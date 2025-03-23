import * as fmtFunctions from './formatting';
import { supabase } from './supabaseClient'; 
import { colorOptions } from '../theme';
import { MAIN_USER_ID } from '../constants';
import { SIBLING_X_DISTANCE, SPOUSE_X_DISTANCE } from '../scenes/family/treeUtils';
import { sortDatesAsc } from '../utils';

export const fileTypesMap = {
    "image/jpeg": { color: colorOptions[0], name: "jpeg" }, 
    "image/png": { color:  colorOptions[1], name: "png" },
    "application/pdf": { color:  colorOptions[2], name: "pdf" },
    "application/msword": { color:  colorOptions[3], name: "doc" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { 
        color:  colorOptions[3], name: "docx" 
    }  
};  

/** 
 * Defines functions used to handle API requests and database logic
 * Responsible for fetching, creating, updating, and deleting data from supabase
 */

// returns rows matching search parameters
const searchTable = (rows, column, value) => {
    try { 
        return rows.filter((row) => row[column] === value);   
    } catch (error) { 
        return [];
    }
};

// adds new or edits existing row in table & returns upserted data
const upsertData = async (table, data, idColName, idColValue) => {   

    if (idColValue !== undefined && idColValue !== null) {  
        // update existing row (if object already has primary key)
        const { data: updatedData, error } = await supabase
            .from(table)
            .update(data, { defaultToNull: false })
            .eq(idColName, idColValue)
            .select();  

        if (error || !updatedData || updatedData.length !== 1) {  
            throw new Error('Error occurred while updating data')
        }; 
        return updatedData[0]; 
    } else { // insert new row 
        const { data: insertedData, error } = await supabase
            .from(table)
            .insert(data, { defaultToNull: false })
            .select();

        if (error || !insertedData || insertedData.length !== 1) {    
            throw new Error('Error occurred while adding data');
        };   
        return insertedData[0];
    }
};

const deleteData = async (table, idColName, idColValues) => {
    const { data, error } = await supabase
        .from(table)
        .delete()
        .in(idColName, idColValues)
        .select(); 

    if (error || !data || data.length !== idColValues.length) {  
        throw new Error('Error occurred while deleting data');
    };     
};

export const getTreeMembers = async () => {
    try {
        const members = JSON.parse(localStorage.getItem('family_members'));
        if (members) return members;   
        
        const { data, error } = await supabase.from('family_members').select('*');
        if (error) throw new Error('Error occurred while getting members');  

        const fmtedMembers = await Promise.all(data.map((mem) => fmtFunctions.formatMember(mem)));
        localStorage.setItem('family_members', JSON.stringify(fmtedMembers));   
        return fmtedMembers;
    } catch (error) { 
        return [];
    }     
}; 

export const searchMembers = async (column, value) => {
    const members = await getTreeMembers();
    return searchTable(members, column, value); 
};

// adds new family tree member and their default `profile` to database  
export const addTreeMember = async (memberData) => { 
    const { level, coords, parentMarriage, marriage, isAddOnSpouse } = memberData;   
    const member = {
        level: level,
        x: coords?.x ?? 0,
        y: coords?.y ?? 0,
        parent_marriage: parentMarriage ?? 0,
        marriage: marriage ?? 0,
        is_add_on_spouse: isAddOnSpouse ?? false
    };  
    const addedData = await upsertData("family_members", member);

    const defaultProfile = {
        memberID: addedData.member_id,  
        dob: memberData.dob,
        sex: memberData.sex, 
        picturePath: memberData.picturePath,
        pictureType: memberData.pictureType,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
    };   
    await addProfile(defaultProfile);  

    const members = await getTreeMembers();
    const addedMember = await fmtFunctions.formatMember(addedData); 
    localStorage.setItem('family_members', JSON.stringify([...members, addedMember]));
};

export const updateTreeMember = async (memberData) => {
    const { memberID, ...rest } = memberData;    
    const updatedData = await upsertData("family_members", { ...rest }, "member_id", memberID);

    const members = await getTreeMembers();
    const addedMember = await fmtFunctions.formatMember(updatedData); 
    const updatedMembers = members.map((mem) => mem.memberID === memberID ? addedMember : mem);
    localStorage.setItem('family_members', JSON.stringify(updatedMembers)); 
};

export const deleteTreeMember = async (memberID) => { 
    await deleteData("family_members", "member_id", [memberID]);
    const members = await getTreeMembers();
    const updatedMembers = members.filter((mem) => mem.memberID !== memberID);  
    localStorage.setItem('family_members', JSON.stringify(updatedMembers)); 
};



export const getLevels = async () => {
    try {
        const levels = JSON.parse(localStorage.getItem('levels'));
        if (levels) return levels;   
        
        const { data, error } = await supabase.from('levels').select('*');
        if (error) throw new Error('Error occurred while getting levels');  
 
        const marriages = await getMarriages();
        const fmtedLevels = await Promise.all( 
            data.map(async (lvl) => { 
                const lvlMarriages = marriages.filter((marr) => marr.levelID === lvl.level_id); 
                return fmtFunctions.formatLevel(lvl, lvlMarriages);
            })
        );  
        localStorage.setItem('levels', JSON.stringify(fmtedLevels));    
        return fmtedLevels;  
    } catch (error) { 
        return [];
    }  
};

export const addLevel = async (levelData) => {   
    const level = {
        level_id: levelData.levelID,
        sibling_x_distance: levelData.siblingXDist ?? SIBLING_X_DISTANCE,
        max_children: levelData.maxChildren ?? 1
    };  
    const addedData = await upsertData("levels", level);

    const levels = await getLevels();  
    const addedLevel = await fmtFunctions.formatLevel(addedData); 
    localStorage.setItem('levels', JSON.stringify([...levels, addedLevel])); 
}; 

export const updateLevel = async (levelData) => { 
    const { levelID, marriages, ...rest } = levelData;    
    const updatedData = await upsertData("levels", { ...rest }, "level_id", levelID); 

    const levels = await getLevels();  
    const updatedLevel = await fmtFunctions.formatLevel(updatedData, marriages); 
    const updatedLevels = levels.map((lvl) => lvl.levelID === levelID ? updatedLevel : lvl); 
    localStorage.setItem('levels', JSON.stringify(updatedLevels)); 
};  

export const deleteLevels = async (levelIDs) => { 
    await deleteData("levels", "level_id", levelIDs);
    const levels = await getLevels();
    const updatedLevels = levels.filter((lvl) => !levelIDs.includes(lvl.levelID));  
    localStorage.setItem('levels', JSON.stringify(updatedLevels));   
};
   


export const getMarriages = async () => { 
    try {  
        const { data, error } = await supabase.from('marriages').select('*');
        if (error) throw new Error('Error occurred while getting marriages');   

        const fmtedMarriages = await Promise.all(data.map((marr) => fmtFunctions.formatMarriage(marr)));  
        return fmtedMarriages;   
    } catch (error) {  
        return [];
    }  
};
 
export const addMarriage = async (marriageData) => {   
    const marriage = {
        level_id: marriageData.levelID, 
        spouse_x_distance: marriageData.spouseXDist ?? SPOUSE_X_DISTANCE,
    };   
    const addedData = await upsertData("marriages", marriage);

    const levels = await getLevels();
    const addedMarriage = await fmtFunctions.formatMarriage(addedData);   
    const updatedLvls = levels
        .map((lvl) => lvl.levelID === addedMarriage.levelID 
            ? { ...lvl, marriages: [...lvl.marriages, addedMarriage] } 
            : lvl
        );  

    localStorage.setItem('levels', JSON.stringify(updatedLvls));
    return addedMarriage.marriageID; 
};

export const updateMarriage = async (marriageData) => { 
    const { marriageID, ...rest } = marriageData;   
    const updatedData = await upsertData("marriages", { ...rest }, "marriage_id", marriageID);;

    const updatedMarriage = await fmtFunctions.formatMarriage(updatedData); 
    const levels = await getLevels();
    const updatedLvls = levels
        .map((lvl) => lvl.levelID === updatedMarriage.levelID 
            ? { 
                ...lvl, 
                marriages: lvl.marriages
                    .map((marr) => marr.marriageID === updatedMarriage.marriageID ? updatedMarriage : marr) 
            }  
            : lvl
        );  
    localStorage.setItem('levels', JSON.stringify(updatedLvls));
};

export const deleteMarriages = async (marriageIDs, levelID) => {  
    await deleteData("marriages", "marriage_id", marriageIDs);
    const levels = await getLevels(); 
    const updatedLevels = levels
        .map((lvl) => lvl.levelID === levelID 
            ? { 
                ...lvl, 
                marriages: lvl.marriages.filter((marr) => !marriageIDs.includes(marr.marriageID)) 
            } 
            : lvl
        );   
    localStorage.setItem('levels', JSON.stringify(updatedLevels));   
};
  
// returns most up-to-date data related to family tree
export const getTreeData = async () => {
    // remove cached values for keys to force re-fetching from database
    const keysToRemove = ["family_members", "levels", "marriages"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    const [members, levels] = await Promise.all([  
        getTreeMembers(),
        getLevels(), 
    ]);  
    return { members: members, levels: levels }; 
};

 
 
const getAllergies = async () => {
    try { 
        const { data: allergies, allergiesError } = await supabase.from('allergies').select('*');
        if (allergiesError) throw new Error('Error occurred while getting allergies');   
        const fmtedAllergies = allergies.map((allergy) => fmtFunctions.formatAllergy(allergy)); 
        return fmtedAllergies;
    } catch (error) { 
        return [];
    }   
};  
 
export const addAllergies = async (allergies) => {
    const addedAllergies = await Promise.all( 
        allergies.map(async (allergy) => {  
            const { allergyID, memberID, name, isCustom, isDrug } = allergy;  
            const allergyData = { 
                member_id: memberID,
                name: name,
                is_custom: isCustom,
                is_drug: isDrug
            }; 
            if (allergyID) allergyData.allergy_id = allergyID; 
            const upsertedData = await upsertData("allergies", allergyData, "allergy_id", allergyID);  
            return fmtFunctions.formatAllergy(upsertedData);
        })
    );  
    return addedAllergies;  
};
  


export const addProfilePicture = async (file) => {      
    const picPath = `profile_pictures/${ Date.now() + "-" + file.name }`
    const { error } = await supabase.storage
        .from('uploads') 
        .upload(picPath, file, { upsert: false }); 
 
    if (error) throw new Error('Error occurred while adding profile picture');
    return picPath;
};

export const deleteProfilePicture = async (pathName) => {  
    const { error } = await supabase.storage
        .from('uploads')
        .remove([pathName]); 
    if (error) throw new Error('Error occurred while deleting profile picture'); 
};

// returns most recent profile picture for main user to be used in Topbar
export const getMainUserPicture = async () => {
    try {
        const mainUserPic = localStorage.getItem('mainUserPic');
        if (mainUserPic) return mainUserPic;

        const profiles = await searchProfiles("memberID", MAIN_USER_ID);  
        const picturePath =  profiles.length === 1 ? profiles[0]?.fullPicturePath : null;
        localStorage.setItem('mainUserPic', picturePath);    
        return picturePath;
    } catch (error) {  
        return null;
    } 
};



export const getProfiles = async () => {
    try {
        const profiles = JSON.parse(localStorage.getItem('profiles'));
        if (profiles) return profiles;   

        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw new Error('Error occurred while getting profiles');  
 
        const allergies = await getAllergies();
        const fmtedProfiles = await Promise.all( 
            data.map(async (profile) => { 
                const profileAllergies = allergies
                    .filter((allergy) => allergy.memberID === profile.member_id); 

                return await fmtFunctions.formatProfile(profile, profileAllergies);
            })
        );  

        localStorage.setItem('profiles', JSON.stringify(fmtedProfiles));  
        return fmtedProfiles;  
    } catch (error) { 
        return [];
    }   
};

export const searchProfiles = async (column, value) => {
    const profiles = await getProfiles(); 
    return searchTable(profiles, column, value);    
};

// updates member's allergies by adding new allergies & deleting removed allergies
const updateProfileAllergies = async (profile) => {  
    const allergyIDsToAdd = profile.newAllergies
        .filter((allergy) => allergy.allergyID !== undefined) 
        .map((allergy) => allergy.allergyID);   
        
    const allergyIDsToDel = profile.oldAllergies
        .filter((oldAllergy) => !allergyIDsToAdd.includes(oldAllergy.allergyID))
        .map((allergy) => allergy.allergyID);  

    await deleteData("allergies", "allergy_id", allergyIDsToDel);
    const profileAllergies = await addAllergies(profile.newAllergies);
    return profileAllergies;  
};

export const addProfile = async (profileData) => { 
    const { 
        profileID, 
        memberID, 
        firstName, 
        lastName, 
        usesMetric, 
        picturePath, 
        pictureType, 
        newAllergies, 
        oldAllergies,
        pictureURL, 
        ...rest 
    } = profileData;
    
    const profile = {
        member_id: memberID,
        first_name: firstName,
        last_name: lastName, 
        uses_metric: usesMetric, 
        picture_path: picturePath,
        picture_type: pictureType,
        ...rest
    }; 
     
    let profileAllergies = [];
    if (oldAllergies !== undefined && newAllergies !== undefined) { 
        profileAllergies = await updateProfileAllergies(profileData);
    } 
  
    const upsertedData = await upsertData("profiles", profile, "profile_id", profileID); 
    const profiles = await getProfiles();  
    const addedProfile = await fmtFunctions.formatProfile(upsertedData, profileAllergies); 
    const updatedProfiles = profileID 
        ? profiles.map((profile) => profile.profileID === profileID ? addedProfile : profile)
        : [...profiles, addedProfile];  

    localStorage.setItem('profiles', JSON.stringify(updatedProfiles)); 
    if (addedProfile.memberID === MAIN_USER_ID) {
        // immediately update topbar's profile picture for main user
        localStorage.setItem('mainUserPic', addedProfile.fullPicturePath);
    }

    // update profile picture for `member` in visits
    const visits = await getVisits();
    const updatedVisits = visits
        .map((visit) => visit.member.memberID === addedProfile.memberID 
            ? { ...visit, member: addedProfile } : visit
        );  
    localStorage.setItem('visits', JSON.stringify(updatedVisits)); 
};



export const getRecords = async () => { 
    try {
        const records = JSON.parse(localStorage.getItem('records'));
        if (records) return records;   
        
        const { data, error } = await supabase.from('records').select('*');
        if (error) throw new Error('Error occurred while getting records');   

        const fmtedRecords = data.map((record, index) => fmtFunctions.formatRecord(record, index)); 
        const orderedRecords = sortDatesAsc(fmtedRecords, "date"); 
        localStorage.setItem('records', JSON.stringify(orderedRecords));   
        return fmtedRecords;  
    } catch (error) { 
        return [];
    }  
}; 

export const searchRecords = async (column, value) => { 
    const records = await getRecords();  
    const matchingRecords = searchTable(records, column, value);
    return fmtFunctions.organizeRecordsByType(matchingRecords); 
};

export const addRecord = async (recordData) => { 
    const { recordID, memberID, ...rest } = recordData; 
    const record = { member_id: memberID, ...rest };  
 
    const upsertedData = await upsertData("records", record, "record_id", recordID);
    const records = await getRecords(); 
    const addedRecord = fmtFunctions.formatRecord(upsertedData, records.length);
    const updatedRecords = recordID 
        ? records.map((record) => record.recordID === recordID ? addedRecord : record)
        : [...records, addedRecord];  
    const orderedRecords = sortDatesAsc(updatedRecords, "date");
    localStorage.setItem("records", JSON.stringify(orderedRecords));  
};

export const deleteRecords = async (recordIDs) => {  
    await deleteData("records", "record_id", recordIDs);
    const records = await getRecords();
    const updatedRecords = records.filter((record) => !recordIDs.includes(record.recordID));  
    localStorage.setItem('records', JSON.stringify(updatedRecords));   
};



export const getProviders = async () => {
    try {
        const providers = JSON.parse(localStorage.getItem('providers'));
        if (providers) return providers;   
        
        const { data, error } = await supabase.from('providers').select('*');
        if (error) throw new Error('Error occurred while getting providers');   

        const fmtedProviders = data.map((provider) => fmtFunctions.formatProvider(provider)); 
        localStorage.setItem('providers', JSON.stringify(fmtedProviders));    
        return fmtedProviders;  
    } catch (error) { 
        return [];
    }   
};

export const searchProviders = async (column, value) => {
    const providers = await getProviders(); 
    return searchTable(providers, column, value);    
};

export const addProvider = async (providerData) => {
    const { providerID, memberID, picturePath, ...rest } = providerData;   
    const provider = {
        member_id: memberID,
        picture_path: picturePath,
        ...rest
    };  

    const upsertedData = await upsertData("providers", provider, "provider_id", providerID); 
    const providers = await getProviders();
    const addedProvider = await fmtFunctions.formatProvider(upsertedData); 

    const updatedProviders = providerID 
        ? providers.map((prov) => prov.providerID === providerID ? addedProvider : prov)
        : [...providers, addedProvider];   
        
    localStorage.setItem('providers', JSON.stringify(updatedProviders));     
};

export const deleteProvider = async (providerID) => {  
    await deleteData("providers", "provider_id", [providerID]);
    const providers = await getProviders();
    const updatedProviders = providers.filter((prov) => prov.providerID !== providerID);  
    localStorage.setItem('providers', JSON.stringify(updatedProviders));      
};

export const getPersonnel = async (memberID = null) => { 
    const [members, providers] = await Promise.all([
        getProfiles(),
        memberID === null ? getProviders() : searchProviders("memberID", Number(memberID))
    ]); 
    return{ members: members, providers: providers };
};


export const getMeds = async () => {
    try {
        const meds = JSON.parse(localStorage.getItem('meds'));
        if (meds) return meds;   
        
        const { data, error } = await supabase.from('medications').select('*');
        if (error) throw new Error('Error occurred while getting medication');  

        const fmtedMeds = await Promise.all(data.map((med, index) => fmtFunctions.formatMed(med, index))); 
        localStorage.setItem('meds', JSON.stringify(fmtedMeds));    
        return fmtedMeds;
    } catch (error) { 
        return [];
    }  
};

export const searchMeds = async (column, value) => {
    const meds = await getMeds(); 
    return searchTable(meds, column, value);  
};

export const addMed = async (medData) => {
    const { medID, memberID, providerID, picturePath, ...rest } = medData; 
    const med = {
        member_id: memberID,
        provider_id: providerID,
        picture_path: picturePath,
        ...rest
    };   

    const upsertedData = await upsertData("medications", med, "med_id", medID);
    const meds = await getMeds(); 
    const addedMed = await fmtFunctions.formatMed(upsertedData, meds.length);
    const updatedMeds = medID 
        ? meds.map((med) => med.medID === medID ? addedMed : med)
        : [...meds, addedMed];   

    localStorage.setItem('meds', JSON.stringify(updatedMeds));   
};

export const deleteMeds = async (medIDs) => { 
    await deleteData("medications", "med_id", medIDs);
    const meds = await getMeds();
    const updatedMeds = meds.filter((med) => !medIDs.includes(med.medID));  
    localStorage.setItem('meds', JSON.stringify(updatedMeds));   
};


const getMeasurements = async () => {
    const { data: msmts, msmtsError } = await supabase.from('measurements').select('*');
    if (msmtsError) throw new Error('Error occurred while getting measurements');    
    return msmts.map((msmt, index) => fmtFunctions.formatMsmt(msmt, index));
};

export const addMeasurement = async (msmtData, condition) => {
    const { measurementID, conditionID, ...rest } = msmtData; 
    const msmt = { condition_id: conditionID, ...rest };   

    const upsertedData = await upsertData("measurements", msmt, "measurement_id", measurementID);
    const conditions = await getConditions();
    const condMsmts = condition.measurements;
    const addedMsmt = fmtFunctions.formatMsmt(upsertedData, condMsmts?.length);

    // update measurements for current condition
    const updatedMsmts = measurementID 
        ? condMsmts.map((msmt) => msmt.measurementID === measurementID ? addedMsmt : msmt)
        : [...condMsmts, addedMsmt];  

    const updatedConditions = conditions.map((cond) => cond.conditionID === conditionID 
        ? { ...cond, measurements: updatedMsmts} 
        : cond);   

    localStorage.setItem('conditions', JSON.stringify(updatedConditions));       
};

export const deleteMeasurements = async (msmtIDs, condition) => { 
    await deleteData("measurements", "measurement_id", msmtIDs);
    const conditions = await getConditions(); 
    const updatedMsmts = condition.measurements.filter((msmt) => !msmtIDs.includes(msmt.measurementID));  
    const updatedConditions = conditions.map((cond) => cond.conditionID === condition.conditionID 
        ? { ...cond, measurements: updatedMsmts} 
        : cond
    );   

    localStorage.setItem('conditions', JSON.stringify(updatedConditions));     
};



const getConditionMedIDs = async () => {
    const { data, error } = await supabase.from('condition_medications').select('*');
    if (error) throw new Error('Error occurred while getting condition meds');
    return data;
};

const getConditionProviderIDs = async () => {
    const { data, error } = await supabase.from('condition_providers').select('*');
    if (error) throw new Error('Error occurred while getting condition providers'); 
    return data;
};

// returns true if two arrays contain the same elements, regardless of order
function areArraysEqualUnordered(arr1, arr2) {
    if (!arr1 || !arr2) return true;
    if (arr1.length !== arr2.length) return false;

    const countMap = new Map(); 

    // count occurrences in first array
    for (const num of arr1) {
      countMap.set(num, (countMap.get(num) || 0) + 1);
    }
  
    // decrease counts based on second array
    for (const num of arr2) {
      if (!countMap.has(num)) return false;
      countMap.set(num, countMap.get(num) - 1);
      if (countMap.get(num) === 0) countMap.delete(num);
    }
    return countMap.size === 0;
};

// given 2 sets of values, identifies which are present in both arrays & which are missing in either array
// when updating condition's med/providers, determines which values should be added, deleted, or remain unchanged
const sortValues = (oldValues, newValues) => {  
    let toDelete = [], toRemain = [];
    for (const value of oldValues) { 
        if (newValues.includes(value)) {
            toRemain.push(parseInt(value));
        } else {
            toDelete.push(parseInt(value))
        }
    }; 
    const toAdd = newValues.filter((value) => !oldValues.includes(value));
    return {
        toDelete: toDelete,
        toRemain: toRemain,
        toAdd: toAdd
    };
};

// adds new meds & deletes removed meds for specified condition
const updateConditionMeds = async (condition, conditionID) => {     
    const medIDs = sortValues(condition.oldMedIDs, condition.newMedIDs); 
    const condMedIDsToAdd = medIDs.toAdd.map((medID) => ({ condition_id: conditionID, med_id: medID }));  
 
    const { error: insertError } = await supabase
        .from('condition_medications')
        .insert(condMedIDsToAdd);

    if (insertError) throw new Error('Error occurred while adding data'); 
 
    const { error: deleteError } = await supabase
        .from('condition_medications')
        .delete()
        .in('med_id', medIDs.toDelete)
        .eq('condition_id', conditionID); 

    if (deleteError) throw new Error("Error occurred while deleting data"); 
 
    const condMedIDs = [...medIDs.toRemain, ...medIDs.toAdd]; 
    const meds = await getMeds();
    const updatedCondMeds = meds
        .filter((med) => 
            condMedIDs.includes(med.medID) 
            && !medIDs.toDelete.includes(med.medID)
        );
    return updatedCondMeds;
};

// adds new providers & deletes removed providers for specified condition
const updateConditionProviders = async (condition, conditionID) => {
    const providerIDs = sortValues(condition.oldProviderIDs, condition.newProviderIDs); 
    const condProvIDsToAdd = providerIDs.toAdd
        .map((provID) => ({ condition_id: conditionID, provider_id: provID }));
 
    const { error: insertError } = await supabase
            .from('condition_providers')
            .insert(condProvIDsToAdd);

    if (insertError) throw new Error("Error occurred while adding data");

    const { error: deleteError } = await supabase
        .from('condition_providers')
        .delete()
        .in('provider_id', providerIDs.toDelete)
        .eq('condition_id', conditionID); 

    if (deleteError) throw new Error("Error occurred while deleting data"); 

    const providers = await getProviders();
    const condProvIDs = [...providerIDs.toRemain, ...providerIDs.toAdd];  
    const updatedCondProviders = providers
        .filter((provider) => 
            condProvIDs.includes(provider.providerID) 
            && !providerIDs.toDelete.includes(provider.providerID)
        ); 
    return updatedCondProviders;
};

// returns all conditions, including each condition's measurements, medications & providers
export const getConditions = async () => {
    try {
        const conditions = JSON.parse(localStorage.getItem('conditions'));
        if (conditions) return conditions;  

        const { data, error } = await supabase.from('conditions').select('*');
        if (error) throw new Error('Error occurred while getting condition');  
 
        const allMsmts = await getMeasurements(); 
        const allCondMedIDs = await getConditionMedIDs();
        const allCondProvIDs = await getConditionProviderIDs();  
        const meds = await getMeds(); 
        const providers = await getProviders();

        const fmtedConditions = data.map(cond => { 
            const condMsmts = allMsmts
                .filter((msmt) => msmt.conditionID === cond.condition_id);

            const condMedIDs = allCondMedIDs  
                .filter((condMedID) => condMedID.condition_id === cond.condition_id)
                .map((condMedID) => condMedID.med_id);

            const condMeds = meds  
                .filter((med) => condMedIDs.includes(med.medID));

            const condProviderIDs = allCondProvIDs  
                .filter((condProvID) => condProvID.condition_id === cond.condition_id)
                .map((condProvID) => condProvID.provider_id);

            const condProviders = providers  
                .filter((prov) => condProviderIDs.includes(prov.providerID));
       
            return fmtFunctions.formatCondition(cond, condMsmts, condMeds, condProviders);
        }); 

        localStorage.setItem('conditions', JSON.stringify(fmtedConditions));     
        return fmtedConditions;
    } catch (error) { 
        return [];
    }  
};

export const searchConditions = async (column, value) => {  
    const conditions = await getConditions();  
    return searchTable(conditions, column, value); 
}; 
 
export const addCondition = async (conditionData) => {    
    const { 
        conditionID, 
        memberID, 
        pinned, 
        oldMedIDs,
        newMedIDs, 
        oldProviderIDs, 
        newProviderIDs, 
        measurements, 
        medications, 
        providers, 
        ...rest 
    } = conditionData; 

    const condition = {
        member_id: memberID,
        is_pinned: pinned,
        ...rest
    };    
    const upsertedData = await upsertData("conditions", condition, "condition_id", conditionID);

    const condMeds = !areArraysEqualUnordered(oldMedIDs, newMedIDs) 
        ? await updateConditionMeds(conditionData, upsertedData.condition_id) 
        : medications;

    const condProviders = !areArraysEqualUnordered(oldProviderIDs, newProviderIDs) 
        ? await updateConditionProviders(conditionData, upsertedData.condition_id) 
        : providers;

    const conditions = await getConditions();
    const updatedCondition = fmtFunctions.formatCondition(
        upsertedData,
        measurements ?? [],
        condMeds ?? [],
        condProviders ?? []
    ); 

    const updatedConditions = conditionID 
        ? conditions.map((cond) => cond.conditionID === conditionID ? updatedCondition : cond)
        : [...conditions, updatedCondition];   
 
    localStorage.setItem('conditions', JSON.stringify(updatedConditions));   
};

export const deleteConditions = async (conditionIDs) => { 
    await deleteData("conditions", "condition_id", conditionIDs);
    const conditions = await getConditions();
    const updatedConditions = conditions.filter((cond) => !conditionIDs.includes(cond.conditionID));  
    localStorage.setItem('conditions', JSON.stringify(updatedConditions));   
}; 



export const getEvents = async () => {
    try {
        const events = JSON.parse(localStorage.getItem('events'));
        if (events) return events;   
        
        const { data, error } = await supabase.from('events').select('*');
        if (error) throw new Error('Error occurred while getting visits');  

        const fmtedEvents = await Promise.all(
            data.map((event, index) => fmtFunctions.formatEvent(event, index))
        ); 
        localStorage.setItem('events', JSON.stringify(fmtedEvents));  
        return fmtedEvents;
    } catch (error) { 
        return [];
    }    
};

export const addEvent = async (eventData) => {
    const { eventID, providerID, ...rest } = eventData; 
    const event = { provider_id: providerID, ...rest }; 
    const upsertedData = await upsertData("events", event, "event_id", eventID);

    const events = await getEvents();
    const addedEvent = await fmtFunctions.formatEvent(upsertedData, events.length);
    const updatedEvents = eventID 
        ? events.map((event) => event.eventID === eventID ? addedEvent : event)
        : [...events, addedEvent];   

    localStorage.setItem('events', JSON.stringify(updatedEvents));    
};

export const deleteEvent = async (eventID) => { 
    await deleteData("events", "event_id", [eventID]);
    const events = await getEvents();
    const updatedEvents = events.filter((event) => event.eventID !== eventID);  
    localStorage.setItem('events', JSON.stringify(updatedEvents));    
};



// returns map of folderIDs to number of visits for each folder
const countFolderVisits = (visits) => { 
    return visits.reduce((accumulator, visit) => {
        const { folderID } = visit;
        if (!accumulator[folderID]) accumulator[folderID] = 0; 
        accumulator[folderID]++;
        return accumulator;
    }, {});  
};

// map of folderIDs to number of direct sub-folders for each folder
const countFolderSubFolders = (folders) => {  
    return folders.reduce((accumulator, folder) => {
        const { parentID } = folder;
        if (!accumulator[parentID]) accumulator[parentID] = 0; 
        accumulator[parentID]++;
        return accumulator;
    }, {}); 
};

export const getFolders = async () => {
    try {   
        const folders = JSON.parse(localStorage.getItem('visit_folders'));
        if (folders) return folders; 
         
        const { data, error } = await supabase.from('visit_folders').select('*');
        if (error) throw new Error('Error occurred while getting folders'); 
 
        const fmtedFolders = data.map((folder, index) => fmtFunctions.formatFolder(folder, index)); 
        localStorage.setItem('visit_folders', JSON.stringify(fmtedFolders));    
        return fmtedFolders;
    } catch (error) {  
        return [];
    }     
}; 

export const addFolder = async (folderData) => {
    const { folderID, parentID, name } = folderData; 
    const folder = { parent_id: parentID, name: name };  
    const upsertedData = await upsertData("visit_folders", folder, "folder_id", folderID);

    const folders = await getFolders();
    const addedFolder = fmtFunctions.formatFolder(upsertedData, folders.length);  
    const updatedFolders = folderID 
        ? folders.map((folder) => folder.folderID === folderID ? addedFolder : folder)
        : [...folders, addedFolder];  

    localStorage.setItem('visit_folders', JSON.stringify(updatedFolders));    
    return addedFolder.folderID;  
};

export const deleteFolder = async (folderID) => { 
    await deleteData("visit_folders", "folder_id", [folderID]); 
    const folders = await getFolders();
    const updatedFolders = folders.filter((folder) => folder.folderID !== folderID);  
    localStorage.setItem('visit_folders', JSON.stringify(updatedFolders));   

    const visits = await getVisits(); 
    const updatedVisits = visits.filter((visit) => visit.folderID !== folderID); 
    localStorage.setItem("visits", JSON.stringify(updatedVisits));
};



export const getFileURL = async (filePath) => {
    const { data } = supabase
        .storage
        .from('uploads')
        .getPublicUrl(filePath);

    return !data.publicUrl ? '' : data.publicUrl;
};

export const getVisitFiles = async () => {
    const { data, error } = await supabase.from('visit_files').select('*');
    if (error) throw new Error('Error occurred while getting visit files');  

    const fmtedFiles = await Promise.all(
        data.map((file, index) => fmtFunctions.formatVisitFile(file, index)) 
    );   
    return fmtedFiles; 
};

export const addVisitFile = async (file, visitID) => {  
    if (!(file.type in fileTypesMap)) throw new Error('Invalid file type'); 

    const { name, type, size } = file;
    const fileName = name.slice(0, name.lastIndexOf('.'));
    const currentDate = Date.now();
    const filePath = `visit_files/${ currentDate + "-" + name }`; 

    const fileData = {
        visit_id: visitID, 
        name: fileName,
        mimetype: type,
        size: size,
        date: new Date(currentDate).toISOString().split('T')[0],
        file_path: filePath
    };     

    // add file to storage bucket
    const { error: bucketError } = await supabase.storage
        .from('uploads') 
        .upload(filePath, file, { upsert: false }); 

    if (bucketError) throw new Error('Error occurred while adding file');
 
    // add file metadata to database table    
    const addedData = await upsertData("visit_files", fileData); 
    const visits = await getVisits();  
    const updatedVisits = await Promise.all(
        visits.map(async (visit) => {
            if (visit.visitID === Number(visitID)) {
                const addedFile = await fmtFunctions.formatVisitFile(addedData, visit.files.length); 
                return { ...visit, files: [...visit.files, addedFile] }; 
            }
            return visit;  
        })
    ); 
    localStorage.setItem('visits', JSON.stringify(updatedVisits)); 
}; 

export const deleteVisitFiles = async (fileIDs, allFiles, visitID) => { 
    const filePathsToDel = fileIDs.map((fileID) => {
        const file = allFiles.find((file) => file.fileID === Number(fileID));
        return file?.filePath ?? "";  
    });  

    // delete file from storage bucket
    const { error: bucketError } = await supabase.storage
        .from('uploads')
        .remove(filePathsToDel);
    
    if (bucketError) throw new Error('Error occurred while deleting file');
    
    // delete file's corresponding row from database table 
    await deleteData("visit_files", "file_id", fileIDs);

    const visits = await getVisits(); 
    const updatedVisits = visits
        .map((visit) => visit.visitID === Number(visitID) 
            ? { 
                ...visit, 
                files: visit.files.filter((file) => !fileIDs.includes(file.fileID)) 
            } 
            : visit
        );  
    localStorage.setItem('visits', JSON.stringify(updatedVisits)); 
};



export const getVisits = async () => {
    try {
        const visits = JSON.parse(localStorage.getItem('visits'));
        if (visits) return visits;   
        
        const { data, error } = await supabase.from('visits').select('*');
        if (error) throw new Error('Error occurred while getting visits');  
 
        const fmtedVisits = await Promise.all(
            data.map(async (visit, index) => fmtFunctions.formatVisit(visit, index))
        );  

        const sortedVisits = sortDatesAsc(fmtedVisits, "date"); 
        localStorage.setItem('visits', JSON.stringify(sortedVisits));    
        return sortedVisits;
    } catch (error) {  
        return [];
    }   
};
 
export const searchVisits = async (column, value) => { 
    const visits = await getVisits();  
    return searchTable(visits, column, value);  
};

export const addVisit = async (visitData) => {  
    const { visitID, folderID, memberID, member, providerID, provider, files, ...rest } = visitData;  
    const visit = {
        folder_id: folderID,
        member_id: memberID,
        provider_id: providerID,
        ...rest
    };   
    const upsertedData = await upsertData("visits", visit, "visit_id", visitID); 

    const visits = await getVisits();    
    const addedVisit = await fmtFunctions.formatVisit(
        upsertedData, 
        visits.length, 
        files, 
        visitData.member, 
        visitData.provider
    );    
    const updatedVisits = visitID 
        ? visits.map((visit) => visit.visitID === visitID ? addedVisit : visit)
        : [...visits, addedVisit];   
        
    localStorage.setItem('visits', JSON.stringify(updatedVisits));     
};
 
export const deleteVisits = async (visitIDs) => {  
    await deleteData("visits", "visit_id", visitIDs);
    const visits = await getVisits();
    const updatedFolders = visits.filter((visit) => !visitIDs.includes(visit.visitID));  
    localStorage.setItem('visits', JSON.stringify(updatedFolders)); 
};

// returns all visits & folders (organized into `visit data`) from database
export const getVisitsData = async () => { 
    try {
        const [folders, visits] = await Promise.all([
            getFolders(),
            getVisits()
        ]); 
        const visitsData = {
            folders: folders,
            visits: visits,
            foldersVisitCount: countFolderVisits(visits),
            foldersSubFolderCount: countFolderSubFolders(folders) 
        };  
        return visitsData;
    } catch (error) {
        throw new Error('Error occurred while getting visit data'); 
    }
}; 