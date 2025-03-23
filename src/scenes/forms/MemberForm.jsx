import { Avatar, Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, Typography, useTheme } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs" 
import dayjs from "dayjs";
import { useFormik  } from "formik";
import * as Yup from "yup";
import { addProfilePicture } from "../../database/clientServices";
import { AvatarSelector, FormButtons, FormTextField, FormToggleButtons } from "../../components";    
import { formStyles } from "../../styles";
import { capitalize, formatStringField } from "../../utils";
import { DEFAULT_PROFILE_PIC_PATH } from "../../constants";
 
/**
 * Form used to add new family member to main user's family tree 
 * New members are added `in relation` to a selected member from the tree
 */

export const MemberForm = ({ onSubmit, onCancelClick, currentMember }) => {  
    const relationOptions = [ "child", "parent", "sibling", "spouse" ];
    const theme = useTheme(); 
    const getInitialValues = () => { 
        return {
            firstName: "",
            lastName: "",
            relation: "",  
            dob: dayjs(),
            sex: "Male",
            pictureType: "default",
            picturePath: "man2.png",
            pictureURL: `${ DEFAULT_PROFILE_PIC_PATH }/man2.png`, 
            customFile: null
        }
    };

    const formik = useFormik({
        initialValues: getInitialValues(), 
        validationSchema: Yup.object({
            firstName: Yup.string().required("Name required"),
            relation: Yup.string().required("Field required")
        }), 
        onSubmit: async (values) => {   
            const picturePath = await getPicturePath();
            const member = {
                firstName: values.firstName,
                lastName: formatStringField(values.lastName),
                relation: values.relation, 
                dob: dayjs(values.dob.$d).toString(),
                sex: values.sex === "Male" ? "M" : "F",
                pictureType: values.pictureType,
                picturePath: picturePath,
                pictureURL: values.pictureURL,
                trackedMember: values.trackedMember
            };   
            onSubmit(member);
        }
    }); 
 
    // returns path for currently selected profile picture
    const getPicturePath = async () => {  
        if (formik.values.pictureType === "custom") {
            // if new file was uploaded, add picture & return path
            if (formik.values.customFile !== null) {  
                const addedFilePath = await addProfilePicture(formik.values.customFile);
                return addedFilePath; 
            } 
        } else {  
            // return current default picture's path  
            return formik.values.picturePath;
        }   
    };

    const RelationSelector = () => {
        const CurrentMemberDisplay = () => (
            <Stack 
                direction="column"  
                sx={{ 
                    width: "34ch", 
                    p: "0.5rem 1rem", 
                    alignItems: "center",
                    border: `0.1rem solid ${ theme.palette.neutral.dark }`,
                    borderRadius: "0.5rem"
                }} 
            > 
                <Typography sx={{ fontSize: "1rem", mb: "1rem" }} >
                    Selected Member:
                </Typography>
                <Avatar 
                    src={ currentMember.fullPicturePath } 
                    alt={ currentMember.fullName } 
                    sx={{ width: 100, height: 100 }} 
                />
                <Typography sx={{ fontSize: "0.9rem", textAlign: "center" }} >
                    { currentMember.fullName } 
                </Typography>
            </Stack>
        );

        return (
            <Stack 
                direction="row" 
                sx={{ width: "100%", justifyContent: "space-between" }}
            >
                <FormControl sx={{ width: "34ch", p: "0.5rem" }} >
                    <FormLabel sx={{ fontSize: "1rem" }} > Relation to Member: </FormLabel>
                    <RadioGroup
                        id="relation"
                        required
                        onChange={ formik.handleChange }
                        value={ formik.values.relation }
                        { ...formik.getFieldProps("relation") }
                        sx={{ pl: "0.2rem" }}
                    >
                        { relationOptions.map(relation => (
                            <FormControlLabel 
                                key={ relation }
                                value={ relation } 
                                label={ capitalize(relation) }
                                control={ <Radio /> } 
                            />
                        ))} 
                    </RadioGroup> 
                </FormControl>  
                { currentMember && <CurrentMemberDisplay /> }
            </Stack>
        )
    };

    return (
        <form onSubmit={ formik.handleSubmit } >
            <Stack 
                direction="column" 
                spacing={4}
                sx={{ 
                    ...formStyles,
                    width: "42rem", 
                    '& .MuiTextField-root': { width: "34ch" }, 
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
                <Typography variant="h3" > Add New Member </Typography>  
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
                                onChange={ value => formik.setFieldValue("dob", value) }
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
 
                <RelationSelector />  
                <FormButtons formik={formik} onCancelClick={onCancelClick} />
            </Stack>
        </form>
    );
}; 