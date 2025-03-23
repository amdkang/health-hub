import { Box, Stack, Tab, Tabs, useTheme } from "@mui/material";
import { CalendarMonthOutlined, DateRangeOutlined, EventNoteOutlined } from "@mui/icons-material";
import { createContext, memo, useEffect, useState } from "react";
import { useCustomNavigate } from "../../useCustomNavigate";  
import { ContainerTitle, ErrorGraphicMessage, DashboardEvent, TooltipButton } from "../../components";  
import { MonthlyCalendar } from "../calendar/MonthlyCalendar";   
import { WeeklyCalendar } from "../calendar/WeeklyCalendar";    
import { formatDaysOfWeek, getDateEvents } from "../../utils";
import { MAIN_USER_ID } from "../../constants";
import { scrollBarStyles } from "../../styles";
import dayjs from "dayjs";

export const DashboardContext = createContext();

const CalendarTypeTabs = ({ currentTab, setCurrentTab, palette }) => {
    const tabSx = { width: "50%", minHeight: "3.5rem", height: "3.5rem" };

    return (
        <Tabs
            value={currentTab}
            onChange={(_event, tabIndex) => setCurrentTab(tabIndex)}
            sx={{
                height: "3.5rem",
                minHeight: "3.5rem",
                borderBottom: `0.1rem solid ${ palette.neutral.light }`
            }}
        >
            <Tab
                label="Monthly"
                icon={ <CalendarMonthOutlined /> }
                iconPosition="start"
                sx={tabSx}
            />
            <Tab
                label="Weekly"
                icon={ <DateRangeOutlined /> }
                iconPosition="start"
                sx={tabSx}
            />
        </Tabs> 
    );
};

/**
 * Interactive monthly/weekly calendar with a list of events scheduled for the selected date
 */

export const Calendar = memo(({ events }) => {
    const palette = useTheme().palette;
    const { goToCalendar } = useCustomNavigate(); 
    const [currentTab, setCurrentTab] = useState(0);
    const [daysOfWeek, setDaysOfWeek] = useState({ days: [], selectedIndex: null });
    const [selected, setSelected] = useState({
        date: dayjs(),
        events: getDateEvents(events, dayjs())
    }); 
    const eventsListSx = {
        width: "100%",
        height: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        ...scrollBarStyles
    };
 
    useEffect(() => { 
        setDaysOfWeek(formatDaysOfWeek());
    }, []);

    const openSchedulePage = () => goToCalendar(MAIN_USER_ID);
  
    return (
        <Stack direction="column" sx={{ width: "100%", height: "95%" }} >    
            <ContainerTitle
                titleIcon={ <EventNoteOutlined sx={{ fontSize: 20 }} /> } 
                title="Schedule"
                extraContent={
                    <TooltipButton type="more" label="View Calendar" onClick={openSchedulePage} />
                }
            />   
            <DashboardContext.Provider value={{ selected, setSelected, events }} >
                <Box
                    sx={{
                        width: "100%",
                        border: `0.1rem solid ${ palette.neutral.light }`,
                        borderRadius: "1rem"
                    }}
                >
                    <CalendarTypeTabs 
                        currentTab={currentTab}
                        setCurrentTab={setCurrentTab}
                        palette={palette}
                    />
                    { currentTab === 0 && <MonthlyCalendar width="100%" height="50%" /> }
                    { currentTab === 1 && (
                        <WeeklyCalendar
                            type="dashboard"
                            height="10rem"
                            daysOfWeek={daysOfWeek}
                            setDaysOfWeek={setDaysOfWeek}
                            sx={{ p: "1.2rem 1rem" }}
                        />
                    )}
                </Box>
            </DashboardContext.Provider>   

            <Stack
                sx={{
                    flex: 1,
                    mt: "2rem",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden"
                }}
            >
                { selected.events.length > 0 ? (
                    <Stack direction="column" spacing={2} sx={eventsListSx} >
                        { selected.events.map((event) => ( 
                            <DashboardEvent
                                key={ event.eventID }
                                event={event} 
                                type="dashboard"
                                onClick={openSchedulePage}
                            />
                        ))}
                    </Stack> 
                ) : ( 
                    <ErrorGraphicMessage type="event" onClick={openSchedulePage} />   
                )}
            </Stack>
        </Stack>
    );
}); 