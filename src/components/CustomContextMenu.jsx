import { ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react"; 

/**
 * Context menu with custom menu items/functions 
 */

export const CustomContextMenu = forwardRef((props, ref) => {  
    const palette = useTheme().palette;
    const [menu, setMenu] = useState({ anchorEl: null, position: null, items: [], selected: null });
    
    // maps of context menu positions  
    const positionsMap = {
        "bottomRight": {
            origins: {
                anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                transformOrigin: { vertical: 'top', horizontal: 'right' }
            },
            sx: { m: "0.3rem 0.4rem 0 0" }
        },
        "bottomLeft": {
            origins: {
                anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                transformOrigin: { vertical: 'top', horizontal: 'left' }
            },
            sx: { mt: "-0.3rem" }
        },
        "topLeft": {
            origins: {
                anchorOrigin: { vertical: 'top', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'right' }
            },
            sx: { m: "0.8rem 0 0 0.8rem" }
        },
        "centerLeft": {
           origins: {
                anchorOrigin: { vertical: 'top', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'right' }
           },
           sx: { m: "0.4rem 0 0 -0.3rem"}
        }
    };

    const openMenu = (element, position, items, selected = null) => {  
        setMenu({ 
            anchorEl: element, 
            position: positionsMap[position] ?? positionsMap["bottomRight"],
            items: items,
            selected: selected
        });
    };

    const closeMenu = () => setMenu({ anchorEl: null, position: null, items: [], selected: null });  

    const onMenuItemClick = (menuItem) => {
        menuItem.onClick();
        closeMenu();
    };

    // exposes specified methods to parent component
    useImperativeHandle(ref, () => ({
        getSelected: () => menu.selected,
        openMenu
    }));

    return (
        <>
            { menu &&  
                <Menu
                    anchorEl={ menu.anchorEl }  
                    open={ Boolean(menu.anchorEl) }  
                    onClose={closeMenu}  
                    elevation={2} 
                    {...props} 
                    sx={{
                        '& .MuiPaper-root': {
                            width: "15rem",
                            p: "0 0.3rem", 
                            border: `0.1rem solid ${ palette.neutral.main }`, 
                            borderRadius: "0.4rem", 
                            ...menu.position?.sx 
                        }, 
                    }}
                    { ...menu.position?.origins }
                >
                    { menu.items.map((menuItem, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => onMenuItemClick(menuItem)} 
                            sx={{ 
                                height: "2rem",
                                m: "0",
                                borderRadius: "0.2rem",
                                '&:hover': { bgcolor: palette.neutral.light }
                            }}
                        >
                            <ListItemIcon> { menuItem.icon } </ListItemIcon>
                            <ListItemText sx={{ fontSize: "1rem", ml: "-0.6rem" }} >
                                { menuItem.title }
                            </ListItemText>
                        </MenuItem>
                    ))}
                </Menu>
            }
        </>
    );
});


    