import { Box, useTheme } from "@mui/material";
import { useEffect, memo } from "react";    
import { getMember } from "./treeUtils";
import { splitStringByCharLength } from "../../utils";
import { containerStyles } from "../../styles";
import * as d3 from "d3";

/**
 * Renders the visualization of and sets the functionality for the family tree
 */

export const FamilyTree = memo(({ treeData, onMemberClick }) => {     
    const palette = useTheme().palette; 
    const primaryColor = palette.primary.main;
    const contrastColor = palette.background.contrastText;
    const NODE_RADIUS = 30;
    const NODE_TOP_CONNECTOR_LENGTH = 10;
    const VIEWBOX_PADDING_X = 30;
    const VIEWBOX_PADDING_Y = 50;
    const defaultPicStyles = {
        imgDiameter: 70,
        imgTransform: "(0, 0)",
        textTransform: "(38, 70)"
    };
    const customPicStyles = {
        imgDiameter: 56,
        imgTransform: "(7, 10)",
        textTransform: "(38, 70)"
    };
    const nodeLines = [];

    useEffect(() => { 
        clearTree();
        createNodes();
        positionNodes();
        positionLines();
        drawLines();
        setSVGViewbox(); 
    }, [treeData, palette.mode]); 

    const setSVGViewbox = () => {
        const svg = d3.select("#familyTreeSVG");
        const nodesContainer = svg.select("#nodes-container");
        const parentBBox = nodesContainer.node().getBBox(); 
        const adjustedX = parentBBox.x - VIEWBOX_PADDING_X;
        const adjustedY = parentBBox.y - VIEWBOX_PADDING_Y;
        const adjustedWidth = parentBBox.width + 2 * VIEWBOX_PADDING_X;
        const adjustedHeight = parentBBox.height + 2 * VIEWBOX_PADDING_Y;
        const viewBox = `${adjustedX} ${adjustedY} ${adjustedWidth} ${adjustedHeight}`;
        svg.attr("viewBox", viewBox);
    };

    const clearTree = () => {
        const svg = d3.select("#familyTreeSVG");
        svg.selectAll("*").remove();
    };

    const createNodes = () => { 
        const svg = d3.select("#familyTreeSVG");
        const nodeContainer = svg.append("g").attr("id", "nodes-container");
        
        // create/binds member data to node
        const nodes = nodeContainer.selectAll("g") 
        .data(treeData.members, d => d.memberID ) 
        .enter()
        .append("g")
        .attr("id", d => `g-${ d.memberID }`)
        .attr("transform", `translate(0, 0)`)
        .on("click", function(event, d) {
            const member = getMember(d.memberID, treeData.members);
            onMemberClick(member.profile);
        })
        .on("mouseover", function() {
            // highlights node
            d3.select(this).select("circle").attr("stroke", primaryColor);
            d3.select(this).selectAll("tspan").attr("stroke", primaryColor);
            d3.select(this).selectAll("tspan").attr("fill", primaryColor);
        })
        .on("mouseleave", function() {
            // removes highlight from node
            d3.select(this).select("circle").attr("stroke", contrastColor);
            d3.select(this).selectAll("tspan").attr("stroke", contrastColor);
            d3.select(this).selectAll("tspan").attr("fill", contrastColor);
        })
        .style("cursor", "pointer");

        nodes.each(function (d) {
            const member = getMember(d.memberID, treeData.members).profile;  
            const isCustomSize = member.pictureType === "custom";  
            const imgDiameter = isCustomSize ? customPicStyles.imgDiameter : defaultPicStyles.imgDiameter;
            const imgTransform = isCustomSize ? customPicStyles.imgTransform : defaultPicStyles.imgTransform;
            const textTransform = isCustomSize ? customPicStyles.textTransform : defaultPicStyles.textTransform;
            const splitName = splitStringByCharLength((member.fullName), 15);
            
            // applies border around profile picture
            d3.select(this)
                .append("circle")
                .attr("fill", "none")
                .attr("stroke", contrastColor)
                .attr("stroke-width", 2)
                .attr("r", NODE_RADIUS)
                .attr("id", d => `circle-${ d.memberID }`)
            .attr("transform", `translate(35,38)`);

            // inserts member profile picture
            d3.select(this)
                .append("image")
                .attr("id", d => `image-${ d.memberID }`)
                .attr("href", member.fullPicturePath)
                .attr("width", imgDiameter)
                .attr("height", imgDiameter)
                .attr("transform", `translate${ imgTransform }`)
                .attr("clip-path", "inset(0% round 50%)");
            
            // inserts member name below node
            d3.select(this)
                .append("text")
                .attr("id", d => `text-${ d.memberID }`)
                .attr("transform", `translate${ textTransform }`)
                .style("text-anchor", "middle")
                .selectAll("tspan")
                .data(splitName)
                .enter()
                .append("tspan")
                .text(d => d)
                .attr("stroke", contrastColor)
                .attr("fill", contrastColor)
                .attr("font-weight", "100")
                .attr("font-size", "0.6rem")
                .attr("letter-spacing", "0.7")
                .attr("x", -3)
                .attr("dy", 12);
        });

        // handles zoom/panning within nodes container
        const zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .filter(filter)
            .on("zoom", zoomed);
        svg.call(zoom);

        function filter(event) {
            event.preventDefault();
            return (!event.ctrlKey || event.type === "wheel") && !event.button;
        };

        function zoomed(event) {
            const {transform} = event;
            nodeContainer.attr("transform", transform);
            svg.selectAll("line").attr("transform", transform);
        };
    }; 

    // returns x,y values for specified element's `translation`
    const getElementPosition = (id, elementType) => {
        const svg = d3.select("#familyTreeSVG"); 
        const element = svg.select(`#${ elementType }-${ id }`);
        const transformAttr = element.attr("transform");
        const match = transformAttr.match(/translate\(([^,]+),([^,]+)\)/);
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    };
 
    const positionNodes = () => {  
        treeData.members.forEach(member => {  
            // translates member node by specified coordinates 
            const translateBy = { x: member.coords.x, y: member.coords.y }; 
            const svg = d3.select("#familyTreeSVG"); 
            const node = svg.select(`#g-${ member.memberID }`); 
            node.attr("transform", `translate(${ translateBy.x },${ translateBy.y })`);
        });
    };

    // returns specified element's bounds (adjusted for translations)
    const getElementBounds = (id, elementType) => {
        const svg = document.getElementById("familyTreeSVG");
        const element = svg.getElementById(`${elementType}-${id}`);
        const elementBBox = element.getBBox();
        const memberPosition = getElementPosition(id, elementType);
        elementBBox.x += memberPosition.x;
        elementBBox.y += memberPosition.y;
        return elementBBox; 
    };

    // returns spouses in order [left spouse, right spouse]
    const getSpouseOrder = (spouseIDs) => {  
        switch (spouseIDs.length) { 
            case 1: 
                return [spouseIDs[0]];
            case 2: 
                const spouse1 = getMember(spouseIDs[0], treeData.members);
                const spouse2 = getMember(spouseIDs[1], treeData.members); 
 
                if (Number(spouse1.coords.x) < Number(spouse2.coords.x)) { 
                    return [spouseIDs[0], spouseIDs[1]];
                } else { 
                    return [spouseIDs[1], spouseIDs[0]];;
                }
            default: 
                return []
        }
    };

    // position/connects spouse nodes + positions vertical parent-child line
    const connectParentChildNodes = (marr) => {
        const spouseOrder = getSpouseOrder(marr.between);  
        const parent1Position = getElementPosition(spouseOrder[0], "g");
        let parentChildLine = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        };  

        // sets starting position for parent-child line
        if (marr.between.length === 1) {
            // 1 parent -> use parent's name text as starting point for parent-child line
            const parent1Text = getElementBounds(spouseOrder[0], "text");
            parent1Text.x += parent1Position.x;
            parent1Text.y += parent1Position.y;
            parentChildLine.start = {
                x: parent1Text.x + parent1Text.width/2,
                y: parent1Text.y + parent1Text.height + 4
            };  
        } else if (marr.between.length === 2) {
            // 2 parents -> use midpoint of spouse-marriage line as starting point for parent-child line
            const parent1Circle = getElementBounds(spouseOrder[0], "circle"); 
            parent1Circle.x += parent1Position.x;
            parent1Circle.y += parent1Position.y; 

            const parent2Position = getElementPosition(spouseOrder[1], "g");
            const parent2Circle = getElementBounds(spouseOrder[1], "circle"); 
            parent2Circle.x += parent2Position.x;
            parent2Circle.y += parent2Position.y; 

            const spouseMarriageLine = {
                start: {
                    x: parent1Circle.x + (NODE_RADIUS * 2),
                    y: parent1Circle.y + NODE_RADIUS
                },
                end: {
                    x: parent2Circle.x,
                    y: parent2Circle.y + NODE_RADIUS
                }
            };   
            nodeLines.push(spouseMarriageLine); 

            parentChildLine.start = {
                x: (parent1Circle.x + NODE_RADIUS * 2 + parent2Circle.x) / 2,
                y: parent1Circle.y + NODE_RADIUS
            };
        }
        
        // set ending position for parent-child line
        if (marr.children.length > 0) {
            const midChildIndex = Math.floor(marr.children.length / 2);
            const midChild = getMember(marr.children[midChildIndex], treeData.members);
            const midChildPosition = getElementPosition(midChild.memberID, "g");
            const midChildCircle = getElementBounds(midChild.memberID, "circle");
            midChildCircle.x += midChildPosition.x;
            midChildCircle.y += midChildPosition.y;

            // odd # kids -> use middle child node as end point 
            // even # kids -> use midpoint of middle 2 childrens' sibling line as end point
            parentChildLine.end.y = marr.children.length % 2 === 0 ? midChildCircle.y - 10 : midChildCircle.y;
            parentChildLine.end.x = parentChildLine.start.x; 
            nodeLines.push(parentChildLine); 
        }
    };

    // position/connects sibling lines between children nodes 
    const connectSiblingNodes = (marr) => {
        for (let i = 0; i < marr.children.length-1; i++) { 
            // positions lines from top of adjacent child nodes to horizontal sibling line 
            const sibling1Position = getElementPosition(marr.children[i], "g");
            const sibling1Circle = getElementBounds(marr.children[i], "circle");
            sibling1Circle.x += sibling1Position.x;
            sibling1Circle.y += sibling1Position.y;
            let nodeTopConnectorLine = {
                start: { x: sibling1Circle.x + NODE_RADIUS, y: sibling1Circle.y },
                end: { x: sibling1Circle.x + NODE_RADIUS, y: sibling1Circle.y - NODE_TOP_CONNECTOR_LENGTH }
            };
            nodeLines.push(nodeTopConnectorLine);

            const sibling2Position = getElementPosition(marr.children[i+1], "g");
            const sibling2Circle = getElementBounds(marr.children[i+1], "circle");
            sibling2Circle.x += sibling2Position.x;
            sibling2Circle.y += sibling2Position.y;
            nodeTopConnectorLine = {
                start: { x: sibling2Circle.x + NODE_RADIUS, y: sibling2Circle.y },
                end: { x: sibling2Circle.x + NODE_RADIUS, y: sibling2Circle.y - NODE_TOP_CONNECTOR_LENGTH }
            };
            nodeLines.push(nodeTopConnectorLine);

            // positions horizontal sibling line connecting above `NodeTopConnectorLines` 
            const siblingConnectorLine = {
                start: { x: sibling1Circle.x + NODE_RADIUS, y: sibling1Circle.y - NODE_TOP_CONNECTOR_LENGTH },
                end: { x: sibling2Circle.x + NODE_RADIUS, y: sibling2Circle.y - NODE_TOP_CONNECTOR_LENGTH }
            };
            nodeLines.push(siblingConnectorLine);
        }
    };

    // positions connecting lines between member nodes
    const positionLines = () => {
        treeData.levels.forEach(lvl => {
            lvl.marriages.forEach(marr => {
                if (marr.between.length > 0) connectParentChildNodes(marr);
                if (marr.children.length > 1) connectSiblingNodes(marr);
            });
        });
    };

    // draws connecting lines between member nodes
    const drawLines = () => {  
        const svg = d3.select("#familyTreeSVG");
        svg.selectAll("line")
            .data(nodeLines)
            .enter()
            .append("line")
            .attr("x1", d => d.start.x)
            .attr("y1", d => d.start.y)
            .attr("x2", d => d.end.x)
            .attr("y2", d => d.end.y)
            .attr("stroke", contrastColor)
            .attr("stroke-width", 2);
    };

    return (
        <Box id="nodes-container" 
            sx={{ 
                ...containerStyles,
                height: "100%",
                backgroundColor: palette.background.container,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }} 
        >
            <svg id="familyTreeSVG" className="familyTreeSVG" width="100%" height= "100%" /> 
        </Box>
    );
}); 