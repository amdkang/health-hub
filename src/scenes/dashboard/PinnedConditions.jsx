import { alpha, Box, Chip, IconButton, Stack, useTheme } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight, PushPin } from "@mui/icons-material";
import { forwardRef, memo, useRef, useState } from "react";
import { useCustomNavigate } from "../../useCustomNavigate";
import { ContainerTitle, ErrorGraphicMessage, TooltipButton } from "../../components";  
import { MsmtsGraph } from "../conditions/MsmtsGraph";
import { MAIN_USER_ID } from "../../constants";
import { containerStyles } from "../../styles";
 
// row of chips used to set selected condition 
const ConditionChips = forwardRef(({ props }, ref) => (
    <Stack 
        direction="row" 
        spacing={1}
        ref={ref}
        // ref={chipsRef}
        sx={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", scrollBehavior: "smooth" }}
    >
        { props.conditions.map((condition) => {
            const isSelected = condition === props.selectedCondition;
            const bgcolor = isSelected ? props.palette.primary.main : "none";
            const hovercolor = isSelected ? alpha(props.palette.primary.main, 0.7) : "default";
            const textcolor = isSelected ? 
                props.palette.primary.contrastText : props.palette.primary.darkText;
        
            return (
                <Chip 
                    key={ condition.conditionID }
                    label={ condition.name }
                    variant="outlined"
                    onClick={() => props.setSelectedCondition(condition)}
                    sx={{
                        fontSize: "0.8rem",
                        bgcolor: bgcolor,
                        color: textcolor,
                        '&.MuiChip-root:hover': { bgcolor: hovercolor }
                    }}
                /> 
            );
        })}
    </Stack>  
));
 
/**
 * Displays list of all pinned conditions along with their measurement graphs
 */

export const PinnedConditions = memo(({ conditions }) => {
    const palette = useTheme().palette;
    const chipsRef = useRef(null);
    const { goToConditions } = useCustomNavigate(); 
    const [selectedCondition, setSelectedCondition] = useState(null);
    if (conditions?.length > 0 && !selectedCondition) {
        setSelectedCondition(conditions[0])
    };

    const openConditionsPage = () => { goToConditions(MAIN_USER_ID) };

    // navigates left/right through `ConditionSelector` chips
    const scrollLeft = () => { if (chipsRef.current) chipsRef.current.scrollLeft -= 100 };

    const scrollRight = () => { if (chipsRef.current) chipsRef.current.scrollLeft += 100 };

    const conditionsProps = { palette, conditions, selectedCondition, setSelectedCondition };

    return (
        <Box
            sx={{
                width: "50%",
                height: "100%",
                bgcolor: palette.background.container,
                ...containerStyles
            }}
        > 
            <Stack direction="column" sx={{ width: "100%", height: "114%" }} >
                <ContainerTitle
                    titleIcon={ <PushPin sx={{ rotate: "45deg", fontSize: 18 }} /> } 
                    title="Pinned Conditions"
                    extraContent={
                        <TooltipButton type="more" label="View All Conditions" onClick={openConditionsPage} />  
                    }
                />  
                { selectedCondition ? (
                    <>
                        <Stack direction="row" sx={{ width: "100%", mt: "-0.5rem"}} >
                            <IconButton onClick={scrollLeft} > <KeyboardArrowLeft /> </IconButton>  
                            <ConditionChips ref={chipsRef} props={conditionsProps} />
                            <IconButton onClick={scrollRight} > <KeyboardArrowRight /> </IconButton> 
                        </Stack>

                        <Stack sx={{ width: "100%", height: "100%", overflow: "hidden", pl: "1rem" }} >
                            { selectedCondition.measurements.length > 0 ? (
                                <MsmtsGraph condition={selectedCondition} onAxisClick={openConditionsPage} />
                            ) : (
                                <ErrorGraphicMessage type="dashboardMsmt" onClick={openConditionsPage} /> 
                            )}
                        </Stack>
                    </>
                ) : (
                    <ErrorGraphicMessage type="pinCondition" onClick={openConditionsPage} />  
                )}
            </Stack>
        </Box>
    );
}); 