import { Box, IconButton, InputBase, List, ListItem, useTheme } from "@mui/material";
import { Close, Search } from "@mui/icons-material";  
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";   
import { useCustomNavigate } from "../useCustomNavigate"; 
import { hoverTextStyles } from "../styles.js";
import { MAIN_USER_ID } from "../constants";

// text field for users to input search term
const InputField = ({ searchTerm, setSearchTerm, bgcolor }) => (
    <Box sx={{ pl: "0.2rem", bgcolor: bgcolor, borderRadius: "2rem" }} >
        { searchTerm.length === 0 ? (
            <IconButton > <Search /> </IconButton>
        ) : (
            <IconButton onClick={() => setSearchTerm("")} > 
                <Close /> 
            </IconButton>
        )} 
        <InputBase  
            value={searchTerm}
            placeholder="Search" 
            onChange={ (event) => setSearchTerm(event.target.value) } 
            sx={{ width: "80%" }}
        />
    </Box>
);

// renders list of results matching search term
const ResultsList = ({ results, palette }) => (
    <Box
        sx={{
            mt: "0.25rem",
            borderRadius: "0.25rem",
            border: `0.1rem solid ${ palette.background.contrastText }`,
            bgcolor: palette.background.container
        }}
    >
        <List disablePadding >
            { results.map((result, index) => (
                <ListItem
                    key={index}
                    onClick={ result.onClick } 
                    sx={{
                        m: "0.5rem 0",
                        bgcolor: palette.background.container,
                        overflow: "hidden",
                        '&:hover': { ...hoverTextStyles }
                    }}
                >
                    <Search sx={{ mr: "0.5rem" }} />
                    { result.name }
                </ListItem>
            ))}
        </List>
    </Box>
);

/**
 * Renders a search bar used to search for & navigate to matching pages
 */  

export const SearchBar = () => {
    const palette = useTheme().palette; 
    const location = useLocation(); 
    const navigate = useCustomNavigate();      
    const [searchTerm, setSearchTerm] = useState("");
    const [matchingResults, setMatchingResults] = useState([]);  
    const pageTitles = [
        { name: "DASHBOARD", onClick: () => { navigate.goToDashboard() }},
        { name: "PAST VISITS",onClick: () => { navigate.goToVisits() }},
        { name: "PROFILES", onClick: () => { navigate.goToProfile(MAIN_USER_ID) }},
        { name: "CONDITIONS", onClick: () => { navigate.goToConditions(MAIN_USER_ID) }},
        { name: "MEDICATIONS", onClick: () => { navigate.goToMeds(MAIN_USER_ID) }},
        { name: "CALENDAR", onClick: () => { navigate.goToCalendar() }},
        { name: "FAMILY TREE", onClick: () => { navigate.goToFamilyTree() }},
        { name: "SITE ATTRIBUTIONS", onClick: () => { navigate.goToAttributions() }},
        { name: "WARNING", onClick: () => { navigate.goToLanding() }} 
    ]; 
     
    useEffect(() => {
        if (searchTerm) { 
            const filteredResults = pageTitles
                .filter((title) => title.name.toLowerCase().includes(searchTerm.toLowerCase()));
            setMatchingResults(filteredResults);
        } else {
            setMatchingResults([]);
        }
    }, [searchTerm]); 

    useEffect(() => { 
        setSearchTerm("");
    }, [location]); 

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                position: searchTerm ? "absolute" : "relative",
                zIndex: 100,
                width: "20rem"
            }}
        >
            <InputField 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                bgcolor={ palette.background.container} 
            /> 
            { matchingResults.length > 0 && <ResultsList results={matchingResults} palette={palette} /> }
        </Box>
    );
}; 