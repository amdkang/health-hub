import { Stack, useTheme } from "@mui/material";  
import { TrendingUpOutlined } from "@mui/icons-material"; 
import { memo, useState } from "react";    
import { ContainerTitle, CustomDataGrid, ImageCell, TooltipButton } from "../../components";   
import { formatDate } from "../../utils";
import { containerStyles } from "../../styles";  

/**
 * Datagrid listing all measurements for the selected condition
 */

export const MsmtsDataGrid = memo(({ condition, openForm, handleMsmtDelete }) => {   
    const palette = useTheme().palette; 
    const [selectedMsmtIDs, setSelectedMsmtIDs] = useState([]);  
 
    const openEditMsmtForm = (msmtID) => {
        const clickedMsmt = condition.measurements.find(msmt => msmt.measurementID === msmtID); 
        openForm("measurement", clickedMsmt);
    };

    const deleteMsmts = async () => { 
        const msmtIDs = selectedMsmtIDs;
        setSelectedMsmtIDs([]);
        await handleMsmtDelete(msmtIDs); 
    };  

    const ContainerTitleButton = () => {
        return (
            selectedMsmtIDs.length > 0 ? (
                <TooltipButton label="Delete Measurements" type="delete" onClick={deleteMsmts} />
            ) : (
                <TooltipButton label="Add Measurement" type="add" onClick={() => openForm("measurement")} /> 
            )
        );
    };

    const columns = [
        { field: "value", headerName: "Value", width: 150,
            valueFormatter: (params) => { 
                if (params) return `${ params } ${ condition?.unit ?? "" }`;   
            }
        },
        { field: "datetime", headerName: "Date/Time", width: 200,
            renderCell: (params) => {
                if (params?.value) {
                    const datetime = params.value;
                    if (datetime) {
                        const [date, time, period] = formatDate("dateTime", datetime).split(" ");  
                        return (
                            <ImageCell type="date" text={ `${date} at ${time} ${period}` } />
                        )
                    }  
                }
            }
        },
        { field: "notes", headerName: "Notes", cellClassName: "notes-cell", width: 250 }
    ]; 

    return (
        <Stack 
            direction="column"
            spacing={1}
            sx={{
                flexGrow: 1,
                bgcolor: palette.background.container,
                ...containerStyles
            }}
        >
            <ContainerTitle
                title="Measurements"
                titleIcon={ <TrendingUpOutlined sx={{ fontSize: 24 }} /> }
                extraContent={ <ContainerTitleButton /> }
            />  
            <CustomDataGrid
                columns={columns}
                rows={ condition?.measurements ?? [] }
                getRowId={ row => row.measurementID }
                onRowClick={ params => openEditMsmtForm(params.row.measurementID) } 
                onRowSelectionModelChange={ newModel => setSelectedMsmtIDs(newModel) } 
            />  
        </Stack>
    );
}); 