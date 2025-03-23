import { Box, Chip, Divider, Stack, Typography, useTheme } from "@mui/material";
import { Add, CalendarMonthOutlined,  Notes, Person, Scale } from "@mui/icons-material";
import { memo, useState } from "react"; 
import { ContainerTitle, FilledButton, TooltipButton } from "../../components";    
import { formatMedTime, getSchedAbbrev, getTimeIcon } from "../../utils";
import { pageStyles } from "../../styles";

// formats each detail for `SelectedMedBox`
const SelectedMedDetail = ({ icon, title, text }) => {
    const palette = useTheme().palette;
    const iconBoxSx = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "3rem",
        height: "3rem",
        borderRadius: "1rem",
        bgcolor: palette.secondary.main
    };

    return (
        <Stack direction="row" spacing={1} >  
            <Box sx={iconBoxSx} > { icon } </Box>         
            <Stack direction="column" sx={{ justifyContent: "space-between" }} >
                <Typography sx={{ fontSize: "0.8rem", color: palette.neutral.dark }} >
                    { title }
                </Typography> 
                <Typography 
                    sx={{ 
                        fontSize: "1.1rem", 
                        fontWeight: 500, 
                        color: palette.background.contrastText 
                    }} 
                >
                    { text }
                </Typography> 
            </Stack>
        </Stack>
    )
};

// displays full details for currently selected med
const SelectedMedBox = ({ med, openForm }) => { 
    const palette = useTheme().palette; 
    const iconSx = { fontSize: 20, color: palette.primary.contrastText };
    const DetailDivider = () => (
        <Divider 
            orientation="vertical" 
            variant="middle" 
            flexItem 
            sx={{ bgcolor: palette.neutral.dark }} 
        />
    );

    return (
        <Stack direction="column" spacing={3} sx={{ flex: 1, pb: "1rem" }} >
            <ContainerTitle
                titleIcon={ <img src={ med.img } alt="pills" style={{ width: 30, height: 30 }} /> }
                title={ med.name }
                extraContent={
                    <TooltipButton type="edit" label="Edit" onClick={() => openForm(med)} />
                }
            />
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2 }} > 
                <SelectedMedDetail
                    icon={ <Scale sx={{...iconSx, fontSize: 18 }} /> }
                    title="DOSAGE"
                    text={ med.dosage ?? "" } 
                />
                <DetailDivider /> 

                <SelectedMedDetail
                    icon={ <Person sx={iconSx} /> }
                    title="PRESCRIBER"
                    text={ med.provider?.name ?? "" } 
                /> 
                <DetailDivider /> 

                <SelectedMedDetail
                    icon={ <CalendarMonthOutlined sx={iconSx} /> }
                    title="SCHEDULE"
                    text={ getSchedAbbrev(med).join(" ") } 
                />  
                <DetailDivider /> 

                <SelectedMedDetail
                    icon={ getTimeIcon(med.time, iconSx) }
                    title="TIME"
                    text={ formatMedTime(med.time) } 
                />  
            </Stack>  
            <SelectedMedDetail
                icon={ <Notes sx={iconSx} /> }
                title="INSTRUCTIONS"
                text={ med.notes ?? "" } 
            />   
        </Stack>
    );
};

// displays limited details for unselected meds
const UnselectedMedBox = ({ med, color }) => (
    <Stack
        direction="row"
        spacing={2}
        sx={{ width: "100%", justifyContent: "flex-start", alignItems: "center" }}
    >
        <img src={ med.img } alt="pills" style={{ width: 45, height: 45 }} />
        <Stack direction="column" spacing={0.2} sx={{ flex: 1 }} >
            <Stack 
                direction="row"
                sx={{ 
                    width: "100%", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}
            >
                <Typography sx={{ fontSize: "1.3rem", fontWeight: 500 }} > { med.name } </Typography> 
                { med.dosage && (
                    <Chip
                        label={ med.dosage }
                        sx={{ fontSize: "0.8rem", '&.MuiChip-root': { height: "2rem" }}}
                    />
                )}
            </Stack>  
            <Typography sx={{ fontSize: "0.9rem", color: color }} >
                { `taken ${ formatMedTime(med.time) }` }
            </Typography>
        </Stack>
    </Stack>
);

/**
 * Lists current member's medications scheduled for the date selected in weekly calendar
 */

export const WeeklyMedsList = memo(({ meds, openForm }) => {  
    const palette = useTheme().palette; 
    const [selectedMed, setSelectedMed] = useState(null);   
    const contrastColor = palette.background.contrastText;
    const medImgBoxSx = {
        justifyContent: "space-between",
        alignItems: "center",
        p: "0.6rem 1.4rem 0.6rem 1.4rem",
        userSelect: "none",
        borderRadius: "1rem",
        bgcolor: palette.background.container, 
        '&:hover': {
            cursor: "pointer", 
            border: `0.1rem solid ${ contrastColor }`
        }
    };

    const toggleSelectedMed = (isSelectedMed, med) => setSelectedMed(isSelectedMed ? null : med);

    return (  
        <Stack direction="column" spacing={1} sx={pageStyles} >  
            <Box> 
                <FilledButton text="Add" icon={ <Add /> } onClick={openForm} /> 
            </Box> 
            <Stack 
                direction="row"
                sx={{
                    width: "100%",  
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    gap: "1.5rem 1.5rem",
                    p: "1rem 0"
                }}
            >
                { meds.map((med) => {
                    const isSelectedMed = med === selectedMed;  
                    return (
                        <Stack  
                            key={ med.medID }
                            direction="row" 
                            onClick={() => toggleSelectedMed(isSelectedMed, med)}
                            sx={{
                                width: isSelectedMed ? "54rem" : "26rem",
                                height: isSelectedMed ? "auto" :  "6rem", 
                                border: isSelectedMed ? `0.1rem solid ${contrastColor}` : "none",
                                ...medImgBoxSx
                            }}
                        > 
                            { isSelectedMed ? (
                                <SelectedMedBox med={med} openForm={openForm} /> 
                            ) : (
                                <UnselectedMedBox med={med} color={contrastColor} /> 
                            )}
                        </Stack>
                    );
                })}
            </Stack> 
        </Stack>  
    );
});