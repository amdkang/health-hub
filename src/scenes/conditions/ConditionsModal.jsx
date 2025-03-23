import { Avatar, Modal, Stack, Typography, useTheme } from "@mui/material"; 
import { MonitorHeartOutlined, PushPin } from "@mui/icons-material"; 
import { memo, useState } from "react";   
import { ColorBox, ContainerTitle, CustomDataGrid, ErrorGraphicMessage, ImageCell, TooltipButton } from "../../components"; 
import { containerStyles } from "../../styles"; 

/**
 * Popup with datagrid showing all of selected member's conditions
 * Provides forms to add/delete conditions for selected member 
 */ 

export const ConditionsModal = memo(({ props }) => {  
    const palette = useTheme().palette; 
    const [selectedCondIDs, setSelectedCondIDs] = useState([]);  
    const modalSx = {
        width: "75%",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        overflowY: "auto",
        bgcolor: palette.background.container, 
        border: `0.1rem solid ${ palette.neutral.main }`,
        ...containerStyles,
        p: "1.6rem 2.2rem"
    };

    const deleteConditions =  async () => {  
        setSelectedCondIDs([]);
        await props.handleConditionDelete(selectedCondIDs); 
    };

    const setSelectedCondition = (conditionID) => {
        props.setSelectedCondition(conditionID);
        closeModal();
    };

    const closeModal = () => {
        setSelectedCondIDs([]);
        props.setModalOpen(false);
    };  
 
    const columns = [
        { field: "name", headerName: "Name", width: 220,
            renderCell: (params) => {
                if (params?.value) {
                    const condition = params.row;
                    if (condition) {
                        return (
                            <ImageCell
                                image={ condition.pinned ? <PushPin sx={{ rotate: "45deg" }} /> : null }
                                text={condition.name}
                                textSx={{ 
                                    fontSize: "1rem", 
                                    fontWeight: 500, 
                                    pl: condition.pinned ? 0 : "1.7rem" 
                                }}
                            />
                        );
                    }
                }  
            }
        },
        { field: "medications", headerName: "Medications", width: 220,
            renderCell: (params) => {  
                if (params?.value) {
                    const meds = params.value;  
                    if (meds?.length > 0) {
                        return (
                            <Stack direction="column" spacing={1} sx={{ m: "0.8rem 0" }} >
                                {  meds.map((med) => (
                                    <Stack 
                                        key={ med.medID } 
                                        direction="row" 
                                        spacing={1}
                                        sx={{ alignItems: "center" }} 
                                    >
                                        <ColorBox color={ med.color.main } /> 
                                        <Typography sx={{ textWrap: "wrap" }} >
                                            { med.name }
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        );
                    }
                }  
            }
        },
        { field: "providers", headerName: "Providers", width: 220,
            renderCell: (params) => {  
                if (params?.value) {
                    const providers = params.value;
                    if (providers?.length > 0) {
                        return (
                            <Stack direction="column" spacing={1} sx={{ m: "0.5rem 0" }} > 
                                { providers.map((provider) => (
                                    <Stack
                                        key={ provider.providerID }
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: "center" }}
                                    >
                                        <Avatar 
                                            src={ provider.fullPicturePath } 
                                            alt={ provider.name }
                                            sx={{ width: 22, height: 22 }} 
                                        />

                                        <Typography sx={{ fontSize: "0.85rem", textWrap: "wrap" }} >
                                            { provider.name }
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        );
                    }
                }
            }
        }
    ];  

    return (
        <Modal open={true} onClose={closeModal} >   
            <Stack direction="column" spacing={2} sx={modalSx} >
                <ContainerTitle
                    title="ALL CONDITIONS"
                    titleIcon={ <MonitorHeartOutlined sx={{ fontSize: 21 }} /> }
                    extraContent={ selectedCondIDs.length > 0 ? (
                        <TooltipButton 
                            type="delete" 
                            label="Delete Conditions" 
                            onClick={deleteConditions} 
                        />
                    ) : (
                        <TooltipButton 
                            type="add" 
                            label="Add Condition" 
                            onClick={() => props.openForm("condition")} 
                        />
                    )}
                />
                { props.conditions.all?.length > 0 ? (
                    <CustomDataGrid
                        columns={columns}  
                        rows={ props.conditions.all }
                        getRowId={ (row) => row.conditionID }
                        getRowHeight={() => "auto"} 
                        onRowClick={ (params) => setSelectedCondition(params.row.conditionID) } 
                        onRowSelectionModelChange={ (newModel) => setSelectedCondIDs(newModel) } 
                    /> 
                ) : (
                    <ErrorGraphicMessage type="condition" onClick={() => props.openForm("condition")} />
                )}      
            </Stack> 
        </Modal>
    );
});