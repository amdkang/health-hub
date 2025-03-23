import { Chip, Stack, useTheme } from "@mui/material";  
import { getAllergyIcon } from "../scenes/history/Allergens";
 
/** 
 * Renders a list of colored chips depicting each allergy in `allergies`
 */

export const AllergyList = ({ allergies }) => {
    const palette = useTheme().palette;

    return (
        <Stack direction="row" sx={{ flexWrap: "wrap", width: "100%", gap: 2 }} >
            { allergies.map((allergy, index) => { 
                const chipColor = palette.options[index % palette.options.length]; 
                const allergyIcon = getAllergyIcon(allergy, chipColor.text);  

                return ( 
                    <Chip
                        key={ allergy.allergyID } 
                        label={ allergy.name }
                        icon={allergyIcon} 
                        sx={{
                            fontSize: "0.9rem",
                            fontWeight: 500, 
                            color: chipColor.text,
                            bgcolor: chipColor.main,
                            cursor: "default"
                        }}
                    />
                );
            })}
    </Stack>
    );
}; 