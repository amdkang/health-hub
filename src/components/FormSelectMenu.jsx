import { Avatar, Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Stack, Typography } from "@mui/material";
import { FolderOutlined } from "@mui/icons-material";

// renders multiple chips showing all selected items  
const MultiValueRenderer = ({ selected, items, type }) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }} >
        { selected.map((value) => {
            if (type === "provider") {
                const provider = items.find((prov) => prov.providerID === value);
                return (
                    <Chip
                        key={ provider.providerID }
                        label={ provider.name } 
                        avatar={ <Avatar alt={ provider.name } src={ provider.fullPicturePath } /> }
                    />
                );
            } else if (type === "med") {
                const med = items.find((med) => med.medID === value);  
                return <Chip label={ med.name } key={ med.medID } /> ;
            } else {
                return null;
            }
        })}
    </Box>
); 
 
// renders graphic showing single selected item  
const SingleValueRenderer = ({ selected, type, formik }) => { 
    const imgSx = { width: 25, height: 25 };
    let name, img;
    const setValues = () => {
        switch (type) {
            case "provider": 
                const provider = formik.values.providers.find((prov) => prov.providerID === selected);  
                name = provider.name; 
                img = <Avatar alt={ provider.name } src={ provider.fullPicturePath } sx={imgSx} />;
                break;
    
            case "member":
                const member = formik.values.members.find((mem) => mem.memberID === selected);  
                name = member.fullName; 
                img = <Avatar alt={ member.fullName } src={ member.fullPicturePath } sx={imgSx} />;
                break;
    
            case "folder":
                const folder = formik.values.folders.find((folder) => folder.folderID === selected);  
                name = folder.name;
                img = (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center", 
                            borderRadius: "50%", 
                            bgcolor: folder.color.main,
                            ...imgSx
                        }}
                    >
                        <FolderOutlined sx={{ color: folder.color.text }} />
                    </Box>
                );
                break;
            default: 
                return;
        }; 
    };
    setValues();

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} > 
            { img }
            <Typography sx={{ fontSize: "0.9rem"}} > { name } </Typography>
        </Stack> 
    ); 
}; 

/**
 * Menu used by forms to select values (supports multi or single-select configurations)
 */

export const FormSelectMenu = ({ formik, type, multiple }) => { 
    let value, fieldValue, items, label; 
    const avatarSx = { width: 24, height: 24, mr: "1rem" };

    const setMenuValues = () => {
        switch (type) {
            case "provider": // can select multiple or single providers
                value = multiple ? formik.values.selectedProviderIDs : formik.values.providerID;
                fieldValue = multiple ? "selectedProviderIDs" : "providerID";
                items = formik.values.providers;
                label = multiple ? "Providers" : "Provider";
                break;

            case "member": // can select only single member
                value = formik.values.memberID;
                fieldValue = "memberID";
                items = formik.values.members;
                multiple = false; 
                label="Member"
                break;

            case "med": // can select only multiple meds
                value = formik.values.selectedMedIDs;
                fieldValue = "selectedMedIDs";
                items = formik.values.meds; 
                label="Medications"
                break;

            case "folder": // can select only single folder
                value = formik.values.folderID;
                fieldValue = "folderID";
                items = formik.values.folders; 
                label="Folder"
                break;
            default:
                break;
        };
    };
    setMenuValues();
     
    // update form's location value to match selected provider's location
    const setProviderLocation = (event) => { 
        const providerID = event.target.value;
        const provider = items.find((prov) => prov.providerID === providerID);   
        formik.setFieldValue("location", provider.location ?? ""); 
    }; 

    // explictly handle change's effects on other form fields 
    const handleMenuChange = (event) => {  
        if (type === "provider") {     
            const hasLocationField = formik.values.location !== undefined;
            if (hasLocationField) {  // sync form's `provider` and `location` fields
                setProviderLocation(event); 
            } else {
                const multipleProviders = formik.values.selectedProviderIDs !== undefined;
                if (multipleProviders) {
                    const selectedItems = event.target.value;
                    const noneSelected = selectedItems[selectedItems.length - 1] === -1; // `none` option's providerID is -1
                    if (noneSelected) {
                        // deselect other selected providers
                        formik.setFieldValue(fieldValue, [-1]); 
                    } else { 
                        const providerIDs = selectedItems.filter((providerID) => providerID !== -1);
                        formik.setFieldValue(fieldValue, providerIDs); 
                    }
                    return;
                }
            } 
        }
        formik.setFieldValue(fieldValue, event.target.value);
    };  

    return (
        <FormControl sx={{ width: 350 }} > 
            <InputLabel> { label } </InputLabel>
            <Select
                value={value}
                onChange={ (event) => handleMenuChange(event) }
                multiple={multiple}
                input={ <OutlinedInput label={ label } /> }
                inputProps={{ "aria-label": "Without label" }}
                renderValue={ (selected) => ( multiple ? (
                    <MultiValueRenderer selected={selected} items={items} type={type} /> 
                ) : (
                    <SingleValueRenderer selected={selected} type={type} formik={formik} /> 
                ))}
                sx={{ borderRadius: "0.4rem" }}
            >
                { items.map((item) => { 
                    switch (type) {
                        case "provider":  
                            return (
                                <MenuItem value={ item.providerID } key={ item.providerID } >
                                    <Avatar 
                                        src={ item.fullPicturePath }
                                        alt={ item.name }
                                        sx={avatarSx}
                                    />
                                    { item.name }
                                </MenuItem> 
                            );

                        case "member": 
                            return (
                                <MenuItem value={ item.memberID } key={ item.memberID } >
                                    <Avatar 
                                        src={ item.fullPicturePath }
                                        alt={ item.fullName } 
                                        sx={avatarSx}
                                    />
                                    { item.fullName } 
                                </MenuItem>
                            );

                        case "med": { 
                            const dosage = item.dosage ? `(${ item.dosage })` : "";
                            return (
                                <MenuItem value={ item.medID } key={ item.medID } >
                                    { `${ item.name } ${ dosage }` }
                                </MenuItem>
                            );
                        };
                            
                        case "folder" : 
                            return (
                                <MenuItem value={ item.folderID } key={ item.folderID } > 
                                    { item.name } 
                                </MenuItem>
                            );
                        default:
                            return null;
                    }  
               })} 
            </Select>
        </FormControl>  
    ); 
}; 