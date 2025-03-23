import { Avatar, Box, Stack, Typography, useTheme } from "@mui/material"; 
import { Add, Delete } from "@mui/icons-material"; 
import { memo, useState } from "react";  
import { CustomDataGrid, FilledButton, ImageCell } from "../../components";  
import { formatMedTime, getSchedAbbrev, getTimeIcon } from "../../utils";
import { pageStyles } from "../../styles";  
 
/**
 * Datagrid showing all of the selected member's medications
 */

export const MedsDataGrid = memo(({ meds, handleMedDelete, openForm }) => {    
    const palette = useTheme().palette;  
    const [selectedIDs, setSelectedIDs] = useState([]); 

    const openEditMedForm = (medID) => {
        const clickedMed = medID ? meds.find(med => med.medID === medID) : null;
        openForm(clickedMed);
    }; 

    const deleteMeds = async () => {
        const medIDs = selectedIDs;
        setSelectedIDs([]); 
        await handleMedDelete(medIDs); 
    };

    const getMedSchedule = (med) => {  
        let schedule = "";
        switch (med.frequency) {
            case "daily": 
                schedule = "daily";
                break; 
            case "weekly":
                schedule = getSchedAbbrev(med).join(" ");
                break; 
            case "prn":
                schedule = "as needed";
                break;
            default:
                break;
        } 
        return schedule;
    };

    const columns = [
        { field: "name", headerName: "Name", width: 250, 
            renderCell: (params) => {
                if (params?.value) {
                    const med = params.row; 
                    if (med) {
                        return (
                            <Stack 
                                direction="row" 
                                spacing={1.5} 
                                sx={{ height: "100%", alignItems: "center" }} 
                            >
                                <img src={ med.img } alt="med icon" style={{ width: 32, height: 32 }} /> 
                    
                                <Stack direction="column" > 
                                    <Typography sx={{ fontSize: "1rem", fontWeight: 500 }} >
                                        { med.name }
                                    </Typography>
                    
                                    <Typography sx={{ fontSize: "0.8rem", color: palette.neutral.dark }} >
                                        { med.dosage }
                                    </Typography>
                                </Stack>
                            </Stack> 
                        );
                    }
                }
            } 
        },  
        { field: "provider", headerName: "Prescriber", width: 200,
            renderCell: (params) => {  
                if (params?.value) {
                    const provider = params.value;
                    if (provider) {
                        return (   
                            <ImageCell
                                image={ 
                                    <Avatar 
                                        src={ provider.fullPicturePath } 
                                        alt={ provider.name }
                                        sx={{ width: 40, height: 40 }} 
                                    /> 
                                }
                                text={ provider.name }   
                            /> 
                        );
                    }
                } 
            }
        },
        {field: "schedule", headerName: "Schedule", width: 180,
            renderCell: (params) => {   
                if (params?.row) {
                    const med = params.row; 
                    if (med) {
                        return <ImageCell type="date" text={ `taken ${ getMedSchedule(med) }` } />; 
                    }
                }
            }
        },
        { field: "time", headerName: "Time", width: 100,
            renderCell: (params) => {   
                if (params?.value) {
                    const time = params.value;
                    if (time) {
                        return <ImageCell image={ getTimeIcon(time) } text={ formatMedTime(time) } />; 
                    } 
                }
            } 
        },
        { field: "notes", headerName: "Notes", cellClassName: "notes-cell", width: 160 }
    ];

    return ( 
        <Stack direction="column" spacing={0.5} sx={pageStyles} >
            <Box>
                { selectedIDs.length === 0 ? (
                    <FilledButton text="Add" icon={ <Add /> } onClick={openForm} /> 
                ) : (
                    <FilledButton text="Delete" icon={ <Delete /> } onClick={deleteMeds} />  
                )}
            </Box> 
            <CustomDataGrid
                columns={columns}
                rows={meds}
                getRowId={ (row) => row.medID }
                rowHeight={65} 
                onRowClick={ (params) => openEditMedForm(params.row.medID) } 
                onRowSelectionModelChange={ (newModel) => setSelectedIDs(newModel) }   
                containerBackground={ palette.background.default }
            />
        </Stack>
    );
}); 