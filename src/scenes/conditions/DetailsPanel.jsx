import { Avatar, Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import { memo } from "react";   
import { useCustomNavigate } from "../../useCustomNavigate"; 
import { ColorBox, ContainerTitle, ImageCell, MemberSelect } from "../../components";  
import { doctor, graph, pills7 } from "../../assets";  
import { formatDate } from "../../utils";
import { containerStyles, scrollBarStyles } from "../../styles";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";

// general, non-scrolling container for a detail
const FixedDetailBox = ({ title, mainContent, imageCell, rightImage, sx }) => (
    <Stack direction="column" sx={sx} >  
        <ContainerTitle title={title} />
        <Stack 
            direction="row" 
            sx={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }} 
        >
            <Stack direction="column" sx={{ width: "75%" }} >
                {mainContent} 
                {imageCell}
            </Stack>
            {rightImage}
        </Stack>
    </Stack>
);  

// calculates + shows average value of condition measurements
const AvgMsmtBox = ({ condition, color, sx }) => {
    dayjs.extend(minMax); 
    const msmts = condition?.measurements;

    const calcMsmtAvg = () => {
        if (msmts?.length > 0) {
            const rawAvg = msmts.reduce((sum, msmt) => sum + parseInt(msmt.value), 0) / msmts.length;
            const roundedAvg = Math.round(rawAvg * 100) / 100;
            const fmtedAvg = roundedAvg % 1 === 0 ? roundedAvg.toString() : roundedAvg.toFixed(2);
            return `${ fmtedAvg } ${ condition.unit ?? "" }`;
        }
        return "";
    };

    // returns total interval of days measurements are recorded over
    const calcTimeRange = () => {
        if (msmts?.length > 0) {
            const dates = msmts.map((msmt) => dayjs(msmt.datetime));
            const earliestDate = dayjs.min(...dates);
            const lastDate = dayjs.max(...dates); 
            return `over ${ lastDate.diff(earliestDate, "day") + 1 } day(s)`
        }
        return "";
    };
    
    return (
        <FixedDetailBox
            title="Average Measurement"
            mainContent={
                <Typography 
                    sx={{ 
                        fontSize: condition ? "1.5rem" : "1.2rem", 
                        fontWeight: condition ? 500 : 400, 
                        wordBreak: "break-word"
                    }} 
                >  
                    { condition ? calcMsmtAvg() : "No data found" }
                </Typography> 
            }
            imageCell={ 
                <ImageCell 
                    type="time"
                    text={ calcTimeRange() }
                    textSx={{ fontSize: "0.9rem", color: color }}
                    iconSx={{ color: color, mt: "0.2rem" }} 
                />
            }
            rightImage={
                <img 
                    src={graph} 
                    alt="bar graph"  
                    style={{ width: 60, height: 60, marginBottom: "0.3rem" }} 
                /> 
            }
            sx={sx}
        />
    );
}; 

// shows member profile + menu to change selected member
const PatientBox = ({ member, allMembers, goToConditions, color, sx }) => (
    <FixedDetailBox
        title="Patient Information"
        mainContent={
            <MemberSelect
                selected={member}
                allMembers={allMembers}
                onMemberChange={ (event) => goToConditions(event.target.value) }
            />
        }
        imageCell={ 
            <ImageCell
                type="date"
                text={ `DOB: ${ formatDate("fullDate", member.dob) }` }
                textSx={{ fontSize: "0.9rem", color: color, pt: "0.3rem" }}
                iconSx={{ color: color }} 
            /> 
        }
        rightImage={ 
            <Avatar 
                src={ member.fullPicturePath } 
                alt={ member.fullName }
                sx={{ width: 75, height: 75 }} 
            /> 
        }
        sx={sx}
    /> 
);

// shows list of condition's designated medications
const MedsList = ({ meds }) => (
    <Stack 
        direction="column" 
        spacing={1}
        sx={{  
            pt: "1rem",
            width: "100%",  
            overflowY: "auto",  
            ...scrollBarStyles 
        }} 
    >
        { meds.map((med) => (
            <Stack 
                key={ med.medID }
                direction="row"
                spacing={1}
                sx={{ width: "95%", alignItems: "center" }}
            >
                <ColorBox color={ med.color.main } /> 
                <Stack 
                    direction="row"
                    sx={{ flex: 1, justifyContent: "space-between", alignItems: "center" }}
                >
                    <Typography sx={{ fontSize: "1rem", fontWeight: 500 }} >
                        { med.name }
                    </Typography> 

                    { med.dosage && (
                        <Chip
                            label={ med.dosage }
                            sx={{
                                height: "1.8rem",
                                fontSize: "0.8rem",
                                fontWeight: 500,
                                bgcolor: med.color.main,
                                color: med.color.text
                            }}
                        />
                    )}
                </Stack>
            </Stack>
        ))} 
    </Stack>
);

// shows list of condition's assigned providers
const ProvidersGrid = ({ providers }) => { 
    const gridSx = {
        width: "100%", 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(4rem, 1fr))",
        gap: 3, 
        borderRadius: "1rem",  
        overflowY: "auto", 
        overflowX: "hidden",
        userSelect: "none",
        ...scrollBarStyles,
        pr: "1.5rem"
    };

    return (
        <Box sx={gridSx} > 
            { providers.map((provider) => (
                <Stack 
                    key={ provider.providerID }
                    direction="column"
                    spacing={1} 
                    sx={{ width: "5rem", alignItems: "center" }}
                >
                    <Avatar 
                        src={ provider.fullPicturePath } 
                        alt={ provider.name }
                        sx={{ width: 60, height: 60 }} 
                    />  
                    <Typography sx={{ fontSize: "0.8rem", textAlign: "center" }} >
                        { provider.name }
                    </Typography>
                </Stack>
            ))}  
        </Box>
    );
};

// img/text component shown when a detail box is empty 
const EmptyDetailGraphic = ({ type, color }) => {
    let img = null;
    switch (type) {
        case "med": 
            img = <img src={pills7} alt="medical" style={{ width: 70, height: 70 }} />;
            break; 

        case "provider":
            img = <img src={doctor} alt="doctor" style={{ width: 80, height: 80 }} />; 
            break;

        case "msmt": 
            img = <img src={graph} alt="graph" style={{ width: 60, height: 60 }} />; 
            break;

        default:
            return null;
    };

    return (
        <Stack 
            direction="row" 
            sx={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }} 
        >
            <Typography sx={{ fontSize: "1.1rem", color: color }} >
                None Recorded
            </Typography> 
            { img }  
        </Stack>
    );
};

/**
 * Displays a panel of core details for the selected condition
 */

export const DetailsPanel = memo(({ memberID, conditions, personnel }) => {  
    const palette = useTheme().palette;
    const { goToConditions } = useCustomNavigate();
    const condition = conditions.selected; 
    const allMembers = personnel.members;
    const member = allMembers.find((profile) => profile.memberID === Number(memberID)); 
    const fixedBoxSx = { 
        width: "50%",  
        bgcolor: palette.background.container,
        pb: "0.8rem"
    };
    const scrollBoxSx = { ...fixedBoxSx, ...containerStyles };

    return (
        <Stack direction="column" spacing={2} sx={{ width: "100%", height: "25rem" }} >  
            <Stack direction="row" spacing={2} sx={{ width: "100%", height: "45%" }} > 
                { condition?.measurements.length > 0 ? (
                    <AvgMsmtBox 
                        condition={condition}
                        color={ palette.neutral.dark }
                        sx={{ ...containerStyles, ...fixedBoxSx }}
                    /> 
                ) : (
                    <Stack direction="column" sx={scrollBoxSx} >  
                        <ContainerTitle title="Average Measurement" />
                        <EmptyDetailGraphic type="msmt" color={ palette.neutral.dark } />
                    </Stack>
                )} 

                <PatientBox
                    member={member} 
                    allMembers={allMembers} 
                    goToConditions={goToConditions}
                    color={ palette.neutral.dark }
                    sx={{ ...containerStyles, ...fixedBoxSx }} 
                /> 
            </Stack> 

            <Stack direction="row" spacing={2} sx={{ width: "100%", height: "55%" }} >  
                <Stack direction="column" sx={scrollBoxSx} >  
                    <ContainerTitle title="Medications" />
                    { condition?.medications.length > 0 ? (
                        <MedsList meds={ condition.medications } />
                    ) : (
                        <EmptyDetailGraphic type="med" color={ palette.neutral.dark } /> 
                    )}
                </Stack>  

                <Stack direction="column" sx={scrollBoxSx} >  
                    <ContainerTitle title="Managing Providers" />
                    { condition?.providers.length > 0 ? (
                        <ProvidersGrid providers={ condition.providers } />
                    ) : (
                        <EmptyDetailGraphic type="provider" color={ palette.neutral.dark } /> 
                    )} 
                </Stack>  
            </Stack> 
        </Stack>
    );
}); 