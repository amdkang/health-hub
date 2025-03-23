import { Box, Stack, Typography, useTheme } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup"; 
import dayjs from "dayjs"; 
import { FormButtons, FormNotesField, FormTextField } from "../../components"; 
import { formatDate, formatStringField } from "../../utils";
import { formStyles } from "../../styles";

/**
 * Form used to add new or edit existing measurement for specified condition 
 */

export const MeasurementForm = ({ onSubmit, currentMsmt, onCancelClick }) => {
    const theme = useTheme(); 
    const title = useRef(currentMsmt ? "Edit Measurement" : "Add New Measurement");
    const getInitialValues = (currentMsmt) => {
        if (currentMsmt) { 
            return {
                value: currentMsmt.value,
                datetime: dayjs(currentMsmt.datetime),
                notes: currentMsmt.notes ?? ""
            };
        }
        return { value: 0, datetime: dayjs(), notes: "" };
    };

    const formik = useFormik({
        initialValues: getInitialValues(currentMsmt),
        validationSchema: Yup.object({
            value: Yup.string()
                .max(5, "Max 5 characters")
                .required("Field required"),
            datetime: Yup.string().required("Field required"),
        }),
        onSubmit: values => {
            const newMsmt = {
                value: values.value,
                datetime: formatDate("dateTime", values.datetime.$d),
                notes: formatStringField(values.notes),
                measurementID: currentMsmt?.measurementID
            };
            onSubmit(newMsmt);
        }
    });

    return (
        <form onSubmit={ formik.handleSubmit }>
            <Stack direction="column" spacing={3} sx={formStyles} >  
                <Typography variant="h3" > { title.current } </Typography> 
                <Stack direction="column" spacing={0.5} >
                    <FormTextField
                            required
                            type="number"   
                            id="value" 
                            label="Value"
                            onChange={ formik.handleChange }
                            inputProps={{ maxLength: 10 }}
                            value={ formik.values.value }
                            { ...formik.getFieldProps("value") }
                    /> 

                    { formik.errors.value && (
                        <Box sx={{ fontSize: "0.7rem", color: theme.palette.neutral.dark }} >
                            { formik.errors.value }
                        </Box>
                    )}
                </Stack>

                <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DateTimePicker 
                        label="Date/Time"
                        value={ formik.values.datetime }
                        onChange={ newValue => formik.setFieldValue("datetime", newValue) }
                        slotProps={{ textField: { required: true, variant: "outlined" }}}
                    />
                </LocalizationProvider> 
                <FormNotesField formik={formik} maxLength={150} />
                <FormButtons formik={formik} onCancelClick={onCancelClick} />
            </Stack>
        </form>
    );
};