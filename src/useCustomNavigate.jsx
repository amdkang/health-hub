import { useNavigate } from 'react-router-dom';
import { MAIN_USER_ID } from "./constants";

/**
 * Custom hook that provides functions used to navigate to each site page
 */

export const useCustomNavigate = () => {
    const navigate = useNavigate(); 
    const goToLanding = () => navigate('/');
    const goToDashboard = () => navigate(`/members/${ MAIN_USER_ID }/dashboard`);
    const goToVisits = () => navigate(`/members/${ MAIN_USER_ID }/visits`);
    const goToVisitDetails = (visitID) => navigate(`/members/${ MAIN_USER_ID }/visits/${ visitID }`);
    const goToProfile = (memberID) => navigate(`/members/${ memberID }/history`);
    const goToConditions = (memberID) => navigate(`/members/${ memberID }/conditions`);
    const goToMeds = (memberID) => navigate(`/members/${ memberID }/medications`); 
    const goToCalendar = () => navigate(`/members/${ MAIN_USER_ID }/calendar`) ; 
    const goToFamilyTree = () => navigate(`/members/${ MAIN_USER_ID }/family`);
    const goToAttributions = () => navigate('/attributions'); 
    const goBack = () => navigate(-1);

    return { 
        goToLanding, 
        goToDashboard, 
        goToProfile, 
        goToConditions, 
        goToMeds, 
        goToVisits, 
        goToVisitDetails, 
        goToCalendar, 
        goToFamilyTree, 
        goToAttributions, 
        goBack 
    };
};