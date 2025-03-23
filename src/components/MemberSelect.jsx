import { FormControl, MenuItem, Select } from "@mui/material"; 
import { memo } from "react";
 
/**
 * Reusable menu used to change selected member for a given page 
 */

export const MemberSelect = memo(({ selected, allMembers, onMemberChange }) => {
  const menuSx = { 
    height: "2rem",
    borderRadius: "1rem",
    fontSize: "1.3rem",
    '.MuiOutlinedInput-notchedOutline': { display: "none" },
    '.MuiSelect-select': { pl: 0 }
  };

  return (
    <FormControl sx={{ maxWidth: "95%" }} > 
      <Select
        value={ selected.memberID }
        onChange={onMemberChange}
        displayEmpty
        autoWidth
        inputProps={{ "aria-label": "Without label" }}
        sx={menuSx}
      >
        { allMembers.map((member) => (
          <MenuItem value={ member.memberID } key={ member.memberID } >
            { member.fullName }
          </MenuItem>
        ))}
      </Select>
    </FormControl>  
  )
}); 