import { Box, Breadcrumbs, Chip, Dialog, DialogContent, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { Add, CreateNewFolderOutlined, Delete, Edit, FolderOpen, NavigateNext, NoteAddOutlined } from "@mui/icons-material";
import { forwardRef, useContext, useRef, useState } from "react"; 
import { VisitsPageContext } from "."; 
import { CustomContextMenu, FilledButton, TooltipButton } from "../../components";  
import { FolderForm, VisitForm } from "../forms";
import { ellipsisTextStyles, formDialogStyles, hoverTextStyles, scrollBarStyles } from "../../styles";
import { folderIcon } from "../../assets";     
 
// shows breadcrumbs of currently open folder hierarchy
const FolderHierarchy = ({ props }) => ( 
    <Breadcrumbs
        separator={ <NavigateNext sx={{ fontSize: "1.5rem", width: "90%" }} /> }
        sx={{ color: props.color, mb: "-1.2rem" }}
    >
        { props.folderHierarchy.length > 1 && (
            <IconButton onClick={ props.resetHierarchy } > 
                <FolderOpen sx={{ fontSize: 20, color: props.color }} />
            </IconButton>
        )} 

        { props.folderHierarchy.slice(1).map((folderID, index) => ( 
            <Typography
                key={folderID}
                onClick={() => props.openFolder(folderID, index)}
                sx={{ fontSize: "1rem", ...hoverTextStyles }}
            >
                { props.getFolderName(folderID) }
            </Typography>
        ))}
    </Breadcrumbs>  
);

// renders list of available folder icons
const FoldersList = forwardRef(({ props }, ref) => {
    const foldersListSx = {
        width: "100%",    
        overflowY: "hidden",
        overflowX: "auto",
        p: "1rem 0.5rem",
        ...scrollBarStyles
    };
    const folderBoxSx = {
        width: "16rem",
        height: "9.5rem",
        pl: "1rem",
        flexShrink: 0,
        borderRadius: "0.5rem",  
        bgcolor: props.palette.background.container,
        '&:hover': {
            outline: `0.1rem solid ${ props.palette.background.contrastText }`,
            cursor: "pointer"
        }
    };
    return (
        <Stack direction="row" spacing={2} sx={foldersListSx} > 
            { props.getFoldersToShow().map((folder) => (
                <TooltipButton
                    key={folder.folderID}
                    label={folder.name}
                    content={
                        <Stack 
                            direction="column" 
                            onClick={() => props.openFolder(folder.folderID)}
                            sx={folderBoxSx}   
                        >
                            <Box 
                                sx={{ 
                                    width: "100%", 
                                    display: "flex", 
                                    justifyContent: "flex-end", 
                                    p: "0.1rem 0.1rem 0 0" 
                                }}
                            >
                                <TooltipButton 
                                    type="more" 
                                    label="Options" 
                                    ref={ (el) => ref.current[folder.folderID] = el }  
                                    onClick={ (event) => props.openMenu("folder", folder, event) } 
                                /> 
                            </Box>
                            <img 
                                src={folderIcon}  
                                alt="folder" 
                                style={{ width: 50, height: 50, marginTop: "-0.7rem" }} 
                            /> 

                            <Stack 
                                direction="row"
                                sx={{ 
                                    flex: 1,
                                    justifyContent: "space-between", 
                                    alignItems: "center",
                                    pr: "1rem"
                                }}
                            >
                                <Typography
                                    sx={{
                                        width: "70%",
                                        fontSize: "1.1rem",
                                        fontWeight: 500,
                                        ...ellipsisTextStyles
                                    }}
                                >
                                    { folder.name }
                                </Typography>  
                                <Chip   
                                    label={ props.getFolderBoxLabel(folder) }
                                    sx={{ height: "1.7rem", '& .MuiChip-label': { p: "0 0.6rem" } }}
                                />
                            </Stack>
                        </Stack> 
                    }
                /> 
            ))}
        </Stack>  
    );
}); 

/**
 * Displays a navigable nested-folder hierarchy structure
 * Provides forms to create/edit a folder or to add a new visit
 */
 
export const FoldersDisplay = () => {   
    const palette = useTheme().palette; 
    const [form, setForm] = useState({ type: null, item: null, open: false });    
    const menuRef = useRef(null);
    const createBtnRef = useRef(null);
    const folderRefs = useRef([]); 
    const { 
        filesData, 
        folderHierarchy, 
        setFolderHierarchy, 
        personnel, 
        handleFolderAdd, 
        handleFolderDelete, 
        handleVisitAdd 
    } = useContext(VisitsPageContext);   
 
    const btnMenuItems = [
        {
            title: "New Folder",
            onClick: () => { openForm("folder") },
            icon: <CreateNewFolderOutlined />
        },
        {
            title: "New Visit",
            onClick: () => { openForm("visit")  },
            icon:  <NoteAddOutlined />
        }
    ];    

    const folderMenuItems = [
        {
            title: "Edit Folder", 
            onClick: () => { openForm("folder", getSelectedFolder()) },  
            icon: <Edit />
        },
        {
            title: "Delete Folder",
            onClick: async () => { await handleFolderDelete(getSelectedFolder()?.folderID) },
            icon:  <Delete />
        }
    ];  

    const openMenu = (type, item, event) => { 
        if (type === "folder") { 
            event.stopPropagation();
            menuRef.current?.openMenu(
                folderRefs.current[item.folderID], 
                "bottomLeft",
                folderMenuItems, 
                item
            );
        } else if (type === "create") {
            menuRef.current?.openMenu(createBtnRef.current, "bottomRight", btnMenuItems);
        }
    };

    const getSelectedFolder = () => { return menuRef.current?.getSelected() }; 

    const getFolderName = (folderID) => {
        const folder = filesData.folders.find(folder => folder.folderID === folderID); 
        return folder?.name ?? "";
    };

    // returns array of sub-folders directly under currently open folder
    const getFoldersToShow = () => {
        const openFolderID = folderHierarchy[folderHierarchy.length-1]; 
        return filesData.folders.filter(folder => folder.parentID === openFolderID);
    };  

    const getFolderBoxLabel = (folder) => { 
        const visitsCount = filesData.foldersVisitCount[folder.folderID] ?? 0;
        const subFoldersCount = filesData.foldersSubFolderCount[folder.folderID] ?? 0;  
        if (visitsCount > 0) return `${ visitsCount } Visits`; 
        return subFoldersCount > 0 ? `${ subFoldersCount } Folders` : `${ visitsCount } Visits`;
    };

    const resetHierarchy = () => setFolderHierarchy([0]);
 
    // opens clicked folder (shows its visits) & updates folder hierarchy
    const openFolder = (folderID, index = null) => {  
        if (index === null) {
            setFolderHierarchy(prev => [...prev, folderID]);
        } else if (index < folderHierarchy.length) { 
            setFolderHierarchy(prev => {
                const newHierarchy = [ ...prev ]; // retain previous order
                for (let i = 0; i < newHierarchy.length; i++) {
                    if (newHierarchy[i] === folderID) {
                        newHierarchy.splice(i + 1); // remove folders that succeed clicked folder 
                        break;
                    }
                }; 
                return newHierarchy;
            });
        };
    };
 
    const openForm = (formType, item = null) => setForm({ type: formType, item: item, open: true }); 
 
    const closeForm = () => setForm({ type: null, item: null, open: false });

    const onFolderFormSubmit = async (formData) => {
        closeForm(); 
        const openFolderID = folderHierarchy[folderHierarchy.length - 1];  
        const folderData = {
            ...formData,
            parentID: openFolderID === 0 ? null : openFolderID 
        };   
        await handleFolderAdd(folderData);
    }; 

    const onVisitFormSubmit = async (formData) => {
        closeForm();  
        await handleVisitAdd(formData); 
    };

    const renderFormType = () => {
        switch (form.type) { 
            case "visit":
                return (
                    <VisitForm
                        currentVisit={null}
                        members={ personnel.members }
                        providers={ personnel.providers } 
                        folders={ filesData.folders }
                        onCancelClick={closeForm}
                        onSubmit={onVisitFormSubmit} 
                    />
                );
            case "folder":
                return (
                    <FolderForm
                        currentFolder={ form.item } 
                        onCancelClick={closeForm}    
                        onSubmit={onFolderFormSubmit}
                    />
                );
            default: 
                return null;
        }
    }; 

    const folderHierarchyProps = { 
        resetHierarchy, 
        folderHierarchy, 
        openFolder, 
        getFolderName, 
        color: palette.background.contrastText 
    };

    const foldersListProps = { getFoldersToShow, openFolder, openMenu, getFolderBoxLabel, palette };

    return (
        <Stack direction="column" spacing={1} > 
            <Stack 
                direction="row" 
                sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }} 
            > 
                <FolderHierarchy props={folderHierarchyProps} /> 
                <FilledButton 
                    ref={createBtnRef}
                    text="Create"
                    icon={ <Add /> }  
                    onClick={() => openMenu("create")} 
                />
            </Stack>  
            <FoldersList props={foldersListProps} ref={folderRefs} />   

            <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                <DialogContent>
                    { renderFormType() }
                </DialogContent>
            </Dialog>    
            <CustomContextMenu ref={menuRef} 
        />  
        </Stack>
    );
};