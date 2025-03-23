import { alpha, Box, Chip, FormControl, LinearProgress, MenuItem, Select, Stack, Typography, useTheme } from "@mui/material";
import { MedicationOutlined } from "@mui/icons-material";
import { PieChart } from "@mui/x-charts/PieChart"; 
import { memo, useEffect, useState } from "react";  
import { useCustomNavigate } from "../../useCustomNavigate";
import { ColorBox, ContainerTitle, ErrorGraphicMessage, LoadingCircle, TooltipButton } from "../../components"; 
import { MAIN_USER_ID } from "../../constants";
import { formatMedSchedule } from "../../utils";
import { containerStyles, scrollBarStyles } from "../../styles";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

// menu used to set med schedule type (`daily` vs `prn`)
const ContainerTitleMenu = ({ scheduleType, setScheduleType }) => {
    const { goToMeds } = useCustomNavigate(); 

    const ScheduleTypeSelector = () => (
        <FormControl>
            <Select
                value={scheduleType}
                onChange={ (event) => setScheduleType(event.target.value) }
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                sx={{ height: "2rem", width: "10rem", borderRadius: "0.5rem" }}
            >
                <MenuItem value="daily" > Daily </MenuItem> 
                <MenuItem value="prn" > As Needed </MenuItem>
            </Select>
        </FormControl> 
    );

    return (
        <Stack direction="row" sx={{ alignItems: "center" }} >
            <ScheduleTypeSelector /> 
            <TooltipButton
                type="more"
                label="View All Medications"
                onClick={() => goToMeds(MAIN_USER_ID)}
            />
        </Stack>
    )
};

// shows details for med hovered in pie graph
const CustomTooltip = (props) => {
    const med = props.series.data[props.itemData.dataIndex]; 
    const time = props.scheduleType === "prn" ? "as needed" : med.time;

    return (
        <Stack 
            direction="column" 
            spacing={1}
            sx={{
                minWidth: "14rem",
                p: "1rem 1.2rem",
                bgcolor: props.palette.background.container,
                border: `0.1rem solid ${ alpha(med.color, 1) }`,
                borderRadius: "1rem"
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} >
                <ColorBox color={ med.color } /> 
                <Typography sx={{ fontSize: "1.2rem", mr: "1.2rem" }} > 
                    { med.name } 
                </Typography> 

                <Chip
                    label={time}
                    sx={{
                        height: "1.5rem",
                        fontSize: "0.8rem",
                        '& .MuiChip-label': { p: "0 0.8rem" }
                    }}
                />
            </Stack> 
            <Typography sx={{ fontSize: "0.9rem", color: props.palette.neutral.dark, pl: "2rem" }} >
                { med.dosage }
            </Typography> 
        </Stack>
    );
}; 

// shows name + dosage for each med of `MedListItem`
const MedListItemTop = ({ med }) => (
    <Stack 
        direction="row"
        sx={{
            flexGrow: 1,
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center"
        }}
    >
        <Typography sx={{  fontSize: "0.9rem", mr: "0.3rem" }} > { med.name } </Typography> 
        <Typography
            sx={{  
                fontSize: "0.7rem",
                border: "0.1rem solid gray",
                borderRadius: "0.3rem",
                color: "gray", 
                p: "0.2rem 0.3rem"
            }}
        >
            { med.dosage }
        </Typography>  
    </Stack>
);

// shows time + progress bar for each med of `MedListItem`
const MedListItemBottom = ({ time, progress, color }) => (
    <Stack direction="column" sx={{ flex: 1 }} > 
        <Typography sx={{ whiteSpace: "nowrap", fontSize: "1rem", fontWeight: 600 }} >
            { time }
        </Typography> 
        <Typography sx={{ textAlign: "right", fontSize: "0.8rem", color: color }} >
            { `${ progress }%` }
        </Typography> 
    </Stack>  
);

// shows details for each med in a scrollable list 
const MedListItem = ({ props }) => {  
    const progress = props.med.checked ? 100 : 0;
    const time = props.scheduleType === "prn" ? "PRN" : props.med.time; 
    const isHighlighted = props.index === props.hoveredMedIndex; 
    const listItemSx = {
        height: "auto",
        p: "0.6rem",  
        borderRadius: "0.5rem", 
        bgcolor: isHighlighted ? props.palette.action.hover : "none",
        '&:hover': {
            cursor: "pointer",
            bgcolor: props.palette.action.hover  
        }
    };
 
    return (
        <Stack 
            direction="row" 
            spacing={0.8}
            onClick={() => props.checkMed(props.med.index)} 
            sx={listItemSx}
        > 
            <Stack direction="column" spacing={0.8} sx={{ width: "85%", pb: "0.3rem" }} >
                <Stack 
                    direction="row"
                    spacing={0.5}
                    sx={{ flexGrow: 1, flexWrap: "wrap", overflow: "hidden", alignItems: "center" }}
                >
                    <ColorBox color={ props.med.color } /> 
                    <MedListItemTop med={props.med} />
                </Stack> 

                <LinearProgress 
                    variant="determinate" 
                    value={progress}  
                    sx={{
                        width: "100%",
                        borderRadius: "1rem", 
                        '&.MuiLinearProgress-root': { bgcolor: props.palette.neutral.main }
                    }}
                /> 
            </Stack>  
            <MedListItemBottom time={time} progress={progress} color={ props.palette.neutral.main } />
        </Stack>
    );
};  

/**
 * Displays a list and pie graph of the main user's medications scheduled for the current day
 * Allows users to mark + track which medications have been taken
 */

export const MedTracker = memo(({ meds, openMedsPage, sx }) => {
    const palette = useTheme().palette;
    const [loading, setLoading] = useState(true);
    const [fmtedMeds, setFmtedMeds] = useState({ prn: [], daily: [] });   
    const [scheduleType, setScheduleType] = useState("daily"); 
    const [hoveredMedIndex, setHoveredMedIndex] = useState(-1);
    const currentMeds = fmtedMeds[scheduleType] ?? [];  
 
    const series = [{
        id: "series-2",
        data: currentMeds,
        innerRadius: sx.innerRadius, 
        outerRadius: sx.outerRadius,
        cx: sx.cx, 
        highlightScope: {
            faded: hoveredMedIndex === -1 ? "none" : "global",
            highlightedMed: "item"
        },
        faded: { innerRadius: 50, additionalRadius: -5 }
    }];

    // format & set daily/prn med schedules
    useEffect(() => { 
        setLoading(true);
        const medSchedule = formatMedSchedule(meds); 
        const currentDate = dayjs().day();
        const fmtedDailyMeds = formatMeds(medSchedule[currentDate]); 
        const prnMeds = meds.filter(med => med.frequency === "prn");
        const fmtedPrnMeds = prnMeds ? formatMeds(prnMeds) : [];
        setFmtedMeds({ prn: fmtedPrnMeds, daily: fmtedDailyMeds });
        setLoading(false);
    }, [meds]); 

    // returns array of formatted meds with one entry for each instance of med taken 
    const formatMeds = (meds) => {
        let medCounter = 0; 
        return meds.flatMap(med => {
            const fmtedMed = {
                name: med.name,
                dosage: med.dosage,
                time: med.time,
                color: alpha(med.color.main, 0.3),
                value: 1,
                checked: false, 
                index: medCounter++
            };
            if (med.time === "both") { 
                // return duplicate instances for daily meds (taken AM & PM)
                const amMed = { ...fmtedMed, time: "AM", value: 0.5 };
                const pmMed = { ...fmtedMed, time: "PM", value: 0.5, index: medCounter++ };
                return [amMed, pmMed];
            }
            return [fmtedMed]; 
        });
    };  

    // highlights corresponding `MedListItem` when med in graph is hovered over
    const onHighlightChange = (event) => setHoveredMedIndex(event ? event.dataIndex : -1);

    // toggles med's taken status in graph and `MedsList`
    const checkMed = (checkedIndex) => {  
        const updatedMeds= currentMeds.map((med, index) => {
            const updatedMed = index === checkedIndex 
                ? {
                    ...med,
                    checked: !med.checked,
                    color: med.checked ? alpha(med.color, 0.4) : alpha(med.color, 1)
                }
                : med;
            return updatedMed;
        });  

        if (scheduleType === "daily") {
            setFmtedMeds(prevState => ({ ...prevState, daily: updatedMeds }));
        } else if (scheduleType === "prn") {
            setFmtedMeds(prevState => ({ ...prevState, prn: updatedMeds }));
        }
    };   

    const medListItemProps ={ scheduleType, palette, hoveredMedIndex, checkMed };
     
    return ( 
        <Box
            sx={{
                display: "flex",
                flex: 1,
                bgcolor: palette.background.container,
                ...containerStyles
            }}
        >   
            { loading && <LoadingCircle sx={{ mt: "2rem" }} /> }

            { !loading &&
                <Stack direction="column" sx={{ width: "100%", height: "100%" }} > 
                    <ContainerTitle
                        titleIcon={ <MedicationOutlined sx={{ fontSize: 22 }} /> } 
                        title="Medication Tracker"
                        extraContent={ 
                            <ContainerTitleMenu 
                                scheduleType={scheduleType} 
                                setScheduleType={setScheduleType}  
                            /> 
                        } 
                    />  
                    { currentMeds.length > 0 ? (
                        <Stack 
                            direction="row"
                            sx={{ 
                                width: "100%",
                                height: "95%",
                                justifyContent: "space-between",
                                pt: "2rem"
                            }}
                        >
                            <PieChart 
                                width={ sx.width }
                                height={ sx.height }
                                series={series}
                                slots={{ itemContent: CustomTooltip }}
                                slotProps={{
                                    legend: { hidden: true },
                                    noDataOverlay: { message: "" },
                                    itemContent: {
                                        scheduleType: scheduleType,
                                        palette: palette
                                    }
                                }}
                                tooltip={{ trigger: "item" }} 
                                onHighlightChange={onHighlightChange}
                                onItemClick={ (_event, med) => checkMed(med.dataIndex) }  
                            />  

                            <Stack 
                                direction="column"
                                sx={{
                                    width: "50%",
                                    height: "90%",   
                                    pr: "0.3rem",
                                    overflowY: "auto",   
                                    ...scrollBarStyles
                                }} 
                            >  
                                { currentMeds.map((med, index) => (
                                    <MedListItem  
                                        key={index}  
                                        props={{ med, index, ...medListItemProps }}
                                    /> 
                                ))}
                            </Stack>
                        </Stack>
                    ) : (
                        <ErrorGraphicMessage type="dashboardMed" onClick={openMedsPage} /> 
                    )} 
                </Stack>
            } 
        </Box>
    );
}); 