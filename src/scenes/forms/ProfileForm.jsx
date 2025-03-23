import { Box, Stack, Typography, useTheme }  from "@mui/material"; 
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";  
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { addProfilePicture, deleteProfilePicture } from "../../database/clientServices";
import { AllergySelector, AvatarSelector, FormButtons, FormTextField, FormToggleButtons } from "../../components";
import { formatStringField } from "../../utils";    
import { formStyles } from "../../styles";

/**
 * Form used to edit an existing member's profile    
 */

// Below `Selector` fields defined outside of `ProfileForm` due to re-renders causing fields to lose focus
const WeightSelector = ({ formik, theme }) => (
    <Stack 
        direction="row" 
        spacing={1} 
        sx={{ width: "100%", alignItems: "flex-end" }} 
    >
        <FormTextField
            id="weight"
            className="longMsmtField"
            label="Weight"
            onChange={ formik.handleChange }
            value={ formik.values.weight }
            { ...formik.getFieldProps("weight") }
        />
        <Typography sx={{ color: theme.palette.neutral.dark }} >
            { formik.values.msmtSystem === "metric" ? "kg" : "lbs" }
        </Typography>
    </Stack>
); 

const HeightSelector = ({ formik, theme }) => (
    <Stack 
        direction="row" 
        spacing={1} 
        sx={{ width: "100%", alignItems: "flex-end" }} 
    >
        { formik.values.msmtSystem === "metric" ?
            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }} >
                <FormTextField
                    id="heightMetricCm"
                    className="longMsmtField"
                    label="Height"
                    onChange={ formik.handleChange }
                    value={ formik.values.heightMetricCm }
                    { ...formik.getFieldProps("heightMetricCm") }
                />
                <Typography sx={{ color: theme.palette.neutral.dark }} > cm </Typography>
            </Stack>
            :
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-end" }} >
                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }} >
                    <FormTextField
                        id="heightStandardFt"
                        className="shortMsmtField"
                        label="Height"
                        onChange={ formik.handleChange }
                        value={ formik.values.heightStandardFt }
                        { ...formik.getFieldProps("heightStandardFt") }
                    />
                    <Typography sx={{ color: theme.palette.neutral.dark }}> ft </Typography>
                </Stack> 

                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }} >
                    <FormTextField
                        id="heightStandardIn"
                        className="shortMsmtField"
                        label="Height"
                        onChange={ formik.handleChange }
                        value={ formik.values.heightStandardIn }
                        { ...formik.getFieldProps("heightStandardIn") }
                    />
                    <Typography sx={{ color: theme.palette.neutral.dark }} > inches </Typography>
                </Stack>
            </Stack>
        }
    </Stack>
);   
 
const ContactSelector = ({ formik }) => (
    <Stack direction="column" spacing={3} sx={{ width: "100%" }} >
        <FormTextField
            id="address" 
            label="Address"
            className="addressField"
            onChange={ formik.handleChange }
            value={ formik.values.address }
            { ...formik.getFieldProps("address") }
        /> 
        <Stack 
            direction="row"
            sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }} 
        >
            <FormTextField
                id="phone"
                label="Phone Number"
                onChange={ formik.handleChange }
                value={ formik.values.phone }
                { ...formik.getFieldProps("phone") }
            /> 
            <FormTextField 
                id="email"
                label="Email"
                onChange={ formik.handleChange }
                value={ formik.values.email }
                { ...formik.getFieldProps("email") }
            />
        </Stack>
    </Stack>
); 

export const ProfileForm = ({ currentProfile, onSubmit, onCancelClick, onError }) => { 
    const theme = useTheme();   

    const getInitialValues = (currentProfile) => {
        if (currentProfile) { 
            const usesMetric = currentProfile.usesMetric; 
            const height = currentProfile.height;  
            return { 
                firstName: currentProfile.firstName,
                lastName: currentProfile.lastName ?? "",
                dob: dayjs(currentProfile.dob), 
                sex: currentProfile.sex,
                msmtSystem: usesMetric ? "metric" : "standard",
                heightMetricCm: usesMetric ? (height ?? "") : "",
                heightStandardFt: !usesMetric ? (height ? height.split(",")[0] : "") : "",
                heightStandardIn: !usesMetric ? (height ? height.split(",")[1] : "") : "",
                weight: currentProfile.weight ?? "",
                address: currentProfile.address ?? "",
                phone: currentProfile.phone ?? "",
                email: currentProfile.email ?? "",
                customAllergies: currentProfile.allergies.filter(allergy => allergy.isCustom === true),
                defaultAllergies: currentProfile.allergies.filter(allergy => allergy.isCustom === false), 
                pictureType: currentProfile.pictureType,
                picturePath: currentProfile.picturePath,
                pictureURL: currentProfile.fullPicturePath, 
                customFile: null
            }; 
        }
    };

    const formik = useFormik({
        initialValues: getInitialValues(currentProfile),
        validationSchema: Yup.object({
            firstName: Yup.string().required("Name required")
        }),
        onSubmit: async (values) => {    
            try {
                const picturePath = await getPicturePath();
                const height = values.msmtSystem === "metric" 
                        ? values.heightMetricCm 
                        : `${ values.heightStandardFt },${ values.heightStandardIn }`;
                const profile = {
                    firstName: values.firstName,
                    lastName: formatStringField(values.lastName),
                    dob: dayjs(values.dob.$d).toString(),
                    sex: values.sex === "Male" ? "M" : "F",
                    usesMetric: values.msmtSystem === "metric" ? 1 : 0,
                    height: formatStringField(height),
                    weight: formatStringField(values.weight),
                    address: formatStringField(values.address),
                    phone: formatStringField(values.phone),
                    email: formatStringField(values.email),
                    oldAllergies: currentProfile ? currentProfile.allergies : [],
                    newAllergies: [...values.defaultAllergies, ...values.customAllergies],
                    pictureType: values.pictureType,
                    picturePath: picturePath,
                    pictureURL: values.pictureURL
                };     
                onSubmit(profile); 
            } catch (err) { 
                onCancelClick();
                onError();
            }
        }
    });  

    // returns path for currently selected profile picture
    const getPicturePath = async () => {   
        const oldPicWasCustom = currentProfile.pictureType === "custom";
        if (formik.values.pictureType === "custom") {
            // if new file was uploaded 
            if (formik.values.customFile !== null) {
                if (oldPicWasCustom) { // delete previous custom picture file
                    await deleteProfilePicture(currentProfile.picturePath); 
                }  
                const addedFilePath = await addProfilePicture(formik.values.customFile);
                return addedFilePath; 
            } else {
                // return initial custom picture path 
                return currentProfile.picturePath; 
            }
        } else if (formik.values.pictureType === "default") { 
            if (oldPicWasCustom) { // delete previous custom picture file 
                await deleteProfilePicture(currentProfile.picturePath);  
            }
            // return selected default picture path   
            return formik.values.picturePath;
        }  
        return null;
    };

    return ( 
        <FormikProvider value={formik} > 
            <form onSubmit={ formik.handleSubmit } >
                <Stack 
                    direction="column" 
                    spacing={4}
                    sx={{ 
                        ...formStyles,
                        width: "42rem", 
                        '& .MuiTextField-root': { width: "34ch" },
                        '& .longMsmtField': { width: "18ch" },
                        '& .shortMsmtField': { width: "12ch" },
                        '& .addressField': { width: "74ch" },
                        '& .MuiToggleButton-root': {
                            width: "6rem",
                            height: "2rem",
                            p: "0.5rem 1rem",
                            border: "none",
                            borderRadius: "0.2rem",
                            fontSize: "0.8rem",
                            textTransform: "none"
                        }
                    }}
                >
                    <Typography variant="h3" > Edit Profile </Typography>   
                    <AvatarSelector formik={formik} type="member" />  

                    <Stack 
                        direction="row" 
                        sx={{ 
                            width: "100%", 
                            justifyContent: "space-between", 
                            alignItems: "center" 
                        }} 
                    >
                        <FormTextField
                            required
                            id="firstName"
                            label="First Name"
                            onChange={ formik.handleChange }
                            value={ formik.values.firstName }
                            inputProps={{ maxLength: 20 }}
                            { ...formik.getFieldProps("firstName") }
                        /> 
                        <FormTextField 
                            id="lastName"
                            label="Last Name"
                            onChange={ formik.handleChange }
                            value={ formik.values.lastName }
                            inputProps={{ maxLength: 20 }}
                            { ...formik.getFieldProps("lastName") }
                        />
                    </Stack> 

                    <Stack direction="row" sx={{ width: "100%", alignItems: "center" }} >
                        <Box sx={{ width: "55%" }} >
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DatePicker
                                    id="dob" 
                                    label="Date of Birth"
                                    value={ formik.values.dob }
                                    onChange={ (value) => formik.setFieldValue("dob", value) }
                                    slotProps={{ textField: { required: true, variant: "outlined" } }}
                                />
                            </LocalizationProvider>
                        </Box>  
                        <FormToggleButtons 
                            formik={formik}
                            id="sex" 
                            value={ formik.values.sex } 
                            title="Sex:" 
                            options={ ["Male", "Female"] } 
                        />
                    </Stack> 

                    <Stack direction="row" sx={{ width: "100%", alignItems: "flex-end" }} >
                        <Stack direction="column" spacing={2} sx={{ width: "55%" }} >
                            <WeightSelector formik={formik} theme={theme} />
                            <HeightSelector formik={formik} theme={theme} />
                        </Stack>  
                        <FormToggleButtons 
                            formik={formik}
                            id="msmtSystem" 
                            value={ formik.values.msmtSystem } 
                            title="Measurement System:" 
                            options={ ["standard", "metric"] } 
                        />
                    </Stack> 

                    <ContactSelector formik={formik} /> 
                    <AllergySelector formik={formik} currentProfile={currentProfile} />   
                    <FormButtons formik={formik} onCancelClick={onCancelClick} />
                </Stack>
            </form>  
        </FormikProvider>
    );
}; 