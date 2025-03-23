import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

//color scheme for additional details
export const colorOptions = [
    { main: "#fcdd9a", dark: "#f2b738", text: "#a85a02" },
    { main: "#fc9762", dark: "#e36d32", text: "#85350b" },
    { main: "#99b1fc", dark: "#4574ff", text: "#091b52" },
    { main: "#8e85d6", dark: "#6A5BDE", text: "#1c1557" }
]; 

//returns theme object that defines color & font systems 
export const themeSettings = (mode) => { 
    return { 
        palette: {  
            mode: mode,
            options: colorOptions, 
            tertiary: {
                main: "#21d6a9"
            },
            ...(mode === "dark" ? 
            {
                primary: {
                    main: "#6a5bde", 
                    contrastText: "#f5f5f5",
                    darkText: "#f5f5f5"
                },
                secondary: {
                    light: "#afa9eb",
                    main: "#9890E9", 
                    dark: "#665bcf"
                }, 
                neutral: {
                    dark: "#A1A1A1", 
                    main: "#696969", 
                    light: "#313131"  
                },
                action: {
                    hover: "#2d2e32"
                },
                background: {
                    default: "#070707",  
                    container: "#1b1c21",  
                    contrastText: "#f5f5f5"
                }
            } 
            : 
            {
                primary: {
                    main: "#8871e5",  
                    dark: "#705cdc",
                    contrastText: "#f5f5f5",
                    darkText: "#2a1769" 
                },
                secondary: {
                    light: "#afa9eb",
                    main: "#887eed",
                    dark: "#5b4fd6" 
                },
                neutral: {
                    dark: "#696969",
                    main: "#A1A1A1",  
                    light: "#D9D9D9"
                },
                background: {
                    default: "#f4f4f4", 
                    container: "#ffffff", 
                    contrastText: "#151624",  
                },
                action: {
                    hover: "#f5f5f5"
                }
            })
        },
        typography: {  
            fontFamily: ["Poppins", "sans-serif"].join(","), 
            fontSize: 12,
            h1: { fontSize: 40 },
            h2: { fontSize: 32 },
            h3: { fontSize: 24 },
            h4: { fontSize: 18, fontWeight: 500 },
            h5: { fontSize: 16, fontWeight: 400 },
            h6: { fontSize: 14 }
        },
        shadows: Array(25).fill( //"2px 4px 10px rgba(65, 62, 62, 0.2)"  
            mode === "dark" 
              ? "2px 4px 10px rgba(20, 20, 20, 0.2)"  
              : "0px 4px 10px rgba(0, 0, 0, 0.2)" 
        ),
        components: {
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        '--DataGrid-containerBackground': mode === "dark" ? "#1b1c21" :  "#ffffff",
                        '--DataGrid-rowBorderColor': mode === "dark" ? "#1b1c21" :  "#ffffff", 
                    }
                },
            },
        }
    }
};

export const ColorModeContext = createContext({ 
    toggleColorMode: () => {}  
});

// custom hook that returns theme & colorMode to use
export const useMode = () => { 
    const [mode, setMode] = useState("dark");   

    const colorMode = useMemo(() => ({  
        toggleColorMode: () =>
            setMode((prev) => prev === "light" ? "dark" : "light"),
    }), []); 

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]); 

    return [theme, colorMode];
};