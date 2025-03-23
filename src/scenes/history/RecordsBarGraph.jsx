import { alpha, Stack, Typography, useTheme } from "@mui/material"; 
import { MonitorHeartOutlined } from "@mui/icons-material";
import { BarChart } from "@mui/x-charts/BarChart";
import { memo } from "react";
import { ColorBox, ContainerTitle, ErrorGraphicMessage, ImageCell } from "../../components";     
import { sortDatesAsc } from "../../utils";
import { containerStyles } from "../../styles";
import dayjs from "dayjs";

// shows list of records for date group hovered in bar graph
const CustomTooltip = (props) => {   
    const year = props.axisValue;
    const title = `${ year } ${ props.recordType }s`; 
    const tooltipRecords = props.fmtedRecords[props.dataIndex]?.records; 
    const palette = props.palette;   
    const tooltipSx = {
        maxWidth: "30rem",
        p: "1.2rem 1.6rem",
        bgcolor: palette.background.container,
        border: `0.1rem solid ${ palette.primary.main }`, 
        borderRadius: "1rem"
    };

    return (
        <Stack direction="column" spacing={2} sx={tooltipSx} >  
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 600 }} > 
                { title } 
            </Typography>  
            
            { tooltipRecords?.map((record, index) => {
                const color = palette.options[index % palette.options.length]; 
                return (
                    <Stack
                        key={ record.recordID } 
                        direction="row"
                        spacing={1}
                        sx={{ width: "100%", alignItems: "flex-start" }}
                    >  
                        <ColorBox color={ color.main } />   
                        <Stack direction="column" spacing={0.3} >
                            <Typography sx={{ fontSize: "0.9rem" }} > { record.name } </Typography> 
                            <ImageCell 
                                type="time"  
                                text={ record.date } 
                                textSx={{ color: palette.neutral.dark }} 
                                iconSx={{ color: palette.neutral.dark }}
                            /> 
                        </Stack> 
                    </Stack>
                )
            })}
        </Stack>   
    );
};

/**
 * Renders a bar graph showing the selected member's medical records (grouped/sorted by date)
 * Records shown (of type `Procedure` or `Immunization`) are synced with `RecordsDataGrid`
 */

export const RecordsBarGraph = memo(({ records, recordType }) => {  
    const palette = useTheme().palette; 
    const customParseFormat = require("dayjs/plugin/customParseFormat");
    dayjs.extend(customParseFormat);
    const dayjsFormats = { "month": "YYYY-MM", "year": "YYYY" };

    const title = recordType === "Procedure" ? "Past Procedures" : "Past Immunizations";
    const currentRecords = recordType === "Procedure" ? records.procedures : records.immunizations; 
    const fmtedRecords = formatRecords(currentRecords);   

    // groups records by provided time interval (month or year)
    function sortByTimeInterval(records, type) {
        let groups = [];
        const formatStr = dayjsFormats[type];
        if (formatStr) {
            records.forEach((record) => {
                const date = dayjs(record.date).format(formatStr);
                const existingDate = groups.find((data) => data.date === date);
                if (existingDate) {
                    // add record to existing date group
                    existingDate.records.push(record); 
                } else {
                    //create new group for record's date
                    groups.push({ date: date, records: [record] })
                }
            });
        };
        return groups;
    };

    // returns true if records are all in same specified time interval (month or year)
    function inSameTimeInterval(records, type) {
        if (records.length <= 1) return true;
        const dateFormat = dayjsFormats[type];
        const firstRecordDate = dayjs(records[0].date).format(dateFormat);
        return records.slice(1).every((record) => {
            const fmtedRecordDate = dayjs(record.date).format(dateFormat); 
            return fmtedRecordDate === firstRecordDate;
        });
    };

    // return records grouped by most relevant time interval & sorted by date
    function formatRecords(records) {
        let data = [];
        if (records.length < 2 ) {
            // use full record date (no grouping needed)
            data = records.map((record) => (       
                { 
                    date: dayjs(record.date).format(dayjsFormats["month"]), 
                    records: [record] 
                }
            ));  
        } else if (inSameTimeInterval(records, "year")) { 
            if (inSameTimeInterval(records, "month")) { 
                // if records in same year & month, use full date (no grouping needed)
                data = records.map((record) => ({ date: record.date, records: [record] }));  
            } else { 
                // if records in same year but different months, group records by month
                data = sortByTimeInterval(records, "month");
            }
        } else {
            // if records in different years, group records by year 
            data = sortByTimeInterval(records, "year");
        } 

        // include property stating number of records in each group (for graph's y-axis)
        return sortDatesAsc(data).map((item) => ({
            ...item,
            recordsLength: item.records.length
        }));  
    };
 
    const getYAxisMax = (records) => {
        return Math.max(...records.map((record) => record.recordsLength)) + 1; 
    };   

    return (
        <Stack
            sx={{
                flex: 1,
                bgcolor: palette.background.container,
                ...containerStyles,
                pb: "0"
            }}
        >
            <ContainerTitle 
                title={title} 
                titleIcon={ <MonitorHeartOutlined sx={{ fontSize: 23 }} /> }   
            /> 
            { currentRecords?.length > 0 ? (
                <BarChart
                    xAxis={[{
                        dataKey: "date",
                        scaleType: "band",
                        disableTicks: true                   
                    }]}
                    yAxis={[{ max: getYAxisMax(fmtedRecords) }]}
                    series={[{
                        dataKey: "recordsLength",
                        color: alpha(palette.primary.main, 0.6)
                    }]}
                    dataset={fmtedRecords}
                    borderRadius={15}
                    axisHighlight={{ x: "none" }}
                    slots={{ axisContent: CustomTooltip }} 
                    slotProps={{ 
                        axisContent: {
                            recordType: recordType,
                            fmtedRecords: fmtedRecords,
                            palette: palette
                        }
                    }}
                    sx={{
                        '& .MuiChartsAxis-directionY': { 
                            display: "none" 
                        },
                        '& .MuiChartsAxisHighlight-root': { 
                            borderRadius: "1rem" 
                        },
                        '& .MuiBarElement-series-auto-generated-id-0': { 
                            fill: "url(#bar-gradient)" 
                        },
                        '& .MuiBarElement-root': {
                            '&:hover': {
                                fill: palette.primary.main,
                                cursor: "pointer"
                            }
                        }
                    }}
                >
                    <defs>
                        <linearGradient id="bar-gradient" x2="0" y2="1" >
                            <stop offset="0%" stopColor={ alpha(palette.primary.main, 0.6) } />
                            <stop offset="100%" stopColor={ alpha(palette.primary.main, 0.1) } />
                        </linearGradient>
                    </defs>
                </BarChart>
            ) : (
                <ErrorGraphicMessage type="record" />
            )}
        </Stack>
    );
}); 