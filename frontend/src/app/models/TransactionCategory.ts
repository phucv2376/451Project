import LunchDiningOutlinedIcon from '@mui/icons-material/LunchDiningOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import TheaterComedyOutlinedIcon from '@mui/icons-material/TheaterComedyOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import FaceRetouchingNaturalOutlinedIcon from '@mui/icons-material/FaceRetouchingNaturalOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

export const categories: TransactionCategory[] = [
    {
        category: "Food & Dining",
        color: "#e63318", //red
        Icon: LunchDiningOutlinedIcon
    },
    {
        category: "Transportation",
        color:"#911e70",// fuschia
        Icon: DirectionsCarFilledOutlinedIcon
    },
    {
        category: "Entertainment",
        color:"#e88200", //orange
        Icon: TheaterComedyOutlinedIcon

    },
    {
        category: "Education",
        color: "#1357ff", //blue
        Icon: SchoolOutlinedIcon
    },
    {
        category: "Personal Care",
        color:"#fe77ee", //pink
        Icon: FaceRetouchingNaturalOutlinedIcon
    },
    {
        category: "Income",
        color:"#159c29", //green
        Icon:PaymentsOutlinedIcon
    }
] 

export interface TransactionCategory {
    category: string;
    color: string; 
    Icon: any
}