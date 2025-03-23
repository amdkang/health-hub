import { Avatar, Box, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { AddOutlined } from "@mui/icons-material"; 
import { CustomSnackbar } from "./CustomSnackbar"; 
import { forwardRef, useRef } from "react";
import { scrollBarStyles, tooltipStyles } from "../styles"; 
import { DEFAULT_PROFILE_PIC_PATH, MEMBER_AVATAR_PATHS } from "../constants";

const DefaultAvatarOption = ({ path, onClick }) => (
    <IconButton 
        onClick={() => onClick(path)}
        sx={{
            width: 70,
            height: 70,
            justifyContent: "center",
            alignItems: "center"
        }}
    >
        <Avatar
            id={path}
            alt={path} 
            src={ `${ DEFAULT_PROFILE_PIC_PATH }/${ path }` }
            sx={{ width: 70, height: 70, mb: "0.4rem" }}
        />
    </IconButton>
);

// button that opens file selector to upload a custom picture
const UploadButton = forwardRef(({ onFileChange, onClick, borderColor }, ref) => {
    const buttonSx = {
        width: 30, 
        height: 30, 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: `0.1rem solid ${borderColor}`,
        borderRadius: "50%"
    };
    
    return (
        <Tooltip
            title="Upload Photo"
            placement="top"
            arrow
            slotProps={tooltipStyles}
        >
            <IconButton sx={{ width: 55, height: 55 }} onClick={onClick} >
                <Box sx={buttonSx} >
                    <AddOutlined sx={{ fontSize: "medium" }} />
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        id="file-input" 
                        ref={ref}
                        onChange={onFileChange}
                        style={{ display: "none" }}
                    />
                </Box>
            </IconButton>
        </Tooltip>
    );
}); 
 
/**
 * Form component used to select a profile picture (for family member or provider) 
 * Users can select from default avatar options or upload a custom image
 */

export const AvatarSelector = ({ formik, type }) => {
    const palette = useTheme().palette; 
    const inputRef = useRef(null);  
    const snackbarRef = useRef(null); 
    const row1Avatars = MEMBER_AVATAR_PATHS.slice(0,8);
    const row2Avatars = MEMBER_AVATAR_PATHS.slice(9);
    const avatarSelectorSx = { 
        width: "64ch",
        alignSelf: "center",
        alignItems: "center",
        p: "1rem",
        border: `0.1rem solid ${ palette.neutral.dark }`,
        borderRadius: "0.5rem"
    };

    // sets form values for selected default profile picture
    const onAvatarClick = (path) => {  
        formik.setFieldValue("pictureType", "default"); 
        formik.setFieldValue("pictureURL", `${ DEFAULT_PROFILE_PIC_PATH }/${ path }`);
        formik.setFieldValue("picturePath", path);
        formik.setFieldValue("customFile", null);  
    }; 

    const openFileSelector = () => { if (inputRef.current) inputRef.current.click(); };

    // formats uploaded file & sets form values for custom profile picture
    const onFileChange = (event) => {
        const file = event.target.files[0]; 
        if (file) {
            const fileUrl = URL.createObjectURL(file);    
            formik.setFieldValue("pictureType", "custom"); 
            formik.setFieldValue("pictureURL", fileUrl);
            formik.setFieldValue("picturePath", `profile_pictures/${ file.name }`); 
            formik.setFieldValue("customFile", file); 
        } 
    };   

    return (
        <Stack direction="column" spacing={1} sx={avatarSelectorSx} > 
            <Avatar 
                src={ formik.values.pictureURL } 
                alt="selected profile picture"
                sx={{ width: 100, height: 100 }} 
            /> 
            <Typography sx={{ fontSize: "1rem" }} > Select a Profile Picture: </Typography> 

            <Stack 
                direction="column"
                sx={{ width: "100%", p: "0.8rem 0", overflow: "auto", ...scrollBarStyles }}
            >
                <Stack direction="row" spacing={2} >
                    { row1Avatars.map((path) => (
                        <DefaultAvatarOption key={path} path={path} onClick={onAvatarClick} /> 
                    ))}
                </Stack> 

                <Stack direction="row" spacing={2} >
                    { row2Avatars.map((path) => (
                        <DefaultAvatarOption key={path} path={path} onClick={onAvatarClick} /> 
                    ))}

                    { type === "member" && (
                        <UploadButton
                            ref={inputRef}
                            onClick={openFileSelector}
                            onFileChange={onFileChange}
                            borderColor={ palette.background.contrastText }
                        /> 
                    )}
                </Stack>
            </Stack> 
            <CustomSnackbar ref={snackbarRef} />     
        </Stack> 
    );
};