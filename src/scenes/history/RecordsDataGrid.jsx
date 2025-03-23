import { alpha, Chip, Dialog, DialogContent, Stack, Typography, useTheme } from "@mui/material";
import { MonitorHeartOutlined } from "@mui/icons-material";
import { memo, useState } from "react";
import { ContainerTitle, CustomDataGrid, ImageCell, TooltipButton } from "../../components";   
import { RecordForm } from "../forms";
import { formatDate } from "../../utils";
import { containerStyles, formDialogStyles } from "../../styles";

// row of chips used to select record type
const RecordTypeSelector = ({ recordType, setRecordType, palette }) => {
    const showProcedures = recordType === "Procedure"; 
    const contrastText = palette.primary.contrastText;
    const darkText = palette.primary.darkText;
    const mainColor = palette.primary.main;

    return (
        <Stack direction="row" spacing={2} sx={{ mb: "1.5rem" }} > 
            <Chip
                label="Procedures"
                variant="outlined"
                onClick={() => setRecordType("Procedure")}
                sx={{
                    fontSize: "0.8rem",
                    color: showProcedures ? contrastText : darkText,
                    bgcolor: showProcedures ? mainColor : "none", 
                    '&.MuiChip-root:hover': {
                        bgcolor: showProcedures ? alpha(mainColor, 0.7) : "default"
                    }
                }}
            />
            <Chip
                label="Immunizations"
                variant="outlined"
                onClick={() => setRecordType("Immunization")}
                sx={{
                    fontSize: "0.8rem",
                    color: !showProcedures ? contrastText : darkText,
                    bgcolor: !showProcedures ? mainColor : "none", 
                    '&.MuiChip-root:hover': {
                        bgcolor: !showProcedures ? alpha(mainColor, 0.7) : "default"
                    }
                }}
            />
        </Stack>
    );
};

/**
 * Datagrid showing the selected member's medical records
 * Provides forms to add, edit, or delete any records 
 * Records shown (of type `Procedure` or `Immunization`) are synced with `RecordsBarGraph`
 */

export const RecordsDataGrid = memo(({ props }) => {   
    const palette = useTheme().palette; 
    const [selectedRecordIDs, setSelectedRecordIDs] = useState([]);  
    const [form, setForm] = useState({ open: false, item: null }); 
    const title = `Past ${ props.recordType }s`;
    const currentRecords = props.recordType === "Procedure" 
        ? props.records.procedures : props.records.immunizations;

    const openForm = (item) => setForm({ open: true, item: item.recordID ? item : null });

    const closeForm = () => setForm({ open: false, item: null }); 

    const openEditForm = (recordID) => {
        const clickedRecord = currentRecords.find(record => record.recordID === recordID);
        openForm(clickedRecord);
    };
 
    const onRecordFormSubmit = async (formData) => { 
        closeForm(); 
        const recordData = { memberID: props.memberID, ...formData };
        await props.handleRecordAdd(recordData);
    };

    const deleteRecords =  async () => { 
        const recordIDs = selectedRecordIDs;
        setSelectedRecordIDs([]);
        await props.handleRecordDelete(recordIDs); 
    };  

    const columns = [
        { field: "name", headerName: "Name", width: 300,
            renderCell: (params) => { 
                if (params?.value) {
                    const record = params.row; 
                    if (record) {
                        return (
                            <Stack 
                                direction="row" 
                                spacing={1} 
                                sx={{ height: "100%", alignItems: "center" }} 
                            >
                                <img 
                                    src={ record.image } 
                                    alt="record icon" 
                                    style={{ width: 30, height: 30 }} 
                                />  
                                <Stack direction="column" > 
                                    <Typography sx={{ fontSize: "1rem", fontWeight: 500 }} >
                                        { record.name }
                                    </Typography> 
                                </Stack>
                            </Stack> 
                        );
                    }
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
        { field: "location", headerName: "Location", width: 200,
            renderCell: (params) => {
                if (params?.value) {
                    const location = params.value;
                    if (location) return <ImageCell type="location" text={location} />; 
                }
            }
        },
        { field: "notes", headerName: "Notes", cellClassName: "notes-cell", width: 250 }
    ]; 

    return (
        <Stack 
            direction="column"
            sx={{
                flexGrow: 1,
                bgcolor: palette.background.container,
                ...containerStyles,
                pr: "2.7rem"
            }}
        >
            <ContainerTitle
                titleIcon={ <MonitorHeartOutlined sx={{ fontSize: 23 }} /> }   
                title={title}
                extraContent={ selectedRecordIDs.length === 0 ? (
                        <TooltipButton
                            type="add"
                            label={ `Add New ${ props.recordType }` }
                            onClick={openForm}
                        />
                    ) : (
                        <TooltipButton type="delete" label="Delete Record" onClick={deleteRecords} />
                    )
                }
            /> 
            <RecordTypeSelector 
                recordType={ props.recordType } 
                setRecordType={ props.setRecordType }
                palette={palette}
            />  
            <CustomDataGrid
                columns={columns}
                rows={currentRecords}
                getRowId={ (row) => row.recordID }
                rowHeight={65} 
                onRowClick={ (params) => openEditForm(params.row.recordID) }
                onRowSelectionModelChange={ (newModel) => setSelectedRecordIDs(newModel) } 
            /> 
            
            <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                <DialogContent>
                    <RecordForm
                        type={ props.recordType }
                        currentRecord={ form.item }
                        onSubmit={onRecordFormSubmit}
                        onCancelClick={closeForm}
                    />
                </DialogContent>
            </Dialog>
        </Stack>
    );
}); 