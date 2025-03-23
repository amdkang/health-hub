import { Stack, Typography } from "@mui/material";
import  { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormButtons, FormTextField } from "../../components"; 
import { formStyles } from "../../styles";

/**
 * Form to add new or edit existing folder (used to organize visits)
 */

export const FolderForm = ({ currentFolder, onSubmit, onCancelClick }) => {
    const title = useRef(currentFolder ? "Rename Folder" : "Add New Folder");
    const getInitialValues = (currentFolder) => {
        return { name: currentFolder ? currentFolder.name : "" };
    };

    const formik = useFormik({
        initialValues: getInitialValues(currentFolder),
        validationSchema: Yup.object({
            name: Yup.string().required("Field required")
        }),
        onSubmit: values => {   
            const folder = {
                name: values.name,
                folderID: currentFolder?.folderID ?? null
            }; 
            onSubmit(folder);
        }
    });

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={3} sx={formStyles} >
                <Typography variant="h3" > { title.current } </Typography>
                <FormTextField
                    required
                    id="name" 
                    label="Folder Name" 
                    inputProps={{ maxLength: 30 }}
                    onChange={ formik.handleChange }
                    value={ formik.values.name }
                    { ...formik.getFieldProps("name") }
                />
            </Stack>
            <FormButtons formik={formik} onCancelClick={onCancelClick} />
        </form>
    );
}; 