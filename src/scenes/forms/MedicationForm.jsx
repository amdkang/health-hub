import { Box, Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, Typography, useTheme } from "@mui/material";
 import { useRef, useState } from "react";
 import { useFormik } from "formik";
 import * as Yup from "yup";
 import { FormButtons, FormNotesField, FormTextField, FormSelectMenu } from "../../components";  
 import { noProviderOption } from "./ProviderForm";  
 import { DAYS } from "../../constants";
 import { formatStringField } from "../../utils";
 import { formStyles } from "../../styles";

/**
 * Form used to to add new or edit existing medication for specified member
 */

export const MedicationForm = ({ currentMed, providers, onSubmit, onCancelClick }) => {
    const theme = useTheme();  
    const title = useRef(currentMed ? "Edit Medication" : "Add New Medication");
    const [weeklyError, setWeeklyError] = useState(false);
    const frequencyOptions = [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "prn", label: "As Needed" }
    ];
    const timeOptions = [
        { value: "AM", label: "AM" },
        { value: "PM", label: "PM" },
        { value: "both", label: "Both" },
        { value: "none", label: "None" }
    ]; 

    const getInitialValues = (currentMed) => {
        if (currentMed) {
            const provider = currentMed?.provider;
            return {
                name: currentMed.name,
                dosage: currentMed.dosage ?? "",
                frequency: currentMed.frequency ?? "",
                time: currentMed.time ?? "none",
                schedule: currentMed.schedule ?? [],
                providerID: provider?.providerID ?? -1,
                providers: [...providers, noProviderOption],
                notes: currentMed.notes ?? ""
            };
        }
        return {
            name: "",
            dosage: "",
            frequency: "daily",
            time: "AM",
            schedule: [],
            providerID: -1,
            providers: [...providers, noProviderOption],
            notes: ""
        }
    };

    const formik = useFormik({
        initialValues: getInitialValues(currentMed),
        validationSchema: Yup.object({
            name: Yup.string().required("Name required")
        }), 
        onSubmit: values => {   
            // ensure `weekly` meds have at least one day scheduled
            if (values.frequency === "weekly" && values.schedule.length === 0) { 
                setWeeklyError(true);
            } 
            else {
                const schedule = values.schedule.length > 0 ? values.schedule.sort((a,b) => a - b) : null;
                const med = {
                    name: values.name,
                    dosage: formatStringField(values.dosage), 
                    frequency: formatStringField(values.frequency),     
                    time: values.time === "none" ? null : values.time,
                    notes: formatStringField(values.notes),  
                    schedule: schedule,  
                    providerID: values.providerID > 0 ? values.providerID : null,
                    medID: currentMed?.medID
                };  
                onSubmit(med);
            }
        }
    });  

    // updates days selected for weekly med's schedule  
    const handleDaySelect = (index) => {
        const isChecked = formik.values.schedule.includes(index);
        const updatedDays = isChecked
            ? formik.values.schedule.filter((selectedDay) => selectedDay !== index)
            : [...formik.values.schedule, index];
        formik.setFieldValue("schedule", updatedDays);
    };

    // checkboxes used to set days for med's weekly schedule
    const WeeklyDaySelector = () => (
        <Stack direction="column" spacing={0.5} >
            <FormControl>
                <FormLabel> Select Days </FormLabel>
                <Box display="flex" flexDirection="row" >
                    { DAYS.map(day => day.shortName).map((day, index) => (
                        <FormControlLabel
                            key={index}
                            label={day}
                            control={
                                <Checkbox
                                    checked={ formik.values.schedule.includes(index) }
                                    onChange={ () => handleDaySelect(index) }
                                />
                            }
                        />
                    ))}
                </Box>
            </FormControl>

            { weeklyError && (
                <Typography sx={{ color: theme.palette.neutral.dark, fontSize: "0.8rem" }} >
                    * Select atleast one day for weekly medications
                </Typography>
            )}
        </Stack>
    );

    // updates med's frequency & clears weekly `schedule` if necessary
    const handleFrequencyChange = (frequency) => { 
        if (frequency !== "weekly") {
            if (weeklyError) setWeeklyError(false);
            if (formik.values.schedule.length > 0) {
                formik.setFieldValue("schedule", []);
            }
        }  
        formik.setFieldValue("frequency", frequency); 
    };

    // buttons used to select frequency at which med is taken
    const FrequencySelector = () => ( 
        <FormControl>
            <FormLabel> Frequency </FormLabel>
            <RadioGroup
                row
                aria-label="frequency"
                name="frequency"
                value={ formik.values.frequency } 
                onChange={ event => handleFrequencyChange(event.target.value) } 
            >   
                { frequencyOptions.map(option => (
                    <FormControlLabel 
                        key={ option.value }
                        value={ option.value } 
                        label={ option.label }
                        control={ <Radio /> } 
                    />
                ))} 
            </RadioGroup>
        </FormControl> 
    );

    // buttons used to select time med is taken
    const TimeSelector = () => (
        <FormControl>
            <FormLabel> Time </FormLabel>
            <RadioGroup
                row
                aria-label="time"
                name="time"
                value={ formik.values.time }
                onChange={ formik.handleChange }
            >
                { timeOptions.map(option => (
                    <FormControlLabel 
                        key={ option.value }
                        value={ option.value } 
                        label={ option.label }
                        control={ <Radio /> } 
                    />
                ))}  
            </RadioGroup>
        </FormControl> 
    );

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={3} sx={formStyles} >
                <Typography variant="h3" > { title.current } </Typography> 
                <FormTextField
                    required
                    id="name"
                    label="Name"
                    onChange={ formik.handleChange }
                    value={ formik.values.name }
                    { ...formik.getFieldProps("name") }
                /> 
                <FormTextField
                    id="dosage"
                    label="Dosage"
                    onChange={ formik.handleChange }
                    value={ formik.values.dosage }
                    { ...formik.getFieldProps("dosage") }
                /> 
                <FormSelectMenu formik={formik} type="provider" multiple={false} /> 

                <Stack direction="column" spacing={2} sx={{ pl: "0.5rem" }} >
                    <FrequencySelector />
                    { formik.values.frequency === "weekly" && <WeeklyDaySelector /> } 
                    <TimeSelector />
                </Stack> 

                <FormNotesField formik={formik} maxLength={300} />  
                <FormButtons formik={formik} onCancelClick={onCancelClick} />
            </Stack>
        </form>
    );
}; 