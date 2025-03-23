import { Stack } from "@mui/material";
import { createContext, useCallback, useEffect, useRef, useState } from "react"; 
import { addFolder, addVisit, deleteFolder, deleteVisits, getPersonnel, getVisitsData } from "../../database/clientServices";
import { CustomSnackbar, ErrorGraphicMessage, LoadingCircle, Topbar } from "../../components";
import { FoldersDisplay } from "./FoldersDisplay";  
import { VisitsDataGrid } from "./VisitsDataGrid";    
import { mainContentStyles, pageStyles } from "../../styles"; 

export const VisitsPageContext = createContext();
 
/**
 * Page that shows all of the main user's past visits, organized into folders
 */

export const VisitsPage = () => {     
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);
    const [filesData, setFilesData] = useState({ visits: [], folders: [], foldersVisitCount: null });   
    const [folderHierarchy, setFolderHierarchy] = useState([0]); 
    const [personnel, setPersonnel] = useState({ members: [], providers: [] });
    const snackbarRef = useRef(null);     

    const fetchSetVisits = useCallback(async () => {
        const visitsData = await getVisitsData();  
        setFilesData(visitsData); 
    }, []);

    useEffect(() => { 
        const fetchAllData = async () => { 
            setLoading(true);    
            try {   
                await fetchSetVisits(); 
                setPersonnel(await getPersonnel());
                setDbError(false);
            } catch (err) {   
                setDbError(true);
            }
            setLoading(false); 
        };       
        fetchAllData();   
    }, [fetchSetVisits]);  
    
    const setSnackbarMsg = useCallback(message => { 
        snackbarRef.current?.showSnackbar(message); 
    }, []);

    const handleFolderAdd = async (folderData) => {
        try { 
            await addFolder(folderData); 
            await fetchSetVisits(); 
        } catch (err) {
            setSnackbarMsg(err.message);
        } 
    };

    const handleFolderDelete = async (folderID) => {
        try {
            await deleteFolder(folderID);
            await fetchSetVisits(); 
        } catch (err) {
            setSnackbarMsg(err.message);
        }
    };

    const handleVisitAdd = async (visitData) => {
        try { 
            await addVisit(visitData); 
            await fetchSetVisits(); 
        } catch (err) {
            setSnackbarMsg(err.message);
        } 
    };

    const handleVisitDelete = async (visitIDs) => {
        try {
            await deleteVisits(visitIDs);
            await fetchSetVisits(); 
        } catch (err) {
            setSnackbarMsg(err.message);
        } 
    };

    const handleVisitMove = async (visitIDs, folderID) => {    
        try {   
            for (const visitID of visitIDs) {
                // move visit to specified folder
                await addVisit({ visitID: visitID, folderID: folderID });
            }
            await fetchSetVisits();
        } catch (err) {
            setSnackbarMsg(err.message);
        } 
    };

    const contextValues = { 
        filesData, 
        folderHierarchy, 
        setFolderHierarchy, 
        personnel,  
        handleVisitDelete, 
        handleVisitMove, 
        handleFolderAdd, 
        handleFolderDelete, 
        handleVisitAdd
    };

    return (
        <Stack direction="column" sx={pageStyles} >
            <Topbar
                title="PAST VISITS"
                subtitle="Archive Your Past Appointments"
            />  
            { loading && <LoadingCircle /> }

            { !loading && !dbError && 
                <VisitsPageContext.Provider value={contextValues} >
                    <Stack direction="column" spacing={3} sx={mainContentStyles} > 
                        <FoldersDisplay />    
                        <VisitsDataGrid />  
                    </Stack> 
                    <CustomSnackbar ref={snackbarRef} />
                </VisitsPageContext.Provider>
            }
            
            { dbError && <ErrorGraphicMessage type="database" /> }   
        </Stack> 
    );
}; 