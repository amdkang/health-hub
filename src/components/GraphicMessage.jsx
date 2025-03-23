import { alpha, Box, Stack, Typography, useTheme } from "@mui/material"; 
import { calendar, clipboard, doctor, drugAllergy, emptyBox, emptyFolder,  
    graph, graph2, medBottle, pinnedNotes, photos, satellite } from "../assets";
 
const bgCircleStyles = { bgcolor: alpha("#9184f5", 0.1), borderRadius: "50%" }; 
const titleStyles = { 
    fontWeight: 500, 
    textAlign: "center",
    '&:hover': { cursor: "default" }
}; 

// maps message `types` to their image/text details
const types = { 
    visit: {
        title: "No Visits Found",
        label: 'Click "Create" to add a new visit or folder',
        titleSx:  { fontSize: "2.8rem", ...titleStyles },
        imageSrc: emptyBox,  
        imageSize: 360,  
        direction: "row"
    },  
    visitFile: {
        title: "No Visit Files Found",
        label: 'Click here to add a new file',
        titleSx: { fontSize: "2rem", ...titleStyles },
        imageSrc: photos,  
        imageSize: 150,
        imageSx: { ...bgCircleStyles, p: "1.4rem" },
        direction: "row"
    },   
    dashboardVisit: {
        title: "No Visits Found",
        label: 'Click here to add a new visit',
        titleSx: { fontSize: "1.2rem", ...titleStyles },
        imageSrc: emptyFolder,  
        imageSize: 120,
        imageSx: { ...bgCircleStyles, p: "1.4rem" },
        direction: "row"
    },  
    med: {
        title: "No Medications Found",
        label: "Click here to add a new medication",
        titleSx: { fontSize: "1.6rem", ...titleStyles },
        imageSrc: medBottle,
        imageSize: 170,
        imageSx: { ...bgCircleStyles, p: "2.2rem 2rem 2.2rem 3rem" },
        direction: "row"
    }, 
    dashboardMed: {
        title: "No Medications Found",
        label: "Click here to add a new medication",
        titleSx: { fontSize: "1.2rem", ...titleStyles },
        imageSrc: medBottle, 
        imageSize: 110,
        imageSx: { ...bgCircleStyles, p: "1.7rem" },
        outerSx: { mt: "2.2rem" }
    }, 
    condition: {
        title: "No Conditions Found",
        label: "Click here to add a new condition",
        titleSx: { fontSize: "1.2rem", ...titleStyles },
        imageSrc: graph2, 
        imageSize: 135,
        imageSx: { ...bgCircleStyles, p: "2.2rem" }
    },
    pinCondition: {
        title: "No Pinned Conditions",
        label: "Click here to add or pin a condition",
        titleSx: { fontSize: "1.2rem", ...titleStyles },
        imageSrc: pinnedNotes,
        imageSize: 90,
        imageSx: { ...bgCircleStyles, p: "2rem" },
        outerSx: { mt: "-3rem" }
    },
    record: {
        title: "No Records Found",
        label: "Click here to add a new record",
        titleSx: { fontSize: "1rem", ...titleStyles },
        imageSrc: clipboard,
        imageSize: 80, 
        imageSx: { ...bgCircleStyles, p: "1.6rem" },
        outerSx: { mt: "-0.7rem" }
    },
    dashboardMsmt: {
        title: "No Measurements Found",
        label: "Click here to add a new measurement",
        titleSx: { fontSize: "1.2rem", ...titleStyles },
        imageSrc: graph2,
        imageSize: 95,
        imageSx: { ...bgCircleStyles, p: "1.8rem" },
        outerSx: { mt: "-1rem" } 
    },
    msmt: {
        title: "No Measurements Found",
        label: "Click here to add a new measurement",
        titleSx: { fontSize: "1.2rem", ...titleStyles },
        imageSrc: graph,  
        imageSize: 120, 
        imageSx: { ...bgCircleStyles, p: "2.5rem" },
        outerSx: { mt: "-4rem" } 
    },
    allergy: {
        title: "No Known Allergies",
        label: 'Click "Edit" to add an allergy',
        titleSx: { fontSize: "1.1rem", ...titleStyles },
        imageSrc: drugAllergy,
        imageSize: 60,
    },
    event: {
        title: "No Events Scheduled",
        label: "Click here to add a new event",
        titleSx: { fontSize: "1.2rem", ...titleStyles },
        imageSrc: calendar,
        imageSize: 100, 
        imageSx: { ...bgCircleStyles, p: "1.4rem" }
    },
    provider: {
        title: "No Providers Found",
        label: "Click here to add a provider",
        titleSx: { fontSize: "1rem", ...titleStyles },
        imageSrc: doctor,
        imageSize: 80,
        imageSx: { ...bgCircleStyles, p: "1.8rem" }
    },
    database: {
        title: "Oops! Something went wrong here",
        label: "A connection error has occurred.\n Please refresh the page to try again.",
        titleSx:  { fontSize: "2.8rem", ...titleStyles },
        imageSrc: satellite,
        imageSize: 400,
        outerSx: { mt: "1rem" },
        direction: "row"
    }
};  

/**
 * Custom image/text component shown for empty/error states 
 */

export const ErrorGraphicMessage = ({ type, onClick }) => {
    const theme = useTheme(); 
    const errorMsgSx = { 
        fontSize: "1rem", 
        color: theme.palette.neutral.dark, 
        textAlign: "center",
        '&:hover': type === "visit" 
            ? { cursor: "default" } 
            : { textDecoration: "underline", cursor: "pointer" }
    };
    const error = types[type];  

    return (
        <Stack 
            direction={ error.direction ?? "column" }
            spacing={2.5}
            sx={{
                width: "100%",
                height: "100%", 
                justifyContent: "center",
                alignItems: "center", 
                ...(error.outerSx ?? null)
            }}
        >
            <Box sx={ error.imageSx } >
                <img 
                    src={ error.imageSrc } 
                    alt="error" 
                    width={ error.imageSize } 
                    height={ error.imageSize } 
                />
            </Box>

            <Stack direction="column" >
                <Typography sx={ error.titleSx } > { error.title } </Typography> 
                <Typography onClick={onClick} sx={errorMsgSx} >
                    { error.label }
                </Typography>
            </Stack>   
        </Stack> 
    );
}; 