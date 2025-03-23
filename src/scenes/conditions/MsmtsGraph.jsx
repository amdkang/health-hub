import { Stack, Typography, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { memo } from "react";  
import { ColorBox } from "../../components";
import { areSameDates, formatDate } from "../../utils";  
import dayjs from "dayjs"; 

// lists summary of measurements recorded for hovered date
const CustomTooltip = (props) => {
    const hoveredDate = props.axisValue;
    const msmts = props.condition.measurements.filter((msmt) => areSameDates(msmt.datetime, hoveredDate));  
    const tooltipSx = { 
        p: "1.2rem 1.6rem",
        bgcolor: props.palette.background.container,
        border: `0.1rem solid ${ props.palette.primary.main }`, 
        borderRadius: "1rem"
    };

    return (
        <Stack direction="column" spacing={2} sx={tooltipSx} >  
            <Typography sx={{ fontSize: "1.2rem" }} >
                { formatDate("textDate", hoveredDate) }
            </Typography>  
            { msmts.map((msmt) => (
                <Stack
                    key={ msmt.measurementID }  
                    direction="row"
                    spacing={1}
                    sx={{ width: "100%", alignItems: "center" }}
                >  
                    <ColorBox color={ msmt.color.main } />

                    <Typography sx={{ fontSize: "1rem", mr: "0.5rem" }} > 
                        { `${ msmt.value } ${ props.condition.unit }` } 
                    </Typography> 

                    <Typography sx={{ fontSize: "0.8rem", color: props.palette.neutral.dark }} >
                        { `(${ formatDate("time", msmt.datetime) })` }
                    </Typography>  
                </Stack> 
            ))}
        </Stack> 
    );
};

 // renders solid color-filled graph data point 
 const CustomMark = (props) => {
    const transformStr = `translate(${ props.x }px, ${ props.y }px)`;
    const originStr = `${ props.x }px ${ props.y }px`;

    return (
        <path
            stroke={ props.palette.neutral.dark }
            fill={ props.palette.primary.main }
            d="M 2.257 0 A 2.257 2.257 90 1 1 -2.257 0 A 2.257 2.257 90 1 1 2.257 0"
            style={{ transform: transformStr, transformOrigin: originStr }}
        />
    );
};

/**
 * Displays a line graph charting the selected condition's measurements
 */

export const MsmtsGraph = memo(({ condition, width, height, onAxisClick }) => {   
    const palette = useTheme().palette; 
    const minValue = Math.min(...condition.measurements.map((msmt) => msmt.value));
    const maxValue = Math.max(...condition.measurements.map((msmt) => msmt.value));
    const padding = (maxValue - minValue) * 0.1;
    const { top, height: drawingAreaHeight, bottom } = useDrawingArea();
    const gradientHeight = top + bottom + drawingAreaHeight; 

    // include date/time & value/unit property for each measurement 
    const formatMsmts = (msmts) => {
        return msmts.map((msmt) => (
            { 
                datetime: dayjs(formatDate("fullDate", msmt.datetime)).toDate(),
                measurement: parseFloat(msmt.value) ?? msmt.value
            }
        ));
    };

    // returns number of unique days recorded across all measurements 
    // used to avoid duplicate entries on graph x-axis
    const getUniqueDaysCount = (msmts) => {
        const uniqueDays = new Set();
        msmts.forEach((msmt) => uniqueDays.add(formatDate("fullDate", msmt.datetime)));
        return uniqueDays.size;
    }; 

    return (
        <LineChart
            onAxisClick={onAxisClick}
            dataset={ formatMsmts(condition.measurements) }
            xAxis={[{ 
                dataKey: "datetime",
                scaleType: "time",
                valueFormatter: (value) => formatDate("shortDate", value),  
                tickNumber: getUniqueDaysCount(condition.measurements),
            }]}
            yAxis={[{ min: minValue - padding, max: maxValue + padding }]}
            series={[{
                dataKey: "measurement",
                area: true,
                color: palette.primary.main,
                valueFormatter: (value) => `${ value } ${ condition.unit }`,
            }]}
            axisHighlight={{ x: "line" }}
            grid={{ horizontal: true }}
            slots={{ axisContent: CustomTooltip, mark: CustomMark }}
            slotProps={{
                axisContent: { condition: condition, palette: palette },
                mark: { palette: palette }
            }}
            tooltip={{ trigger: "axis" }}
            width={width}
            height={height}
            sx={{    
                height: "100% !important",
                mt: "-5rem",  
                '& .MuiAreaElement-root': { 
                    fill: "url(#fill-gradient)" 
                },
                '& .MuiLineElement-root': { 
                    strokeWidth: 1.5 
                },
                '& .MuiChartsAxis-tick': { 
                    display: "none" 
                },
                '& .MuiChartsAxis-directionY .MuiChartsAxis-line': { 
                    stroke: "none"
                },
                '& .MuiChartsAxisHighlight-root': {
                    stroke: palette.neutral.main, 
                    strokeDasharray: "none",
                },
                '& .MuiChartsAxis-tickLabel': {
                    fontSize: "0.8rem !important",
                    fill: palette.neutral.dark
                },
                '& .MuiChartsAxis-directionX .MuiChartsAxis-line': {
                    stroke: palette.neutral.main,
                    strokeWidth: 1
                },
                '& .MuiChartsGrid-line': {
                    strokeDasharray: "2,4",
                    strokeWidth: "1.5",
                    shapeRendering: "auto"
                }
            }}
        >
             <defs>
                <linearGradient
                    id="fill-gradient"
                    x1="0" x2="0"
                    y1="0" y2={ `${gradientHeight}px` }
                    gradientUnits="userSpaceOnUse" 
                >
                    <stop offset="0%" style={{ stopColor: palette.primary.main, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: palette.background.container, stopOpacity: 0 }} />
                </linearGradient>
            </defs> 
        </LineChart>
    );
}); 