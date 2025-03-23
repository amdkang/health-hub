import { Avatar, Modal, Typography, Stack, useTheme } from "@mui/material"; 
import { KeyboardArrowRight, LabelImportantOutlined } from "@mui/icons-material";
import { memo } from "react";  
import { useCustomNavigate } from "../../useCustomNavigate";
import { ImageCell } from "../../components";   
import { hoverTextStyles, scrollBarStyles } from "../../styles"; 
import { firstAidBox, pills1 } from "../../assets";  
import { decapitalize } from "../../utils";

const MemberProfile = ({ member, goToProfile, color }) => (
    <Stack 
        direction="row" 
        spacing={4}
        sx={{ width: "100%", justifyContent: "center", alignItems: "center", mb: "2rem" }} 
    >
        <Avatar 
            src={ member.fullPicturePath } 
            alt={ member.fullName } 
            sx={{ width: 100, height: 100 }} 
        />
        <Stack direction="column" >
            <Typography
                onClick={() => goToProfile(member.memberID)}
                sx={{ 
                    fontSize: "1.8rem",  
                    fontWeight: 500,
                    color: color,
                    mb: "0.7rem",
                    ...hoverTextStyles
                }} 
            >
                { member.fullName }
            </Typography>    
            <ImageCell
                type="time"
                text={ `DOB: ${ member.dob }` } 
                textSx={{ fontSize: "0.95rem" }} 
                iconSx={{ fontSize: 14 }}
            />
            <ImageCell 
                type={ decapitalize(member.sex) }
                text={ `Sex: ${ member.sex }` }
                textSx={{ fontSize: "0.95rem" }}
                iconSx={{ ml: "-0.2rem" }}  
            />  
        </Stack>
    </Stack>
); 

// general container to show condition or medication summary
const MedicalDetailBox = ({ img, title, itemsLength, onClick }) => {
    const palette = useTheme().palette;
    const boxSx = { 
        width: "100%", 
        height: "5rem",
        justifyContent: "space-between",
        alignItems: "center",
        mb: "1rem",
        p: "1rem 1rem",
        border: `0.1rem solid ${ palette.neutral.main }`, 
        borderRadius: "0.8rem",
        '&:hover': { 
            outline: `0.1rem solid ${ palette.primary.main }`,
            cursor: "pointer"
        }
    };

    return (
        <Stack direction="row" onClick={onClick} sx={boxSx} > 
            <Stack direction="row" spacing={1.5} >
                { img }
                <Stack direction="column" sx={{ height: "100%", justifyContent: "space-between" }} >
                    <Typography sx={{ fontSize: "1.1rem", color: palette.background.contrastText }} >
                        { title }
                    </Typography> 
                    <ImageCell
                        text={ `${ itemsLength } entries` }
                        textSx={{ color: palette.neutral.dark }}
                        image={
                            <LabelImportantOutlined sx={{ fontSize: 14, color: palette.neutral.dark }} />
                        } 
                    />
                </Stack> 
            </Stack> 
            <KeyboardArrowRight 
                sx={{ 
                    bgcolor: palette.primary.main,
                    color: palette.primary.contrastText,
                    borderRadius: "50%",
                    p: "0.2rem",
                    fontSize: 24
                }} 
            />  
        </Stack> 
    );
};
 
/**
 * Popup showing summary of and links to member's profile & medical summary 
 */ 

export const MemberModal = memo(({ memberModal, onClose }) => { 
    const theme = useTheme();
    const { goToProfile, goToConditions, goToMeds } = useCustomNavigate();
    const member = memberModal.member;  
    const modalSx = {
        width: "30rem",
        maxHeight: "80%",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)", 
        alignItems: "center",
        p: "1.6rem 2.2rem", 
        bgcolor: theme.palette.background.container, 
        border: `0.1rem solid ${ theme.palette.neutral.main }`,
        borderRadius: "0.5rem", 
        overflowY: "auto",
        ...scrollBarStyles
    }; 
 
    return (
        <Modal open={ memberModal.open } onClose={onClose} >   
            { member && (
                <Stack direction="column" sx={modalSx} >
                    <MemberProfile 
                        member={member}
                        goToProfile={goToProfile}
                        color={ theme.palette.background.contrastText }
                    />   
                    <MedicalDetailBox
                        title="CONDITIONS"
                        img={ <img src={firstAidBox} alt="graph" style={{ width: 40, height: 40 }} /> }
                        itemsLength={ member.conditions.length }
                        onClick={() => goToConditions(member.memberID)}
                    /> 
                    <MedicalDetailBox
                        title="MEDICATIONS"
                        img={ <img src={pills1} alt="pill" style={{ width: 38, height: 38 }} /> }
                        itemsLength={ member.medications.length }
                        onClick={() => goToMeds(member.memberID)}
                    />
                </Stack>
            )} 
        </Modal>
    );
}); 