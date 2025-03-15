"use client";

import React, { useEffect, useState } from "react";
import { Box, LinearProgress, Stack } from '@mui/material';
import { useAuth } from "../contexts/AuthContext";
import NavBar from "../components/NavBar";
import BankIntegration from "../components/PlaidIntegration/BankIntegration";
import TransactionTable from "../components/TransactionTable";
import { Transaction } from "../models/Transaction";
import { getRecentTransactions, getMonthlyIncome, getMonthlyExpenses } from "../services/transactionService";
import { usePlaid } from '../hooks/usePlaid';

const Dashboard = () => {
    const { logout } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const { plaidAccessToken, exchangePublicToken, disconnectBank } = usePlaid();
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);

    useEffect(() => {
        const storedName = localStorage.getItem('user') || '';
        const storedUserId = localStorage.getItem('userId') || '';
        const accessToken = localStorage.getItem('accessToken');

        setName(storedName);
        setUserId(storedUserId);

        const fetchTransactions = async () => {
            if (!storedUserId || !accessToken) {
                setError("Authentication required");
                setIsLoading(false);
                return;
            }

            try {
                const [transactionsResult, incomeResult, expensesResult] = await Promise.all([
                    getRecentTransactions(storedUserId, accessToken),
                    getMonthlyIncome(storedUserId, accessToken),
                    getMonthlyExpenses(storedUserId, accessToken)
                ]);

                if (transactionsResult.success && transactionsResult.data) {
                    setTransactions(transactionsResult.data);
                } else {
                    setError(transactionsResult.message || "No transactions found");
                    setTransactions([]);
                }

                if (incomeResult.success) {
                    setMonthlyIncome(incomeResult.data || 0);
                }

                if (expensesResult.success) {
                    setMonthlyExpenses(expensesResult.data || 0);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError("Failed to fetch data");
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const handlePlaidSuccess = async (publicToken: string) => {
        try {
            await exchangePublicToken(publicToken);
        } catch (error) {
            console.error('Error exchanging public token:', error);
        }
    };

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            <NavBar />
    
            <div className="w-full lg:ml-[5%] lg:w-3/4 p-4">
                <p className="text-3xl mb-6">Hello, {name || 'User'}!</p>
    
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            <BankIntegration 
                                onDisconnect={disconnectBank}
                                isConnected={!!plaidAccessToken}
                                onPlaidSuccess={handlePlaidSuccess}
                            />
                        </div>
                    </div>
    
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            <h3 className="text-md font-semibold mb-2 text-gray-800">Financial Summary</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Cash In:</span>
                                    <span className="text-green-500 font-semibold">
                                        {isLoading ? "Loading..." : `+$${monthlyIncome.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Cash Out:</span>
                                    <span className="text-red-500 font-semibold">
                                        {isLoading ? "Loading..." : `-$${monthlyExpenses.toFixed(2)}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div className="flex flex-col lg:flex-row gap-4 mt-6">
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                            <h2 className="text-md font-bold mb-4">Recent Transaction History</h2>
                            <div className="overflow-x-auto">
                                {isLoading ? (
                                    <p>Loading transactions...</p>
                                ) : error ? (
                                    <p className="text-red-500">{error}</p>
                                ) : transactions.length === 0 ? (
                                    <p>No transactions found</p>
                                ) : (
                                    <TransactionTable
                                        transactions={transactions}
                                        enablePagination={false}
                                        enableCheckbox={false}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
    
                    <div className="w-full lg:w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                        <h2 className="font-bold text-md mb-5">Budget Overview</h2>
                        <div className="flex justify-center">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Budget data will be added here */}
                            </div>
                        </div>
                    </div>
                </div>
    
                <div className="bg-white rounded-lg border border-gray-200 p-5 mt-6 shadow-sm">
                    <h2 className="font-bold text-md mb-4">Spending Breakdown</h2>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ width: '100%', height: '30px', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                            <LinearProgress
                                variant="determinate"
                                value={100} 
                                sx={{
                                    height: '100%',
                                    backgroundColor: '#e0e0e0',
                                    position: 'absolute',
                                    width: '100%',
                                }}
                            />
                            <Box sx={{ display: 'flex', height: '100%', position: 'absolute', width: '100%' }}>
                                {/* Spending breakdown data will be added here */}
                            </Box>
                        </Box>
    
                        <Stack direction="row" justifyContent="flex-start" spacing={7} sx={{ mt: 2 }}>
                            {/* Category labels will be added here */}
                        </Stack>
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;