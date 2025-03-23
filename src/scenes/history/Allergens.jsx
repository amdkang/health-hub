import { SvgIcon } from "@mui/material";
import { cloneElement } from "react"; 

/**
 * Renders & exports svg icons used to represent different types of allergens
 */
 
const AllergyIcon = ({ paths }) => (
    <SvgIcon 
        sx={{
            fontSize: 26,
            ml: "0.6rem",
            mr: "-0.7rem" 
        }} 
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"  
        >  
            { paths.map((path, index) => 
                <path key={index} d={path} />
            )} 
        </svg>  
    </SvgIcon>
);

const ShrimpIcon = () => (
    <AllergyIcon 
        paths={["M15.4091492,18.6986036 L15.5,18.5 C14.6355086,16.4828534 12.4348726,15.3912818 10.3058074,15.9235481 L10,16 C10,17.3807119 11.1192881,18.5 12.5,18.5 C11.1745166,18.5 10.0899613,19.5315359 10.0053177,20.8356243 L10,21 L10.3058074,21.0764519 C12.3639038,21.5909759 14.488879,20.5881138 15.4091492,18.6986036 L15.4091492,18.6986036 Z M15.5,18.5 L16.0876894,15.2677081 C16.3179456,14.0012994 15.5065195,12.7792266 14.25,12.5 C12.7524581,12.1672129 11.2843177,11.7137271 9.85996697,11.1439868 L9.5,11 C7.99008611,10.3960344 7,8.93364462 7,7.3074176 L7,7 L7,7 C5.8954305,7 5,6.1045695 5,5 L5,4 L5,4 L5,5 C5,6.1045695 5.8954305,7 7,7 L10,7 L5,7 C3.8954305,7 3,6.1045695 3,5 L3,3 L3,3 L3,5 C3,6.1045695 3.8954305,7 5,7 L10,7 L10,7 L13.0377855,7 C14.6611857,7 16.2665182,7.34067476 17.75,8 L18.1161292,8.1627241 C19.3050993,8.69115526 20.1844343,9.73773708 20.5,11 C20.822649,12.290596 20.6729809,13.6540381 20.0780456,14.8439089 L20,15 C19.3543116,16.2913768 18.2717937,17.3120884 16.9447292,17.8808303 L15.5,18.5 L15.5,18.5 Z M20.6503318,12.7744367 L20.539997,12.9515358 C19.7452448,14.1659903 18.3449036,14.8965565 16.8438806,14.8027425 L16.1253897,14.7573974 M20.0306873,9.86186454 L18.2226934,11.468717 L18.0277613,11.6323951 C17.033486,12.4205412 15.7520231,12.7531999 14.4999327,12.5481943 M16.8048928,7.6285803 L13.9923496,10.1887731 L13.8143356,10.3419788 C12.6651871,11.2777778 11.1129282,11.5562543 9.70980266,11.0776843 L9.88380266,11.1319241"]}
    /> 
); 

const GlutenIcon = () => (
    <AllergyIcon
        paths={["M3.46530832,20.534679 L15.2109027,8.78899174 M8.90748885,9.23119339 C10.5260377,10.4451155 10.8540525,12.741287 9.64013033,14.3598359 C9.48392783,14.5681041 9.3061194,14.7589289 9.10982697,14.9291885 L8.90748885,15.0924774 C7.28893997,13.8785552 6.96092521,11.5823837 8.17484736,9.96383487 C8.33104986,9.75556668 8.5088583,9.56474181 8.70515072,9.39448224 L8.90748885,9.23119339 Z M11.8381055,6.30055141 C13.4566544,7.51447356 13.7846691,9.81064501 12.570747,11.4291939 C12.4145445,11.6374621 12.236736,11.8282869 12.0404436,11.9985465 L11.8381055,12.1618354 C10.2195566,10.9479132 9.89154184,8.65174177 11.105464,7.03319289 C11.2616665,6.82492469 11.4394749,6.63409983 11.6357674,6.46384026 L11.8381055,6.30055141 Z M14.7687221,3.36990942 C16.387271,4.58383158 16.7152858,6.88000303 15.5013636,8.4985519 C15.3451611,8.7068201 15.1673527,8.89764496 14.9710602,9.06790454 L14.7687221,9.23119339 C13.1501732,8.01727123 12.8221585,5.72109978 14.0360806,4.10255091 C14.1922831,3.89428271 14.3700916,3.70345785 14.566384,3.53319827 L14.7687221,3.36990942 Z M20.6299554,9.23119339 C19.4160647,10.8497283 17.1199302,11.1777572 15.5013953,9.96386656 C15.2931167,9.80765894 15.102283,9.62984306 14.9320168,9.43354137 L14.7687221,9.23119339 C15.9826128,7.61265851 18.2787473,7.28462956 19.8972822,8.49852022 C20.1055608,8.65472784 20.2963945,8.83254372 20.4666607,9.02884541 L20.6299554,9.23119339 Z M17.6993388,12.1618354 C16.4854481,13.7803702 14.1893135,14.1083992 12.5707787,12.8945085 C12.3625,12.7383009 12.1716664,12.560485 12.0014002,12.3641834 L11.8381055,12.1618354 C13.0519961,10.5433005 15.3481307,10.2152715 16.9666656,11.4291622 C17.1749442,11.5853698 17.3657778,11.7631857 17.536044,11.9594874 L17.6993388,12.1618354 Z M14.7687221,15.0924774 C13.5548315,16.7110122 11.2586969,17.0390412 9.64016202,15.8251505 C9.43188339,15.6689429 9.24104976,15.491127 9.07078357,15.2948253 L8.90748885,15.0924774 C10.1213795,13.4739425 12.4175141,13.1459135 14.036049,14.3598042 C14.2443276,14.5160118 14.4351612,14.6938277 14.6054274,14.8901294 L14.7687221,15.0924774 Z M5.90748885,12.2311934 C7.52603772,13.4451155 7.85405249,15.741287 6.64013033,17.3598359 C6.48392783,17.5681041 6.3061194,17.7589289 6.10982697,17.9291885 L5.90748885,18.0924774 C4.28893997,16.8785552 3.96092521,14.5823837 5.17484736,12.9638349 C5.33104986,12.7555667 5.5088583,12.5647418 5.70515072,12.3944822 L5.90748885,12.2311934 Z M11.7687221,18.0924774 C10.5548315,19.7110122 8.25869689,20.0390412 6.64016202,18.8251505 C6.43188339,18.6689429 6.24104976,18.491127 6.07078357,18.2948253 L5.90748885,18.0924774 C7.12137951,16.4739425 9.41751408,16.1459135 11.036049,17.3598042 C11.2443276,17.5160118 11.4351612,17.6938277 11.6054274,17.8901294 L11.7687221,18.0924774 Z M20.7375506,3.26301485 C21.0236732,5.26589042 19.6319978,7.12145287 17.6291624,7.40756974 C17.3714382,7.44438685 17.1107705,7.45359128 16.8515745,7.4351821 L16.593027,7.40752834 C16.3069102,5.40469292 17.6985855,3.54913047 19.7014209,3.26301359 C20.0450532,3.2139237 20.3939185,3.21392412 20.7375506,3.26301485 Z"]}
    />      
);

const EggIcon = () => (
    <AllergyIcon
        paths={["M8.5,4 C10.6880996,4 12.6236769,6.56725359 13.8016474,9.38507756 C14.6677837,7.99375083 15.7831262,6.96153846 17,6.96153846 C19.7614237,6.96153846 22,12.2770378 22,15.0384615 C22,17.7998853 19.7614237,20.0384615 17,20.0384615 C15.6471612,20.0384615 14.41981,19.501185 13.5196845,18.6283698 C12.3291905,20.0763143 10.5224644,21 8.5,21 C4.91014913,21 2,18.0898509 2,14.5 C2,13.5862198 2.18855842,12.4573062 2.52888881,11.2819886 L2.52888881,11.2819886 L2.6839296,10.7759319 C3.75069954,7.47449151 5.95446938,4 8.5,4 Z M8.5,21 C12.0898509,21 15,18.0898509 15,14.5 C15,13.5862198 14.8114416,12.4573062 14.4711112,11.2819886 L14.3160704,10.7759319 C13.2493005,7.47449151 11.0455306,4 8.5,4 C5.95446938,4 3.75069954,7.47449151 2.6839296,10.7759319 L2.52888881,11.2819886 C2.18855842,12.4573062 2,13.5862198 2,14.5 C2,18.0898509 4.91014913,21 8.5,21 Z"]}
    />
);

const DairyIcon = () => (
    <AllergyIcon
        paths={["M8.30755459,10.5115516 L9.23628684,9.03656842 C10.0507366,7.74308517 10.5742404,6.28799914 10.7705303,4.77211737 L11,3 L14,3 L14.2074647,4.65971731 C14.4001716,6.20137271 14.9265656,7.68250497 15.75,9 L16.6959966,10.5135946 C16.8946611,10.8314578 17,11.198753 17,11.5735925 L17,19 C17,20.1045695 16.1045695,21 15,21 L10,21 C8.8954305,21 8,20.1045695 8,19 L8,11.5772103 C8,11.2000991 8.10661865,10.8306716 8.30755459,10.5115516 Z M8,14 L8.62829175,14.2094306 C10.1136618,14.7045539 11.747426,14.4394305 13,13.5 L13.2111456,13.3416408 C14.2465666,12.565075 15.6124342,12.4039592 16.7935841,12.9047455 L17,13 L17,19 C17,20.1045695 16.1045695,21 15,21 L10,21 C8.8954305,21 8,20.1045695 8,19 L8,14 Z M10,3 L15,3"]}
    />
); 

const SoyIcon = () => (
    <AllergyIcon
        paths={["M20,9.19722436 C20,10.3234988 19.437117,11.3752554 18.5,12 C17.562883,12.6247446 17,13.6765012 17,14.8027756 L17,15 C17,16.1754137 16.2000338,17.1999916 15.059715,17.4850713 L14.7489493,17.5627627 C13.6235704,17.8441074 12.64346,18.5348101 12,19.5 C11.3752554,20.437117 10.3234988,21 9.19722436,21 L5,21 C5.64028925,20.3597108 6,19.4912922 6,18.5857864 L6,17.8027756 C6,16.6765012 6.56288303,15.6247446 7.5,15 C8.46518994,14.35654 9.15589261,13.3764296 9.43723732,12.2510507 L9.63619656,11.4552138 C9.85000633,10.5999747 10.6184397,10 11.5,10 C12.4192991,10 13.2596973,9.48060532 13.6708204,8.65835921 L14.1055728,7.78885438 C14.6537369,6.69252624 15.7742679,6 17,6 L17.5857864,6 C18.4912922,6 19.3597108,5.64028925 20,5 L20,9.19722436 Z M8.43933983,18.5606602 C8.16789322,18.2892136 8,17.9142136 8,17.5 C8,16.6715729 8.67157288,16 9.5,16 C9.91421356,16 10.2892136,16.1678932 10.5606602,16.4393398 M12.0857864,14.9142136 C11.7238576,14.5522847 11.5,14.0522847 11.5,13.5 C11.5,12.3954305 12.3954305,11.5 13.5,11.5 C14.0522847,11.5 14.5522847,11.7238576 14.9142136,12.0857864 M15.9393398,10.5606602 C15.6678932,10.2892136 15.5,9.91421356 15.5,9.5 C15.5,8.67157288 16.1715729,8 17,8 C17.4142136,8 17.7892136,8.16789322 18.0606602,8.43933983 M5.5,11 C6.32842712,11 7,10.3284271 7,9.5 C7,8.67157288 6.32842712,8 5.5,8 C4.67157288,8 4,8.67157288 4,9.5 C4,10.3284271 4.67157288,11 5.5,11 Z M5.5,6 C6.32842712,6 7,5.32842712 7,4.5 C7,3.67157288 6.32842712,3 5.5,3 C4.67157288,3 4,3.67157288 4,4.5 C4,5.32842712 4.67157288,6 5.5,6 Z M10.5,7 C11.3284271,7 12,6.32842712 12,5.5 C12,4.67157288 11.3284271,4 10.5,4 C9.67157288,4 9,4.67157288 9,5.5 C9,6.32842712 9.67157288,7 10.5,7 Z"]}
    />
); 

const NutIcon = () => (
    <AllergyIcon
        paths={["M12,21 C16,19.6666667 18,17.4411765 18,14.3235294 L18,12 L18,12 L6,12 L6,14.3235294 L6,14.3235294 C6,17.4411765 8,19.6666667 12,21 Z M7.5,7 L10.2747211,6.20722253 C10.7040227,6.08456495 11,5.69217895 11,5.24569859 L11,4 L13,4 L12.5575036,4.88499271 C12.3105144,5.3789712 12.5107387,5.97964425 13.0047172,6.22663349 C13.0699767,6.25926325 13.1386113,6.28465283 13.2093952,6.3023488 L16,7 C18.1421954,7.53554885 19.4700868,9.65673819 19.0450148,11.7991358 L19,12 L5,12 L4.882843,11.531372 C4.39057566,9.56230266 5.54842347,7.55759329 7.5,7 Z"]}
    />
); 

const FlowerIcon = () => (
    <AllergyIcon
        paths={["M12 13C8 13 7 9.66667 7 8V4L9.5 6L12 3L14.5 6L17 4V8C17 9.66667 16 13 12 13ZM12 13V21M13 21C18.6 21 20 16.3333 20 14C14.4 14 13 18.6667 13 21ZM13 21H12M11 21C5.4 21 4 16.3333 4 14C9.6 14 11 18.6667 11 21ZM11 21H12"]}
    />
);

export const DrugIcon = () => (
    <AllergyIcon
        paths={["M9.17158 9.17156L5.63604 12.7071C4.07395 14.2692 4.07395 16.8019 5.63604 18.3639V18.3639C7.19814 19.926 9.7308 19.926 11.2929 18.3639L14.8284 14.8284M9.17158 9.17156L12.7071 5.63603C14.2692 4.07393 16.8019 4.07393 18.364 5.63603V5.63603C19.9261 7.19812 19.9261 9.73078 18.364 11.2929L14.8284 14.8284M9.17158 9.17156L14.8284 14.8284"]}
    />
);

export const DEFAULT_ALLERGENS = {
    gluten: { icon: <GlutenIcon />, isDrug: false },
    egg: { icon: <EggIcon />, isDrug: false },
    dairy: { icon: <DairyIcon />, isDrug: false },
    soy: { icon: <SoyIcon />, isDrug: false },
    seafood: { icon: <ShrimpIcon />, isDrug: false },
    nut: { icon: <NutIcon />, isDrug: false },
    pollen: { icon: <FlowerIcon />, isDrug: false }, 
    NSAID: { icon: <DrugIcon />, isDrug: true },
    penicillin: { icon: <DrugIcon />, isDrug: true },
    drug: { icon: <DrugIcon />, isDrug: true } 
}; 

export const getAllergyIcon = (allergy, iconColor) => { 
    let icon = null;
    if (allergy.isCustom) {
        if (allergy.isDrug) icon = <DrugIcon />;  
    } else { 
        icon = DEFAULT_ALLERGENS[allergy.name]?.icon ?? null;
    }      
    
    try {
       return cloneElement(icon, { color: iconColor ?? "default" });
    } catch (error) {
        return null;
    }
};