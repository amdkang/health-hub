import { Stack, Typography, useTheme } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormButtons, FormNotesField, FormSelectMenu, FormTextField } from "../../components";  
import { noProviderOption } from "./ProviderForm";  
import { formatDate, formatStringField } from "../../utils";
import { formStyles } from "../../styles";

/**
 * Form used to to add new or edit existing visit  
 */

export const VisitForm = ({ currentVisit, members, providers, folders, onSubmit, onCancelClick }) => {
    const theme = useTheme();
    const title = useRef(currentVisit ? "Edit Visit" : "Add New Visit");  
    const getInitialValues = (currentVisit) => {
        const noFolderOption = { 
            folderID: -1, 
            name: "none", 
            color: { main: "none", text: theme.palette.background.contrastText } 
        };
            
        if (currentVisit) { 
            return {
                name: currentVisit.name,
                date: dayjs(currentVisit.date),
                reason: currentVisit.reason ?? "",
                location: currentVisit.location ?? "",
                memberID: currentVisit.member.memberID,
                members: members,
                providerID: currentVisit.provider?.providerID ? currentVisit.provider?.providerID : -1,
                providers: [...providers, noProviderOption],
                folders: [noFolderOption, ...folders],
                folderID: currentVisit.folderID ?? -1,
                notes: currentVisit.notes ?? ""
            };
        }
        return {
            name: "",
            date: dayjs(),
            reason: "",
            location: "",
            memberID: 1,
            members: members,
            providerID: -1,
            providers: [...providers, noProviderOption],
            folders: [noFolderOption, ...folders],
            folderID: -1,
            notes: ""
        };
    };

    const formik = useFormik({
        initialValues: getInitialValues(currentVisit),
        validationSchema: Yup.object({
            name: Yup.string().required("Field required")
        }),
        onSubmit: values => {
            const visit = {
                visitID: currentVisit?.visitID ?? null,
                name: values.name,
                date: formatDate("fullDate", dayjs(values.date.$d)),
                reason: formatStringField(values.reason),
                location: formatStringField(values.location), 
                providerID: values.providerID > 0 ? values.providerID : null,
                memberID: values.memberID,
                notes: formatStringField(values.notes),
                files: currentVisit?.files,
                folderID: values.folderID > 0 ? values.folderID : null 
            };    
            onSubmit(visit);
        }
    });
  
    return ( 
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={3} sx={formStyles} >
                <Typography variant="h3" > { title.current } </Typography> 
                <FormTextField
                    required
                    id="name" 
                    label="Visit Name"
                    onChange={ formik.handleChange }
                    value={ formik.values.name }
                    { ...formik.getFieldProps("name") }
                />   
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DatePicker
                        id="date"
                        label="Date"
                        value={ formik.values.date }
                        onChange={ newValue => formik.setFieldValue("date", newValue) }
                        slotProps={{ textField: { required: true, variant: "outlined" }}}
                    />
                </LocalizationProvider>  
                <FormSelectMenu type="member" formik={formik} />  
                <FormSelectMenu type="provider" formik={formik} multiple={false} />  
                <FormSelectMenu type="folder" formik={formik} multiple={false} />  
                <FormTextField 
                    id="location" 
                    label="Location"
                    onChange={ formik.handleChange }
                    value={ formik.values.location }
                    { ...formik.getFieldProps("location") }
                />     
                <FormTextField 
                    id="reason" 
                    label="Reason for Visit"
                    onChange={ formik.handleChange }
                    value={ formik.values.reason } 
                    { ...formik.getFieldProps("reason") }
                />  
                <FormNotesField formik={formik} maxLength={300} />  
            </Stack>
            
            <FormButtons formik={formik} onCancelClick={onCancelClick} />
        </form> 
    );
}; 