import { Box, CssBaseline, ThemeProvider } from '@mui/material';  
import { Route, Routes } from "react-router-dom";
import { ColorModeContext, useMode } from './theme';
import { LeftSidebar } from "./components";
import { AttributionsPage, CalendarPage, ConditionsPage, Dashboard, FamilyHistory, 
  HistoryPage, MedicationsPage, VisitDetails, VisitsPage, WarningPage } from "./scenes";

export function App() {
  const [ theme, colorMode ] = useMode();   

  return (    
    <ColorModeContext.Provider value={colorMode} >
      <ThemeProvider theme={theme} >
        <CssBaseline/>
          <Box  
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100vw",
              height: "100vh"
            }}
          >  
            <LeftSidebar /> 
            <Box  
              sx={{
                flexGrow: 1,
                p: "1rem 2rem 2rem 2rem",
                boxSizing: "border-box",
                overflow: "auto"
              }}
            > 
              <Routes>
                <Route path={ "/" } element={ <WarningPage />} />
                <Route path={ "members/:memberID/dashboard" } element={ <Dashboard />} />
                <Route path={ "members/:memberID/visits" } element={ <VisitsPage />} />
                <Route path={ "members/:memberID/visits/:visitID" } element={ <VisitDetails />} />
                <Route path={ "members/:memberID/history" } element={ <HistoryPage />} />
                <Route path={ "members/:memberID/conditions" } element={ <ConditionsPage />} />
                <Route path={ "members/:memberID/medications" } element={ <MedicationsPage />} />
                <Route path={ "members/:memberID/calendar" } element={ <CalendarPage />} />
                <Route path={ "members/:memberID/family" } element={ <FamilyHistory />} />
                <Route path={ "attributions" } element={ <AttributionsPage />} /> 
              </Routes>
            </Box>
          </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}; 