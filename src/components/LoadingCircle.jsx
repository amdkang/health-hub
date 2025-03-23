import { Box, CircularProgress } from "@mui/material";
 
/**
 * Circular progress graphic shown while pages/components are loading
 */

export const LoadingCircle = ({ sx }) => (
    <Box 
        sx={{ 
            display: "flex", 
            flex: 1, 
            justifyContent: "center",
            alignItems: "center",
            ...sx
        }} 
    >
        <CircularProgress color="secondary" size={100} />
    </Box>
); 