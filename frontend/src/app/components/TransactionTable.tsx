import React from "react";
import { Transaction } from "../models/Transaction";

type Props = {
    transactions: Transaction[];
};

const TransactionTable = (props: Props) => {
    return (
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
                    {props.transactions.map((transaction, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.date.toDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                {transaction.category.Icon ? <transaction.category.Icon /> : null} {transaction.category.category}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900">${transaction.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;