"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { red } from '@mui/material/colors';
import BudgetCircle from "../components/BudgetCircle";

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Avatar from '@mui/material/Avatar';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MoneyBox from "../components/MoneyBox";
import NavBarItems from "../components/NavBarItems";
import { Money } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
    const progressValue = 62; // Example: 62% progress
    const { accessToken, logout } = useAuth();

    
      const handleLogout = () => {
        logout();
      };

    useEffect(() => {
        if (!accessToken){
            logout();
        }
    }, []);

    const router = useRouter();

    const handleSettings = () => {

    }



    return (
        <div className="flex bg-[#F1F5F9] h-dvh w-full">

            {/*Nav bar*/}
            <div className="bg-white h-full w-1/6 p-6 flex flex-col shadow-right shadow-sm border border-gray-200">
                <h1 className="text-xl mb-5">Our App Name</h1>
                <div>
                    <NavBarItems
                        label="Dashboard"
                        alt="Dashboard"
                        Icon={GridViewOutlinedIcon}
                    />
                    <NavBarItems
                        label="Transactions"
                        alt="Transactions"
                        Icon={SwapHorizOutlinedIcon}
                    />
                    <NavBarItems
                        label="Goals"
                        alt="Goals"
                        Icon={EmojiEventsOutlinedIcon}
                    />
                    <NavBarItems
                        label="Analytics"
                        alt="Analytics"
                        Icon={InsightsOutlinedIcon}
                    />
                </div>

                <div className="mt-auto">
                    <div className="border-t border-gray-200"></div>
                    <NavBarItems
                        label="Settings"
                        onClick={handleSettings}
                        alt="Settings"
                        Icon={SettingsOutlinedIcon}
                    />
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center">
                            <Avatar />
                            <h2 className="ml-3">Profile</h2>
                        </div>
                        <LogoutOutlinedIcon
                            sx={{
                                color: red[600],
                                '&:hover': { color: red[900] },
                            }}
                            className="cursor-pointer"
                            onClick={handleLogout}
                        />
                    </div>
                </div>

            </div>

            {/*Main Page*/}
            <div className="ml-10 mr-10 mt-5 w-3/4 h-full">
                <p className="text-3xl mb-10">Hello, Name!</p>
                <div className="flex flex-row gap-10 mt-5 justify-center">
                    <div className="flex-1 bg-white rounded-lg flex flex-col items-start justify-start p-5 border border-gray-200">
                        <p className="text-md font-bold">Balance</p>
                        <div className="flex items-center gap-2 mt-4">
                            <h2 className="text-4xl font-bold">$1,234.56</h2>
                            <TrendingUpIcon
                                sx={{
                                    color: '#4caf50', // Green color
                                }}
                            />
                        </div>
                        
                    </div>
                    <MoneyBox
                        text="Cash In"
                        money="+$196"
                    />
                    <MoneyBox   
                        text="Cash Out"
                        money="-$280"
                    />
                </div>

                <div className="flex flex-row gap-5 mt-7">
                    {/*Table*/}
                    <div className="flex-[2]">
                        <div className="h-full">
                            {/* White Container with Rounded Edges */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                                {/* Table Title */}
                                <h2 className="text-md font-bold mb-6">Recent Transaction History</h2>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        {/* Table Header */}
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            </tr>
                                        </thead>

                                        {/* Table Body */}
                                        <tbody className="divide-y divide-gray-200">
                                            {/* Row 1 */}
                                            <tr>
                                                <td className="px-6 py-4 text-sm text-gray-900">2023-10-01</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Food & Dining</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Groceries</td>
                                                <td className="px-6 py-4 text-sm text-right text-gray-900">-$50.00</td>
                                            </tr>

                                            {/* Row 2 */}
                                            <tr>
                                                <td className="px-6 py-4 text-sm text-gray-900">2023-10-02</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Transport</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Gas</td>
                                                <td className="px-6 py-4 text-sm text-right text-gray-900">-$30.00</td>
                                            </tr>

                                            {/* Row 3 */}
                                            <tr>
                                                <td className="px-6 py-4 text-sm text-gray-900">2023-10-03</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Income</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Salary</td>
                                                <td className="px-6 py-4 text-sm text-right text-green-600">+$2,000.00</td>
                                            </tr>

                                            {/* Row 4 */}
                                            <tr>
                                                <td className="px-6 py-4 text-sm text-gray-900">2023-10-04</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Entertainment</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Movie Tickets</td>
                                                <td className="px-6 py-4 text-sm text-right text-gray-900">-$25.00</td>
                                            </tr>

                                            <tr>
                                            <td className="px-6 py-4 text-sm text-gray-900">2023-10-04</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Personal Care</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">Skincare</td>
                                                <td className="px-6 py-4 text-sm text-right text-gray-900">-$52.21</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*Goals*/}
                    <div className="flex-[1] bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-md justify-start mb-5">Budget</h2>
                        <div className="flex justify-center">
                        <div className="grid grid-cols-2 gap-10 ">
                            <BudgetCircle
                                progressValue={10}
                                color="#3f51b5"
                                label="Transportation"
                            />
                            <BudgetCircle
                                progressValue={94}
                                color="#cf6087"
                                label="Education"
                            />
                            <BudgetCircle
                                progressValue={51}
                                color="#1d8e1e"
                                label="Personal Care"
                            />
                            <BudgetCircle
                                progressValue={72}
                                color="#df98d3"
                                label="Food & Dining"
                            />
                        </div>
                    </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;