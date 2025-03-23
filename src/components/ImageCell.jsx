import { Box, Stack, Typography } from "@mui/material";
import { AccessTimeOutlined, CalendarTodayOutlined, FemaleOutlined, LocationOnOutlined, MaleOutlined, PersonOutlined } from "@mui/icons-material";
 
/**
 * Renders horizontal image/text component used for datagrid rows/container details
 */

export const ImageCell = ({ type, image, text, textSx, iconSx, onClick, multiline }) => { 
    // maps commonly used cell `types` to their icons
    const typeIcons = {
        time: { icon: <AccessTimeOutlined sx={{ fontSize: 13, ...iconSx }} /> }, 
        location: { icon: <LocationOnOutlined sx={{ fontSize: 14, ...iconSx }} /> },
        person: { icon: <PersonOutlined sx={{ fontSize: 14, ...iconSx }} /> },
        date: { icon: <CalendarTodayOutlined sx={{ fontSize: 12, ...iconSx }} /> },
        male: { icon: <MaleOutlined sx={{ fontSize: 18, ...iconSx }} /> },
        female: { icon: <FemaleOutlined sx={{ fontSize: 18, ...iconSx }} /> }
    };  
    const icon = typeIcons[type]?.icon;

    return (
        <>
            { text &&  
                <Stack
                    direction="row" 
                    onClick={onClick} 
                    spacing={0.5} 
                    sx={{ 
                        alignItems: multiline ? "flex-start" : "center", 
                        flexShrink: 0, 
                        height: "100%" 
                    }}
                >
                    { type ? (
                        <Box sx={{ pt: multiline ? "0" : "0.25rem" }} > { icon } </Box> 
                    ) : (
                        image 
                    )}    
                    <Typography sx={{ fontSize: "0.8rem", textWrap: "wrap", ...textSx }} > 
                        { text }
                    </Typography>
                </Stack>
            }
        </>
    );
}; 