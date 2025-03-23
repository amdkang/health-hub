import { Box, Chip, Modal, Stack, Typography, useTheme } from "@mui/material";
import { AttachFile } from "@mui/icons-material";
import { memo, useState } from "react";
import { CloseButton, ContainerTitle, CustomDataGrid, ErrorGraphicMessage, ImageCell, TooltipButton } from "../../components"; 
import { fileTypesMap } from "../../database/clientServices"; 
import { formatDate } from "../../utils";
import { containerStyles, pageStyles, scrollBarStyles } from "../../styles";

const FileModal = ({ modalImg, closeModal, palette }) => {
    const modalSx = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        minWidth: "50rem",
        minHeight: "40rem",
        maxWidth: "90vw", 
        maxHeight: "90vh",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        p: "1rem",
        bgcolor: palette.background.container, 
        borderRadius: "0.8rem"
    };

    return (
        <Modal open={modalImg} onClose={closeModal} >
            <Stack spacing={3} sx={modalSx} >
                <Stack 
                    direction="row" 
                    spacing={2} 
                    sx={{ width: "100%", alignItems: "flex-start" }} 
                >
                    <CloseButton onClick={closeModal} color={ palette.neutral.dark } size="1.8rem" />
                    <Typography sx={{ fontSize: "1.3rem" }} > 
                        { modalImg.name } 
                    </Typography>
                </Stack>  

                <Box sx={{ flex: 1, overflow: "auto", ...scrollBarStyles }} >
                    <img 
                        src={ modalImg.fileURL }
                        alt={ modalImg.name }
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                </Box>
            </Stack>
        </Modal>
    )
};

/**
 * Displays datagrid showing all of the open visit's uploaded files 
 */

export const FilesDataGrid = memo(({ files, handleFileDelete, openFileForm }) => {
    const palette = useTheme().palette; 
    const [selectedFileIDs, setSelectedFileIDs] = useState([]);
    const [modalImg, setModalImg] = useState(null);
    const closeModal = () => setModalImg(null); 
    
    const openFile = (fileID) => {
        const file = files.find(file => file.fileID === fileID);  
        if (file.mimetype.startsWith("application/")) { // if file is pdf/doc, open file in new tab
            window.open(file.fileURL);
        } else if (file.mimetype.startsWith("image/")) { // if file is image, open img in `FileModal`
            setModalImg(file);   
        }
    };

    const deleteFiles = async() => {
        const fileIDs = selectedFileIDs;
        setSelectedFileIDs([]);  
        await handleFileDelete(fileIDs);
    }; 
 
    const columns = [
        { field: "name", headerName: "Name", width: 350,
            renderCell: (params) => { 
                if (params?.value) {
                    const file = params.row; 
                    if (file.name) {
                        return (
                            <Stack direction="row" spacing={1} sx={{ height: "100%", alignItems: "center" }} > 
                                <img src={ file.image } alt="file icon" style={{ width: 32, height: 32 }} /> 
                                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }} >
                                    { file.name }
                                </Typography> 
                            </Stack>  
                        );
                    }
                } 
            }
        },
        { field: "mimetype", headerName: "Type", width: 120,
            renderCell: (params) => {
                if (params?.value) {
                    const file = params.row;  
                    if (file.mimetype) {
                        const fileType = fileTypesMap[file.mimetype]?.name ?? "";
                        return ( 
                            <Chip 
                                label={fileType}
                                sx={{
                                    height: "1.8rem",
                                    fontSize: "0.7rem",
                                    fontWeight: 550,
                                    bgcolor: file.color?.main,
                                    color: file.color?.text
                                }}
                            />
                        );
                    }
                } 
            } 
        },
        { field: "date", headerName: "Date", width: 150,
            renderCell: (params) => {
                if (params?.value) {
                    const date = formatDate("fullDate", params.value); 
                    if (date) return <ImageCell type="time" text={date} />;
                }
            } 
        },
        { field: "size", headerName: "Size", width: 120, 
            valueFormatter: (params) => { 
                if (params) { 
                    const sizeInKB = (params / 1024).toFixed(0);
                    if (sizeInKB) return `${ sizeInKB } KB`; 
                }
            }
        }
    ];

    return ( 
        <Stack 
            direction="column" 
            spacing={1}
            sx={{  
                bgcolor: palette.background.container,
                ...containerStyles,
                ...pageStyles,
                width: "67%",
                overflow: "hidden",
                pb: "0.5rem"
            }}
        >  
            <ContainerTitle
                title="Files"
                titleIcon={ <AttachFile sx={{ fontSize: 20 }} /> }
                extraContent={ selectedFileIDs.length > 0 ? (
                        <TooltipButton type="delete" label="Delete Files" onClick={deleteFiles} />
                    ) : (
                        <TooltipButton type="add" label="Add New File" onClick={openFileForm} />
                    )
                }
            /> 
            { files?.length > 0 ? (
                <CustomDataGrid
                    columns={columns}  
                    rows={files} 
                    getRowId={ row => row.fileID } 
                    rowHeight={55} 
                    onRowClick={ params => openFile(params.row.fileID) }
                    onRowSelectionModelChange={ newModel => setSelectedFileIDs(newModel) } 
                />
            ) : (
                <ErrorGraphicMessage type="visitFile" onClick={openFileForm} />
            )}  

            { modalImg && (
                <FileModal modalImg={modalImg} closeModal={closeModal} palette={palette} /> 
            )}
        </Stack>
    );
}); 