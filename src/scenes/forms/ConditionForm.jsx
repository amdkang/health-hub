import { Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRef } from "react";  
import { noProviderOption } from "./ProviderForm";
import { FormButtons, FormNotesField, FormTextField, FormSelectMenu } from "../../components";
import { formatStringField } from "../../utils";
import { formStyles } from "../../styles";

/**
 * Form used to add new or edit existing condition for specified member
 */

export const ConditionForm = ({ onSubmit, currentCond, allProviders, allMeds, onCancelClick }) => {
    const title = useRef(currentCond ? "Edit Condition" : "Add New Condition");   
    const getInitialValues = (currentCond) => { 
        if (currentCond) {
            const { medications, providers } = currentCond;
            const oldMedIDs = medications.length > 0 ? medications.map(med => med.medID) : [];
            const oldProviderIDs = providers.length > 0 ? providers.map(prov => prov.providerID) : [-1];
            return { 
                name: currentCond.name,
                meds: allMeds,
                oldMedIDs: oldMedIDs,
                selectedMedIDs: oldMedIDs,
                providers: [...allProviders, noProviderOption],
                oldProviderIDs: oldProviderIDs,
                selectedProviderIDs: oldProviderIDs,
                unit: currentCond.unit ?? "",
                notes: currentCond.notes ?? ""
            };
        }  
        return {
            name: "",
            meds: allMeds, 
            oldMedIDs: [],
            selectedMedIDs: [],
            providers: [...allProviders, noProviderOption],
            oldProviderIDs: [],
            selectedProviderIDs: [-1],
            unit: "",
            notes: ""
        };
    };
    
    const formik = useFormik({
        initialValues: getInitialValues(currentCond),
        validationSchema: Yup.object({
            name: Yup.string().required("Field required")
        }),
        onSubmit: values => {
            const condition = {
                name: values.name,
                oldMedIDs: values.oldMedIDs,
                newMedIDs: values.selectedMedIDs,
                oldProviderIDs: values.oldProviderIDs,
                newProviderIDs: values.selectedProviderIDs.includes(-1) ? [] : values.selectedProviderIDs,
                unit: formatStringField(values.unit),
                notes: formatStringField(values.notes),
                pinned: currentCond?.pinned ?? false,
                conditionID: currentCond?.conditionID,
                measurements: currentCond?.measurements,
                medications: currentCond?.medications,
                providers: currentCond?.providers 
            }; 
            onSubmit(condition);
        }
    }); 

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack direction="column" spacing={3} sx={formStyles} > 
                <Typography variant="h3" > { title.current } </Typography>
                <FormTextField
                    required
                    id="name"
                    label="Condition Name"
                    onChange={ formik.handleChange }
                    value={ formik.values.name }
                    { ...formik.getFieldProps("name") }
                />
                <FormTextField
                    id="unit"
                    label="Measurement Unit"
                    onChange={ formik.handleChange }
                    value={ formik.values.unit }
                    { ...formik.getFieldProps("unit") }
                />
                <FormSelectMenu formik={formik} type="med" multiple={true} />
                <FormSelectMenu formik={formik} type="provider" multiple={true} /> 
                <FormNotesField formik={formik} maxLength={150} /> 
                <FormButtons formik={formik} onCancelClick={onCancelClick} />
            </Stack>
        </form>
    );
}; 