"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { red } from '@mui/material/colors';
import BudgetCircle from "../components/BudgetCircle";
import { Box, LinearProgress, Typography, Stack } from '@mui/material';
import TransactionTable from "../components/TransactionTable";
import NavBar from "../components/NavBar";

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

    useEffect(() => {
        if (!accessToken) {
            //logout();
        }
    }, []);

    const router = useRouter();

    const expenses = [
        {
            category: categories[0],
            percentage: 8,
        },
        {
            category: categories[1],
            percentage: 20,
        },
        {
            category: categories[2],
            percentage: 12,
        },
        {
            category: categories[3],
            percentage: 29,
        },
        {
            category: categories[4],
            percentage: 31
        }
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
            <NavBar />

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
                                    color={categories[1].color}
                                    label={categories[1].category}
                                />
                                <BudgetCircle
                                    progressValue={94}
                                    color={categories[3].color}
                                    label={categories[3].category}
                                />
                                <BudgetCircle
                                    progressValue={51}
                                    color={categories[4].color}
                                    label={categories[4].category}
                                />
                                <BudgetCircle
                                    progressValue={72}
                                    color={categories[0].color}
                                    label={categories[0].category}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/*Expenses Table*/}
                <div className="bg-white rounded-lg border border-gray-200 p-5 mt-7 mb-7 shadow-sm">
                    <h2 className="font-bold text-md justify-start mb-5">Spending Breakdown</h2>
                    <Box sx={{ width: '100%' }}>
                        {/* Combined Progress Bar */}
                        <Box sx={{ width: '100%', height: '30px', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
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
                                            backgroundColor: expense.category.color,
                                            height: '100%',
                                            borderRadius: index === 0 ? '5px 0 0 5px' :
                                                index === expenses.length - 1 ? '0 5px 5px 0' : '0',
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Labels */}
                        <Stack direction="row" justifyContent="flex-start" spacing={7} sx={{ mt: 2 }}>
                            {expenses.map((expense, index) => (
                                <Stack key={index} direction="row" alignItems="center" spacing={2}>
                                    {/* Colored circle */}
                                    <Box
                                        sx={{
                                            width: 15,
                                            height: 15,
                                            borderRadius: "50%",
                                            backgroundColor: expense.category.color,
                                        }}
                                    />
                                    {/* Text */}
                                    <Typography variant="body2" sx={{ color: "black" }}>
                                        {expense.category.category} ({expense.percentage}%)
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>

                </div>

            </div>
        </div>
    );
}

export default Dashboard;