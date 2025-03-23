import { Box } from "@mui/material";   

export const ColorBox = ({ color, sx }) => (
    <Box
        sx={{
            width: "0.9rem",
            height: "0.9rem",
            bgcolor: color,
            borderRadius: "30%",
            flexShrink: 0,
            ...sx
        }}
    />  
); 