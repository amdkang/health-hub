/**
 * Defines styles commonly used throughout site's components/forms 
 */
export const pageStyles = { width: "100%", height: "100%" };   
  
export const mainContentStyles = { flexGrow: 1, p: "0 0.5rem 1.5rem 0.5rem" };

export const containerStyles = {
  borderRadius: "1rem",
  overflow: "hidden",
  p: "0.8rem 1.5rem 1.2rem 1.5rem"
}; 
  
// styles `ContainerTitle` while accounting for button on far right
export const containerTitleBtnStyles = {
  width: "calc(100% + 1rem)",  
  justifyContent: "space-between",
  alignItems: "center",
  mb: "1rem"
}; 
  
// styles `ContainerTitle` without buttons
export const containerTitleStyles = { width: "100%", mb: "1rem", pt: "0.5rem" };
  
export const scrollBarStyles = {
  '&::-webkit-scrollbar': { width: "0.6rem" },
  '&::-webkit-scrollbar-track': { borderRadius: "0.5rem" },
  '&::-webkit-scrollbar-thumb': { borderRadius: "0.5rem" }
};
   
export const ellipsisTextStyles = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
}; 
   
export const hoverTextStyles = { '&:hover': { textDecoration: "underline", cursor: "pointer" }};
   
export const tooltipStyles = {
  tooltip: { sx: { fontSize: "0.7rem" }},
  popper: { modifiers: [{ name: "offset", options: { offset: [0, -8] }}]}
}; 
  
export const formStyles = {
  p: "0 1rem",
  alignItems: "flex-start",
  '& .MuiTextField-root': { width: "50ch" }
};
  
export const formDialogStyles = { '& .MuiDialog-paper': { borderRadius: "0.7rem" }};    
    
export const dataGridStyles = (toolbarColor, containerBackground) => ({ 
  border: "none",   
  ...(containerBackground && { '--DataGrid-containerBackground': containerBackground }), // override only if provided
  '& .MuiDataGrid-columnHeaders': { 
    fontSize: "0.9rem",  
    color: toolbarColor
  },
  '& .MuiDataGrid-cell': {
    border: "none", 
    borderBottom: "none",
    ...ellipsisTextStyles
  }, 
  '& .MuiDataGrid-row': {
    fontSize: "0.9rem",
    "&:hover": { 
      cursor: "pointer"
    } 
  }, 
  '& .MuiSelect-root, & .MuiSelect-icon, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    color: toolbarColor 
  }, 
  '& .MuiDataGrid-footerContainer': {
    border: "none", 
  },
  '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
    display: "none" 
  },
  '& .notes-cell, .reason-cell': { 
    fontSize: "0.8rem" 
  } 
});