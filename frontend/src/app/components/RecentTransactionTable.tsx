// RecentTransactionTable.tsx
import { useEffect, useState } from 'react';
import TransactionTable from "./TransactionTable";
import { Transaction } from "../models/Transaction";
import { useRouter } from 'next/navigation';

const RecentTransactionTable = ({ transactions: initialTransactions, error, isLoading }: { 
    transactions: Transaction[]; 
    error: string | null; 
    isLoading: boolean 
}) => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const router = useRouter();

    useEffect(() => {
        // Update transactions when initialTransactions changes
        setTransactions(initialTransactions);
    }, [initialTransactions]);

    useEffect(() => {
        const handleNewTransaction = (event: CustomEvent) => {
            const { transactionDate, category, amount, name } = event.detail;
            
            // Create a new transaction object
            const newTransaction: Transaction = {
                transactionId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                categories: [category],
                amount: amount,
                transactionDate: new Date(transactionDate),
                payee: name
            };

            // Add the new transaction to the beginning of the list
            setTransactions(prev => [newTransaction, ...prev].slice(0, 10)); // Keep only the 10 most recent
        };

        // Add event listener for new transactions
        window.addEventListener('newTransaction', handleNewTransaction as EventListener);

        // Cleanup
        return () => {
            window.removeEventListener('newTransaction', handleNewTransaction as EventListener);
        };
    }, []);

    return (
        <div className="w-full m-h-full mlg:w-2/3 cursor-pointer bg-white rounded-lg border border-gray-200 shadow-sm p-5" onClick={() => {router.push("/transaction")}}>
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
                            enableSubCat={false}
                        />
                    )}
            </div>
        </div>
    );
};

export default RecentTransactionTable;