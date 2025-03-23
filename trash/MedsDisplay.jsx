// import { Dialog, DialogContent, Stack, Typography } from "@mui/material"; 
// import { MedicationOutlined } from "@mui/icons-material";
// import { useContext, useState } from "react";  
// import { GridImgButton, ErrorGraphicMessage } from "../src/components";   
// import { formDialogStyles } from "../src/styles";
// import { MedsDataGrid } from "../src/scenes/medications/MedsDataGrid";  
// import { WeeklyMedsList } from "../src/scenes/medications/WeeklyMedsList";
// import { MedsPageContext } from "../src/scenes/medications";
// import { MedicationForm } from "../src/scenes/forms"; 
 
// /**
//  * Renders visualizations (image list & grid) for selected member's medications
//  * Provides forms to add, edit, or delete meds
//  */

//     const medsDisplayProps = {
//         member,  
//         daysOfWeek, 
//         setDaysOfWeek, 
//         weeklyMedSched, 
//         meds, 
//         personnel,
//         handleMedAdd, 
//         handleMedDelete, 
//         setSnackbarMsg
//     };
// export const MedsDisplay = ({ props }) => {    
//     console.log('meds display'); 
//     // const { member, daysOfWeek, meds, personnel, weeklyMedSched, handleMedAdd } = useContext(MedsPageContext);
//     const [form, setForm] = useState({ open: false, item: null });
//     const [showMedType, setShowMedType] = useState("Daily"); 
//     const [gridView, setGridView] = useState(false);

//     const closeForm = () => setForm({ open: false, item: null });

//     const toggleDisplayType = (type) => {
//         setShowMedType(type);
//         setGridView(!gridView);
//     };

//     //shows selected med type & buttons to toggle between types
//     const Header = () => (
//         <Stack 
//             direction="row" 
//             sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }} 
//         >
//             <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }} >
//                 <MedicationOutlined sx={{ fontSize: 23 }} />   
//                 <Typography variant="h4" sx={{ width: "100%" }} >
//                     { `${ showMedType } Medications` }
//                 </Typography>   
//             </Stack>

//             <GridImgButton 
//                 onGridClick={ () => toggleDisplayType("All") }
//                 onImgClick={ () => toggleDisplayType("Daily") }
//                 startGrid={gridView}
//             />
//         </Stack> 
//     );

//     const onMedFormSubmit = async (formData) => { 
//         closeForm(); 
//         const medData = { memberID: props.member.memberID, ...formData };
//         await props.handleMedAdd(medData);
//     };  

//     const SelectedDisplay = () => {
//         if (showMedType === "Daily") {
//             return (
//                 <WeeklyMedsList 
//                     meds={ props.weeklyMedSched[props.daysOfWeek.selectedIndex] } 
//                     setForm={setForm}   
//                 />
//             );
//         }
//         return <MedsDataGrid meds={props.meds} handleMedDelete={props.handleMedDelete} setForm={setForm} />;
//     };

//     return ( 
//         <Stack direction="column" spacing={2} sx={{ flexGrow: 1, alignItems: "center" }} >
//             <Header /> 
//             { props.meds.length > 0 ? (
//                 <SelectedDisplay />
//             ) : (
//                 <ErrorGraphicMessage 
//                     type="med" 
//                     title={ `No Medications Found for ${ props.member.firstName }` }  
//                     onClick={ () => setForm({ open: true, item: null }) }
//                 />
//             )} 
//             <Dialog open={ form.open } onClose={closeForm} sx={formDialogStyles} >
//                 <DialogContent>
//                     <MedicationForm
//                         currentMed={ form.item }
//                         providers={ props.personnel.providers }
//                         onSubmit={onMedFormSubmit}
//                         onCancelClick={closeForm}
//                     />
//                 </DialogContent>
//             </Dialog> 
//         </Stack> 
//     );
// }; 