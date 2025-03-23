import { Box, Button, Tooltip, IconButton, Stack, useTheme } from "@mui/material";
import { Add, Close, Delete, Edit, GridView, List, MoreVert, PushPin, PushPinOutlined } from "@mui/icons-material";    
import { forwardRef, useState } from "react"; 

/**
 * Renders & exports custom-styled buttons commonly used throughout the site
 */ 

// used to toggle between datagrid view & images list view 
export const GridImgButton = ({ onImgClick, onGridClick, startGrid }) => {
    const palette = useTheme().palette; 
    const [gridClicked, setGridClicked] = useState(startGrid); 
    const btnBackgroundSx = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "3rem",
        p: "0.3rem",
        '&:hover': {
            bgcolor: palette.background.container,
            cursor: "pointer"
        }
    };
 
    const handleImgClick = () => {
        if (gridClicked) {
            setGridClicked(false);
            onImgClick();
        }
    };

    const handleGridClick = () => {
        if (!gridClicked) {
            setGridClicked(true);
            onGridClick();
        }
    };
 
    return (     
        <Stack
            direction="row"
            sx={{ p: "0.15rem", bgcolor: palette.action.hover, borderRadius: "0.8rem" }}
        >
            <Box
                onClick={handleGridClick}
                sx={{ 
                    ...btnBackgroundSx,
                    borderRadius: "0.6rem 0 0 0.6rem", 
                    bgcolor: gridClicked ? palette.background.container : palette.action.hover
                }}
            >
                <List
                    sx={{
                        fontSize: 26,   
                        color: gridClicked ? palette.neutral.dark : palette.neutral.main
                    }}
                />
            </Box>


            <Box
                onClick={handleImgClick}
                sx={{
                    ...btnBackgroundSx,
                    borderRadius: "0 0.6rem 0.6rem 0", 
                    bgcolor: !gridClicked ? palette.background.container : palette.action.hover
                }}
            >
                <GridView
                    sx={{
                        fontSize: 22,  
                        color: !gridClicked ? palette.neutral.dark : palette.neutral.main
                    }} 
                />
            </Box> 
        </Stack>
    );
};  

// button used to close page/form sections
export const CloseButton = ({ onClick, color }) => (
    <Close
        onClick={onClick}
        sx={{ 
            fontSize: 18,
            '&:hover': { 
                color: color,
                border: `0.1rem solid ${color}`,                   
                borderRadius: "0.3rem",
                cursor: "pointer"
            }
        }} 
    />
);

// button with background color filled
export const FilledButton = forwardRef(({ text, icon, ...props }, ref) => {
    const palette = useTheme().palette;   

    return (
        <Button
            ref={ref}
            type="submit"   
            startIcon={icon} 
            sx={{
                borderRadius: "0.5rem", 
                bgcolor: palette.primary.main,
                color: palette.primary.contrastText, 
                fontSize: "0.8rem",
                pr: "0.8rem",
                '&:hover': {
                    outline: `0.1rem solid ${ palette.background.contrastText }`,
                    bgcolor: palette.primary.main 
                },
                "& .MuiButton-startIcon > *:nth-of-type(1)": { fontSize: "1.3rem" },
                "& .MuiButton-startIcon": { marginLeft: "0" }
            }}
            { ...props }  
        >
            { text }
        </Button>
    );
});

// button with color outline + transparent fill
export const OutlinedButton = ({ text, icon, onClick, sx }) => {
    const palette = useTheme().palette;  
    
    return (
        <Button
            type="submit" 
            onClick={onClick}
            startIcon={icon} 
            sx={{ 
                fontSize: "0.85rem", 
                color: palette.secondary.main,
                border: `0.15rem solid ${ palette.secondary.main }`,
                borderRadius: "0.5rem",  
                '&:hover': {
                    border: `0.15rem solid ${ palette.background.contrastText }`,
                    color: palette.background.contrastText 
                },
                ...sx
            }}
        >
            { text }
        </Button>
    );
}; 

// maps TooltipButton `types` to their icon 
const tooltipBtnIcons = {
    add: <Add sx={{ fontSize: 22 }} />,
    edit: <Edit sx={{ fontSize: 22 }} />,
    delete: <Delete sx={{ fontSize: 22 }} />,
    more: <MoreVert sx={{ fontSize: 22 }} />,
    pin:  <PushPinOutlined />,
    unpin: <PushPin sx={{ rotate: "45deg" }} /> 
};

// renders icon button with tooltip shown when hovered over  
export const TooltipButton = forwardRef((props, ref) => { 
    const btnIcon = props.icon ?? tooltipBtnIcons[props.type];

    return (
        <Tooltip  
            title={ props.label }
            arrow={ props.arrow }
            placement={ props.placement }
            slotProps={{
                tooltip: { sx: { fontSize: "0.7rem" } },
                popper: {
                    modifiers: [{ name: "offset", options: { offset: [0, -8] }}]
                }
            }}
        >
            { btnIcon && (
                <IconButton id={ props.btnId } ref={ref} onClick={ props.onClick } > 
                    { btnIcon }
                </IconButton>
            )}
            { props.content }
        </Tooltip>  
    );
});