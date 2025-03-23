import { Divider, Stack, Typography, useTheme } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useContext, useRef } from "react";
import { CalendarContext } from ".";
import { ContainerTitle, CustomContextMenu, ErrorGraphicMessage, CalendarEvent, TooltipButton } from "../../components"; 
import { planner } from "../../assets";
import { formatDate } from "../../utils";
import { containerStyles } from "../../styles";

const TitleGraphic = ({ date, color }) => (
    <Stack direction="row" spacing={1.5} >
        <img src={planner} alt="planner" style={{ width: 40, height: 40 }} />  
        <Stack direction="column" sx={{ flex: 1, justifyContent: "space-between" }} >
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 500 }} >
                Events 
            </Typography> 
            <Typography sx={{ fontSize: "0.9rem", fontStyle: "italic", color: color }} >
                { date }
            </Typography> 
        </Stack>
    </Stack>
);
 
/**
 * Lists all events scheduled for currently selected date on `Monthly Calendar`
 */

export const EventsList = ({ openForm, handleEventDelete }) => {
    const palette = useTheme().palette;
    const { selected } = useContext(CalendarContext);
    const eventRefs = useRef([]);  
    const menuRef = useRef(null);
    const getSelectedEvent = () => { return menuRef.current?.getSelected() };
  
    const eventMenuItems = [
        {
            title: "Delete Event",
            onClick: () => { handleEventDelete(getSelectedEvent()?.eventID) },
            icon: <Delete />
        }
    ];   

    const openMenu = (e, event) => { 
        e.preventDefault();
        menuRef.current?.openMenu(
            eventRefs.current[event.eventID], 
            "centerLeft", 
            eventMenuItems, 
            event
        );
    };

    return (
        <Stack 
            direction="column" 
            sx={{ width: "25%", height: "100%", ...containerStyles }}
        >
            <ContainerTitle 
                titleContent={  
                    <TitleGraphic 
                        date={formatDate("textDate", selected.date)} 
                        color={ palette.neutral.dark } 
                    /> 
                }
                extraContent={ <TooltipButton type="add" label="Add Event" onClick={openForm} /> } 
            />    
            
            <Divider sx={{ bgcolor: palette.neutral.light }} />

            { selected.events.length > 0 ? (
                <Stack 
                    direction="column" 
                    spacing={3}
                    sx={{ width: "100%", height: "85%", mt: "1.5rem" }}
                >
                    { selected.events.map((event) => (
                        <CalendarEvent
                            key={ event.eventID }
                            event={event} 
                            ref={ (el) => eventRefs.current[event.eventID] = el }  
                            type="calendar"
                            onClick={() => openForm(event)} 
                            onContextMenu={ (e) => openMenu(e, event) }
                        />
                    ))}
                </Stack> 
            ) : (
                <ErrorGraphicMessage type="event" /> 
            )}
            <CustomContextMenu ref={menuRef} />
        </Stack>
    );
}; 