import { Box, Stack, Typography, useTheme } from "@mui/material";
import { AssignmentOutlined, CalendarMonthOutlined, HomeOutlined, InfoOutlined, LocalHospital, MedicalInformationOutlined, 
    MedicationOutlined, MenuOutlined, MonitorHeartOutlined, PeopleAltOutlined } from "@mui/icons-material";  
import { useCustomNavigate } from "../useCustomNavigate";
import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { sidebarClasses } from "react-pro-sidebar"; 
import { APP_NAME, MAIN_USER_ID } from "../constants";
import { decapitalize } from "../utils";
 
// links to site's image attributions page
const AttributesFooter = ({ isCollapsed, onClick, hoverSx }) => (
    <Box 
        onClick={onClick}
        sx={{ 
            display: "flex", 
            justifyContent: "center",
            alignItems: "center",
            height: "3rem", 
            ...hoverSx
        }} 
    >
        { !isCollapsed ? (
            <Stack direction="row" spacing={1} >
                <InfoOutlined sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: "1rem" }} > Site Attributions </Typography>
            </Stack> 
        ) : ( 
            <InfoOutlined sx={{ fontSize: 18 }} />
        )}
    </Box>
);

const LogoHeader = ({ isCollapsed, onClick, itemIconSx }) => (
    <MenuItem
        onClick={onClick}
        icon={ isCollapsed && <MenuOutlined sx={{ ...itemIconSx, ml: "1rem" }} /> }
        style={{  
            padding: "0 0.4rem 0 0.8rem", 
            margin: "0.2rem 0 2rem 0" 
        }}
    >
        { !isCollapsed &&  
            <Stack 
                direction="row" 
                sx={{ justifyContent: "space-between", alignItems: "center" }} 
            >
                <Stack direction="row" spacing={0.3} sx={{ alignItems: "center" }} >
                    <LocalHospital sx={{ fontSize: 24 }} /> 
                    <Typography variant="h4" > { APP_NAME.toUpperCase() } </Typography>
                </Stack> 
                <MenuOutlined sx={{ fontSize: 20 }} />
            </Stack>
        } 
    </MenuItem>   
);  

/**
 * Collapsible sidebar with clickable links to each of site's pages
 */

export const LeftSidebar = memo(() => {
    const palette = useTheme().palette;  
    const location = useLocation();
    const { goToAttributions } = useCustomNavigate(); 
    const [isCollapsed, setIsCollapsed] = useState(false); 
    const itemIconSx = { fontSize: "1.6rem", ml: "-0.3rem" }; 
    const hoverSx = {
        fontSize: "1rem",
        borderRadius: "0.5rem",
        '&.ps-active, &:hover': {  
            cursor: "pointer",
            color: palette.primary.contrastText, 
            backgroundColor: palette.primary.main
        }
    };
    const menuItems = [
        {
            name: "Dashboard",
            icon: <HomeOutlined sx={itemIconSx} />,
            link: `members/${ MAIN_USER_ID }/dashboard` 
        }, 
        {
            name: "Past Visits",
            linkName: "visits",
            icon: <AssignmentOutlined sx={itemIconSx} />,
            link: `members/${ MAIN_USER_ID }/visits` 
        }, 
        {
            name: "History",
            icon: <MedicalInformationOutlined sx={itemIconSx} />,
            link: `members/${ MAIN_USER_ID }/history`
        }, 
        {
            name: "Conditions",
            icon: <MonitorHeartOutlined sx={itemIconSx} />,
            link: `members/${ MAIN_USER_ID }/conditions`
        }, 
        {
            name: "Medications",
            icon: <MedicationOutlined sx={itemIconSx} />,
            link: `members/${ MAIN_USER_ID }/medications`
        }, 
        {
            name: "Calendar",
            icon: <CalendarMonthOutlined sx={itemIconSx} />,
            link: `members/${ MAIN_USER_ID }/calendar`
        }, 
        {
            name: "Family",
            icon: <PeopleAltOutlined sx={itemIconSx} />,
            link: `members/${ MAIN_USER_ID }/family`
        }
    ];

    // returns true if selected menu item matches currently open page 
    const pageIsOpen = (item) => {
        const pageName = item.linkName ?? decapitalize(item.name); 
        return location.pathname.includes(pageName);
    }; 

    return (
        <Sidebar 
            collapsed= {isCollapsed}
            width="16rem"
            style={{ height: "100%", borderRight: "none" }} 
            rootStyles={{
                [`.${sidebarClasses.container}`]: { 
                    backgroundColor: palette.background.default 
                }
            }}
        > 
            <Stack 
                direction="column" 
                sx={{ height: "100%", justifyContent: "space-between", p: "0.2rem 0.4rem" }} 
            >
                <Menu menuItemStyles={{ button: { ...hoverSx }}} >  
                    <Stack direction="column" sx={{ fontWeight: 500, height: "100%" }} >    
                        <LogoHeader 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            isCollapsed={isCollapsed}
                            itemIconSx={itemIconSx}
                        /> 

                        <Typography sx={{ pl: "0.5rem", fontSize: "1rem", height: "1rem", mb: "1rem" }} > 
                            { !isCollapsed ? "MENU" : "" } 
                        </Typography>

                        { menuItems.map((item, index) => (
                            <MenuItem
                                key={index}
                                active={ pageIsOpen(item) }
                                icon={ item.icon } 
                                component={ <Link to={ item.link }/> } 
                                style={{ height: "3rem" }}
                            >
                                { item.name }
                            </MenuItem>
                        ))} 
                    </Stack>
                </Menu>
                
                <AttributesFooter 
                    onClick={goToAttributions}
                    hoverSx={hoverSx}
                    isCollapsed={isCollapsed}
                />
            </Stack>
        </Sidebar> 
    );
}); 