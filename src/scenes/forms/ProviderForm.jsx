import { Stack, Typography } from "@mui/material";
import { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AvatarSelector, FormButtons, FormTextField } from "../../components";  
import { formatStringField } from "../../utils";
import { DEFAULT_PROFILE_PIC_PATH } from "../../constants";  
import { formStyles } from "../../styles";

export const noProviderOption = { name: "none", providerID: -1, location: "", avatarImgPath: "man2.png" };

/**
 * Form used to to add new or edit existing provider for specific member 
 */

export const ProviderForm = ({ currentProvider, onSubmit, onCancelClick }) => {
    const title = useRef(currentProvider ? "Edit Provider" : "Add New Provider"); 
    const getInitialValues = (currentProvider) => {
        if (currentProvider) { 
            return {
                name: currentProvider.name,
                specialty: currentProvider.specialty ?? "",
                location: currentProvider.location ?? "",
                email: currentProvider.email ?? "",
                phone: currentProvider.phone ?? "",
                picturePath: currentProvider.picturePath,
                pictureURL: currentProvider.fullPicturePath 
            };
        }
        return {
            name: "",
            specialty: "",
            location: "",
            email: "",
            phone: "",
            picturePath: "man2.png",
            pictureURL: `${ DEFAULT_PROFILE_PIC_PATH }/man2.png`,
        }
    };

    const formik = useFormik({
        initialValues: getInitialValues(currentProvider),
        validationSchema: Yup.object({
            name: Yup.string().required("Name required")
        }),
        onSubmit: values => { 
            const provider = {
                name: values.name,
                specialty: formatStringField(values.specialty),
                location: formatStringField(values.location),
                email: formatStringField(values.email),
                phone: formatStringField(values.phone),
                picturePath: values.picturePath, 
                providerID: currentProvider?.providerID
            }; 
            onSubmit(provider);
        }
    });

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack 
                direction="column" 
                spacing={3} 
                sx={{ ...formStyles, '& .MuiTextField-root': { width: "64ch" }}} 
            > 
                <Typography variant="h3" > { title.current } </Typography>
                <AvatarSelector formik={formik} />
                <FormTextField
                    required
                    id="name" 
                    label="Provider Name"
                    onChange={ formik.handleChange }
                    value={ formik.values.name }
                    { ...formik.getFieldProps("name") }
                />
                <FormTextField
                    id="location"
                    label="Location"
                    onChange={ formik.handleChange }
                    value={ formik.values.location }
                    { ...formik.getFieldProps("location") }
                /> 
                <FormTextField 
                    id="specialty"
                    label="Specialty"
                    onChange={ formik.handleChange }
                    value={ formik.values.specialty }
                    { ...formik.getFieldProps("specialty") }
                /> 
                <FormTextField  
                    id="email" 
                    label="Email"
                    onChange={ formik.handleChange }
                    value={ formik.values.email }
                    { ...formik.getFieldProps("email") }
                />    
                <FormTextField   
                    id="phone" 
                    label="Phone"
                    onChange={ formik.handleChange }
                    value={ formik.values.phone }
                    { ...formik.getFieldProps("phone") }
                />   
                <FormButtons formik={formik} onCancelClick={onCancelClick} />
            </Stack>
        </form>
    );
};