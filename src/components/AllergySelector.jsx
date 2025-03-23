import { Box, Button, Checkbox, Chip, FormControlLabel, Stack, Typography, useTheme } from "@mui/material"; 
import { Edit } from "@mui/icons-material";
import { FormTextField } from "./FormFields";
import { CloseButton } from "./CustomButtons";
import { FieldArray } from "formik";
import { createContext, useContext, useState } from "react";
import { DEFAULT_ALLERGENS, getAllergyIcon } from "../scenes/history/Allergens";

export const AllergyContext = createContext();

const CustomAllergy = ({ arrayHelpers, index, formik, palette }) => {
    const field = `customAllergies[${ index }]`;
    return (
        <Stack  
            spacing={0.5}
            direction="row" 
            sx={{ alignItems: "center" }} 
        > 
            <CloseButton // remove this custom allergy
                onClick={() => arrayHelpers.remove(index)}
                color={ palette.neutral.dark }
            />   
            <FormTextField
                id={ `${ field }.name` }
                name={ `${ field }.name` }
                value={ formik.values.customAllergies[index].name }
                onChange={ (event) => { 
                    // add new custom allergy to form's values
                    const updatedCustomAllergies = [...formik.values.customAllergies];
                    const allergyName = event.target.value;
                    updatedCustomAllergies[index].name = allergyName;
                    formik.setFieldValue("customAllergies", updatedCustomAllergies);  
                }} 
            />  
            <FormControlLabel
                label="Drug Allergy"
                checked={ formik.values.customAllergies[index].isDrug }
                control={ <Checkbox /> }
                onChange={ (event) => {  
                    formik.setFieldValue(`${ field }.isDrug`, event.target.checked);
                }} 
            /> 
        </Stack>
    );
};
 
// section used to add/view/delete custom allergies 
const CustomAllergyBuilder = () => {  
    const { formik, palette, currentProfile } = useContext(AllergyContext); 
    const addNewCustomAllergy = (arrayHelpers) => {
        arrayHelpers.push({
            name: "",
            isCustom: true,
            isDrug: false,
            memberID: currentProfile.memberID 
        })
    };

    return (
    <Stack direction="column" spacing={1} >
        <Typography sx={{ fontSize: "0.9rem" }} > Add Custom: </Typography>  
        <FieldArray
            name="customAllergies"
            render={ (arrayHelpers) => (
                <Stack direction="column" spacing={2} >
                    { formik.values.customAllergies.map((_allergy, index) => (
                        <CustomAllergy 
                            key={index}
                            arrayHelpers={arrayHelpers} 
                            index={index} 
                            formik={formik} 
                            palette={palette}
                        />
                    ))}
                    <Box>
                        <Button
                            onClick={() => addNewCustomAllergy(arrayHelpers)} 
                            sx={{ 
                                color: palette.background.contrastText, 
                                border: "0.1rem solid", 
                                ml: "1.7rem" 
                            }}
                        >
                            Add Entry
                        </Button>
                    </Box>
                </Stack>
            )}
        />
    </Stack> 
)};

// section that lists all selectable default allergy options
const DefaultAllergySelector = () => {  
    const { formik, palette, currentProfile } = useContext(AllergyContext);  
    const isSelectedAllergy = (allergyName) => {  
        // returns true if allergy is already part of selected default allergies
        return formik.values.defaultAllergies.some((allergy) => allergy.name === allergyName);
    }; 
    // adds/removes clicked default allergy from form's values 
    const onDefaultAllergyClick = (allergyName, allergyData) => {   
        const index = formik.values.defaultAllergies
            .findIndex((allergy) => allergy.name === allergyName);
        if (index !== -1) { 
            formik.setFieldValue(formik.values.defaultAllergies.splice(index, 1));
        } else { 
            formik.setFieldValue(
                formik.values.defaultAllergies.push(
                    {
                        name: allergyName,
                        icon: allergyData.icon,
                        memberID: currentProfile.memberID,
                        isCustom: false,
                        isDrug: allergyData.isDrug 
                    }
                )
            );
        }
    };

    return (
        <Stack direction="column" spacing={2} >
            <Typography sx={{ fontSize: "0.9rem" }} > Select Default: </Typography> 
            <Stack 
                direction="row"
                sx={{ width: "100%", flexWrap: "wrap",overflowX: "hidden", p: "0.5rem 0 0 1rem" }}
            > 
                { Object.entries(DEFAULT_ALLERGENS).map(([name, allergyData], index) => (
                    <Chip 
                        key={index} 
                        label={name} 
                        icon={ allergyData.icon }
                        onClick={() => onDefaultAllergyClick(name, allergyData)}
                        sx={{
                            m: "0 1rem 1rem 0",
                            fontSize: "0.9rem",
                            bgcolor: isSelectedAllergy(name) ? palette.primary.main : "none",
                            '&:hover': {
                                outline: `0.1rem solid ${ palette.background.contrastText }`
                            }
                        }}
                    />
                ))}
            </Stack>
        </Stack> 
    );
};

// section that lists all currently selected allergies 
const SelectedAllergies = ({ openEditor }) => {
    const { formik, palette } = useContext(AllergyContext);
    const allAllergies = [...formik.values.defaultAllergies, ...formik.values.customAllergies]; 

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                overflowX: "hidden",
                width: "100%"
            }}
        >
            { allAllergies.map((allergy, index) => (
                <Chip
                    key={index}
                    label={ allergy.name }
                    icon={ getAllergyIcon(allergy) }
                    sx={{
                        fontSize: "0.9rem",
                        m: "0 1rem 1rem 0",
                        bgcolor: palette.primary.main,
                        cursor: "default"
                    }}
                />
            ))} 
            <Chip
                label="Edit Allergy"
                icon={ <Edit /> }
                onClick={openEditor}
                sx={{ pl: "0.2rem", m: "0 1rem 1rem 0", fontSize: "0.9rem" }}
            />
        </Box>
    )
};
  
/**
 * Form component used to add, edit, or delete allergies for the selected profile
 */

export const AllergySelector = ({ formik, currentProfile }) => {
    const palette = useTheme().palette; 
    const [editAllergies, setEditAllergies] = useState(false);   
    
    return (
        <AllergyContext.Provider value={{ formik, palette, currentProfile }} >
            <Box>
                <Typography sx={{ mb: "0.5rem", fontSize: "1rem" }} > Allergies: </Typography> 
                <SelectedAllergies openEditor={() => setEditAllergies(true)} /> 

                { currentProfile && editAllergies &&
                    <Stack 
                        direction="column" 
                        spacing={0.5}
                        sx={{
                            mt: "1rem",
                            p: "1rem",
                            border: `0.1rem solid ${ palette.neutral.dark }`,
                            borderRadius: "1rem"
                        }}
                    > 
                        <DefaultAllergySelector /> 
                        <CustomAllergyBuilder />

                        <Stack direction="row" sx={{ width: "100%", justifyContent: "flex-end" }} >
                            <Button 
                                variant="outlined" 
                                onClick={() => setEditAllergies(false)}
                                sx={{ 
                                    border: `0.15rem solid ${ palette.primary.main }`,
                                    borderRadius: "0.7rem" 
                                }}
                            >
                                Close
                            </Button>   
                        </Stack>
                    </Stack>
                }
            </Box>
        </AllergyContext.Provider>
    );
}; 