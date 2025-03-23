import * as clientServices from './clientServices';
import dayjs from "dayjs"; 
import { colorOptions } from "../theme";
import { DEFAULT_PROFILE_PIC_PATH } from "../constants";
import { formatDate, getFirst, sortDatesAsc } from "../utils";
import { document1, document2, document3, document4, document5,
    pills1, pills2, pills3, pills4, pills5, pills6,
    imageFile1, imageFile2, imageFile3 } from "../assets";

const medImgs = [pills1, pills2, pills3, pills4, pills5, pills6];
const documentImgs = [document1, document2, document3, document4, document5];
const visitFileImgs = [imageFile1, imageFile2, imageFile3];  

/** 
 * Defines functions to format raw database data into standard objects 
 */

export const formatMember = async (memberData) => { 
    const { member_id, level, x, y, marriage, parent_marriage, is_add_on_spouse } = memberData;
    const profiles = await clientServices.searchProfiles("memberID", member_id); 
    
    return {
        memberID: member_id,
        level: level,
        coords: { x: x, y: y },
        marriage: marriage,
        parentMarriage: parent_marriage,
        isAddOnSpouse: is_add_on_spouse,
        profile: getFirst(profiles) 
    };
};

export const formatLevel = async (levelData, marriages) => {
    const { level_id, sibling_x_distance, max_children } = levelData; 
    return {
        levelID: level_id,
        siblingXDist: sibling_x_distance,
        maxChildren: max_children,
        marriages: marriages ?? []
    };
};

export const formatMarriage = async (marriageData) => {
    const { marriage_id, level_id, spouse_x_distance } = marriageData;  

    // get array of memberIDs for spouses of marriage
    const spouses = await clientServices.searchMembers("marriage", marriage_id);
    const spouseIDs = spouses.map((spouse) => spouse.memberID); 

    // get array of memberIDs for children of marriage
    const children = await clientServices.searchMembers("parentMarriage", marriage_id); 
    const childIDs = children.map((child) => child.memberID);

    return {
        marriageID: marriage_id,
        levelID: level_id,
        spouseXDist: spouse_x_distance,
        between: spouseIDs,
        children: childIDs
    };
};
  
export const formatProfile = async(profileData, allergies) => {
    const { 
        profile_id, 
        member_id, 
        first_name, 
        last_name, 
        dob, 
        uses_metric, 
        sex, 
        picture_path, 
        picture_type, 
        ...rest 
    } = profileData;  
 
    let pictureURL = null;
    if (picture_path && picture_type) {
        pictureURL = picture_type === "custom" 
            ? await clientServices.getFileURL(picture_path) 
            : `${ DEFAULT_PROFILE_PIC_PATH }/${ picture_path }`;
    } 

    return {
        profileID: profile_id,
        memberID: member_id,
        firstName: first_name,
        lastName: last_name ?? "",
        fullName: `${ first_name } ${ last_name ?? "" }`,
        dob: formatDate("fullDate", dob),
        usesMetric: uses_metric,
        sex: sex === "M" ? "Male" : "Female",
        pictureType: picture_type,
        picturePath: picture_path,
        fullPicturePath: pictureURL, 
        allergies: allergies,
        ...rest
    }; 
};

export const formatAllergy = (allergyData) => {
    const { allergy_id, member_id, name, is_custom, is_drug } = allergyData;  
    return {
        allergyID: allergy_id,
        memberID: member_id,
        name: name, 
        isCustom: is_custom,
        isDrug: is_drug
    }; 
};
 
export const formatRecord = (record, index) => { 
    const { record_id, member_id, date, ...rest } = record; 
    return {
        recordID: record_id,
        memberID: member_id,
        image: documentImgs[index % documentImgs.length],
        date: dayjs(date).format("YYYY-MM-DD"),
        ...rest
    }; 
};

export const organizeRecordsByType = (records) => {  
    return {
        procedures: records.filter(record => record.type === "procedure"),
        immunizations: records.filter(record => record.type === "immunization")
    }; 
};

export const formatProvider = (provider) => {
    const { provider_id, member_id, picture_path, ...rest } = provider; 
    return {
        providerID: provider_id,
        memberID: member_id,
        picturePath: picture_path,
        fullPicturePath: `${ DEFAULT_PROFILE_PIC_PATH }/${ picture_path }`,
        ...rest
    };
};

export const formatMed = async (med, index) => {
    const { med_id, member_id, provider_id, ...rest } = med;    
    const providers = provider_id 
        ? await clientServices.searchProviders("providerID", provider_id) 
        : null;  

    return {
        medID: med_id,
        memberID: member_id, 
        provider: getFirst(providers), 
        img: medImgs[index % medImgs.length],
        color: colorOptions[index % colorOptions.length],
        ...rest
    };
}; 

export const formatMsmt = (msmt, index) => {
    const { measurement_id, condition_id, ...rest } = msmt; 
    return {
        measurementID: measurement_id,
        conditionID: condition_id,
        color: colorOptions[index % colorOptions.length], 
        ...rest
    };
};

export const formatCondition = (condition, msmts, meds, providers) => {
    const { condition_id, member_id, is_pinned, ...rest } = condition;   
    return {
        conditionID: condition_id,
        memberID: member_id, 
        pinned: is_pinned,
        measurements: sortDatesAsc(msmts, "datetime"),
        medications: meds,
        providers: providers,
        ...rest
    }; 
};

export const formatEvent = async (event, index) => {
    const { event_id, provider_id, datetime, ...rest } = event;  
    const providers = provider_id 
        ? await clientServices.searchProviders("providerID", provider_id) 
        : null; 
 
    return {
        eventID: event_id, 
        providerID: provider_id,
        provider: getFirst(providers), 
        datetime: formatDate("dateTime", datetime),
        color: colorOptions[index % colorOptions.length],
        ...rest
    };
};

export const formatFolder = (folder, index) => {
    const { folder_id, parent_id, name } = folder; 
    return {
        folderID: folder_id,
        parentID: parent_id ?? 0,
        name: name,
        color: colorOptions[index % colorOptions.length]
    };
};

export const formatVisit = async (visit, index, files, member, provider) => {
    const { visit_id, folder_id, member_id, provider_id, img, ...rest } = visit;    

    if (!files) {
        const allFiles = await clientServices.getVisitFiles();  
        files = allFiles.filter(file => file.visitID === visit_id); 
    } 
    if (!member) {
        const allMembers = await clientServices.searchProfiles("memberID", member_id);
        member = getFirst(allMembers); 
    } 
    if (!provider) {
        const allProviders = await clientServices.searchProviders("providerID", provider_id);
        provider = provider_id ? getFirst(allProviders) : null;
    }

    return {
        visitID: visit_id,
        folderID: folder_id,
        member: member, 
        provider: provider, 
        files: files,  
        img: documentImgs[index % documentImgs.length],
        ...rest
    }; 
}; 

export const formatVisitFile = async (file, index) => {   
    const { file_id, visit_id, file_path, ...rest } = file; 
    const fileURL = await clientServices.getFileURL(file_path);

    return {
        fileID: file_id,
        visitID: visit_id,  
        filePath: file_path,
        fileURL: fileURL,
        image: visitFileImgs[index % visitFileImgs.length],
        color: clientServices.fileTypesMap[file.mimetype]?.color,
        ...rest
    };
};