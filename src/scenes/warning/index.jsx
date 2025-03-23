import { Box, Button, Stack, Typography, useTheme } from "@mui/material"; 
import { useCustomNavigate } from "../../useCustomNavigate";
import { Topbar } from "../../components"; 
import { pageStyles } from "../../styles";  
import { warning } from "../../assets"; 

/**
 * Acts as the site's landing page & shows warning message regarding sharing personal information
 */

export const WarningPage = () => {  
    const palette = useTheme().palette;    
    const { goToDashboard } = useCustomNavigate(); 
    const stackSx = { 
        m: "auto",
        width: "34rem", 
        height: "25rem", 
        alignItems: "center",
        bgcolor: palette.background.default, 
        border: `0.1rem solid ${ palette.primary.main }`, 
        borderRadius: "1rem"
    };
    const imgBoxSx = { 
        width: "100%", 
        height: "8rem", 
        bgcolor: palette.primary.main, 
        borderRadius: "0.8rem 0.8rem 0 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    };

    return (
        <Stack direction="column" sx={pageStyles} >
            <Topbar title="HEALTH HUB" subtitle="Welcome To Your Health Hub" />   
            <Stack direction="column" sx={stackSx} >
                <Box sx={imgBoxSx} >
                    <img src={warning} alt="warning" style={{ width: 70, height: 70 }} />
                </Box>

                <Stack 
                    direction="column" 
                    sx={{ 
                        height: "100%", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        p: "1rem 2rem 2rem 2rem" 
                    }} 
                >
                    <Typography sx={{ fontSize: "2rem", fontWeight: 500 }} > 
                        ATTENTION!
                    </Typography> 
                    <Typography sx={{ fontSize: "1rem", fontWeight: 400, color: palette.neutral.dark }} > 
                        This is a test site using a shared database. 
                        Please do not upload any personal, sensitive, or confidential information to this platform.
                        All data is accessible to others using the test environment and may be cleared or modified at any time.
                    </Typography>

                    <Button 
                        onClick={goToDashboard} 
                        sx={{
                            borderRadius: '2rem', 
                            bgcolor: palette.primary.main,
                            color: palette.primary.contrastText, 
                            fontSize: '0.8rem', 
                            '&:hover': {
                                outline: `0.1rem solid ${ palette.background.contrastText }`,
                                bgcolor: palette.primary.main 
                            }
                        }}
                    >
                        CLOSE
                    </Button>
                </Stack>
 
            </Stack> 
        </Stack> 
    );
}; 