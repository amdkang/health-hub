import { Dialog, DialogContent, Stack } from "@mui/material";
import { createContext, useCallback, useEffect, useRef, useState } from "react"; 
import { addEvent, deleteEvent, getEvents, getProviders } from "../../database/clientServices";
import { CustomSnackbar, ErrorGraphicMessage, LoadingCircle, Topbar } from "../../components";
import { EventsList } from "./EventsList";  
import { MonthlyCalendar } from "./MonthlyCalendar";   
import { EventForm } from "../forms"; 
import { getDateEvents } from "../../utils";
import { formDialogStyles, pageStyles } from "../../styles";
import dayjs from "dayjs";

export const CalendarContext = createContext();

/**
 * Page that displays a monthly calendar &  list showing all scheduled events
 * Provides a form to add, edit, or delete these events
 */

export const CalendarPage = () => {
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);  
    const [events, setEvents] = useState([]);
    const [providers, setProviders] = useState([]);
    const [selected, setSelected] = useState({ date: null, events: [] }); 
    const [form, setForm] = useState({ open: false, event: null });
    const snackbarRef = useRef(null);  

    const fetchSetEvents = useCallback(async (prevSelectedDate = null) => {
        const allEvents = await getEvents();
        setEvents(allEvents); 
        const selectedDate = prevSelectedDate ?? dayjs(); // reinstate previous date or use today
        setSelected({ 
            date: selectedDate, 
            events: getDateEvents(allEvents, selectedDate) 
        });
    }, []);  

    useEffect(() => {  
        const fetchAllData = async () => {
            setLoading(true);  
            try {     
                await fetchSetEvents();
                setProviders(await getProviders());
                setDbError(false);
            } catch (err) {   
                setDbError(true);
            }
            setLoading(false); 
        };  
        fetchAllData();   
    }, [fetchSetEvents]);

    const openForm = (item) => setForm({ open: true, event: item.eventID ? item : null });

    const closeForm = () => setForm({ open: false, event: null });

    const setSnackbarMsg = useCallback(message => { 
        snackbarRef.current?.showSnackbar(message); 
    }, []); 

    const handleEventAdd = async (eventData) => {
        try { 
            await addEvent(eventData);
            await fetchSetEvents(selected.date); 
        } catch (err) {
            setSnackbarMsg(err.message);
        }  
        closeForm();
    };   

    const handleEventDelete = useCallback(async (eventID) => {
        try {  
            await deleteEvent(eventID); 
            await fetchSetEvents(selected.date); 
        } catch (err) {
            setSnackbarMsg(err.message);
        }
    }, [selected, fetchSetEvents, setSnackbarMsg]);
        
    return (
        <Stack direction="column" sx={pageStyles} >
            { loading && <LoadingCircle /> }

            { !loading && !dbError  &&
                <CalendarContext.Provider value={{ selected, setSelected, events }} >
                    <Topbar title="CALENDAR" subtitle="Sync Your Appointments" />  
                    <Stack 
                        direction="row"
                        sx={{ justifyContent: "space-between", alignItems: "flex-end" }}
                    >
                        <MonthlyCalendar />
                        <EventsList handleEventDelete={handleEventDelete} openForm={openForm} /> 

                        <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
                            <DialogContent>
                                <EventForm
                                    currentEvent={ form.event } 
                                    selectedDate={ selected.date }
                                    providers={providers}
                                    onSubmit={handleEventAdd}
                                    onCancelClick={closeForm}
                                />
                            </DialogContent>
                        </Dialog>
                    </Stack>

                    <CustomSnackbar ref={snackbarRef} /> 
                </CalendarContext.Provider>
            }
            
            { dbError && <ErrorGraphicMessage type="database" /> }
        </Stack>
    );
}; 