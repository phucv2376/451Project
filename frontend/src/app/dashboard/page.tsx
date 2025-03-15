"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, LinearProgress, Typography, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import NavBar from "../components/NavBar";
import BudgetCircle from "../components/BudgetCircle";
import TransactionTable from "../components/TransactionTable";
import MoneyBox from "../components/MoneyBox";

import { Transaction } from "../models/Transaction";
/*import { categories } from "../models/TransactionCategory";*/
import { useAuth } from "../contexts/AuthContext";

import { getRecentTransactions } from "../services/transactionService";
import { access } from "fs";
import BankIntegration from "../components/PlaidIntegration/BankIntegration";
import PlaidLinkWrapper from "../components/PlaidIntegration/PlaidLinkWrapper";
import { usePlaid } from '../hooks/usePlaid';

const Dashboard = () => {
    const { logout } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([{
        transactionId: "",
        transactionDate: new Date,
        amount: 0,
        category: "",
        payee: ""
    }]);
    
    const [name, setName] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const { plaidAccessToken, exchangePublicToken, disconnectBank } = usePlaid();


    useEffect(() => {
        setName(localStorage.getItem('user'));
        setUserId(localStorage.getItem('userId'));
        const accessToken = localStorage.getItem('accessToken');

        // Fetch recent transactions
        const fetchTransactions = async () => {
            if (!userId) {
                setError("User ID not found");
                return;
            }
            if (!accessToken) {
                //logout();
                return;
            }
            const result = await getRecentTransactions(userId, accessToken);
            if (result.success) {
                if (result.data) {
                    setTransactions(result.data);
                } else {
                    setError("No data found");
                }
            } else {
                setError(result.message || "An unknown error occurred");
            }
        };
        fetchTransactions();
    }, [userId]); // Add userId as a dependency

    // Return nothing until mounted to prevent hydration mismatches.


    /*const expenses = [
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
    ];*/


    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            {/*Nav bar*/}
            <NavBar />

            {/*Main Page*/}
            <div className="ml-[20%] mr-5 mt-5 w-3/4 h-full">
                <p className="text-3xl mb-10">Hello, {name}!</p>
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

                <div className="mt-7">
                {!plaidAccessToken ? (
                    <PlaidLinkWrapper onSuccess={exchangePublicToken} />
                ) : (
                    <BankIntegration onDisconnect={disconnectBank} />
                )}
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
                                        transactions={transactions}
                                        enablePagination={false}
                                        enableCheckbox={false}
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
                               {/* <BudgetCircle
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
                                */}
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
                                {/*expenses.map((expense, index) => (
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
                                ))*/}
                            </Box>
                        </Box>

                        {/* Labels */}
                        <Stack direction="row" justifyContent="flex-start" spacing={7} sx={{ mt: 2 }}>
                            {/*expenses.map((expense, index) => (
                                <Stack key={index} direction="row" alignItems="center" spacing={2}>
                                  
                                    <Box
                                        sx={{
                                            width: 15,
                                            height: 15,
                                            borderRadius: "50%",
                                            backgroundColor: expense.category.color,
                                        }}
                                    />
                                    {
                                    <Typography variant="body2" sx={{ color: "black" }}>
                                        {expense.category.category} ({expense.percentage}%)
                                    </Typography>
                                </Stack>
                            ))*/}
                        </Stack>
                    </Box>

                </div>

            </div>
        </div>
    );
}

export default Dashboard;