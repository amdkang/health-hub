import { MAIN_USER_ID } from "../../constants";  
import { addLevel, addMarriage, addTreeMember, deleteTreeMember, deleteLevels, deleteMarriages, 
    updateTreeMember, updateLevel, updateMarriage, getTreeData } from "../../database/clientServices";
 
/**
 * Defines functions used to position family tree members in relation to each other
 */
 
export const PARENT_CHILD_Y_DISTANCE = 120;
export const SPOUSE_X_DISTANCE = 100; 
export const SIBLING_X_DISTANCE = 170;

export function getMember(memberID, familyMembers) {
    return familyMembers.find(member => member.memberID === memberID);
};

function getLevel(levelID, levels) {
    return levels.find(level => level.levelID === levelID);
}

function getMarriage (marriageID, levels) {
    for (const lvl of levels) {
        const matchingMarr = lvl.marriages.find(marr => marr.marriageID === marriageID);
        if (matchingMarr) return matchingMarr;
    };
    return null;
};

// given memberID, returns that member's spouse, otherwise returns null
function getSpouse(memberID, marriage, familyMembers) { 
    if (marriage.between.length !== 2) return null; 

    if (marriage.between[0] === memberID) {
        return getMember(marriage.between[1], familyMembers);
    } else if (marriage.between[1] === memberID) {
        return getMember(marriage.between[0], familyMembers);
    }
    return null; 
};

function firstSpouseIsMain(marriage, members) {  
    if (marriage.between?.length > 0) {
        const firstSpouse = getMember(marriage.between[0], members);
        return marriage.between.length === 2 && !firstSpouse.isAddOnSpouse; 
    }
    return false;
};

// returns true if member is `main parent` (main user's direct parent or grandparent)
export function isMainParent(memberID, treeData) {
    const user = getMember(MAIN_USER_ID, treeData.members);
    const parentMarr = getMarriage(user.parentMarriage, treeData.levels);
    for (const parentID of parentMarr.between) {
        if (parentID === memberID) return true;
        let parent = getMember(parentID, treeData.members);
        let gparentMarr = getMarriage(parent.parentMarriage, treeData.levels);
        if (gparentMarr) {
            for (const gparentID of gparentMarr.between) {
                if (gparentID === memberID) return true;
            }
        }
    };
    return false;
};

// create/adds parent member to existing child member  
export async function addParent(newParent, childID, treeData) {  
    let child = getMember(childID, treeData.members); 

    if (child.level === -3) throw new Error("Cannot add members beyond this level");
    if (child.isAddOnSpouse) throw new Error("Cannot add parents to this member");

    // make parent level if non-existent
    let parentLvl = getLevel(child.level-1, treeData.levels);
    if (!parentLvl) {
        parentLvl = { levelID: child.level-1 }; 
        await addLevel(parentLvl); 
    }

    // make/set parent marriage if non-existent 
    let parentMarr =  getMarriage(child.parentMarriage, treeData.levels);
    if (!parentMarr) {
        parentMarr = { levelID: parentLvl.levelID };  
        const parentMarrID = await addMarriage(parentMarr); 
        parentMarr.marriageID = parentMarrID;
        child.parentMarriage = parentMarrID; 
        await updateTreeMember({ memberID: childID, parent_marriage: parentMarrID }); 
    }  

    let parent = { level: parentLvl.levelID, ...newParent }; 
    parent.marriage = parentMarr.marriageID;  

    // set new parent's add-on spouse attribute 
    parent.isAddOnSpouse = parent.level >= 0 && firstSpouseIsMain(parentMarr, treeData.members); 

    // auto-create grandparent marriage/level if non-existent 
    if (parent.level > -3) await addDefaultParent(parent, treeData);  

    await addTreeMember(parent); 
}; 

// create/adds spouse to existing member 
export async function addSpouse(newSpouseData, oldSpouseID, treeData) { 
    let oldSpouse = getMember(oldSpouseID, treeData.members);  
    let marriage = getMarriage(oldSpouse.marriage, treeData.levels);  

    if (oldSpouse.isAddOnSpouse || marriage?.between.length === 2) {  
        throw new Error("Cannot add spouse to this member");
    };

    // make/set spouse marriage if non-existent 
    if (!marriage) {
        marriage = { levelID: oldSpouse.level }; 
        const spouseMarrID = await addMarriage(marriage); 
        oldSpouse.marriage = spouseMarrID;  
        await updateTreeMember({ memberID: oldSpouseID, marriage: spouseMarrID }); 
    }

    let newSpouse = { level: oldSpouse.level, marriage: oldSpouse.marriage, ...newSpouseData };  

    if (!isMainParent(oldSpouseID, treeData)) {
        newSpouse.isAddOnSpouse = true;
    } else { 
        // auto-create parent marriage/level if newly added spouse is a `main parent`  
        await addDefaultParent(newSpouse, treeData); 
    }

    await addTreeMember(newSpouse); 
};

// empty parent marriage is automataically created for `main` parent members
// used for main user's direct parents ~ great-grandparents (tree levels -1 ~ -3)
// necessary since marriages' children are used to position tree members
async function addDefaultParent(child, treeData) {
    let parentLvl = getLevel(child.level-1, treeData.levels);   
    if (!parentLvl) { 
        parentLvl = { levelID: child.level-1 };  
        await addLevel(parentLvl); 
    }    

    let parentMarr = getMarriage(child.parentMarriage, treeData.levels);
    if (!parentMarr) {
        parentMarr = { levelID: parentLvl.levelID };  
        const parentMarrID = await addMarriage(parentMarr); 
        child.parentMarriage = parentMarrID; 
    } 
};
 
// create/adds child member to existing parent member 
export async function addChild(newChildData, parentID, treeData) { 
    let parent = getMember(parentID, treeData.members);   
    if (parent.level === -3 || parent.level === 3) {
        throw new Error("Cannot add children to this member");
    }

    // make child level if non-existent 
    let childLvl = getLevel(parent.level + 1, treeData.levels);  
    if (!childLvl) {  
        childLvl = { levelID: parent.level + 1 };  
        await addLevel(childLvl); 
    } 

    // make parent marriage if non-existent 
    let parentMarr = getMarriage(parent.marriage, treeData.levels);  
    if (!parentMarr) {  
        parentMarr = { levelID: parent.level };  
        const parentMarrID = await addMarriage(parentMarr); 
        parent.marriage = parentMarrID;
        await updateTreeMember({ memberID: parent.memberID, marriage: parentMarrID }); 
    }  
    const child = { 
        level: childLvl.levelID, 
        parentMarriage: parent.marriage, 
        ...newChildData
    };  
    await addTreeMember(child); 
};

// create/adds sibling to existing member  
export async function addSibling(newSiblingData, oldSiblingID, treeData) {
    let oldSibling = getMember(oldSiblingID, treeData.members); 
    if (oldSibling.level <= -2 || oldSibling.isAddOnSpouse) { 
        throw new Error("Cannot add siblings to this member");
    }  

    let newSibling = { level: oldSibling.level, ...newSiblingData };
    let parentMarr = getMarriage(oldSibling.parentMarriage, treeData.levels);
    if (parentMarr.children.length === 5) {
        throw new Error("Limit of 5 children per marriage")
    }
    newSibling.parentMarriage = parentMarr.marriageID;
    await addTreeMember(newSibling); 
};

// returns true if both spouses in `marriage` each have 2 parents
function areSpouseParentsFull(marriage, treeData) {
    if (marriage.between.length < 2) return false;

    let parentsCount = 0;
    marriage.between.forEach(spouseID => {
        const spouse = getMember(spouseID, treeData.members);
        const parentMarr = getMarriage(spouse.parentMarriage, treeData.levels);
        if (parentMarr) parentsCount += parentMarr.between.length;
    });
    return parentsCount === 4;
};

// updates spouse distance for all non-empty marriages in given level
async function adjustSpouseXDist(levelID, newDistance, treeData) {
    const lvl = getLevel(levelID, treeData.levels);
    if (lvl) {
        await Promise.all(
            lvl.marriages.map(async (marr) => {
                if (
                    marr.between.length > 0 
                    && isMainParent(marr.between[0], treeData)
                    && marr.spouseXDist !== newDistance
                ) {   
                    marr.spouseXDist = newDistance; 
                    await updateMarriage({ marriageID: marr.marriageID, spouse_x_distance: newDistance });
                }
        }));  
    };
};

// adjust level to prevent overlap between sibling nodes
async function checkChildOverflow(treeData) {  
    // sort levels descending to start checking overflow from bottom levels/youngest members 
    treeData.levels.sort((lvl1, lvl2) => lvl2.levelID - lvl1.levelID); 

    treeData.levels.forEach(lvl => {
        if (lvl.levelID > -3) { 
            lvl.marriages.forEach(async (marr) => {  
                const childOverflow = marr.between.length > 0 && marr.children.length > lvl.maxChildren; 
                if (childOverflow) {  
                    const lvlBelow = getLevel(lvl.levelID + 1, treeData.levels);  
                    lvl.siblingXDist = lvl.siblingXDist + lvlBelow.siblingXDist/2;  
                    const updatedLevel = { 
                        levelID: lvl.levelID, 
                        max_children: ++lvl.maxChildren, 
                        sibling_x_distance: lvl.siblingXDist
                    };
                    await updateLevel(updatedLevel);
                };
            });
        };
    });
};

function getMidChildIndex(marriage) {
    const childCount = marriage.children.length; 
    let midChildIndex = Math.floor(childCount/2);
    if (childCount % 2 === 0) midChildIndex -= 1;
    return midChildIndex;
};

function getElementIndex(elementID, elements) {
    for (let i = 0; i < elements.length; i++) {
        if (elements[i] === elementID) return i;
    }
    return -1;
};

// positions `newMidChildID` at center of given marriage's children
// only used for main user/their siblings & main user's single parent/their siblings
function orderChildren(marriage, newMidChildID) { 
    const midChildIndex = getMidChildIndex(marriage);
    const originalMidChild = marriage.children[midChildIndex];
    const swapIndex = getElementIndex(newMidChildID, marriage.children);
    marriage.children[midChildIndex] = newMidChildID;
    marriage.children[swapIndex] = originalMidChild;
};

// positions children in given marriage based on number/position of parents
function positionChildren(marriage, level, treeData) {  
    const midChildIndex = getMidChildIndex(marriage); 
    const midChild = getMember(marriage.children[midChildIndex], treeData.members); 
    let midpointX= 0;

    // position middle child
    if (midChild.memberID !== 1) { // main user always at (0,0)
        const parent1 = getMember(marriage.between[0], treeData.members); 
        if (parent1) {
            //1 parent -> use single parent as midpoint
            midpointX = parent1.coords.x; 

            //2 parents -> use midpoint between parents
            if (marriage.between.length === 2) { 
                let parent2 = getMember(marriage.between[1], treeData.members); 
                midpointX = (parent1.coords.x + parent2.coords.x) / 2;
            };

            // odd # children -> keep same midpoint from above
            // even # children -> use midpoint between middle two children
            if (marriage.children.length % 2 === 0) midpointX -= level.siblingXDist / 2; 
            midChild.coords = { x: midpointX, y: parent1.coords.y + PARENT_CHILD_Y_DISTANCE }
        }
    }
    positionChildSiblings(midChildIndex, marriage, level, treeData);
};

// positions siblings around middle child in given marriage
function positionChildSiblings(midChildIndex, marriage, level, treeData) {  
    let midChild = getMember(marriage.children[midChildIndex], treeData.members);

    for (let i = 0; i < marriage.children.length; i++) { 
        // calculate each sibling's distance from middle child
        let xOffset = Math.abs(midChildIndex - i) * level.siblingXDist;  
        if (i < midChildIndex) xOffset *= -1;  

        // set coordinates for siblings & their spouses/children
        let sibling = getMember(marriage.children[i], treeData.members);     
        if (sibling.memberID !== midChild.memberID) {
            sibling.coords = { 
                x: midChild.coords.x + xOffset, 
                y: midChild.coords.y 
            };
        }

        let siblingMarr = getMarriage(sibling.marriage, treeData.levels);   
        if (siblingMarr) {
            const spouse = getSpouse(sibling.memberID, siblingMarr, treeData.members);
            if (spouse) {  
                spouse.coords = {
                    x: sibling.coords.x + siblingMarr.spouseXDist,
                    y: sibling.coords.y
                }; 
            }    
            if (siblingMarr.children.length > 0 ) { 
                const siblingChildLvl = getLevel(siblingMarr.levelID + 1, treeData.levels);
                if (siblingChildLvl) positionChildren(siblingMarr, siblingChildLvl, treeData);
            }
        }
    }
};
  

// positions spouses for a given marriage
function positionParents(marriage, level, treeData) {  
    // use middle child's coordinates to position parents
    const midChildIndex = getMidChildIndex(marriage);
    const midChildID = marriage.children[midChildIndex];
    const midChild = getMember(midChildID, treeData.members); 
    const childLvl = getLevel(midChild.level, treeData.levels); 
    const midpointX = marriage.children.length % 2 === 0 
        ? midChild.coords.x + childLvl.siblingXDist / 2 
        : midChild.coords.x
    ; 

    // order parents amongst their siblings 
    if (marriage.between.length > 0) { 
        const parent1 = getMember(marriage.between[0], treeData.members);
        if (parent1) {
            parent1.coords = {
                x: midpointX,
                y: midChild.coords.y - PARENT_CHILD_Y_DISTANCE
            };

            // 1 parent -> set single parent as middle child amongst their siblings 
            if (marriage.between.length === 1) { 
                const gparentMarr = getMarriage(parent1.parentMarriage, treeData.levels);
                if (gparentMarr) orderChildren(gparentMarr, parent1.memberID); 
            } else if (marriage.between.length === 2) {
                // 2 parents -> position left & right parent at the far end amongst their siblings
                const parent2 = getMember(marriage.between[1], treeData.members);
                parent1.coords.x -= marriage.spouseXDist/2;
                parent2.coords = {
                    x: midpointX + marriage.spouseXDist/2,
                    y: parent1.coords.y
                };
                orderMainParents(marriage, treeData);
            }   
        }
    };

    // position each parent's siblings/parents
    marriage.between.forEach(parentID => {
        let parent = getMember(parentID, treeData.members); 
        let gparentMarriage = getMarriage(parent.parentMarriage, treeData.levels);  
        if (gparentMarriage) {
            if (gparentMarriage.children.length > 1) {
                positionParentSiblings(parent, gparentMarriage, level, treeData);
            }
            positionParents(gparentMarriage, level, treeData);
        } 
    });
};

// positions main user's parents amongst their siblings 
function positionParentSiblings(parent, gparentMarr, level, treeData) {  
    let parentIndex = getElementIndex(parent.memberID, gparentMarr.children);

    for (let i = 0; i < gparentMarr.children.length; i++) { 
        if (i !== parentIndex) { 
            // calculate distance from middle sibling
            let xOffset = Math.abs(parentIndex - i) * level.siblingXDist;
            if (i < parentIndex) xOffset *= -1;

            // set coordinates for unpositioned sibling
            const parentSibling = getMember(gparentMarr.children[i], treeData.members);
            parentSibling.coords = {
                x: parent.coords.x + xOffset,
                y: parent.coords.y
            };

            // position sibling & their spouse/children
            const siblingMarr = getMarriage(parentSibling.marriage, treeData.levels);
            if (siblingMarr) {
                const spouse = getSpouse(parentSibling.memberID, siblingMarr, treeData.members);
                if (spouse && spouse.isAddOnSpouse) {  
                    spouse.coords = {
                        x: parentSibling.coords.x + siblingMarr.spouseXDist,
                        y: parentSibling.coords.y
                    };
                } 
                if (siblingMarr.children.length > 0) positionChildren(siblingMarr, level, treeData); 
            }
        }
    }
};

// positions main user's parents at inner-most end of their siblings
function orderMainParents(marriage, treeData) {   
    for (let i = 0; i < marriage.between.length; i++) {
        let spouse = getMember(marriage.between[i], treeData.members); 
        let spouseParentMarr = getMarriage(spouse.parentMarriage, treeData.levels); 
        let spouseIndex = getElementIndex(spouse.memberID, spouseParentMarr.children);

        // left parent = positioned last/right-most amongst siblings
        // right parent = positioned first/left-most amongst siblings
        let switchIndex = i === 0 ? spouseParentMarr.children.length-1 : 0;
        let switchSiblingID = spouseParentMarr.children[switchIndex];
        spouseParentMarr.children[switchIndex] = spouse.memberID;
        spouseParentMarr.children[spouseIndex] = switchSiblingID;
    }
};

// resets each level's `maxChildren` & `siblingXDist` & each marriage's `spouseXDist` to default values
export async function resetTrees (treeData) {  
    await Promise.all(
        treeData.levels.map(async (lvl) => {
            if (lvl.levelID > -3) {  
                await Promise.all(
                    lvl.marriages.map(async (marr) => 
                        updateMarriage({ marriageID: marr.marriageID, spouse_x_distance: SPOUSE_X_DISTANCE })
                    )
                ); 
                const updatedLevel = {
                    levelID: lvl.levelID,
                    max_children: 1,
                    sibling_x_distance: SIBLING_X_DISTANCE
                };  
                await updateLevel(updatedLevel);
            };
        })
    );
    return await getTreeData();
};

export async function positionMembers(treeData) {   
    checkChildOverflow(treeData);
    const user = getMember(MAIN_USER_ID, treeData.members);   
    const userLvl = getLevel(0, treeData.levels);   

    const parentMarriage = getMarriage(user.parentMarriage, treeData.levels); 
    const grandparentsFull = parentMarriage && areSpouseParentsFull(parentMarriage, treeData); 

    // in levels 0 to -2 (main user ~ grandparents), each member can have 1 spouse & 2 parents 
    // adjust spouse distance to ensure no overlap between members
    await adjustSpouseXDist(-1, (grandparentsFull ? 4 : 2) * SPOUSE_X_DISTANCE, treeData);
    await adjustSpouseXDist(-2, 1.5 * SPOUSE_X_DISTANCE, treeData);
    await adjustSpouseXDist(-3, 75, treeData);  
    treeData.members.forEach(member => { 
        member.coords.x = 0;
        member.coords.y = 0;
    });

    orderChildren(parentMarriage, user.memberID); // order main user at center of siblings 
    positionChildren(parentMarriage, userLvl, treeData); // positions main user/siblings/children & lower levels

    // positions main user's parents & upper levels
    if (parentMarriage && parentMarriage.between.length > 0) { 
        const userParentLvl = getLevel(-1, treeData.levels); 
        positionParents(parentMarriage, userParentLvl, treeData); 
    } 

    await Promise.all(
        treeData.members.map(async (member) => {  
            await updateTreeMember({ memberID: member.memberID, x: member.coords.x, y: member.coords.y })
        }) 
    );   
};

// removes target  member from `treeData` and database
async function markMemberToDelete (targetMember, treeData) {
    treeData.members = treeData.members.filter(mem => mem.memberID !== targetMember.memberID);

    // deletes member from parent marriage if marriage exists
    const parentMarr = getMarriage(targetMember.parentMarriage, treeData.levels);
    if (parentMarr) {
        parentMarr.children = parentMarr.children.filter(childID => childID !== targetMember.memberID);
    } 
    await deleteTreeMember(targetMember.memberID); 
};

// deletes empty marriages & levels from `treeData` and database
async function deleteEmpty(treeData) {   
    const lvlsData = treeData.levels.map(lvl => { 
        const marrsToDel = [];
        let marrCount = lvl.marriages.length;
        lvl.marriages.map(async (marr) => { 
            const marrIsEmpty = marr.between.length < 2 && marr.children.length === 0;
            if (marrIsEmpty) { 
                marrsToDel.push(marr.marriageID); 
                marrCount--; 
            };
        });  
        return { levelID: lvl.levelID, marriageCount: marrCount, marriagesToDel: marrsToDel };
    });

    const lvlMemberCounts = treeData.members.reduce((acc, member) => {
        acc[member.level] = (acc[member.level] || 0) + 1;
        return acc;
    }, {});  

    const lvlsToDel = [];
    await Promise.all(
        lvlsData.map(async (lvl) => {  
            const lvlMembers = lvlMemberCounts[lvl.levelID];    
            const lvlIsEmpty = (lvlMembers === 0 || lvlMembers === undefined) && lvl.marriageCount === 0; 
            if (lvlIsEmpty) lvlsToDel.push(lvl.levelID);  
 
            if (lvl.marriagesToDel.length > 0) {
                return deleteMarriages(lvl.marriagesToDel, lvl.levelID);
            }
        })
    );  
    console.log('\nlvlsToDel: ', lvlsToDel);
    if (lvlsToDel.length > 0) await deleteLevels(lvlsToDel); 
};

// deletes member matching memberID & relevant family members
export async function deleteMember(memberID, treeData) {  
    if (memberID === 1) throw new Error("Cannot delete main user");
    if (!isMainParent(memberID, treeData)) {
        await deleteMemberDown(memberID, treeData);
    } else {
        deleteMemberUp(memberID, treeData);
    } 
    await deleteEmpty(treeData);
};

// deletes member matching memberID & add-on spouses/children 
// used for lower tree levels (levelID 0 ~ 3)
async function deleteMemberDown(memberID, treeData) {
    const member = getMember(memberID, treeData.members);
    const marr = getMarriage(member.marriage, treeData.levels);
    if (marr) {
        const spouse = getSpouse(memberID, marr, treeData.members);
        if (member.isAddOnSpouse) {
            // has children -> delete only `add-on` spouse 
            // no children -> also reset remaining `main` spouse's marriage 
            if (marr.children.length === 0) {  
                await updateTreeMember({ memberID: spouse.memberID, marriage: 0 }); 
                spouse.marriage = 0;
                marr.between = [spouse.memberID];
            }
        } else {
            // also delete `main` member's spouse/children
            if (marr.children.length > 0) { 
                marr.children.forEach(childID => deleteMemberDown(childID, treeData));
            }  
            if (spouse) markMemberToDelete(spouse, treeData); 
        }
    }
    markMemberToDelete(member, treeData);
};

// deletes member & add-on spouses/siblings/parents 
// used for upper tree levels (levelID 0 ~ -3)
async function deleteMemberUp(memberID, treeData) {
    const member = getMember(memberID, treeData.members); 
    const marr = getMarriage(member.marriage, treeData.levels); 

    if (marr) {
        //delete member's `add-on` spouse
        const spouse = getSpouse(memberID, marr, treeData.members);
        if (spouse && spouse.isAddOnSpouse) {
            await deleteMemberDown(spouse.memberID, treeData);
        }
    }

    const parentMarr = getMarriage(member.parentMarriage, treeData.levels); 
    if (parentMarr) {
        //delete member's siblings & their spouses/children 
        parentMarr.children.forEach(async (childID) => {
            if (childID !== memberID) await deleteMember(childID, treeData);
        }); 

        //delete member's parents
        parentMarr.between.forEach(async (parentID) => await deleteMemberUp(parentID, treeData));
    }
    await markMemberToDelete(member, treeData);
};