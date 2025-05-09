import LunchDiningOutlinedIcon from '@mui/icons-material/LunchDiningOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MiscellaneousServicesOutlinedIcon from '@mui/icons-material/MiscellaneousServicesOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SportsFootballOutlinedIcon from '@mui/icons-material/SportsFootballOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import { Transaction } from './Transaction';

export const categories: TransactionCategory[] = [
    {
        category: "Bank Fees",
        color:"#840404", // Muted orange
        Icon: AccountBalanceOutlinedIcon
    },
    {
        category: "Cash Advance",
        color: "#FF6B6B", // Muted red
        Icon: AttachMoneyOutlinedIcon
    },
    {
        category: "Community",
        color: "#FF8EFF", // Muted pink (variant of red)
        Icon: PeopleOutlinedIcon
    },
    {
        category: "Food and Drink",
        color: "#FFD166", // Muted yellow
        Icon: LunchDiningOutlinedIcon
    },
    {
        category: "Healthcare",
        color: "#06D6A0", // Muted green
        Icon: LocalHospitalOutlinedIcon
    },
    {
        category: "Interest",
        color: "#118AB2", // Muted blue
        Icon: SavingsOutlinedIcon
    },
    {
        category: "Payment",
        color: "#5E4FA2", // Muted indigo
        Icon: PaymentsOutlinedIcon
    },
    {
        category: "Recreation",
        color: "#9B5DE5", // Muted violet
        Icon: SportsFootballOutlinedIcon
    },
    {
        category: "Service",
        color: "#EF476F", // Muted red-violet (complementary)
        Icon: MiscellaneousServicesOutlinedIcon
    },
    {
        category: "Shops",
        color: "#83C5BE", // Muted teal (extension of green)
        Icon: ShoppingCartOutlinedIcon
    },
    {
        category: "Tax",
        color: "#FFDD59", // Muted gold (yellow variant)
        Icon: PercentOutlinedIcon
    },
    {
        category: "Transfer",
        color: "#7FB3D5", // Muted sky blue
        Icon: SwapHorizOutlinedIcon
    },
    {
        category: "Travel",
        color: "#B388EB", // Muted lavender (violet variant)
        Icon: FlightTakeoffOutlinedIcon
    }
]

export interface TransactionCategory {
    category: string;
    color: string;
    Icon: typeof import('@mui/material/SvgIcon').default;
}

export const getCategory = (transaction: Transaction): TransactionCategory => {
    const category = categories.find((cat) => cat.category === transaction.categories[0]);
    return category || categories[0];
}

export const getCategoryByName = (categoryName: string): TransactionCategory => {
    const category = categories.find((cat) => cat.category === categoryName);
    return category || categories[0];
}