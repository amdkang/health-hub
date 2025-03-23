import { alpha, Avatar, Box, Dialog, DialogContent, Stack, Typography, useTheme } from "@mui/material";
import { AccessTimeOutlined,  Download, Edit, EventNote } from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom"; 
import { addVisitFile, addVisit, deleteVisitFiles, getFolders, getPersonnel, searchVisits } from "../../database/clientServices";
import { CustomSnackbar, ErrorGraphicMessage, FilledButton, ImageCell, LoadingCircle, NotesTextField, Topbar } from "../../components";  
import { FileSelectForm, VisitForm } from "../forms"; 
import { FilesDataGrid } from "./FilesDataGrid";  
import { formatDate, getFirst } from "../../utils";
import { containerStyles, formDialogStyles, mainContentStyles, pageStyles, scrollBarStyles } from "../../styles";
import { clipboard, doctor } from "../../assets"; 

// renders row of action buttons used to edit visit
const ActionButtons = ({ date, openEditForm }) => (
    <Stack 
        direction="row" 
        sx={{ width: "100%", justifyContent: "space-between", pb: "0.5rem" }} 
    > 
        <FilledButton text={date} icon={ <EventNote /> } onClick={openEditForm} /> 
        <Stack direction="row" spacing={2} >
            <FilledButton text="Export" icon={ <Download /> } /> 
            <FilledButton text="Edit" icon={ <Edit /> } onClick={openEditForm} /> 
        </Stack>
    </Stack>
);

// general container for each detail in `MainVisitDetails`
const DetailBox = ({ title, mainText, subText, rightImg, detailBoxSx }) => (
    <Box sx={detailBoxSx} >  
        <Stack 
            direction="row"
            sx={{
                width: "100%",
                alignItems: "center",
                overflowY: "auto",
                overflowX: "hidden",
                ...scrollBarStyles
            }}
        >
            <Stack 
                direction="column" 
                sx={{ width: "75%", height: "100%", justifyContent: "space-between" }} 
            >
                <Typography sx={{ fontSize: "1rem" }} > { title } </Typography>  
                <Stack direction="column" >  
                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 500 }} > 
                        { mainText } 
                    </Typography>  
                    <Box> { subText } </Box>  
                </Stack>
            </Stack> 
            { rightImg }  
        </Stack>
    </Box>
); 
 
// row of boxes showing visit's core details (patient, provider, reason)
const MainVisitDetails = ({ selectedVisit, palette }) => {
    const imageCellTextStyles = { fontSize: "0.9rem", color: palette.neutral.dark };
    const bgCircleStyles = { bgcolor: alpha("#9184f5", 0.1), borderRadius: "50%", p: "1.2rem" }; 
    const detailBoxSx = {
        display: "flex",
        width: "33%",
        height: "100%", 
        bgcolor: palette.background.container,
        ...containerStyles,
        p: "1.2rem 1.5rem" 
    };

    const member = selectedVisit.member;  
    const provider = selectedVisit.provider;  
    const providerName = provider?.name ?? "None Recorded";
    const providerImg = provider ? (
        <Avatar 
            src={ provider.fullPicturePath } 
            alt={ provider.name } 
            sx={{ width: 90, height: 90 }} 
        />
    ) : (
        <Box sx={bgCircleStyles} >
            <img src={doctor} alt="doctor" style={{ width: 57, height: 57 }} />
        </Box>
    );   

    return (
        <Stack 
            direction="row" 
            spacing={2}
            sx={{ width: "100%", height: "10rem", justifyContent: "space-between" }}
        >
            <DetailBox
                title="Patient Information"
                mainText={ member.fullName }
                subIcon={ <AccessTimeOutlined sx={{ fontSize: 13 }} /> }
                subText={
                    <ImageCell
                        type="date"
                        text={ `DOB: ${ formatDate("fullDate", member.dob) }` }
                        textSx={{ ...imageCellTextStyles }}
                        iconSx={{ color: palette.neutral.dark }}
                    />
                }
                rightImg={ 
                    <Avatar 
                        src={ member.fullPicturePath } 
                        alt={ member.fullName }
                        sx={{ width: 90, height: 90 }} 
                    /> 
                }
                detailBoxSx={detailBoxSx}
            />
            <DetailBox
                title="Provider Information"
                mainText={providerName}
                subText={ 
                    <ImageCell
                        type="location"
                        text={ selectedVisit.location }
                        textSx={imageCellTextStyles}
                        iconSx={{ color: palette.neutral.dark }}
                    /> 
                }
                rightImg={providerImg}
                detailBoxSx={detailBoxSx}
            /> 
            <DetailBox
                title="Reason for Visit"
                mainText={ selectedVisit.reason ?? "None Recorded" }
                rightImg={
                    <Box sx={bgCircleStyles} >
                        <img src={clipboard} alt="clipboard" style={{ width: 55, height: 55 }} />
                    </Box>
                } 
                detailBoxSx={detailBoxSx}
            />
        </Stack> 
    );
};
 
/**
 * Page that shows the full information and uploaded files for the selected visit
 * Provides forms to edit visit details and to add/delete visit files
 */

export const VisitDetails = () => {
    const palette = useTheme().palette; 
    const { visitID } = useParams();
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);   
    const [selectedVisit, setSelectedVisit] = useState(null); 
    const [folders, setFolders] = useState([]);
    const [personnel, setPersonnel] = useState({ members: [], providers: [] });
    const [form, setForm] = useState({ type: null, item: null, open: false })
    const snackbarRef = useRef(null);   

    const fetchSetVisit = useCallback(async () => {
        const visits = await searchVisits("visitID", Number(visitID));
        setSelectedVisit(getFirst(visits));   
    }, [visitID]); 

    useEffect(() => {   
        const fetchAllData = async () => {
            setLoading(true);  
            try {        
                await fetchSetVisit();
                setFolders(await getFolders());
                setPersonnel(await getPersonnel());
                setDbError(false);
            } catch (err) {   
                setDbError(true);
            }
            setLoading(false); 
        }; 
        fetchAllData();   
    }, [fetchSetVisit]);   
 
    const setSnackbarMsg = useCallback(message => { 
        snackbarRef.current?.showSnackbar(message); 
    }, []);

    const openEditForm = () => setForm({ type: "visit", item: selectedVisit, open: true });

    const openFileForm = () => setForm({ type: "file", item: null, open: true });

    const closeForm = () => setForm({ type: null, item: null, open: false });

    const onVisitFormSubmit = async (visitData) => {
        try { 
            await addVisit(visitData);   
            await fetchSetVisit();
        } catch (err) {
            setSnackbarMsg(err.message); 
        }
        closeForm();
    };

    const onFileFormSubmit = async (files) => { 
        try { 
            await Promise.all(Array.from(files).map(file => addVisitFile(file, visitID))); 
            await fetchSetVisit(); 
        } catch (err) {  
            snackbarRef.current?.showSnackbar(err.message); 
        }
        closeForm(); 
    };

    const handleFileDelete = async (fileIDs) => { 
        try {   
            await deleteVisitFiles(fileIDs, selectedVisit.files, visitID);
            await fetchSetVisit();
        } catch (err) {
            snackbarRef.current?.showSnackbar(err.message); 
        } 
    };
 
    const updateNotes = useCallback(async (notes) => { 
        try {   
            const updatedVisit = {
                visitID: selectedVisit.visitID,  
                notes: notes, 
                files: selectedVisit.files, 
                member: selectedVisit.member,
                provider: selectedVisit.provider
            }; 
            await addVisit(updatedVisit);  
            await fetchSetVisit(); 
            setSnackbarMsg("Notes successfully updated");    
            return true;
        } catch (err) { 
            setSnackbarMsg("Error updating notes");   
            return false;
        }    
    }, [selectedVisit, fetchSetVisit, setSnackbarMsg]); 

    const renderFormType = () => {
        switch (form.type) {
            case "visit":
                return (
                    <VisitForm
                        currentVisit={ form.item } 
                        members={ personnel.members }
                        providers={ personnel.providers }
                        folders={folders}
                        onSubmit={onVisitFormSubmit} 
                        onCancelClick={closeForm}
                    />
                ); 
            case "file":
                return <FileSelectForm onSubmit={onFileFormSubmit} onCancelClick={closeForm} />;
            default: 
                return null;
        };
    };
  
    return (
        <Stack direction="column" sx={pageStyles} >
            <Topbar 
                title={ selectedVisit?.name }
                subtitle={ selectedVisit ? "Visit Summary" : null }
            />  
            { loading && <LoadingCircle /> }

            { !loading && !dbError && selectedVisit &&
                <Stack 
                    direction="column" 
                    spacing={2} 
                    sx={{ ...mainContentStyles, mt: "1rem" }} 
                > 
                    <ActionButtons 
                        date={ formatDate("textDate", selectedVisit.date) }
                        openEditForm={openEditForm}
                    />
                    <MainVisitDetails selectedVisit={selectedVisit} palette={palette} />
                    
                    <Stack direction="row" spacing={2}  sx={{ flexGrow: 1 }} >
                        <Box sx={{ width: "33%" }} >
                            <NotesTextField
                                notes={ selectedVisit.notes ?? "" }
                                updateNotes={updateNotes} 
                            />
                        </Box>
                        <FilesDataGrid
                            files={ selectedVisit.files }
                            handleFileDelete={handleFileDelete}
                            openFileForm={openFileForm}
                        />  
                    </Stack>  

                    <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                        <DialogContent>
                            { renderFormType() } 
                        </DialogContent>
                    </Dialog>
                    <CustomSnackbar ref={snackbarRef} />
                </Stack>
            }

            { dbError && <ErrorGraphicMessage /> }
        </Stack>
    );
}; 