import { Avatar, Box, Dialog, DialogContent, Divider, Stack, Typography, useTheme } from "@mui/material";
import { CalendarTodayOutlined, Email, FemaleOutlined, Home, MaleOutlined, MedicalInformationOutlined, MonitorWeightOutlined, Phone, SquareFootOutlined } from "@mui/icons-material";
import { memo, useState } from "react"; 
import { useCustomNavigate } from "../../useCustomNavigate"; 
import { AllergyList, ContainerTitle, ErrorGraphicMessage, MemberSelect, TooltipButton } from "../../components";  
import { ProfileForm } from "../forms";  
import { formatDate, formatHeight, formatWeight } from "../../utils";
import { containerStyles, formDialogStyles } from "../../styles"; 

// general container for each detail in `PersonalData` and `ContactInformation`
const ProfileDetail = ({ title, text, icon, width, color }) => (
    <Stack direction="row" spacing={0.5} sx={{ width: width ?? "100%" }} >
        <Box> { icon } </Box> 

        <Stack direction="column" spacing={0.3} >
            <Typography sx={{ fontSize: "0.8rem", color: color }} >
                { title }
            </Typography>  
            <Typography sx={{ fontSize: "0.9rem", pl: "0.1rem" }} >
                { text }
            </Typography>
        </Stack> 
    </Stack>
);

// shows demographic + biometric data for selected member
const PersonalData = ({ profile, color }) => {
    const iconSx = { fontSize: 16, color: color }; 
    return (
        <Stack direction="column" spacing={3} sx={{ width: "92%", alignItems: "center" }} >
            <Stack direction="row" sx={{ width: "100%", justifyContent: "space-between" }} >
                <ProfileDetail
                    title="Date Of Birth"
                    text={ formatDate("fullDate", profile.dob) }
                    icon={ <CalendarTodayOutlined sx={{ ...iconSx, fontSize: 12 }} /> }
                    width="70%" 
                    color={color}
                />
                <ProfileDetail
                    title="Gender"
                    text={ profile.sex }
                    icon={ profile.sex === "Male" ? 
                        <MaleOutlined sx={iconSx} /> : <FemaleOutlined sx={iconSx} /> 
                    }
                    width="30%" 
                    color={color}
                />
            </Stack>

            <Stack direction="row" sx={{ width: "100%", justifyContent: "space-between" }} >
                <ProfileDetail
                    title="Weight"
                    text={ formatWeight(profile.weight, profile.usesMetric) }
                    icon={ <MonitorWeightOutlined sx={{ ...iconSx, fontSize: 14, mt: "0.1rem" }} /> }
                    width="70%" 
                    color={color}
                /> 
                <ProfileDetail
                    title="Height"
                    text={ formatHeight(profile.height, profile.usesMetric) }
                    icon={ <SquareFootOutlined sx={{ ...iconSx, fontSize: 14 }} /> }
                    width="30%" 
                    color={color}
                />
            </Stack>
        </Stack>
    )
}; 

// shows contact information for selected member
const ContactInformation = ({ profile, color }) => {
    const iconSx = { fontSize: 12, color: color };
    return (
        <Stack direction="column" spacing={3} > 
            <ContainerTitle title="Contact" />    
            <ProfileDetail
                title="Home Address"
                text={ profile.address }
                icon={ <Home sx={{...iconSx, mt: "0.1rem" }} /> } 
                color={color}
            /> 
            <ProfileDetail 
                title="Phone Number" 
                text={ profile.phone } 
                icon={ <Phone sx={iconSx} /> } 
                color={color}
            /> 
            <ProfileDetail 
                title="Email Address" 
                text={ profile.email }
                icon={ <Email sx={iconSx} /> } 
                color={color}
            />
        </Stack>
    )
};
 
/**
 * Displays the selected member's profile information
 * Provides a form to edit any profile details + menu to change selected member
 */

export const Profile = memo(({ memberID, profiles, handleProfileAdd, setSnackbarMsg }) => {  
    const palette = useTheme().palette; 
    const { goToProfile } = useCustomNavigate(); 
    const [form, setForm] = useState({ item: null, open: false });
    const profile = profiles.selected; 
    const closeForm = () => setForm({ type: null, item: null, open: false }); 

    const onProfileFormSubmit = async (formData) => {
        closeForm();
        const profileData = { 
            profileID: profile.profileID, 
            memberID: memberID, 
            ...formData 
        };    
        await handleProfileAdd(profileData);
    };    
 
    return ( 
        <>
            { profile && 
                <Stack direction="column" spacing={2} sx={{ width: "27%" }} >
                    <Stack 
                        direction="column" 
                        spacing={2}
                        sx={{ width: "100%", bgcolor: palette.background.container, ...containerStyles }}
                    >
                        <ContainerTitle
                            titleIcon={ <MedicalInformationOutlined sx={{ fontSize: 22 }} /> }  
                            title="Profile"
                            extraContent={
                                <TooltipButton
                                    type="edit"
                                    label="Edit Profile" 
                                    onClick={() => setForm({ item: profile, open: true })}  
                                />
                            }
                        /> 
                        
                        <Stack direction="column" spacing={4} sx={{ alignItems: "center" }} >
                            <Stack direction="column" spacing={1} sx={{ width: "100%",  alignItems: "center" }} >
                                <Avatar 
                                    src={ profile.fullPicturePath } 
                                    alt={ profile.fullName } 
                                    sx={{ width: 130, height: 130 }} 
                                />   
                                <MemberSelect
                                    selected={profile}
                                    allMembers={ profiles.all }
                                    onMemberChange={ (event) => goToProfile(event.target.value) }
                                />    
                            </Stack> 
                            <PersonalData profile={profile} color={ palette.neutral.dark } />
                        </Stack> 

                        <Divider sx={{ bgcolor: palette.neutral.light }} />   
                        <ContactInformation profile={profile} color={ palette.neutral.dark } />
                    </Stack> 
                    
                    <Stack 
                        direction="column" 
                        spacing={2}
                        sx={{ width: "100%", bgcolor: palette.background.container, ...containerStyles }}
                    >
                        <ContainerTitle title="Allergies" />  
                        { profile.allergies.length > 0 ? (
                            <AllergyList allergies={profile.allergies} />
                        ) : (
                            <ErrorGraphicMessage type="allergy" /> 
                        )}
                    </Stack>
                    
                    <Dialog open={ form.open } onClose={closeForm}  sx={formDialogStyles} >
                        <DialogContent>
                            <ProfileForm
                                currentProfile={ form.item } 
                                onSubmit={onProfileFormSubmit}
                                onCancelClick={closeForm}
                                onError={() => setSnackbarMsg("Error updating profile")}
                            />
                        </DialogContent>
                    </Dialog>
                </Stack>
            }
        </>
    );
});  