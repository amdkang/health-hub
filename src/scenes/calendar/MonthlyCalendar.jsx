import { Box, Stack, Typography, useTheme } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useContext } from "react";
import { CalendarContext } from ".";
import { DashboardContext } from "../dashboard/Calendar";
import { areSameDates, getDateEvents } from "../../utils";
import { DAYS } from "../../constants";
import { ellipsisTextStyles, scrollBarStyles } from "../../styles";
import dayjs from "dayjs";

const DashboardDayContainer = ({ textColor, day, bgcolor }) => ( 
    <Typography
        sx={{
            width: "100%",
            height: "100%",
            display: "flex",  
            justifyContent: "center",
            alignItems: "center", 
            fontSize: "1rem",
            color: textColor, 
            borderRadius: "50%", 
            bgcolor: bgcolor
        }}
    >
        { day }
    </Typography>  
);

const CalendarDayContainer = ({ textColor, day, bgcolor }) => (
    <Box
        sx={{ 
            width: "100%",  
            display: "flex",
            justifyContent: "flex-end",  
            fontSize: "1.1rem",
            pr: "0.3rem"
        }}
    >
        <Typography
            sx={{ 
                fontSize: "1.1rem",
                p: "0.3rem 0.7rem", 
                color: textColor,   
                borderRadius: "50%", 
                bgcolor: bgcolor
            }}
        >
            { day }
        </Typography> 
    </Box>
); 

const DashboardEventsBadge = ({ color }) => (
    <Box
        sx={{
            width: "0.5rem",
            height: "0.5rem",
            float: "right",
            position: "absolute",
            borderRadius: "50%",
            bgcolor: color
        }}
    />
); 

// shows name/number of events for day with scheduled events
const CalendarEventsBox = ({ events }) => { 
    const palette = useTheme().palette;
    const eventsBoxText = events.length > 1 ? "Events" : events[0].name; 
    const textStyles = { color: palette.primary.contrastText, fontSize: "0.8rem" };
    const boxSx = {
        width: "90%",
        height: "2rem",
        borderRadius: "0.4rem",
        bgcolor: palette.secondary.main, 
        alignItems: "center",
        justifyContent: "space-between",
        p: "0 0.2rem 0 0.4rem"
    };

    return (
        <Stack direction="row" sx={boxSx} > 
            <Typography sx={{ ...textStyles,  ...ellipsisTextStyles }} >
                { eventsBoxText }
            </Typography>  
            { events.length > 1 && (
                <Box
                    sx={{
                        display: "flex",
                        p: "0.2rem 0.5rem",
                        bgcolor: palette.primary.main, 
                        borderRadius: "0.3rem", 
                    }}
                >
                    <Typography sx={{ ...textStyles, alignSelf: "center" }} >
                        { events.length }
                    </Typography>
                </Box>
            )}
        </Stack>
    );
};  

// lists MUI-specific `DateCalendar` props to filter out
const excludedProps = [
    "today",
    "disableHighlightToday",
    "showDaysOutsideCurrentMonth",
    "isAnimating",
    "onDaySelect",
    "outsideCurrentMonth",
    "isFirstVisibleCell",
    "isLastVisibleCell",
    "context",
    "calendarContext",
    "dashboardContext",
    "dayStyles", 
    "palette" 
];

// removes `excludedProps` from custom rendered components/slots
const filterProps = (props, excludedProps) => {
    const filteredProps = { ...props };
    excludedProps.forEach(prop => {
        if (prop in filteredProps) delete filteredProps[prop];
    });
    return filteredProps;
};

const CustomDay = ({ ...props }) => { 
    const context = props.calendarContext ?? (props.dashboardContext ?? null); 
    const fmtedDay = dayjs(props.day).format("D"); 
    const isSelectedDay = areSameDates(props.day, context.selected.date);  
    const inSameMonth = dayjs(props.day).isSame(dayjs(), "month");  
    const selectedEvents = getDateEvents(context.events, props.day);
    const setNewDate = () => context.setSelected({ date: props.day, events: selectedEvents });
    
    const bgcolor =  isSelectedDay ? props.palette.primary.main : "none";
    const textColor = isSelectedDay ? props.palette.primary.contrastText : (
        inSameMonth ? "default" : props.palette.neutral.main
    );  

    return (
        <Stack
            key={ props.day }
            onClick={setNewDate}
            { ...filterProps(props, excludedProps) }
            sx={{ ...props.dayStyles, bgcolor: props.palette.background.container }}
        >
            { props.dashboardContext && selectedEvents.length > 0 && (
                <DashboardEventsBadge color={ props.palette.tertiary.main } /> 
            )}

            { props.dashboardContext ? (
                <DashboardDayContainer textColor={textColor} day={fmtedDay} bgcolor={bgcolor} /> 
            ) : ( 
                <CalendarDayContainer textColor={textColor} day={fmtedDay} bgcolor={bgcolor} /> 
            )} 

            { props.calendarContext && selectedEvents.length > 0 && (
                <CalendarEventsBox events={selectedEvents} /> 
            )}
        </Stack>
    ); 
}; 

/**
 * Renders a monthly calendar, where dates with scheduled events are marked with visual indicator
 */

export const MonthlyCalendar = () => {
    const palette = useTheme().palette; 
    const calendarContext = useContext(CalendarContext);  
    const dashboardContext = useContext(DashboardContext);    
    const context = calendarContext ?? (dashboardContext ?? null);
 
    // returns abbreviation for day of week depending on context used     
    const customDayOfWeekFormatter = (day) => {
        if (calendarContext) { // use multi-character abbreviation
            const dayIndex = new Date(day).getDay();
            return DAYS[dayIndex].longName.toUpperCase(); 
        } 
        return day.format("dddd").charAt(0); // use single-character abbreviation 
    };

    const calendarDaySx = {
        width: "10rem",
        height: "7.6rem",
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
        m: "0.5rem",
        p: "0.5rem 0 0.6rem 0",
        borderRadius: "0.5rem",
        '&:hover': {
            outline: `0.1rem solid ${ palette.background.contrastText }`,
            cursor: "pointer"
        }
    };

    const dashboardDaySx = {
        width: "2.6rem",
        height: "2.6rem",
        alignItems: "flex-end",
        m: "0.1rem 0.3rem",
        borderRadius: "50%",
        '&:hover': { 
            outline: `0.1rem solid ${ palette.background.contrastText }`,
            bgcolor: palette.action.hover,
            cursor: "pointer"
        }
    };

    const calendarMonthSx = {  
        width: "72%",
        height: "100%",
        maxHeight: "100% !important",   
        borderRadius: "1rem",   
        pb: "1rem",
        '& .MuiPickersCalendarHeader-root': { 
            p: "0rem 0 0 0.5rem",
            borderRadius: "1rem 1rem 0 0",
            maxHeight: "3.2rem",
            minHeight: "3.2rem",
            mt: "0"
        },
        '& .MuiPickersCalendarHeader-label': { 
            fontSize: "1.2rem",
            fontWeight: 600,
        },
        '& .MuiPickersArrowSwitcher-button': {
            fontSize: "1.8rem"
        },
        '& .MuiPickersSlideTransition-root': { 
            minHeight: "44rem",
        }, 
        '& .MuiDayCalendar-weekDayLabel': {  
            fontSize: "1rem",
            height: "2rem",
            width: "10rem",
            m: "0.5rem 0.5rem 0 0.5rem",
            justifyContent: "right",
            alignItems: "end",
            pr: "0.5rem", 
        },
        '& .MuiDateCalendar-viewTransitionContainer': {
            height: "100%",
        },
        '& .MuiDayCalendar-root': {
            height: "100% !important",
        },
        '& .MuiPickersYear-yearButton': {
            fontSize: "1rem"
        },
        '& .MuiPickersMonth-monthButton': {
            fontSize: "1rem"
        }
    };

    const dashboardMonthSx = { 
        width: "95%",
        height: "22rem",  
        '& .MuiPickersCalendarHeader-root': { 
            p: "0rem 0.5rem 0 0.8rem",
            borderRadius: "1rem 1rem 0 0",
            maxHeight: "2.5rem",
            minHeight: "2.5rem"
        },
        '& .MuiPickersCalendarHeader-label': { 
            fontSize: "1.2rem", 
            fontWeight: 400
        },
        '& .MuiPickersCalendarHeader-switchViewButton': {
            display: "none"
        },
        '& .MuiPickersArrowSwitcher-button': {
            fontSize: "1.3rem",
            border: `0.1rem solid ${ palette.neutral.light }`,
            p: "0.3rem",
            '&:hover': { border: `0.1rem solid ${ palette.primary.dark }` }
        },
        '& .MuiPickersArrowSwitcher-spacer': {
            width: "2.2rem"
        },
        '& .MuiPickersSlideTransition-root': { 
            minHeight: "20.2rem",
        },
        '& .MuiYearCalendar-root': {
            width: "100%",
            height: "17rem",
            ...scrollBarStyles
        },
        '& .MuiMonthCalendar-root': {
            width: "100%"
        },
        '& .MuiDayCalendar-weekDayLabel': {  
            fontSize: "0.9rem",
            height: "2rem",
            width: "2.6rem",
            m: "0.7rem 0.3rem 0 0.3rem",
            justifyContent: "center",
            alignItems: "center",
        },
        '& .MuiPickersDay-root.Mui-selected': {
            color: palette.neutral.dark,
            bgcolor: palette.primary.main,
            borderRadius: "0.5rem",
        },
        '& .MuiPickersYear-root': {
            m: "0"
        },
        '& .MuiPickersYear-yearButton': {
            fontSize: "1rem"
        },
        '& .MuiPickersMonth-monthButton': {
            fontSize: "1rem"
        }
    }; 

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} >
            <DateCalendar
                dayOfWeekFormatter={customDayOfWeekFormatter}
                views={[ "year", "month", "day" ]}
                slots={{ day: CustomDay }}
                slotProps={{ 
                    day: {  
                        context: context, 
                        calendarContext: calendarContext,
                        dashboardContext: dashboardContext,
                        dayStyles: calendarContext ? calendarDaySx : dashboardDaySx,
                        palette: palette
                    } 
                }}
                sx={ calendarContext ? calendarMonthSx : dashboardMonthSx }
            />
        </LocalizationProvider>
    );
}; 