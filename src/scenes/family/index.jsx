import { Dialog, DialogContent, SpeedDial, SpeedDialAction, Stack, Typography, useTheme } from "@mui/material";
import { EditOutlined, PersonAddAlt1, PersonRemove } from "@mui/icons-material"; 
import { useCallback, useEffect, useRef, useState } from "react";
import { getTreeData, searchConditions, searchMeds } from "../../database/clientServices";   
import { addChild, addParent, addSibling, addSpouse, deleteMember, positionMembers, resetTrees } from "./treeUtils";
import { CloseButton, CustomSnackbar, ErrorGraphicMessage, LoadingCircle, Topbar } from "../../components";  
import { FamilyTree } from "./FamilyTree";  
import { MemberModal } from "./MemberModal";    
import { MemberForm } from "../forms"; 
import { formDialogStyles, pageStyles, tooltipStyles } from "../../styles";

// shows options to add or delete member
const EditModeSpeedDial = ({ editMode, editModeOptions, closeEditMode }) => {
    const palette = useTheme().palette;   

    return (
        <Stack 
            direction="row"
            sx={{
                width: "100%", 
                justifyContent: editMode.open ? "space-between" : "flex-end",
                alignItems: "flex-end"
            }}
        > 
            { editMode.open && (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", pb: "0.5rem" }} >
                    <CloseButton
                        onClick={closeEditMode}
                        color={ palette.background.contrastText }
                    />
                    <Typography sx={{ fontSize: "1.2rem" }} > 
                        { `Select Member to ${ editModeOptions[editMode.type].title }:` } 
                    </Typography>
                </Stack>
            )} 

            <SpeedDial
                ariaLabel="SpeedDial"
                direction="left"
                icon={ <EditOutlined /> }
                sx={{ '& .MuiSpeedDial-fab': { width: "3rem", height: "3rem" } }}
            >
                { Object.values(editModeOptions).map((mode, index) => (
                    <SpeedDialAction
                        key={index}
                        icon={ mode.speedDial.icon }
                        onClick={ mode.speedDial.action }
                        tooltipTitle={ mode.speedDial.name } 
                        slotProps={tooltipStyles}
                        arrow
                        sx={{
                            bgcolor: palette.primary.main,
                            color: palette.primary.contrastText,
                            '&:hover': {
                                bgcolor: palette.primary.main,
                                outline: `0.15rem solid ${ palette.background.contrastText }`
                            }
                        }}
                    />
                ))}
            </SpeedDial>
        </Stack>
    );
};

/**
 * Page that displays the main user's family tree 
 * Provides a form to add or delete family members
 */

export const FamilyHistory = () => { 
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);  
    const [treeData, setTreeData] = useState({ members: [], levels: [] });
    const [form, setForm] = useState({ open: false, selected: null });
    const [editMode, setEditMode] = useState({ open: false, type: null });
    const [memberModal, setMemberModal] = useState({ open: false, member: null });
    const editModeRef = useRef(editMode);
    const snackbarRef = useRef(null);   
    console.log(treeData);
    
    // defines button items for `EditModeSpeedDial`
    const editModeOptions = {
        add: {
            title: "Add To",
            onMemberClick: (member) => setForm({ open: true, selected: member }),
            speedDial: {
                icon: <PersonAddAlt1 />,
                name: "Add Member",
                action: () => setEditMode({ open: true, type: "add" })
            }
        },
        delete: {
            title: "Delete", 
            onMemberClick: (member) => handleMemberDelete(member),
            speedDial: {
                icon: <PersonRemove />,
                name: "Delete Member",
                action: () => setEditMode({ open: true, type: "delete" })
            }
        }
    };  

    const fetchSetTreeData = async () => {  
        try {     
            setTreeData(await getTreeData());
            setDbError(false);
        } catch (err) {   
            setDbError(true);
        }
    };  

    useEffect(() => {    
        const fetchAllData = async () => {
            setLoading(true);    
            await fetchSetTreeData();    
            setLoading(false); 
        }
        fetchAllData();    
    }, []); 

    useEffect(() => {   
        editModeRef.current = editMode;
    }, [editMode]); 

    const closeEditMode = () => setEditMode({ open: false, type: null });

    const closeForm = useCallback(() => {
        if (form.open) setForm({ open: false, selected: null }); 
        if (editModeRef.current.open) closeEditMode();
        fetchSetTreeData();
    }, [form]);
    
    const onMemberClick = useCallback(async (member) => { 
        if (!editModeRef.current.open) { // show medical summary for member
            const [conditions, meds] = await Promise.all([  
                searchConditions("memberID", member.memberID),
                searchMeds("memberID", member.memberID), 
            ]);  
            setMemberModal({
                open: true,
                member: { ...member, conditions: conditions, medications: meds }
            });
        } else { 
            // execute add/delete function for member
            editModeOptions[editModeRef.current.type].onMemberClick(member); 
        }
    }, []); 

    const handleMemberAdd = useCallback (async (memberData) => {    
        try { 
            switch(memberData.relation) {
                case "parent":  
                    await addParent(memberData, form.selected.memberID, treeData);
                    break;

                case "child":
                    await addChild(memberData, form.selected.memberID, treeData);
                    break;
                case "sibling":
                    
                    await addSibling(memberData, form.selected.memberID, treeData);
                    break;

                case "spouse":  
                    await addSpouse(memberData, form.selected.memberID, treeData)
                    break;

                default:
                    throw new Error("Error adding family member"); 
            }
        } catch (err) {  
            snackbarRef.current?.showSnackbar(err.message, 3500); 
        }   
        await positionMembers(await getTreeData());  
        closeForm();
    }, [form, closeForm, treeData]); 

    const handleMemberDelete = async (member) => {   
        try {    
            await deleteMember(member.memberID, await getTreeData());     
            const updatedTreeData = await resetTrees(await getTreeData());   
            await positionMembers(updatedTreeData);  
            closeForm(); 
        } catch (err) {
            snackbarRef.current?.showSnackbar(err.message, 3500); 
        } 
    }; 

    return (
        <Stack direction="column" sx={pageStyles} > 
            <Topbar title="FAMILY TREE" subtitle="Track Your Family's Health" /> 
            { loading && <LoadingCircle /> }

            { !loading && !dbError &&
                <Stack 
                    direction="column"  
                    spacing={1} 
                    sx={{ ...pageStyles, p: "0 0.5rem", overflow: "hidden" }} 
                > 
                    <EditModeSpeedDial 
                        editMode={editMode}
                        editModeOptions={editModeOptions}
                        closeEditMode={closeEditMode}
                    />  

                    { treeData.members.length > 0 && (
                        <FamilyTree treeData={treeData} onMemberClick={onMemberClick} />
                    )}

                    { memberModal.open && (
                        <MemberModal
                            memberModal={memberModal}
                            onClose={() => setMemberModal({ open: false, member: null })} 
                        />
                    )} 

                    <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                        <DialogContent>
                            <MemberForm 
                                onSubmit={handleMemberAdd} 
                                onCancelClick={closeForm} 
                                currentMember={ form.selected }    
                            />
                        </DialogContent>
                    </Dialog>  
                    <CustomSnackbar ref={snackbarRef} />  
                </Stack>
            }

            { dbError && <ErrorGraphicMessage type="database" /> }
        </Stack>
    );
}; 