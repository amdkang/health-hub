import { Badge, Box, Stack, Typography, useTheme } from "@mui/material";
import { EventNoteOutlined, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material"; 
import { Fragment, memo, useContext } from "react";
import { DashboardContext } from "../dashboard/Calendar";
import { getDateEvents } from "../../utils";
import { DAYS } from "../../constants";
import dayjs from "dayjs";

// adds specified # of days to current week & returns formatted data for new week 
export const addDaysToWeek = (daysOfWeek, daysCount) => {
    const newDaysOfWeek = daysOfWeek.days.map(day => {
        const newDate = dayjs(day.date).add(daysCount, "day");
        return {
            ...day,
            date: newDate,
            fmtedDate: dayjs(newDate).format("D")
        };
    });
    return newDaysOfWeek;
};

const DashboardEventsBadge = ({ color }) => (
    <Badge
        overlap="circular"
        badgeContent={
            <Box
                sx={{
                    width: "0.5rem",
                    height: "0.5rem",
                    borderRadius: "50%",
                    bgcolor: color 
                }}
            />
        }
    />
); 

const DashboardDayContainer = ({ day, index, daysOfWeek, setDaysOfWeek }) => {
    const palette = useTheme().palette;
    const context = useContext(DashboardContext);  

    const date = daysOfWeek.days[index].date;
    const areDatesEqual = dayjs(date).isSame(dayjs(context.selected.date), "day");
    const dayTextColor = areDatesEqual ? palette.primary.contrastText : palette.primary.darkText;

    return (
        <Stack 
            direction="column"
            key={index}
            onClick={() => {
                // set new date & update events shown
                setDaysOfWeek(prev => ({ ...prev, selectedIndex: index }));
                const selectedDayEvents = getDateEvents(context.events, date);
                context.setSelected({ date: dayjs(date), events: selectedDayEvents });
            }}  
            sx={{
                width: "2.5rem",
                height: "4rem",
                justifyContent: "space-between",
                alignItems: "center",
                p: "0.5rem 0",
                borderRadius: "1rem",
                bgcolor: areDatesEqual ? palette.primary.main : "none",
                userSelect: "none",
                '&:hover': {
                    cursor: "pointer",
                    border: `0.1rem solid ${ palette.background.contrastText }`
                }
            }}
        >
            <Typography sx={{ color: dayTextColor, fontSize: "0.8rem" }} >
                { DAYS[day.index].longName }
            </Typography> 
            <Typography sx={{ color: dayTextColor, fontSize: "0.9rem" }} >
                { day.fmtedDate }
            </Typography>

            { getDateEvents(context.events, date).length > 0 && (
                <DashboardEventsBadge color={ palette.tertiary.main } />
            )}
        </Stack>
    );
};

// for weekly calendar on `MedicationsPage`
const MedDayContainer = ({ day, index, daysOfWeek, setDaysOfWeek }) => {  
    const palette = useTheme().palette;
    const isSelected = index === daysOfWeek.selectedIndex;
    const textColor = isSelected ? palette.primary.contrastText : palette.background.contrastText;

    return (
        <Stack 
            direction="column"  
            onClick={() => // set as selected date
                setDaysOfWeek(prev => ({ ...prev, selectedIndex: index }))
            } 
            sx={{
                width: "7rem",
                height: "8rem",
                justifyContent: "space-between",
                alignItems: "center",
                p: "1rem 0",
                borderRadius: "1rem", 
                bgcolor: isSelected ? palette.primary.main : palette.background.container,
                userSelect: "none",
                '&:hover': { cursor: "pointer", border: `0.1rem solid ${ textColor }` }
            }}
        >
            <Typography variant="h4" sx={{ color: textColor }} >
                { DAYS[day.index].longName }
            </Typography>
            <Typography variant="h5" sx={{ color: textColor }} >
                { day.fmtedDate }
            </Typography>
        </Stack>
    );
};

/**
 * Renders a weekly calendar depicting the currently selected week
 */

export const WeeklyCalendar = memo(({ type, height, daysOfWeek, setDaysOfWeek, sx }) => {
    const palette = useTheme().palette;  
    const MedTitleSx = { fontSize: "1.5rem", fontWeight: 500 };
    const DashboardTitleSx = { fontSize: "1.2rem", fontWeight: 400, pl: "0.3rem" };
    const arrowSx = {
        fontSize: "2rem",
        p: "0.3rem",
        border: `0.1rem solid ${ palette.neutral.light }`,
        borderRadius: "1rem",
        "&:hover": {
            border: `0.1rem solid ${ palette.primary.main }`,
            cursor: "pointer"
        }
    }; 

    const getSelectedMonthYear = () => { 
        const { days, selectedIndex } = daysOfWeek;
        if (days.length > 0 && selectedIndex !== null) {
            const selectedDate = days[selectedIndex].date;
            return dayjs(selectedDate).format("MMMM YYYY");
        } 
        return "";
    }; 

    // navigate to next or previous week
    const onArrowClick = (days) => {
        setDaysOfWeek(prev => ({ ...prev, days: addDaysToWeek(daysOfWeek, days) }));
    };  
  
    return (
        <Stack 
            direction="column" 
            spacing={2}
            sx={{ width: "100%", height: height, overflow: "hidden", ...sx }}
        > 
            <Stack 
                direction="row" 
                sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }} 
            >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} >
                    { type === "med" && <EventNoteOutlined sx={{ fontSize: 22 }} /> }

                    <Typography sx={ type === "med" ? MedTitleSx : DashboardTitleSx } >
                        { getSelectedMonthYear() }
                    </Typography> 
                </Stack>

                <Stack direction="row" spacing={0.6} >
                    <KeyboardArrowLeft onClick={() => onArrowClick(-7)} sx={arrowSx} />
                    <KeyboardArrowRight onClick={() => onArrowClick(7)} sx={arrowSx} />
                </Stack>
            </Stack>  

            <Stack direction="row" sx={{ width: "100%", justifyContent: "space-between" }} >
                { daysOfWeek.days.map((day, index) => (
                    <Fragment key={index} >
                        { type === "med" && (
                            <MedDayContainer 
                                day={day} 
                                index={index} 
                                daysOfWeek={daysOfWeek}
                                setDaysOfWeek={setDaysOfWeek}
                            /> 
                        )} 
                        { type === "dashboard" && (
                            <DashboardDayContainer 
                                day={day} 
                                index={index} 
                                daysOfWeek={daysOfWeek}
                                setDaysOfWeek={setDaysOfWeek} 
                            />
                        )} 
                    </Fragment>
                ))}
            </Stack> 
        </Stack>
    );
}); 