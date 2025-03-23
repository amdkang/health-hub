import { alpha, Box, Avatar, Chip, Dialog, DialogContent, Stack, Typography, useTheme } from "@mui/material"; 
import { ContentPasteOutlined, Delete, DriveFileMove } from "@mui/icons-material"; 
import { useGridApiRef } from '@mui/x-data-grid';
import { useContext, useState } from "react"; 
import { useCustomNavigate } from "../../useCustomNavigate";
import { VisitsPageContext } from ".";  
import { ContainerTitle, CustomDataGrid, ErrorGraphicMessage, FilledButton, ImageCell } from "../../components"; 
import { MoveVisitForm } from "../forms";
import { formatDate } from "../../utils";
import { containerStyles, formDialogStyles } from "../../styles"; 

// custom datagrid cell showing visit's name & icon 
export const VisitNameCell = ({ visit }) => {
    const theme = useTheme(); 
    return (
        <Stack direction="row" spacing={1} sx={{ height: "100%", alignItems: "center" }} > 
            <img src={ visit.img } alt="visit icon" style={{ width: 35, height: 35 }} /> 
            
            <Stack direction="column" > 
                <Typography 
                    sx={{ 
                        fontSize: "1rem", 
                        fontWeight: 500, 
                        color: theme.palette.background.contrastText 
                    }} 
                >
                    { visit.name }
                </Typography>

                <Typography sx={{ fontSize: "0.8rem", color: theme.palette.neutral.dark }} >
                    { visit.location }
                </Typography>
            </Stack>
        </Stack> 
    );
};

/**
 * Renders a datagrid listing all recorded past visits
 * Provides a form to move selected visits to a specified folder.
 */

export const VisitsDataGrid = () => {   
    const { filesData, folderHierarchy, handleVisitMove, handleVisitDelete } = useContext(VisitsPageContext);
    const palette = useTheme().palette; 
    const { goToVisitDetails } = useCustomNavigate(); 
    const [selectedVisitIDs, setSelectedVisitIDs] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const apiRef = useGridApiRef();    
    const visits = getVisitsToShow(); 

    const getTitle = () => {
        if (folderHierarchy.length > 1) { // returns name of currently open folder
            const openFolderID = folderHierarchy[folderHierarchy.length-1];
            const openFolder = filesData.folders.find(folder => folder.folderID === openFolderID);
            if (openFolder) return `${ openFolder.name } Visits`;
        }
        return "All Visits"; 
    };

    // returns visits belonging to currently open folder
    function getVisitsToShow() {
        if (folderHierarchy.length <= 1 ) return filesData.visits; 
        const openFolderID = folderHierarchy[folderHierarchy.length-1];
        return filesData.visits.filter(visit => visit.folderID === openFolderID);  
    };  

    const closeForm = () => { 
        apiRef.current?.setRowSelectionModel([]);  
        setSelectedVisitIDs([]);
        setFormOpen(false); 
    };

    const onMoveVisitFormSubmit = async (folderID) => {  
        closeForm(); 
        await handleVisitMove(selectedVisitIDs, folderID);
    }; 
    
    const onVisitsDelete = async () => {    
        closeForm();
        await handleVisitDelete(selectedVisitIDs); 
    };  

    const columns = [
        { field: "name", headerName: "Name", width: 400,
            renderCell: (params) => {   
                if (params?.value) {
                    const visit = params.row;
                    if (visit) return <VisitNameCell visit={visit} />;  
                } 
            }
        },
        { field: "folderID", headerName: "Folder", width: 200,
            renderCell: (params) => {      
                if (params?.value) {
                    const folder = filesData.folders.find(folder => folder.folderID === Number(params.value)); 
                    if (folder) { 
                        return (
                            <Box>
                                <Chip 
                                    label={ folder.name }
                                    sx={{ 
                                        color: folder.color?.text, 
                                        bgcolor: alpha(folder.color?.main, 0.8),
                                        fontSize: "0.82rem",
                                        fontWeight: 550
                                    }}
                                />
                            </Box>
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
        <>
            { visits.length > 0 ? (
                <Stack 
                    direction="column" 
                    spacing={2}
                    sx={{ flexGrow: 1, bgcolor: palette.background.container, ...containerStyles }}
                >   
                    <ContainerTitle
                        title={ getTitle() }
                        titleIcon={ <ContentPasteOutlined sx={{ fontSize: 20 }} /> }  
                    />     
                    { selectedVisitIDs.length > 0 && (
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }} >  
                            <FilledButton text="Delete" icon={ <Delete /> } onClick={onVisitsDelete} />
                            <FilledButton
                                text="Move To"
                                icon={ <DriveFileMove /> }
                                onClick={() => setFormOpen(true)} 
                            /> 
                        </Stack>
                    )}     

                    <CustomDataGrid
                        apiRef={apiRef} 
                        columns={columns}  
                        rows={visits}
                        getRowId={ (row) => row.visitID } 
                        rowHeight={65} 
                        onRowClick={ (params) => goToVisitDetails(params.row.visitID) }  
                        onRowSelectionModelChange={ (newModel) => setSelectedVisitIDs(newModel) } 
                    />  

                    <Dialog open={formOpen} onClose={closeForm} sx={formDialogStyles} >
                        <DialogContent>
                            <MoveVisitForm
                                folders={ filesData.folders }
                                onSubmit={onMoveVisitFormSubmit} 
                                onCancelClick={closeForm}    
                            />
                        </DialogContent>
                    </Dialog> 
                </Stack>
            ) : (
                <ErrorGraphicMessage type="visit" />
            )} 
        </>
    );
}; 