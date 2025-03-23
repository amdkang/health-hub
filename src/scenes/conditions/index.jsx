import { Stack } from "@mui/material"; 
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";  
import { addCondition, addMeasurement, deleteConditions, deleteMeasurements, 
    getPersonnel, searchConditions, searchMeds } from "../../database/clientServices";
import { CustomSnackbar, ErrorGraphicMessage, LoadingCircle, NotesTextField, Topbar } from "../../components";
import { MsmtsDisplay } from "./MsmtsDisplay";  
import { DetailsPanel } from "./DetailsPanel"; 
import { mainContentStyles, pageStyles } from "../../styles";

/**
 * Page that displays all conditions (with information & measurements) for the selected member
 */

export const ConditionsPage = () => { 
    const { memberID } = useParams(); 
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);
    const [conditions, setConditions] = useState({ all: [], selected: null });
    const [personnel, setPersonnel] = useState({ members: [], providers: [] });
    const [meds, setMeds] = useState([]);    
    const snackbarRef = useRef(null);  

    const fetchSetConditions = useCallback(async (prevSelectedID) => { 
        const conditions = await searchConditions("memberID", Number(memberID));   
        fmtSetConditions(conditions, prevSelectedID);
    }, [memberID]); 

    useEffect(() => {     
        const fetchAllData = async () => {
            setLoading(true);  
            try {    
                setPersonnel(await getPersonnel(Number(memberID)));
                setMeds(await searchMeds("memberID", Number(memberID)));
                await fetchSetConditions();
                setDbError(false);
            } catch (err) {   
                setDbError(true);
            } 
            setLoading(false); 
        }; 
        fetchAllData();   
    }, [memberID, fetchSetConditions]);   

    const setSnackbarMsg = useCallback(message => { 
        snackbarRef.current?.showSnackbar(message); 
    }, []);
 
    // determines which value to set as the selected condition
    const fmtSetConditions = (allConds, prevSelectedID = null) => {    
        const selectedCond = prevSelectedID 
            ? allConds.find(cond => cond.conditionID === prevSelectedID) // reinstate previous selected condition
            : allConds.length > 0 ? allConds[0] : null; // set new condition
        setConditions({ all: allConds, selected: selectedCond });
    };  
             
    const handlePinToggle = async () => {  
        try { 
            const cond = conditions.selected;
            const updatedCond = {
                conditionID: cond.conditionID, 
                pinned: !cond.pinned, 
                measurements: cond.measurements,
                medications: cond.medications, 
                providers: cond.providers
            }; 
            await addCondition(updatedCond);  
            await fetchSetConditions(cond.conditionID); 
        } catch (err) {
            setSnackbarMsg(err.message);
        }
    };

    const handleConditionAdd = async (conditionData) => {
        try {  
            await addCondition(conditionData);  
            await fetchSetConditions(conditions.selected?.conditionID);
        } catch (err) { 
            setSnackbarMsg(err.message);
        }  
    }; 

    const handleConditionDelete =  async (conditionIDs) => { 
        try { 
            await deleteConditions(conditionIDs);
            await fetchSetConditions(); 
        } catch (err) {    
            setSnackbarMsg(err.message); 
        } 
    };

    const handleMsmtAdd = async (msmtData) => { 
        try {  
            await addMeasurement(msmtData, conditions.selected);
            await fetchSetConditions(conditions.selected.conditionID);  
        } catch (err) {
            setSnackbarMsg(err.message);
        }  
    }; 

    const handleMsmtDelete = async (msmtIDs) => { 
        try { 
            await deleteMeasurements(msmtIDs, conditions.selected);
            await fetchSetConditions(conditions.selected.conditionID); 
        } catch (err) {    
            setSnackbarMsg(err.message); 
        }
    }; 

    const getConditionNotes = () => {
        const condition = conditions.selected;
        if (condition) return condition.notes ?? "";
        return null; 
    };

    const updateNotes = useCallback(async (notes) => {  
        try {  
            const cond = conditions.selected;
            const updatedCond = {
                conditionID: cond.conditionID,  
                notes: notes,
                measurements: cond.measurements,
                medications: cond.medications, 
                providers: cond.providers
            }; 
            await addCondition(updatedCond);  
            await fetchSetConditions(cond.conditionID); 
            setSnackbarMsg("Notes successfully updated");    
            return true;
        } catch (err) {
            setSnackbarMsg("Error updating notes");   
            return false;
        } 
    }, [conditions, fetchSetConditions, setSnackbarMsg]);
 
    const msmtsDisplayProps = {
        memberID, 
        conditions, 
        fmtSetConditions, 
        personnel, 
        meds, 
        handlePinToggle, 
        handleConditionAdd, 
        handleConditionDelete,
        handleMsmtAdd,
        handleMsmtDelete
    };

    return (
        <Stack direction="column" sx={pageStyles} > 
            <Topbar
                title="CONDITIONS"
                subtitle="Manage Your Chronic Conditions"
            />    
            { loading && <LoadingCircle /> }

            { !loading && !dbError &&   
                <Stack direction="row" spacing={2} sx={mainContentStyles} >
                    <MsmtsDisplay props={msmtsDisplayProps} />  
                    <Stack direction="column" spacing={2} sx={{ width: "50%" }} >
                        <DetailsPanel 
                            memberID={memberID}
                            conditions={conditions}
                            personnel={personnel}
                        />  
                        <NotesTextField 
                            notes={ getConditionNotes() } 
                            updateNotes={updateNotes} 
                        /> 
                    </Stack>   
                    <CustomSnackbar ref={snackbarRef} />    
                </Stack>  
            } 
            
            { dbError && <ErrorGraphicMessage /> }
        </Stack>
    );
}; 