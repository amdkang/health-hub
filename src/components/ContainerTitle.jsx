import { Stack, Typography } from "@mui/material";
import { containerTitleBtnStyles, containerTitleStyles } from "../styles";
 
/**
 * Title component with icons/text/buttons used for containers (sections of a page's content)
 */

export const ContainerTitle = ({ title, titleIcon, titleContent, spacing, extraContent }) => {
  const styles = extraContent ? containerTitleBtnStyles : containerTitleStyles;  
  
  return (
    <Stack direction="row" sx={styles} >  
      <Stack 
        direction="row" 
        spacing={ spacing ?? 1 } 
        sx={{ alignItems: "center" }} 
      >
        { titleIcon && titleIcon }
        { title && <Typography variant="h4" > { title } </Typography> }
        { titleContent && titleContent }
      </Stack>  

      <Stack direction="row" sx={{ alignItems: "center" }} >
        { extraContent && extraContent } 
      </Stack>
    </Stack>
  );
};