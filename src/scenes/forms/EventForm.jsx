import { Stack, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import  { useRef } from "react";
import { useFormik } from "formik"; 
import { FormButtons, FormNotesField, FormTextField, FormSelectMenu } from "../../components"; 
import { noProviderOption } from "./ProviderForm";  
import { formatDate, formatStringField } from "../../utils";
import { formStyles } from "../../styles";

/**
 * Form used to to add new or edit existing calendar event 
 */

export const EventForm = ({ currentEvent, selectedDate, providers, onSubmit, onCancelClick }) => {
    const title = useRef(currentEvent ? "Edit Event" : "Add New Event");
    const getInitialValues = (currentEvent) => {
        if (currentEvent) { 
            return {
                name: currentEvent.name,
                datetime: dayjs(currentEvent.datetime), 
                providers: [...providers, noProviderOption],
                providerID: currentEvent.provider?.providerID ?? -1, 
                location: currentEvent.location ?? "",
                notes: currentEvent.notes ?? ""
            };
        }
        return {
            name: "",
            datetime: dayjs(selectedDate),
            providers: [...providers, noProviderOption], 
            providerID: -1,
            location: "",
            notes: "",
            eventID: currentEvent?.eventID
        };
    };

    const formik = useFormik({
        initialValues: getInitialValues(currentEvent),
        onSubmit: values => {  
            const event = {
                name: values.name, 
                datetime: formatDate("dateTime", values.datetime.$d),
                providerID: values.providerID > 0 ? values.providerID : null,
                location: formatStringField(values.location),
                notes: formatStringField(values.notes),
                eventID: currentEvent?.eventID
            };   
            onSubmit(event);
        }
    });

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={3} sx={formStyles} >
                <Typography variant="h3" > { title.current } </Typography> 
                <FormTextField
                    required
                    id="name"
                    label="Event Name"
                    onChange={ formik.handleChange }
                    value={ formik.values.name }
                    { ...formik.getFieldProps("name") }
                />
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DateTimePicker
                        id="datetime"
                        label="Date/Time"
                        value={ formik.values.datetime }
                        onChange={ newValue => formik.setFieldValue("datetime", newValue) }
                        slotProps={{ textField: { required: true, variant: "outlined" }}}                   
                    />
                </LocalizationProvider>  
                <FormSelectMenu formik={formik} type="provider" multiple={false} />
                <FormTextField
                    id="location"
                    label="Location"
                    onChange={ formik.handleChange }
                    value={ formik.values.location }
                    { ...formik.getFieldProps("location") }
                />
                <FormNotesField formik={formik} />
            </Stack>
            
            <FormButtons formik={formik} onCancelClick={onCancelClick} />
        </form>
    );
}; 