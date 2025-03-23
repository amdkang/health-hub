import { alpha, Avatar, Box, Collapse, Divider, Menu, Stack, Typography, useTheme } from "@mui/material"; 
import { LightModeOutlined, NightlightOutlined, NotificationsOutlined, Search, Warning } from "@mui/icons-material"; 
import { memo, useContext, useEffect, useState } from "react";
import { useCustomNavigate } from "../useCustomNavigate";
import { ColorModeContext } from "../theme";
import { SearchBar } from "./Searchbar"; 
import { CloseButton, TooltipButton } from "./CustomButtons";
import { MAIN_USER_ID } from "../constants"; 
import { getMainUserPicture } from "../database/clientServices"; 

const PageTitle = ({ title, subtitle, palette }) => (
    <Stack direction="column" >
        <Typography  
            sx={{ 
                fontSize: "1.7rem", 
                fontWeight: 500, 
                color: palette.background.contrastText 
            }} 
        >
            { title }
        </Typography>

        { subtitle && (
            <Typography 
                sx={{ 
                    mt: "-0.2rem",
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    color: palette.primary.main 
                }} 
            >
                { subtitle }
            </Typography> 
        )}
    </Stack> 
);

// popup linking to security warning page
const WarningNotification = ({ anchorEl, palette, closeContextMenu, goToLanding }) => { 
    const headerSx = { 
        fontSize: "1rem", 
        fontWeight: 500, 
        p: "0 0.5rem 0.3rem 0.5rem",
        '&:hover': { cursor: "default" }
    };
    const menuSx = {
        '& .MuiPaper-root': {
            width: "15rem", 
            border: `0.1rem solid ${ palette.neutral.light }`, 
            borderRadius: "0.4rem",
            bgcolor: palette.background.default,
            p: "0 0.5rem"
        }
    };  

    const openWarningPage = () => { 
        closeContextMenu();
        goToLanding();
    };

    return (
        <Menu
            anchorEl={anchorEl}  
            open={ Boolean(anchorEl) }
            onClose={closeContextMenu} 
            elevation={2}
            sx={menuSx}
        >
            <Stack direction="row" sx={{ width: "100%", justifyContent: "space-between" }} > 
                <Typography sx={headerSx} > Notifications </Typography> 
                <CloseButton color={ palette.primary.contrastText } onClick={closeContextMenu} />
            </Stack>
            <Divider sx={{ bgcolor: palette.neutral.light }} /> 
            <Stack 
                direction="row" 
                spacing={1} 
                onClick={openWarningPage}
                sx={{ 
                    mt: "0.5rem",
                    p: "0.4rem 0.3rem", 
                    borderRadius: "0.4rem",
                    '&:hover': {
                        cursor: "pointer",
                        bgcolor: alpha(palette.action.hover, 0.7)
                    } 
                }} 
            >
                <Warning sx={{ color: palette.neutral.dark }} />  
                <Typography sx={{ color: palette.neutral.dark }} >
                    Warning: This is a test site with a shared database. 
                    Do not upload personal, sensitive, or confidential information.
                </Typography>
            </Stack> 
        </Menu>
    );
};


const SearchArea = ({ searchBarOpen, setSearchBarOpen }) => (
    <Stack direction="row" >
        <Collapse in={searchBarOpen} orientation="horizontal" timeout={600} >
            <Box sx={{ overflow: "hidden", width: "20rem", mr: "0.5rem" }} >
                <SearchBar />
            </Box>
        </Collapse>
        <TooltipButton
            label="Search For Pages"
            icon={ <Search sx={{ fontSize: "1.5rem" }} /> }
            onClick={() => setSearchBarOpen(!searchBarOpen)}
            arrow 
        /> 
    </Stack> 
);  
 
/**
 * Displays page title, search bar for page navigation, row of action buttons 
 */

export const Topbar = memo(({ title, subtitle, profilePic }) => {  
    const palette = useTheme().palette;   
    const colorMode = useContext(ColorModeContext);  
    const { goToLanding, goToProfile } = useCustomNavigate();  
    const [loading, setLoading] = useState(true);
    const [memberPic, setMemberPic] = useState(profilePic ?? null); 
    const [searchBarOpen, setSearchBarOpen] = useState(false); 
    const [anchorEl, setAnchorEl] = useState(null);   
    const btnSx = { fontSize: "1.5rem" };   
    const topbarSx = { 
        height: "auto",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: "1.5rem",
        pl: "0.5rem"
    };
    const avatarSx = { 
        width: 50, 
        height: 50,  
        ml: "0.8rem", 
        cursor: "pointer"
    };

    useEffect(() => {   
        fetchMainUserPic();    
    }, [profilePic]);        
    
    // fetch main user's profile picture from database 
    const fetchMainUserPic = async () => {   
        setLoading(true); 
        const memberPic = await getMainUserPicture();  
        setMemberPic(memberPic);  
        setLoading(false);
    };  
 
    const openContextMenu = () => setAnchorEl(document.getElementById("anchor-element"));  
    const closeContextMenu = () => setAnchorEl(null);  
   
    return (
        <>
            { !loading &&
                <Stack direction="row" sx={topbarSx} >
                    <PageTitle title={title} subtitle={subtitle} palette={palette} />    
                    <Stack direction="row" sx={{ alignItems: "center" }} >
                       <SearchArea 
                            searchBarOpen={searchBarOpen} 
                            setSearchBarOpen={setSearchBarOpen} 
                       />  
                        <TooltipButton
                            btnId="anchor-element"
                            label="View Notifications"
                            icon={ <NotificationsOutlined sx={btnSx} /> }
                            onClick={openContextMenu}
                            arrow
                        />  
                        <TooltipButton
                            label="Toggle Theme"
                            icon={ palette.mode === "dark" ? 
                                <NightlightOutlined sx={btnSx} /> : <LightModeOutlined sx={btnSx} /> 
                            }
                            onClick={ colorMode.toggleColorMode }
                            arrow
                        />  
                        <TooltipButton 
                            label="View Profile"
                            arrow
                            content={
                                <Avatar 
                                    src={memberPic} 
                                    alt="user avatar"
                                    onClick={() => goToProfile(MAIN_USER_ID)}
                                    sx={avatarSx} 
                                />
                            } 
                        /> 
                    </Stack> 
                    <WarningNotification 
                        anchorEl={anchorEl}
                        palette={palette} 
                        closeContextMenu={closeContextMenu} 
                        goToLanding={goToLanding}
                    /> 
                </Stack>
            }
        </>
    );
}); 