/*import LunchDiningOutlinedIcon from '@mui/icons-material/LunchDiningOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import TheaterComedyOutlinedIcon from '@mui/icons-material/TheaterComedyOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import FaceRetouchingNaturalOutlinedIcon from '@mui/icons-material/FaceRetouchingNaturalOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import WaterDamageOutlinedIcon from '@mui/icons-material/WaterDamageOutlined';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import { Transaction } from './Transaction';

export const categories: TransactionCategory[] = [
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440001",
        category: "Food & Dining",
        color: "#c7522a", //red
        Icon: LunchDiningOutlinedIcon
    },
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440002",
        category: "Transportation",
        color:"#e5c185",// beige
        Icon: DirectionsCarFilledOutlinedIcon
    },
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440003",
        category: "Entertainment",
        color:"#fbf2c4", //yellow
        Icon: TheaterComedyOutlinedIcon

    },
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440008",
        category: "Education",
        color: "#ffa600", //orange
        Icon: SchoolOutlinedIcon
    },
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440009",
        category: "Personal Care",
        color:"#74a892", //green
        Icon: FaceRetouchingNaturalOutlinedIcon
    },
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440010",
        category: "Payroll",
        color:"#008585", //blue
        Icon:PaymentsOutlinedIcon
    },
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440007",
        category: "Shopping",
        color: "#004343",
        Icon: ShoppingBagOutlinedIcon
    },
    {   
        categoryId:"550e8400-e29b-41d4-a716-446655440011",
        category: "Other",
        color: "#8a508f", //purple
        Icon: PendingOutlinedIcon
    },
    {
        categoryId:"550e8400-e29b-41d4-a716-446655440006",
        category: "Utilities",
        color:"#6f12fa", // darker purple
        Icon: WaterDamageOutlinedIcon
    },
    {
        categoryId: "550e8400-e29b-41d4-a716-446655440005",
        category: "Housing",
        color: "#2f9f99", //cyan
        Icon: CottageOutlinedIcon
    }, 
    {
        categoryId: "550e8400-e29b-41d4-a716-446655440004",
        category: "Healthcare",
        color:"#9c2700", //red
        Icon: LocalHospitalOutlinedIcon
    },
    {
        categoryId: "550e8400-e29b-41d4-a716-446655440012",
        category: "Travel",
        color: "#00af34", //green
        Icon: FlightTakeoffOutlinedIcon
    }
] 

export interface TransactionCategory {
    categoryId: string;
    category: string;
    color: string; 
    Icon: any
}

export const getCategory = (transaction: Transaction): TransactionCategory => {
    const category = categories.find((cat) => cat.categoryId === transaction.categoryId);
    return category || categories[7];
}*/