"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePlaid } from "../hooks/usePlaid";
import NavBar from "../components/NavBar";
import { Transaction } from "../models/Transaction";
import {
  getRecentTransactions,
  getMonthlyIncome,
  getMonthlyExpenses,
} from "../services/transactionService";
import BalanceSummary from "../components/BalanceSummary";
import SpendingBreakdown from "../components/SpendingBreakdown";
import CashflowSummary from "../components/CashflowSummary";
import RecentTransactionTable from "../components/RecentTransactionTable";
import BudgetOverview from "../components/BudgetOverview";
import { useRouter } from "next/navigation";

const Dashboard = () => {
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

  const router = useRouter();

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
      const [transactionsResult, incomeResult, expensesResult] =
        await Promise.all([
          getRecentTransactions(storedUserId, accessToken),
          getMonthlyIncome(storedUserId, accessToken),
          getMonthlyExpenses(storedUserId, accessToken),
        ]);

      setTransactions(
        transactionsResult.success ? transactionsResult.data || [] : []
      );
      setMonthlyIncome(incomeResult.success ? incomeResult.data || 0 : 0);
      setMonthlyExpenses(expensesResult.success ? expensesResult.data || 0 : 0);
      setError(
        transactionsResult.success
          ? null
          : transactionsResult.message || "No transactions found"
      );
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
  const handlePlaidSuccess = useCallback(
    async (publicToken: string) => {
      try {
        await exchangePublicToken(publicToken);
        await updateTransactions();
        setContentKey((prevKey) => prevKey + 1);
        console.log("test");
      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    },
    [exchangePublicToken]
  );

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen w-full">
      <NavBar />
      <div className="w-full lg:ml-[5%] lg:w-3/4 p-4" key={contentKey}>
        <p className="text-3xl mb-6">Hello, {name}!</p>

        {/* Bank Integration & Financial Summary */}
        <div className="flex flex-col lg:flex-row gap-4">
          <BalanceSummary
            onDisconnect={disconnectBank}
            isConnected={isBankConnected}
            onPlaidSuccess={handlePlaidSuccess}
          />
          <CashflowSummary
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            isLoading={loadingState.financials}
          />
        </div>

        {/* Recent Transactions & Budget Overview */}
        <div className="flex m-h-[24rem] flex-col lg:flex-row gap-4 mt-6">
          <RecentTransactionTable
            transactions={transactions}
            error={error}
            isLoading={loadingState.transactions}
          />
          <BudgetOverview />
        </div>
        <SpendingBreakdown />
      </div>
    </div>
  );
};

export default Dashboard;
