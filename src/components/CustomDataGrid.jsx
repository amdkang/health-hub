import { useTheme } from "@mui/material"; 
import { DataGrid  } from "@mui/x-data-grid"; 
import { useState } from "react";
import { dataGridStyles } from "../styles";
  
/**
 * Custom-styled MUI datagrid commonly used throughout site   
 */

export const CustomDataGrid = ({ ...props }) => {
    const theme = useTheme(); 
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 }); 
 
    return (
        <DataGrid
            disableRowSelectionOnClick
            checkboxSelection
            pageSizeOptions={[5, 10]}
            paginationModel={paginationModel}
            onPaginationModelChange={ (model) => setPaginationModel(model) }
            { ...props }  
            sx={ dataGridStyles(theme.palette.neutral.dark, props.containerBackground) }  
        />  
    );
};