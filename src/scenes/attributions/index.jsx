import { Link, Stack, Typography } from "@mui/material"; 
import { Topbar } from "../../components"; 
import { ICON_ATTRIBUTIONS } from "../../constants"; 
import { pageStyles } from "../../styles";
 
/**
 * This page shows a list of attributions for images/icons used throughout the site.
 */
export const AttributionsPage = () => (
  <Stack direction="column" sx={pageStyles} >
    <Topbar
      title="SITE ATTRIBUTIONS"
      subtitle="Acknowledging Creative Contributors"
    />      
      <Typography sx={{ fontSize: "1.3rem", pl: "2rem" }} >
        Images used throughout this project are credited as follows:
      </Typography>

      <ul>
        { ICON_ATTRIBUTIONS.map((icon, index) => (
          <li key={index} style={{ fontSize: "1rem", marginBottom: "0.7rem" }} > 
            Icons made by 
            <span style={{ fontWeight: 600 }} > { icon.author } </span> 
            from&nbsp;
      
            <Link href={ `https://${ icon.source }` } underline="hover" > 
              { icon.source } 
            </Link> 
          </li>
        ))}
      </ul> 
  </Stack>
);