"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { red } from '@mui/material/colors';
import BudgetCircle from "../components/BudgetCircle";
import { Box, LinearProgress, Typography, Stack } from '@mui/material';
import TransactionTable from "../components/TransactionTable";

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
import { useAuth } from "../contexts/AuthContext";
import { categories } from "../models/TransactionCategory";
import React from "react";

const Dashboard = () => {
    const { accessToken, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    useEffect(() => {
        if (!accessToken) {
            //logout();
        }
    }, []);

    const router = useRouter();

    const handleSettings = () => {

    }

    const expenses = [
        { 
            category: 'Transportation', 
            percentage: 8, 
            color: 'red' 
        },
        {
            category: 'Food & Dining',
            percentage: 92,
            color: 'blue'
        },
    ];

    const transactionList = [
        {
            id: '0',
            date: new Date(),
            amount: 323.20,
            description: 'Groceries',
            category: categories[0]
        },
        {
            id: '1',
            date: new Date(),
            amount: 12.40,
            description: 'Uber',
            category: categories[1]
        },
        {
            id: '3',
            date: new Date(),
            amount: 2576.00,
            description: 'Tuition',
            category: categories[3]
        },
        {
            id: '2',
            date: new Date(),
            amount: 23.57,  
            description: 'Movie',
            category: categories[2]
        },
        {
            id: '5',
            date: new Date(),
            amount: 292.30,
            description: 'Job',
            category: categories[5]
        }
        
    ]

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            {/*Nav bar*/}
            <div className="bg-white h-full w-1/6 p-6 flex flex-col shadow-right shadow-sm border border-gray-200 fixed">
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
            <div className="ml-[20%] mr-5 mt-5 w-3/4 h-full">
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
                                    <TransactionTable
                                        transactions={transactionList}
                                    />
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

                {/*Expenses Table*/}
                <div className="bg-white rounded-lg border border-gray-200 p-5 mt-5 mb-7 shadow-sm">
                    <h2 className="font-bold text-md justify-start mb-5">Spending Breakdown</h2>
                    <Box sx={{ width: '100%' }}>
                        {/* Combined Progress Bar */}
                        <Box sx={{ width: '100%', height: '20px', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                            {/* Background Bar */}
                            <LinearProgress
                                variant="determinate"
                                value={100} // Full width background
                                sx={{
                                    height: '100%',
                                    backgroundColor: '#e0e0e0', // Light gray background for the full bar
                                    position: 'absolute',
                                    width: '100%',
                                }}
                            />
                            {/* Segmented Bar */}
                            <Box sx={{ display: 'flex', height: '100%', position: 'absolute', width: '100%' }}>
                                {expenses.map((expense, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: `${expense.percentage}%`,
                                            backgroundColor: expense.color,
                                            height: '100%',
                                            borderRadius: index === 0 ? '5px 0 0 5px' :
                                                index === expenses.length - 1 ? '0 5px 5px 0' : '0',
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Labels */}
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                            {expenses.map((expense, index) => (
                                <Typography key={index} variant="body2" sx={{ color: expense.color }}>
                                    {expense.category} ({expense.percentage}%)
                                </Typography>
                            ))}
                        </Stack>
                    </Box>

                </div>

            </div>
        </div>
    );
}

export default Dashboard;