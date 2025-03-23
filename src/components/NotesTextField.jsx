import { Stack, TextField, Typography, useTheme } from "@mui/material";
import { memo, useEffect, useRef } from "react";    
import { CustomSnackbar, ImageCell, OutlinedButton } from ".";  
import { stickyNote } from "../assets";  
import { formatDate } from "../utils";
import { containerStyles, scrollBarStyles } from "../styles";  
import dayjs from "dayjs";

const NotesHeader = () => (
    <Stack 
        direction="row" 
        spacing={1.5}
        sx={{ height: "4rem", alignItems: "center" }}
    >
        <img src={stickyNote} alt="notes" style={{ width: 35, height: 35 }} /> 
        <Typography sx={{ fontSize: "1.4rem", fontWeight: 500 }} >
            Notes
        </Typography>
    </Stack> 
);

const NotesFooter = ({ color, savedTime, onSaveClick }) => (
    <Stack 
        direction="row"
        sx={{ width: "100%", justifyContent: "space-between", alignItems: "flex-end" }}
    >
        <ImageCell
            type="time"
            text={ `Last saved ${ savedTime }` }
            textSx={{ fontSize: "0.9rem", color: color }}
            iconSx={{ color: color }}
        />
        <OutlinedButton text="Save" onClick={onSaveClick} /> 
    </Stack>
);
 
/**
 * Reusable textfield used to display/manage notes for specified `Condition` or `Visit` 
 */

export const NotesTextField = memo(({ notes, updateNotes }) => {    
    const palette = useTheme().palette; 
    const notesRef = useRef(null);
    const snackbarRef = useRef(null); 
    const savedTime = useRef(formatDate("time", dayjs()));  
    const notesAreaSx = {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "flex-end",
        p: "0.6rem 0",
        borderTop: `0.1rem solid ${ palette.neutral.light }` 
    };
    const textFieldSx = { 
        width: "100%",
        height: "85%",
        p: "0 0.8rem 0.5rem 1rem",
        '& .MuiInputBase-input': {
            lineHeight: "2",
            fontSize: "1rem",
            ...scrollBarStyles
        }
    }; 
    const errorMsgSx = { color: palette.neutral.main, fontStyle: "italic", pl: "0.5rem" };

    useEffect(() => {
        if (notesRef.current) notesRef.current.value = notes;
    }, [notes]);
 
    const saveNotes = async () => {   
        if (notes !== notesRef.current.value) {
            const success = await updateNotes(notesRef.current.value); 
            if (success) savedTime.current = formatDate("time", dayjs()); // updates last saved time
        }
    };
  
    return (
        <Stack 
            direction="column"  
            sx={{
                flex: 1,
                height: "100%",
                bgcolor: palette.background.container,
                ...containerStyles,
                pb: "0.5rem"
            }}
        >
            <NotesHeader />
            
            { notes?.length >= 0 ? (
                <Stack direction="column" sx={notesAreaSx} >
                    <TextField
                        inputRef={notesRef}
                        variant="standard"
                        multiline 
                        rows={10}
                        placeholder="Type your notes here..." 
                        defaultValue={ notes }
                        slotProps={{ input: { disableUnderline: true }}} 
                        sx={textFieldSx}
                    />
                    <NotesFooter 
                        color={ palette.neutral.dark } 
                        savedTime={ savedTime.current } 
                        onSaveClick={saveNotes} 
                    />
                </Stack>
            ): (
                <Typography sx={errorMsgSx} > Type your notes here... </Typography>
            )}

            <CustomSnackbar ref={snackbarRef} />  
        </Stack> 
    );
}); 