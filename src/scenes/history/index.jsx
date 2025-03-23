import { Stack } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom"; 
import { addProfile, addProvider, addRecord, deleteProvider, deleteRecords, 
    getProfiles, searchProviders, searchRecords } from "../../database/clientServices";
import { CustomSnackbar, ErrorGraphicMessage, LoadingCircle, Topbar } from "../../components";    
import { Profile } from "./Profile";
import { ProvidersDirectory } from "./ProvidersDirectory";
import { RecordsBarGraph } from "./RecordsBarGraph";
import { RecordsDataGrid } from "./RecordsDataGrid"; 
import { MAIN_USER_ID } from "../../constants";
import { mainContentStyles, pageStyles } from "../../styles";

/**
 * Page that displays the selected member's profile data, medical history, and assigned providers
 */

export const HistoryPage = () => {   
    const { memberID } = useParams();    
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);  
    const [profiles, setProfiles] = useState({ all: [], selected: null });   
    const [providers, setProviders] = useState([]);
    const [recordType, setRecordType] = useState("Procedure");
    const [records, setRecords] = useState({ procedures: [], immunizations: [] });
    const snackbarRef = useRef(null);    

    const fetchSetProfiles = useCallback(async () => {
        const profiles = await getProfiles();
        setProfiles({ 
            all: profiles, 
            selected: profiles.find(profile => profile.memberID === Number(memberID))
        });  
    }, [memberID]);

    const fetchSetProviders = useCallback(async () => {
        const updatedProviders = await searchProviders("memberID", Number(memberID));
        setProviders(updatedProviders); 
    }, [memberID]);

    const fetchSetRecords = useCallback(async () => {
        const updatedRecords = await searchRecords("memberID", Number(memberID));
        setRecords(updatedRecords); 
    }, [memberID]); 

    useEffect(() => {    
        const fetchAllData = async () => {
            setLoading(true);  
            try {        
                await fetchSetProfiles();
                await fetchSetProviders();
                await fetchSetRecords(); 
                setDbError(false);
            } catch (err) {   
                setDbError(true);
            }
            setLoading(false); 
        }; 
        fetchAllData();   
    }, [fetchSetProfiles, fetchSetProviders, fetchSetRecords]); 
          
    const setSnackbarMsg = useCallback((message) => { 
        snackbarRef.current?.showSnackbar(message); 
    }, []);

    const handleProfileAdd = useCallback(async (profileData) => { 
        try {
            await addProfile(profileData);  
            await fetchSetProfiles();
        } catch (err) { 
            setSnackbarMsg(err.message);
        }
    }, [fetchSetProfiles, setSnackbarMsg]);  

    const handleProviderAdd = useCallback(async (providerData) => {
        try { 
            await addProvider(providerData);
            await fetchSetProviders();
        } catch (err) {
            setSnackbarMsg(err.message);  
        } 
    }, [fetchSetProviders, setSnackbarMsg]);

    const handleProviderDelete = useCallback(async (providerID) => {
        try {
            await deleteProvider(providerID); 
            await fetchSetProviders();
        } catch (err) {
            setSnackbarMsg(err.message);   
        }
    }, [fetchSetProviders, setSnackbarMsg]);

    const handleRecordAdd = useCallback(async (recordData) => {
        try { 
            await addRecord(recordData);  
            await fetchSetRecords();
        } catch (err) {
            setSnackbarMsg(err.message); 
        }
    }, [fetchSetRecords, setSnackbarMsg]);

    const handleRecordDelete =  useCallback(async (recordIDs) => { 
        try { 
            await deleteRecords(recordIDs);
            await fetchSetRecords();
        } catch (err) {   
            setSnackbarMsg(err.message); 
        } 
    }, [fetchSetRecords, setSnackbarMsg]); //records 

    // shows most recent profile picture for main user in Topbar
    const getTopbarPic = () => {  
        if (profiles.selected?.memberID === MAIN_USER_ID) {
            return profiles.selected?.fullPicturePath ?? null;  
        }
        return null;
    };

    const recordsDataGridProps = {
        memberID,
        records,
        recordType,
        setRecordType, 
        handleRecordAdd,
        handleRecordDelete
    };

    const providersDirectoryProps = {
        memberID,
        providers, 
        handleProviderAdd, 
        handleProviderDelete,
        setSnackbarMsg,
    };

    return (
        <Stack direction="column" sx={pageStyles} >
            <Topbar
                title="PATIENT PROFILE"
                subtitle="Update Your Medical History" 
                profilePic={ getTopbarPic() }
            /> 
            { loading && <LoadingCircle /> }
            
            { !loading && !dbError &&
                <Stack direction="row" spacing={2} sx={mainContentStyles} > 
                    <Profile  
                        memberID={memberID}
                        profiles={profiles}  
                        handleProfileAdd={handleProfileAdd}
                        setSnackbarMsg={setSnackbarMsg}
                    /> 
                    
                    <Stack direction="column" spacing={2} sx={{ width: "73%" }} >
                        <Stack direction="row" spacing={2} sx={{ width: "100%", height: "21rem" }} >
                            <RecordsBarGraph records={records} recordType={recordType} />   
                            <ProvidersDirectory props={providersDirectoryProps} /> 
                        </Stack> 
                        <RecordsDataGrid props={recordsDataGridProps} />
                    </Stack> 

                    <CustomSnackbar ref={snackbarRef} />
                </Stack>
            }

            { dbError && <ErrorGraphicMessage /> }
        </Stack>
    ); 
}; 