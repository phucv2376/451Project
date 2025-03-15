"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Box, LinearProgress, Stack } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { usePlaid } from "../hooks/usePlaid";
import NavBar from "../components/NavBar";
import BankIntegration from "../components/PlaidIntegration/BankIntegration";
import TransactionTable from "../components/TransactionTable";
import { Transaction } from "../models/Transaction";
import {
    getRecentTransactions,
    getMonthlyIncome,
    getMonthlyExpenses,
} from "../services/transactionService";

const Dashboard = () => {
    const { logout } = useAuth();
    const { plaidAccessToken, exchangePublicToken, disconnectBank } = usePlaid();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
    const [loadingState, setLoadingState] = useState({
        transactions: true,
        financials: true,
    });
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [contentKey, setContentKey] = useState<number>(0);

    // Memoized variable for checking bank connection
    const isBankConnected = useMemo(() => !!plaidAccessToken, [plaidAccessToken]);

    // Fetch Transactions and Financial Data
    const updateTransactions = async () => {
        const storedUserId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!storedUserId || !accessToken) {
            setError("Authentication required");
            setLoadingState({ transactions: false, financials: false });
            return;
        }

        setUserId(storedUserId);

        try {
            setLoadingState({ transactions: true, financials: true });
            const [transactionsResult, incomeResult, expensesResult] = await Promise.all([
                getRecentTransactions(storedUserId, accessToken),
                getMonthlyIncome(storedUserId, accessToken),
                getMonthlyExpenses(storedUserId, accessToken),
            ]);

            setTransactions(transactionsResult.success ? transactionsResult.data || [] : []);
            setMonthlyIncome(incomeResult.success ? incomeResult.data || 0 : 0);
            setMonthlyExpenses(expensesResult.success ? expensesResult.data || 0 : 0);
            setError(transactionsResult.success ? null : transactionsResult.message || "No transactions found");
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to fetch data");
            setTransactions([]);
        } finally {
            setLoadingState({ transactions: false, financials: false });
        }
    };

    // Load user data and transactions on mount
    useEffect(() => {
        setName(localStorage.getItem("user") || "User");
        updateTransactions();
    }, []);

    // Handle Plaid success (smooth refresh without reloading the page)
    const handlePlaidSuccess = useCallback(async (publicToken: string) => {
        try {
            await exchangePublicToken(publicToken);
            await updateTransactions();
            setContentKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error("Error exchanging public token:", error);
        }
    }, [exchangePublicToken]);

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            <NavBar /> {/* Sidebar will not refresh */}
            <div className="w-full lg:ml-[5%] lg:w-3/4 p-4" key={contentKey}>
                <p className="text-3xl mb-6">Hello, {name}!</p>

                {/* Bank Integration & Financial Summary */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            <BankIntegration
                                onDisconnect={disconnectBank}
                                isConnected={isBankConnected}
                                onPlaidSuccess={handlePlaidSuccess}
                            />
                        </div>
                    </div>
                    <FinancialSummary
                        monthlyIncome={monthlyIncome}
                        monthlyExpenses={monthlyExpenses}
                        isLoading={loadingState.financials}
                    />
                </div>

                {/* Recent Transactions & Budget Overview */}
                <div className="flex flex-col lg:flex-row gap-4 mt-6">
                    <TransactionSection
                        transactions={transactions}
                        error={error}
                        isLoading={loadingState.transactions}
                    />
                    <BudgetOverview />
                </div>
                 {/* 🔥 Spending Breakdown Section Added Back */}
                 <SpendingBreakdown />
            </div>
        </div>
    );
};

/**
 * Financial Summary Component
 */
const FinancialSummary = ({ monthlyIncome, monthlyExpenses, isLoading }: { monthlyIncome: number; monthlyExpenses: number; isLoading: boolean }) => (
    <div className="w-full lg:w-1/3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-md font-semibold mb-2 text-gray-800">Financial Summary</h3>
            <div className="flex flex-col gap-3">
                <SummaryItem label="Cash In:" value={monthlyIncome} isLoading={isLoading} positive />
                <SummaryItem label="Cash Out:" value={monthlyExpenses} isLoading={isLoading} />
            </div>
        </div>
    </div>
);

/**
 * Transaction Section Component
 */
const TransactionSection = ({ transactions, error, isLoading }: { transactions: Transaction[]; error: string | null; isLoading: boolean }) => (
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
                    <TransactionTable transactions={transactions} enablePagination={false} enableCheckbox={false} />
                )}
            </div>
        </div>
    </div>
);

/**
 * Budget Overview Component
 */
const BudgetOverview = () => (
    <div className="w-full lg:w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-md mb-5">Budget Overview</h2>
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4">{/* Budget data */}</div>
        </div>
    </div>
);

/**
 * Summary Item Component
 */
const SummaryItem = ({ label, value, isLoading, positive = false }: { label: string; value: number; isLoading: boolean; positive?: boolean }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`font-semibold ${positive ? "text-green-500" : "text-red-500"}`}>
            {isLoading ? "Loading..." : `${positive ? "+" : "-"}$${value.toFixed(2)}`}
        </span>
    </div>
);

/**
 * Spending Breakdown Component (RESTORED ✅)
 */
const SpendingBreakdown = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mt-6 shadow-sm">
        <h2 className="font-bold text-md mb-4">Spending Breakdown</h2>
        <Box sx={{ width: "100%" }}>
            <Box sx={{ width: "100%", height: "30px", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
                <LinearProgress
                    variant="determinate"
                    value={100} 
                    sx={{
                        height: "100%",
                        backgroundColor: "#e0e0e0",
                        position: "absolute",
                        width: "100%",
                    }}
                />
                <Box sx={{ display: "flex", height: "100%", position: "absolute", width: "100%" }}>
                    {/* Spending breakdown data will be added here */}
                </Box>
            </Box>

            <Stack direction="row" justifyContent="flex-start" spacing={7} sx={{ mt: 2 }}>
                {/* Category labels will be added here */}
            </Stack>
        </Box>
    </div>
);


export default Dashboard;
