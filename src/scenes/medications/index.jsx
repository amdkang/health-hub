import { Dialog, DialogContent, Stack } from "@mui/material";
import { MedicationOutlined } from "@mui/icons-material"; 
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { addMed, deleteMeds, getMeds, getPersonnel, searchMeds, searchProfiles } from "../../database/clientServices";
import { ContainerTitle, CustomSnackbar, ErrorGraphicMessage, GridImgButton, LoadingCircle, Topbar } from "../../components";  
import { MedsDataGrid } from "./MedsDataGrid";  
import { WeeklyMedsList } from "./WeeklyMedsList";
import { MemberDetails } from "./MemberDetails";   
import { WeeklyCalendar } from "../calendar/WeeklyCalendar";  
import { MedicationForm } from "../forms";
import { formatDaysOfWeek, formatMedSchedule, getFirst } from "../../utils"; 
import { formDialogStyles, mainContentStyles, pageStyles } from "../../styles";

/**
 * Page that displays all of selected member's medications & drug allergies
 * Provides a form to add, edit, or delete medications
 * Includes a weekly calendar that details which medications are scheduled for each day of the week 
 */
 
export const MedicationsPage = () => {
    const { memberID } = useParams(); 
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);
    const [member, setMember] = useState(null); 
    const [meds, setMeds] = useState([]);
    const [personnel, setPersonnel] = useState({ members: [], providers: [] });
    const [weeklyMedSched, setWeeklyMedSched] = useState([]);
    const [daysOfWeek, setDaysOfWeek] = useState({ days: [], selectedIndex: null });
    const [selectedMedType, setSelectedMedType] = useState("Daily"); 
    const [gridView, setGridView] = useState(false);
    const [form, setForm] = useState({ open: false, item: null }); 
    const snackbarRef = useRef(null);   

    const fetchSetPersonnel = useCallback(async () => {
        const memberProfile = getFirst(await searchProfiles("memberID", Number(memberID)));  
        const drugAllergies = memberProfile.allergies.filter((allergy) => allergy.isDrug);  
        setMember({ ...memberProfile, drugAllergies: drugAllergies });
        setPersonnel(await getPersonnel(Number(memberID)));
    }, [memberID]);

    const fetchSetMeds = useCallback(async () => {
        const meds = await searchMeds("memberID", Number(memberID)); 
        setMedsAndSchedule(meds);
    }, [memberID]);

    useEffect(() => {     
        const fetchAllData = async () => {   
            setLoading(true);   
            try {     
                await fetchSetPersonnel();
                await fetchSetMeds(); 
                setDaysOfWeek(formatDaysOfWeek()); 
                setDbError(false);
            } catch (err) {   
                setDbError(true);
            }
            setLoading(false);  
        };    
        fetchAllData();   
    }, [memberID, fetchSetPersonnel, fetchSetMeds]); 
  
    const setMedsAndSchedule = (meds) => {  
        const weeklyMedSched = formatMedSchedule(meds);
        setWeeklyMedSched(weeklyMedSched);
        setMeds(meds);
    };
 
    const setSnackbarMsg = useCallback(message => { 
        snackbarRef.current?.showSnackbar(message); 
    }, []);

    const handleMedAdd = async (formData) => {
        try {  
            closeForm(); 
            const medData = { memberID: memberID, ...formData };
            await addMed(medData); 
            setMedsAndSchedule(await getMeds());
        } catch (err) {
            setSnackbarMsg(err.message);  
        } 
    }; 

    const handleMedDelete = async (medIDs) => {
        try {  
            await deleteMeds(medIDs);
            const updatedMeds = meds.filter((med) => !medIDs.includes(med.medID));
            setMedsAndSchedule(updatedMeds); 
        } catch (err) {    
            setSnackbarMsg(err.message); 
        } 
    };

    const openForm = (item) => setForm({ open: true, item: item.medID ? item : null }); 

    const closeForm = () => setForm({ open: false, item: null });

    const toggleDisplayType = (type) => {
        setSelectedMedType(type);
        setGridView(!gridView);
    };

    const getSelectedDisplay = () => {
        if (selectedMedType === "Daily") {
            return (
                <WeeklyMedsList 
                    meds={ weeklyMedSched[daysOfWeek.selectedIndex] } 
                    openForm={openForm}   
                />
            ); 
        }
        return <MedsDataGrid meds={meds} handleMedDelete={handleMedDelete} openForm={openForm} />;
    };
 
    return (
        <Stack direction="column" sx={pageStyles} >
            <Topbar title="MEDICATIONS" subtitle="Your Medication Schedule" /> 
            { loading && <LoadingCircle /> }

            { !loading && !dbError && member &&
                <Stack 
                    direction="row" 
                    spacing={4}
                    sx={{ ...mainContentStyles, justifyContent: "space-between", p: "2rem 0 0 0.5rem"  }}
                > 
                    { daysOfWeek.days.length > 0 && (
                        <Stack direction="column" spacing={8} sx={{ width: "70%" }} > 
                            <WeeklyCalendar
                                type="med"
                                height="auto"
                                daysOfWeek={daysOfWeek}
                                setDaysOfWeek={setDaysOfWeek}
                            />  

                            <Stack direction="column" spacing={2} sx={{ flex: 1 }}> 
                                { meds.length > 0 ? ( 
                                    <Stack direction="column" spacing={2} >
                                        <ContainerTitle
                                            titleIcon={ <MedicationOutlined sx={{ fontSize: 23 }} /> }  
                                            title={ `${ selectedMedType } Medications` }
                                            extraContent={
                                                <GridImgButton 
                                                    onGridClick={() => toggleDisplayType("All")}
                                                    onImgClick={() => toggleDisplayType("Daily")}
                                                    startGrid={gridView}
                                                />
                                            }
                                        />    
                                        { meds.length > 0 ? (
                                            getSelectedDisplay()
                                        ) : (
                                            <ErrorGraphicMessage 
                                                type="med" 
                                                title={`No Medications Found for ${ member.firstName }`} 
                                                onClick={openForm} 
                                            />
                                        )}  
                                    </Stack> 
                                ) : (  
                                    <ErrorGraphicMessage 
                                        type="med" 
                                        title={`No Medications Found for ${ member.firstName }`} 
                                        onClick={openForm} 
                                    /> 
                                )}  
                            </Stack> 
                        </Stack>
                    )} 
                    <MemberDetails member={member} allMembers={ personnel.members } />  
                    <CustomSnackbar ref={snackbarRef} /> 

                    <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                        <DialogContent>
                            <MedicationForm
                                currentMed={ form.item }
                                providers={ personnel.providers }
                                onSubmit={handleMedAdd}
                                onCancelClick={closeForm}
                            />
                        </DialogContent>
                    </Dialog>  
                </Stack>
            }

            { dbError && <ErrorGraphicMessage type="database" /> } 
        </Stack>
    );
}; 