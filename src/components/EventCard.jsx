import { Box, Stack, Typography, useTheme } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { forwardRef } from "react";
import { ColorBox, ImageCell } from ".";  
import { formatDate } from "../utils";

/**
 * Renders box showcasing details for a calendar event  
 */

const CalendarEventTitle = ({ event, time }) => (
    <Stack 
        direction="row" 
        spacing={1}
        sx={{ width: "100%", justifyContent: "space-between", alignItems: "flex-start" }} 
    >
        <Typography sx={{ fontSize:"1rem", wordBreak: "break-word", fontWeight: 500 }} >
            { event.name }
        </Typography>
        <ImageCell 
            type="time" 
            text={time}  
            textSx={{ fontSize: "0.9rem" }}
            iconSx={{ fontSize: 13 }} 
        />
    </Stack>
);

// template used for `CalendarPage`
export const CalendarEvent = forwardRef(({ event, onClick, onContextMenu }, ref) => {  
    const palette = useTheme().palette;
    const fmtedTime = formatDate("time", event.datetime); 
    const eventCardSx = {
        width: "98%", 
        alignItems: "center",
        p: "0.5rem 0.7rem 0.5rem 0", 
        borderRadius: "0.7rem", 
        bgcolor: palette.background.container,  
        '&:hover': {   
            border: `0.1rem solid ${ event.color.main }`, 
            cursor: "pointer"
        }
    };
    const detailTextSx = { fontSize: "0.9rem", color: palette.neutral.dark };

    return (
        <Stack 
            ref={ref}
            direction="row" 
            spacing={1.3}
            onClick={onClick}
            onContextMenu={onContextMenu}    
            sx={eventCardSx}
        >
            <ColorBox color={ event.color.main } sx={{ height: "90%", width: "0.15rem" }} /> 
            <Stack 
                direction="column" 
                spacing={2}  
                sx={{ flex: 1, justifyContent: "space-between" }}
            >
                <CalendarEventTitle event={event} time={fmtedTime} />    
                <Stack direction="column" spacing={1} sx={{ width: "100%" }} >
                    { event.provider && (
                        <ImageCell 
                            type="person"
                            text={ event.provider.name } 
                            textSx={detailTextSx}
                            iconSx={{ color: palette.neutral.dark, fontSize: 17 }}  
                        /> 
                    )}  

                    { event.location && (
                        <ImageCell 
                            type="location" 
                            text={ event.location } 
                            textSx={detailTextSx}
                            iconSx={{ color: palette.neutral.dark, fontSize: 15 }}  
                            multiline
                        /> 
                    )}
                </Stack>  
            </Stack>
        </Stack>
    );
}); 

const DashboardEventTitle = ({ event, time }) => (
    <Stack 
        direction="column" 
        spacing={1} 
        sx={{ flex: 1, height: "100%", alignItems: "flex-start" }} 
    >
        <Typography
            sx={{
                width: "70%",
                wordBreak: "break-word",
                fontSize:"1rem",
                fontWeight: 500
            }}
        >
            { event.name }
        </Typography>

        <Box> <ImageCell type="time" text={time} /> </Box>
    </Stack>
);

// template used for `Dashboard` calendar
export const DashboardEvent = ({ event, onClick }) => {
    const palette = useTheme().palette;  
    const fmtedTime = formatDate("time", event.datetime); 
    const eventCardSx = {
        width: "98%", 
        alignItems: "center",
        p: "0.5rem 0.8rem 0.5rem 0",  
        borderRadius: "0.7rem",
        border: `0.1rem solid ${ palette.neutral.light }`,
        '&:hover': {
            border: `0.1rem solid ${ event.color.main } `,
            cursor: "pointer"
        }
    };

    return (
        <Stack 
            direction="row" 
            spacing={2}
            onClick={onClick}
            sx={eventCardSx}
        >
                <ColorBox color={ event.color.main } sx={{ height: "90%", width: "0.15rem" }} />
                <Stack 
                    direction="row" 
                    sx={{ 
                        flex: 1, 
                        height: "100%", 
                        justifyContent: "space-between", 
                        alignItems: "center" 
                    }}
                >
                <DashboardEventTitle event={event} time={fmtedTime} />   
                <KeyboardArrowRight 
                    sx={{
                        border: `0.1rem solid ${ palette.neutral.light }`,
                        borderRadius: "50%",
                        p: "0.2rem",
                        fontSize: 24
                    }} 
                />
            </Stack> 
        </Stack>
    );
}; 
 
