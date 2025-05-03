import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { topTransactionsBudget } from "../services/budgetService";
import { Transaction } from "../models/Transaction";
import { format } from 'date-fns';

interface Props {
    userId: string,
    category: string
}

const TopTransactionsTable = (props: Props) => {
    const [topTransactions, setTopTransactions] = useState<Transaction[]>([]);
    const currentMonth = format(new Date(), 'MMMM'); // Gets current month name (e.g., "May")

    useEffect(() => {
        const fetchTopTransactions = async () => {
            const result = await topTransactionsBudget(props.userId, props.category);
            if (result.success) {
                const sortedTransactions = [...result.data || []].sort((a, b) => a.amount - b.amount);
                setTopTransactions(sortedTransactions);
            }
        };
        fetchTopTransactions();
    }, [props.userId, props.category]);

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                maxWidth: 300,
                ml: 2,
                maxHeight: 330, // Maximum height with scroll
                minHeight: topTransactions.length === 0 ? 100 : 300 // Minimum height
            }}
        >
            <Typography variant="subtitle2" sx={{ p: 2, pb: 1, fontWeight: 600 }}>
                Top Transactions from {currentMonth}
            </Typography>
            <Table size="small">
                <TableBody>
                    {topTransactions.length === 0 ? (
                        <TableRow sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell 
                          colSpan={2} 
                          align="center"
                          sx={{ borderBottom: 'none' }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No transactions found...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                        topTransactions.map((transaction, index) => (
                            <TableRow 
                                key={index} 
                                hover
                                sx={{
                                    // Remove bottom border for the 5th transaction
                                    '&:last-child td': { borderBottom: index === 4 ? 'none' : undefined }
                                  }}
                            >
                                <TableCell>
                                    <div>
                                        <Typography variant="body2">{transaction.payee}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(transaction.transactionDate), 'MMMM dd, yyyy')}
                                        </Typography>
                                    </div>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        color={transaction.amount < 0 ? 'error.main' : 'success.main'}
                                        fontWeight={500}
                                    >
                                        {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TopTransactionsTable;