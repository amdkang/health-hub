import { Avatar, Dialog, DialogContent, Stack, Typography, useTheme } from "@mui/material";
import { Delete, Edit, Email, PersonOutlined, Phone } from "@mui/icons-material";
import { forwardRef, memo, useRef, useState } from "react";   
import { ContainerTitle, CustomContextMenu, ErrorGraphicMessage, ImageCell, TooltipButton } from "../../components";    
import { ProviderForm } from "../forms";
import { containerStyles, formDialogStyles, scrollBarStyles } from "../../styles"; 

// lists profile information for given provider
const ProviderProfile = ({ provider, color }) => (
    <Stack 
        direction="row"
        spacing={2} 
        sx={{ alignItems: "center", p: "0.7rem 0.5rem 0 0" }} 
    >
        <Avatar 
            src={ provider.fullPicturePath } 
            alt={ provider.name }
            sx={{ width: 80, height: 80 }} 
        />  
        <Stack direction="column" spacing={1.5} >
            <Stack direction="column" sx={{ pl: "0.2rem" }} >
                <Typography sx={{ fontSize: "1.1rem" }} > { provider.name } </Typography> 
                <Typography 
                    sx={{ 
                        fontSize: "0.8rem", 
                        color: color, 
                        pl: "0.1rem",
                        fontStyle: "italic"
                    }} 
                >
                    { provider.specialty ?? "" }
                </Typography> 
            </Stack> 

            <ImageCell type="location" text={ provider.location } /> 
        </Stack> 
    </Stack> 
);

// lists contact details for given provider
const ContactInformation = forwardRef(({ props }, ref) => {
    const iconSx = { fontSize: 20, color: props.color };   
    return (
        <Stack 
            direction="column" 
            spacing={0.5} 
            sx={{ justifyContent: "flex-start", alignItems: "flex-end" }}
        >
            <TooltipButton type="more" label="Options"
                ref={ (el) => ref.current[props.provider.providerID] = el } 
                onClick={() => props.openMenu(props.provider)}  
            /> 
            <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }} >
                <TooltipButton
                    label={ props.provider.phone ?? "" }
                    placement="top"
                    arrow={true}
                    icon={ <Phone sx={iconSx} /> }
                    onClick={() => props.copyToClipboard(props.provider.phone)}
                />
                <TooltipButton
                    label={ props.provider.email ?? "" }
                    placement="top"
                    arrow={true}
                    icon={ <Email sx={iconSx} /> }
                    onClick={() => props.copyToClipboard(props.provider.email)}
                /> 
            </Stack>
        </Stack>
    );
});

/**
 * Shows list of the selected member's providers and their information
 * Provides forms to add, edit, or delete providers for that member
 */

export const ProvidersDirectory = memo(({ props }) => {   
    const palette = useTheme().palette; 
    const [form, setForm] = useState({ item: null, open: false }); 
    const menuRef = useRef(null); 
    const providerRefs = useRef([]);  
    const providerBoxSx = { 
        width: "95%",
        p: "0.1rem 0 0.5rem 0",
        justifyContent: "space-between", 
        cursor: "default" 
    }; 
 
    const providerMenuItems = [
        {
            title: "Edit Provider",
            onClick: () => { openForm(getSelectedProvider()) },
            icon: <Edit />
        },
        {
            title: "Delete Provider",
            onClick: () => { deleteProvider(getSelectedProvider()?.providerID) },
            icon: <Delete />
        }
    ]; 

    const getSelectedProvider = () => { return menuRef.current?.getSelected() }; 

    const openMenu = (provider) => { 
        menuRef.current?.openMenu(
            providerRefs.current[provider.providerID], 
            "topLeft", 
            providerMenuItems, 
            provider
        );
    };
 
    const openForm = (item) => setForm({ open: true, item: item.providerID ? item : null });
    
    const closeForm = () => setForm({ item: null, open: false }); 

    const onProviderFormSubmit = async (formData) => {
        closeForm();
        const providerData = { memberID: props.memberID, ...formData };
        await props.handleProviderAdd(providerData);
    };

    const deleteProvider = async (providerID) => await props.handleProviderDelete(providerID); 

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => { 
            props.setSnackbarMsg("Copied to clipboard");   
        })
    };  

    const contactInfoProps = { color: palette.neutral.dark, copyToClipboard, openMenu };

    return (
        <Stack 
            direction="column"
            sx={{
                flex: 1,
                bgcolor: palette.background.container,
                ...containerStyles,
                pb: "2rem"
            }}
        >
            <ContainerTitle
                titleIcon={ <PersonOutlined sx={{ fontSize: 22 }} /> }   
                title="Providers"
                extraContent={
                    <TooltipButton type="add" label="Add New Provider" onClick={openForm} />
                }
            />  
            { props.providers.length > 0 ?  (
                <Stack 
                    direction="column"
                    sx={{
                        width: "99.5%",
                        alignItems: "center",
                        overflowY: "auto",
                        ...scrollBarStyles
                    }}
                >
                    { props.providers.map((provider, index) => (
                        <Stack 
                            key={ provider.providerID }
                            direction="row"
                            sx={{
                                ...providerBoxSx,
                                borderBottom: index < props.providers.length-1 ?
                                    `0.1rem solid ${ palette.neutral.light }` : "none"
                            }}
                        >
                            <ProviderProfile provider={provider} color={ palette.neutral.dark } /> 
                            <ContactInformation props={{ provider, ...contactInfoProps }} ref={providerRefs} />
                        </Stack> 
                    ))}
                </Stack>
            )    : (
                <ErrorGraphicMessage type="provider" onClick={openForm} /> 
            )}     
            
            <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                <DialogContent>
                    <ProviderForm
                        currentProvider={ form.item }
                        onSubmit={onProviderFormSubmit}
                        onCancelClick={closeForm}
                    />
                </DialogContent>
            </Dialog> 
            <CustomContextMenu ref={menuRef} />  
        </Stack>
    );
});  