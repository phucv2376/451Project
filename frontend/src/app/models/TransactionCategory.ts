import LunchDiningOutlinedIcon from '@mui/icons-material/LunchDiningOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import TheaterComedyOutlinedIcon from '@mui/icons-material/TheaterComedyOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import FaceRetouchingNaturalOutlinedIcon from '@mui/icons-material/FaceRetouchingNaturalOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

export const categories: TransactionCategory[] = [
    {
        category: "Food & Dining",
        color: "#c7522a", //red
        Icon: LunchDiningOutlinedIcon
    },
    {
        category: "Transportation",
        color:"#e5c185",// beige
        Icon: DirectionsCarFilledOutlinedIcon
    },
    {
        category: "Entertainment",
        color:"#fbf2c4", //yellow
        Icon: TheaterComedyOutlinedIcon

    },
    {
        category: "Education",
        color: "#ffa600", //orange
        Icon: SchoolOutlinedIcon
    },
    {
        category: "Personal Care",
        color:"#74a892", //green
        Icon: FaceRetouchingNaturalOutlinedIcon
    },
    {
        category: "Income",
        color:"#008585", //blue
        Icon:PaymentsOutlinedIcon
    },
    {
        category: "Shopping",
        color: "#004343",
        Icon: ShoppingBagOutlinedIcon
    },
    {
        category: "Miscellaneous",
        color: "#8a508f", //purple
        Icon: PendingOutlinedIcon
    }
] 

export interface TransactionCategory {
    category: string;
    color: string; 
    Icon: any
}