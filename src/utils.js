import { DAYS } from "./constants";
import { Brightness2, Brightness4, LightMode } from "@mui/icons-material"; 
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek"; 
dayjs.extend(isoWeek);

/**
 * Defines utility functions reused across components/forms
 */


/** Date-related functions */ 
const dateFormats = {
    fullDate: "M/D/YYYY",
    shortDate: "M/D/YY",
    textDate: "MMMM D, YYYY",
    dateTime: "M/D/YYYY h:mm A",
    time: "h:mm A" 
};

// returns date (converted to specified format) as string
export const formatDate = (type, date) => {
    if (date === null || date === '') return '...';
    const formatString = dateFormats[type];
    if (dayjs(date).isValid() && formatString) {
        return dayjs(date).format(formatString);
    };
    return date; 
};  

// compares dates while ignoring time
export const areSameDates = (date1, date2) => {
    const fmtedDate1 = dayjs(date1).startOf('day');
    const fmtedDate2 = dayjs(date2).startOf('day');
    return fmtedDate1.isSame(fmtedDate2);
};

export const sortDatesAsc = (dates, property) => {
    return [...dates].sort((a, b) => new Date(a[property]) - new Date(b[property])); 
};

// returns events with datetime matching targetDate
export const getDateEvents = (events, targetDate) => {
    return events.filter(event => areSameDates(event.datetime, targetDate));
}; 

// formats days for current week & sets/manages selected date
export const formatDaysOfWeek = () => {
    const daysOfWeek = [];
    const currentDate = dayjs();
    const weekStart = currentDate.startOf("week").day(0); // start week on Sunday
 
     // include days's index + formatted date for each day of week
    DAYS.forEach((_day, index) => { 
         const date = weekStart.add(index, "day").format("MM/DD/YY"); 
         daysOfWeek.push({
             index: index,
             date: date,
             fmtedDate: dayjs(date).format("D")
         });
    }); 
    return { days: daysOfWeek, selectedIndex: currentDate.day() }; 
 };


 
/** Profile formatting functions */ 
export const formatWeight = (weight, usesMetric) => {
   if (!weight || usesMetric === null) return null;
   const unit = usesMetric ? 'kg' : 'lbs';
   return `${ weight } ${unit}`;
};

export const formatHeight = (height, usesMetric) => {
   if (!height || usesMetric === null) return null;
   if (!usesMetric) {
       const ftInches = height.split(","); // return height in [feet, inches]
       const fmtedHeight = ftInches.length === 2 ? `${ ftInches[0] }' ${ ftInches[1] }"` : '';
       return fmtedHeight;
   }
   return `${ height } cm`;
};


 
/** Medication formatting functions */ 
export const formatMedSchedule = (meds) => {
    const dailyMeds = []; 
    const medSched = DAYS.map(() => []); // separate arrays to store meds for each day of week

    // add med to daily or weekly med array
    meds.forEach((med) => {
        if (med.frequency === "daily") {
            dailyMeds.push(med);
        } else if (med.frequency === "weekly") {
            med.schedule.forEach((dayIndex) =>  medSched[dayIndex].push(med));
        }
    }); 
    return DAYS.map((_day, index) => [...dailyMeds, ...medSched[index]]);   
}; 

// returns string of abbreviations for each day in weekly med's schedule
export const getSchedAbbrev = (med) => {   
    const allDays = DAYS.map((day) => day.shortName);
    return med.frequency === "daily" 
        ? allDays : med.schedule.map((day) => DAYS[day].shortName);
};

// returns icon corresponding to time period
export const getTimeIcon = (time, iconStyles) => { 
    switch (time) {
        case "AM":
            return <LightMode sx={iconStyles} />
        case "PM":
            return <Brightness2 sx={iconStyles} />
        case "both":
            return <Brightness4 sx={iconStyles} />
        default:
            return null
    }
};

export const formatMedTime = (time) => {
    return time === "both" ? "AM/PM" : time;
};



/** String formatting functions */

// return string with first letter decapitalized
export function decapitalize(str) {
   return str.charAt(0).toLowerCase() + str.slice(1);
};

// return string with first letter capitalized
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const charIsLetter = (char) => { return /[a-zA-Z]/.test(char) };

// separate string into characters of set length
// return character `chunks` in array
export const splitStringByCharLength = (str, chunkLength) => {
    const chunks = [];
    for (let i = 0; i < str.length; i += chunkLength) {
        let chunk = str.substr(i, chunkLength);
        if (i + chunkLength < str.length && charIsLetter(str[i+chunkLength-1])) {
            const nextChar = str[i+chunkLength];
            if (charIsLetter(nextChar)) {
                chunk += "-";
            }
            else if (nextChar === " ") {
                i++;
            }
        }
        chunks.push(chunk);
    }
    return chunks;
};

 // returns null if field is an empty string, else returns full string
export const formatStringField = (field) => {
    return field?.length === 0 ? null : field;
};

export const getFirst = (array) => {
    return array?.length > 0 ? array[0] : null;
};