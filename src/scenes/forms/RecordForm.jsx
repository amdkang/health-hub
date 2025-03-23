import { Stack, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"; 
import { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormButtons, FormNotesField, FormTextField } from "../../components";  
import { decapitalize, formatDate, formatStringField } from "../../utils";
import { formStyles } from "../../styles"; 

/**
 * Form used to to add new or edit existing medical history record for specific member  
 */

export const RecordForm = ({ type, currentRecord, onSubmit, onCancelClick }) => { 
    const title = useRef(currentRecord ? `Edit ${ type }` : `Add New ${ type }`);  
    const getInitialValues = (currentRecord) => {
        if (currentRecord) { 
            return {
                name: currentRecord.name,
                date: dayjs(currentRecord.date),
                location: currentRecord.location ?? "",
                notes: currentRecord.notes ?? ""
            };
        }
        return { name: "", date: dayjs(), location: "", notes: "" };
    }; 

    const formik = useFormik({
        initialValues: getInitialValues(currentRecord),
        validationSchema: Yup.object({
            name: Yup.string().required("Name required")
        }),
        onSubmit: values => {
            const record = {
                name: values.name,
                date: formatDate("fullDate", dayjs(values.date.$d)), 
                location: formatStringField(values.location),
                notes: formatStringField(values.notes),
                type: decapitalize(type),
                recordID: currentRecord?.recordID
            };
            onSubmit(record);
        }
    });

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={3} sx={formStyles} >
                <Typography variant="h3" > { title.current }  </Typography> 
                <FormTextField
                    required
                    id="name" 
                    label="Procedure Name"
                    onChange={ formik.handleChange }
                    value={ formik.values.name }
                    { ...formik.getFieldProps("name") }
                />  
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        id="date"
                        label="Date"
                        value={ formik.values.date }
                        onChange={ (newValue) => formik.setFieldValue("date", newValue) }
                        slotProps={{ textField: { required: true, variant: "outlined" }}}
                    />
                </LocalizationProvider> 
                <FormTextField
                    id="location" 
                    label="Location"
                    onChange={ formik.handleChange }
                    value={ formik.values.location }
                    { ...formik.getFieldProps("location") }
                />   
                <FormNotesField formik={formik} maxLength={300} />    
                <FormButtons formik={formik} onCancelClick={onCancelClick} />
            </Stack>    
        </form>
    );
}; 