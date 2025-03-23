import { Avatar, Stack, useTheme } from "@mui/material";
import { memo } from "react";  
import { useCustomNavigate } from "../../useCustomNavigate";
import { AllergyList, ContainerTitle, ErrorGraphicMessage, ImageCell, MemberSelect, TooltipButton } from "../../components";  
import { containerStyles } from "../../styles"; 


const MemberProfileMenu = ({ member, allMembers, goToMeds, palette }) => (
    <Stack 
        direction="column"
        sx={{ 
            width: "100%", 
            bgcolor: palette.background.container, 
            ...containerStyles 
        }}
    >  
        <ContainerTitle title="Patient Information" /> 
        <Stack 
            direction="row" 
            sx={{ 
                width: "100%", 
                justifyContent: "space-between", 
                alignItems: "flex-end" 
            }}
        >
            <Stack direction="column" spacing={0.5} sx={{ width: "75%" }} >
                <MemberSelect
                    selected={member}
                    allMembers={allMembers}
                    onMemberChange={ (event) => goToMeds(event.target.value) }
                /> 
                <ImageCell
                    type="date"
                    text={ `DOB: ${ member.dob }` } 
                    textSx={{ fontSize: "0.9rem", color: palette.neutral.dark }}
                    iconSx={{ color: palette.neutral.dark, fontSize: 13 }}
                /> 
            </Stack> 
            <Avatar 
                src={ member.fullPicturePath } 
                alt={ member.fullName } 
                sx={{ width: 75, height: 75 }} 
            />
        </Stack>
    </Stack>
); 

/**
 * Shows the selected member's profile summary & their drug allergies
 * Provides a menu to change the selected member
 */

export const MemberDetails = memo(({ member, allMembers }) => { 
    const palette = useTheme().palette;
    const { goToMeds, goToProfile } = useCustomNavigate();  
    const allergies = member.drugAllergies;  

    return ( 
        <Stack direction="column" spacing={4} sx={{ width: "25%", height: "100%" }} >
            <MemberProfileMenu 
                member={member}
                allMembers={allMembers}
                goToMeds={goToMeds}
                palette={palette}
            />
            <Stack 
                direction="column"
                sx={{
                    width: "100%",
                    bgcolor: palette.background.container,
                    ...containerStyles 
                }}
            >  
                <ContainerTitle
                    title="Drug Allergies"
                    extraContent={
                        <TooltipButton
                            type="edit"
                            label="Edit Allergies"
                            onClick={() => goToProfile(member.memberID)}
                        />
                    }
                />
                { allergies?.length > 0 ? 
                    <AllergyList allergies={allergies} /> : <ErrorGraphicMessage type="allergy" /> 
                }
            </Stack> 
        </Stack>
    );
}); 