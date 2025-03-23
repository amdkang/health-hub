import { Box, Stack, Typography } from "@mui/material"; 
import { useFormik } from "formik";
import { AttachFileOutlined } from "@mui/icons-material"; 
import { ContainerTitle, FormButtons } from "../../components";
import { formStyles } from "../../styles";

/**
 * Form used to upload files for a specific visit 
 */

export const FileSelectForm = ({ onSubmit,  onCancelClick }) => {
    const getInitialValues = () => { return { files: [] } };
    const formik = useFormik({
        initialValues: getInitialValues(),
        onSubmit: values => { onSubmit(values.files) }
    });

    // renders list of uploaded file names
    const updateFileNames = () => {
        var input = document.getElementById("files-input");
        var names = document.getElementById("file-names"); 
        names.innerHTML = "<ul>";
        for (var i = 0; i < input.files.length; ++i) {
            names.innerHTML += "<li>" + input.files.item(i).name + "</li>";
        };
        names.innerHTML += "</ul>";
    };

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={3} sx={formStyles} >
                 <ContainerTitle
                    title="Add New Files"
                    titleIcon={ <AttachFileOutlined sx={{ fontSize: 22 }} /> }  
                />      
                <input
                    id="files-input" 
                    type="file"  
                    multiple
                    onChange={ event => {
                        formik.setFieldValue("files", event.currentTarget.files);
                        updateFileNames();
                    }}
                />
                
                <Stack direction="column" sx={{ pl: "0.3rem" }} >
                    { formik.values.files.length > 0 && (
                        <Typography sx={{ fontSize: "1rem" }} > Selected Files: </Typography>
                    )}
                    <Box id="file-names" />
                </Stack>
            </Stack> 

            <FormButtons formik={formik} onCancelClick={onCancelClick} />
        </form>
    );
}; 