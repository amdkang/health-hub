import { Avatar, Stack, useTheme } from "@mui/material"; 
import { ContentPaste } from "@mui/icons-material";
import { memo, useEffect, useState } from "react";
import { useCustomNavigate } from "../../useCustomNavigate"; 
import { getEvents, getVisits, searchConditions, searchMeds } from "../../database/clientServices";
import { ContainerTitle, CustomDataGrid, ErrorGraphicMessage, ImageCell, LoadingCircle, TooltipButton, Topbar } from "../../components"; 
import { PinnedConditions } from "./PinnedConditions";  
import { MedTracker } from "./MedTracker";  
import { Calendar } from "./Calendar";   
import { VisitNameCell } from "../visits/VisitsDataGrid";
import { formatDate } from "../../utils";
import { MAIN_USER_ID } from "../../constants";
import { containerStyles, mainContentStyles, pageStyles } from "../../styles";   

const VisitsGrid = memo(({ visits, bgcolor }) => {
    const { goToVisits, goToVisitDetails } = useCustomNavigate();  
    const columns = [
        { field: "name", headerName: "Name", width: 400,
            renderCell: (params) => {
                if (params?.value) {
                    const visitName = params.row;
                    if (visitName) return <VisitNameCell visit={visitName} />;  
                } 
            }
        }, 
        { field: "date", headerName: "Date", width: 150,
            renderCell: (params) => {
                if (params?.value) {
                    const date = params.value;
                    if (date) {
                        return <ImageCell type="date" text={ formatDate("fullDate", date) } />;
                    } 
                }
            }
        }, 
        { field: "provider", headerName: "Provider", width: 200, 
            renderCell: (params) => { 
                if (params?.value) {
                    const provider = params.value;
                    if (provider) { 
                        return (
                            <ImageCell 
                                text={ provider.name }  
                                image={ 
                                    <Avatar 
                                        src={ provider.fullPicturePath } 
                                        alt={ provider.name }  
                                        sx={{ width: 40, height: 40 }} 
                                    /> 
                                }
                            /> 
                        );
                    }
                }
            }
        },
        { field: "reason", headerName: "Reason for Visit", cellClassName: "reason-cell", width: 200 }
    ]; 

    return (
        <Stack 
            direction="column"
            sx={{ flexGrow: 1, minHeight: "23.5rem", bgcolor: bgcolor, ...containerStyles }}
        >
            <ContainerTitle
                titleIcon={ <ContentPaste sx={{ fontSize: 20 }} /> }  
                title="Past Visits"
                extraContent={
                    <TooltipButton
                        type="more"
                        label="View All Visits"
                        onClick={() => goToVisits(MAIN_USER_ID)}
                    />
                }
            />  
            { visits.length > 0 ? (
                <CustomDataGrid
                    columns={columns}  
                    rows={visits}
                    getRowId={ (row) => row.visitID } 
                    rowHeight={65} 
                    onRowClick={ (params) => goToVisitDetails(params.row.visitID) }  
                    checkboxSelection={false} 
                />
            ) : (
                <ErrorGraphicMessage type="dashboardVisit" />
            )}
        </Stack>
    );
});

/**
 * Page that displays a summary of the main user's pinned conditions, medications, scheduled events, and past visits
 */

export const Dashboard = () => {
    const palette = useTheme().palette;    
    const [loading, setLoading] = useState(true);
    const [conditions, setConditions] = useState([]);
    const [meds, setMeds] = useState([]); 
    const [visits, setVisits] = useState([]);
    const [events, setEvents] = useState([]);  
    const [dbError, setDbError] = useState(false);   
     
    useEffect(() => {
        const fetchAllData = async () => { 
            setLoading(true);   
            try { 
                const [pinnedConds, meds, visits, events] = await Promise.all([ 
                    searchConditions("pinned", true), 
                    searchMeds("memberID", MAIN_USER_ID),
                    getVisits(),
                    getEvents(),
                ]);    
                setConditions(pinnedConds);
                setMeds(meds);
                setVisits(visits);
                setEvents(events);  
                setDbError(false);
            } catch (err) { 
                setDbError(true);
            } 
            setLoading(false); 
        };
        fetchAllData();    
    }, []);   

    return (
        <Stack direction="column" sx={pageStyles} >
            <Topbar
                title="DASHBOARD"
                subtitle="Welcome To Your Health Hub"
            />   
            { loading && <LoadingCircle /> }
 
            { !loading && !dbError &&
                <Stack direction="row" spacing={2} sx={mainContentStyles} >  
                    <Stack direction="column" spacing={3} sx={{ width: "74%" }} >
                        <Stack 
                            direction="row" 
                            spacing={2} 
                            sx={{ width: "100%", height: "25rem" }} 
                        > 
                            <PinnedConditions conditions={conditions} />  
                            <MedTracker 
                                meds={meds} 
                                sx={{ 
                                    width: 200, 
                                    height: 200, 
                                    cx: 85, 
                                    innerRadius: 65, 
                                    outerRadius: 90 
                                }} 
                            />
                        </Stack>
                        <VisitsGrid visits={visits} bgcolor={ palette.background.container } />
                    </Stack>
                    
                    <Stack 
                        direction="column"
                        sx={{
                            flex: 1,
                            bgcolor: palette.background.container,
                            ...containerStyles,
                            pb: "0rem"
                        }}
                    > 
                        <Calendar events={events} />
                    </Stack>
                </Stack>
            }
            
            { dbError && <ErrorGraphicMessage type="database" /> }
        </Stack>
    );
}; 