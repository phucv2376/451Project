import TransactionTable from "./TransactionTable";

const RecentTransactionTable = ({ transactions, error, isLoading }: { transactions: Transaction[]; error: string | null; isLoading: boolean }) => (
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
                        enableSubCat={false}
                    />
                )}
            </div>
        </div>
    </div>
);

export default RecentTransactionTable;