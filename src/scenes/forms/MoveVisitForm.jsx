import { FormControl, FormControlLabel,Radio, RadioGroup, Stack, Typography, useTheme } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup"; 
import { FormButtons } from "../../components";
import { formStyles } from "../../styles";

/**
 * Form used to move visits to a specific folder 
 */

 export const MoveVisitForm = ({ folders, onSubmit, onCancelClick }) => {
    const theme = useTheme();  
    const getInitialValues = () => { 
        return {  
            selectedFolderID: -1,
            folders: [{ folderID: -1, name: "No Folder" }, ...folders]
        }
    };

    const formik = useFormik({
        initialValues: getInitialValues(),
        validationSchema: Yup.object({
            selectedFolderID: Yup.string().required("Field required")
        }), 
        onSubmit: values => {    
            const folderID = values.selectedFolderID > -1 ? values.selectedFolderID : null;
            onSubmit(folderID);
        }
    }); 
    
    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={2} sx={formStyles} >
                <Typography variant="h3" > Move Files To </Typography> 
                <FormControl>
                    <RadioGroup
                        name="folderID"  
                        value={ formik.values.selectedFolderID }
                        onChange={ event => { 
                            formik.handleChange(event);
                            formik.setFieldValue("selectedFolderID", event.target.value);
                        }}
                        sx={{ 
                            color: theme.palette.background.contrastText,
                            m: "0 0.2rem"
                        }}
                    >
                        { formik.values.folders.map(folder => 
                            <FormControlLabel
                                key={ folder.folderID }
                                value={ folder.folderID }
                                label={ folder.name } 
                                control={
                                    <Radio sx={{ '&.Mui-checked': { color: theme.palette.secondary.main }}} />
                                }
                                sx={{ wordBreak: "break-word" }}
                            />
                        )}
                    </RadioGroup>
                </FormControl>
            </Stack>   
            <FormButtons formik={formik} onCancelClick={onCancelClick} />
        </form>
    );
}; 