import { Snackbar } from "@mui/material"; 
import { CloseButton } from "./CustomButtons"; 
import { forwardRef, useImperativeHandle, useState } from "react";
  
/**
 * Snackbar used to display notification message after an event 
 */

export const CustomSnackbar = forwardRef((props, ref) => {  
    const [snackbar, setSnackbar] = useState({ open: false, message: null, timeShown: 0 });

    // sets snackbar's message & length of time to be shown
    const showSnackbar = (msg, timeShown = 1500) => {
        setSnackbar({ open: true, message: msg, timeShown: timeShown });
    };

    const closeSnackbar = () => setSnackbar({ open: false, message: null, timeShown: 0 }); 

    // exposes `showSnackbar` method to parent component
    useImperativeHandle(ref, () => ({ showSnackbar }));  

    return (
        <Snackbar
            open={ snackbar.open } 
            autoHideDuration={ snackbar.timeShown }
            onClose={closeSnackbar}
            message={ snackbar.message }
            action={ <CloseButton onClick={closeSnackbar} /> }
            { ...props }
            sx={{ '& .MuiSnackbarContent-root': { fontSize: "1rem" } }}
        />
    );
}); 