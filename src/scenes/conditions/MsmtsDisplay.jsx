import { Box, Dialog, DialogContent, FormControl, MenuItem, Select, Stack, useTheme } from "@mui/material"; 
import { Edit, Search } from "@mui/icons-material"; 
import { forwardRef, memo, useCallback, useRef, useState } from "react";   
import { ContainerTitle, CustomContextMenu, ErrorGraphicMessage, TooltipButton } from "../../components";   
import { ConditionsModal } from "./ConditionsModal";
import { MsmtsGraph } from "./MsmtsGraph"; 
import { MsmtsDataGrid } from "./MsmtsDataGrid";
import { ConditionForm, MeasurementForm } from "../forms"; 
import { containerStyles, formDialogStyles } from "../../styles"; 

// menu used to change current member's selected condition
const ConditionSelector = ({ conditions, setSelectedCondition }) => ( 
    <FormControl sx={{ ml: "-1rem" }} >
        <Select
            value={ conditions.selected.conditionID } 
            onChange={ (event) => setSelectedCondition(event.target.value) }
            displayEmpty
            autoWidth
            inputProps={{ "aria-label": "Without label" }}
            sx={{
                height: "2rem",
                fontSize: 20,
                fontWeight: 500,
                borderRadius: "1rem",
                '.MuiOutlinedInput-notchedOutline': { display: "none" }
            }}
        >
            { conditions.all.map((cond) => (
                <MenuItem value={ cond.conditionID } key={ cond.conditionID } >
                    { cond.name }
                </MenuItem>
            ))}
        </Select>
    </FormControl> 
);
 
// shows line graph tracking selected condition's measurements
const MsmtsGraphSection = forwardRef(({ props }, ref) => {     
    const condition = props.conditions.selected;
    const pinButton = condition.pinned ? (
        <TooltipButton type="unpin" label="Unpin from Dashboard" onClick={props.onPinClick} />
    ) : (
        <TooltipButton type="pin" label="Pin to Dashboard" onClick={props.onPinClick} />
    ); 

    return ( 
        <Stack direction="column" sx={{ width: "100%", height: "114%" }} > 
            <ContainerTitle
                titleIcon={pinButton} 
                titleContent={ 
                        <ConditionSelector 
                        conditions={ props.conditions } 
                        setSelectedCondition={ props.setSelectedCondition }
                    /> 
                }
                extraContent={
                    <TooltipButton
                        ref={ref} 
                        type="more"
                        label="Options"
                        onClick={ props.openMenu } 
                    />
                }
            />    
            { condition.measurements.length > 0 ? (
                <MsmtsGraph condition={condition} /> 
            ) : (
                <ErrorGraphicMessage type="msmt" onClick={() => props.openForm("measurement")} />
            )}  
        </Stack>
    );
});

/**
 *  Renders visualizations (graph & grid) for the selected condition's measurement data  
 *  Provides forms to add, edit, or delete any measurements
 */

export const MsmtsDisplay = memo(({ props }) => {    
    const palette = useTheme().palette;  
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ type: null, item: null, open: false });
    const menuRef = useRef(null); 
    const btnRef = useRef(null);  
    const menuItems = [
        {
            title: "Edit Condition",
            icon: <Edit />,
            onClick: () => { openForm("condition", props.conditions.selected) }
        },
        {
            title: "View All Conditions",
            icon:  <Search />,
            onClick: () => { setModalOpen(true) }   
        }
    ]; 

    const openMenu = () => menuRef.current?.openMenu(btnRef.current, "bottomLeft", menuItems);

    const onPinClick = async () => await props.handlePinToggle();  

    const openForm = (formType, item = null) => setForm({ type: formType, item: item, open: true }); 

    const closeForm = () => setForm({ type: null, item: null, open: false });

    const onConditionFormSubmit = async (formData) => { 
        closeForm();   
        const conditionData = { ...formData, memberID: props.memberID };  
        await props.handleConditionAdd(conditionData);
    }; 
    
    const onMsmtFormSubmit = async (formData) => {  
        closeForm();    
        const msmtData = {
            ...formData,
            conditionID: props.conditions.selected.conditionID
        };
        await props.handleMsmtAdd(msmtData);
    };  

    const renderFormType = () => { 
        switch (form.type) {
            case "condition":
                return (
                    <ConditionForm
                        currentCond={ form.item }
                        allProviders={ props.personnel.providers }
                        allMeds={ props.meds}
                        onSubmit={onConditionFormSubmit}
                        onCancelClick={closeForm}
                    />
                ); 
            case "measurement":
                return (
                    <MeasurementForm
                        currentMsmt={ form.item }
                        onSubmit={onMsmtFormSubmit}  
                        onCancelClick={closeForm}
                    />
                );
            default: 
                return null;
        };
    }; 

    const setSelectedCondition = useCallback((conditionID) => {
        props.fmtSetConditions(props.conditions.all, conditionID)
    }, [props.conditions, props.fmtSetConditions]);

    const msmtGraphProps = { 
        onPinClick, 
        openForm, 
        openMenu, 
        setSelectedCondition, 
        conditions: props.conditions 
    };

    const modalProps = {
        openForm,
        setModalOpen,
        handleConditionDelete: props.handleConditionDelete,
        conditions: props.conditions,
        setSelectedCondition
    };

    return (
        <Stack direction="column" spacing={2} sx={{ width: "50%" }} >
            <Box
                sx={{
                    width: "100%",
                    height: "25rem",
                    bgcolor: palette.background.container,
                    ...containerStyles
                }}
            >   
                { props.conditions.selected ? (
                    <MsmtsGraphSection props={msmtGraphProps} ref={btnRef} /> 
                ) : (      
                    <ErrorGraphicMessage type="condition" onClick={() => openForm("condition")} /> 
                )}  

                { modalOpen && <ConditionsModal props={modalProps} /> } 
            </Box>      
            
            <MsmtsDataGrid
                condition={ props.conditions.selected }
                setSelectedCondition={setSelectedCondition}
                handleMsmtDelete={ props.handleMsmtDelete }
                openForm={openForm} 
            /> 

            <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                <DialogContent>
                    { renderFormType() }
                </DialogContent>
            </Dialog>
            <CustomContextMenu ref={menuRef} /> 
        </Stack>
    );
}); 