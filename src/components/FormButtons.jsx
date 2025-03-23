import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "@mui/material"; 
import { capitalize } from "../utils";

/**
 * Renders & exports custom-styled buttons used by forms
 */

// `Cancel` & `Submit` buttons used on all forms  
export const FormButtons = ({ onCancelClick }) => {
    const palette = useTheme().palette; 

    return (
        <Stack 
            direction="row" 
            spacing={1}
            sx={{ width: "100%", justifyContent: "flex-end", alignItems: "center", mt: "2rem" }}
        >
            <Button 
                variant="outlined" 
                onClick={onCancelClick}
                sx={{ 
                    border: `0.15rem solid ${ palette.primary.main }`,
                    borderRadius: "0.7rem",  
                    fontWeight: 700
                }}
            >
                Cancel
            </Button>
            
            <Button
                type="submit"
                variant="outlined"  
                sx={{
                    borderRadius: "0.7rem",
                    bgcolor: palette.primary.main,
                    color: palette.primary.contrastText
                }}
            >
                Submit
            </Button>
        </Stack>
    );
}; 

// Buttons used to toggle between two options 
export const FormToggleButtons = ({ formik, id, value, title, options }) => {
    const palette = useTheme().palette; 

    return (
        <Stack direction="column" >
            <Typography sx={{ fontSize: "0.8rem", color: palette.neutral.dark }} >
                { title }
            </Typography> 
            <Box 
                sx={{
                    p: "0.3rem", 
                    border: `0.1rem solid ${ palette.neutral.dark }`, 
                    borderRadius: "0.3rem" 
                }} 
            >
                <ToggleButtonGroup
                    id={id} 
                    exclusive
                    value={value}
                    onChange={ (event) => formik.setFieldValue(id, event.target.value) }
                >
                    { options.map((option, index) => (
                        <ToggleButton 
                            key={index} 
                            id={option} 
                            value={option} 
                            aria-label="center" 
                        >
                            { capitalize(option) }
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup> 
            </Box>
        </Stack>
    )
};