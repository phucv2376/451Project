'use client';

import React, { useState } from "react";
import { Transaction, TransactionListResponse } from "../models/Transaction";
import {
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Chip, Stack
} from "@mui/material";
import { getCategory } from "../models/TransactionCategory";

type Props = {
    transactions: Transaction[];
    paging?: TransactionListResponse;
    enablePagination?: boolean;
    enableCheckbox?: boolean;
    enableSubCat?: boolean;
    page?: number;
    rowsPerPage?: number;
    onPageChange?: (event: unknown, newPage: number) => void;
    onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    selectedTransaction?: string | null;
    onTransactionSelect?: (transactionId: string) => void;
    getTransactionSelected?: (transaction: any) => void;
};

const TransactionTable = (props: Props) => {
    // Use the transactions directly from props since pagination is handled by the backend
    const transactions = props.transactions;

    // Handle row selection
    const handleRowSelection = (transactionId: string) => {
        if (props.onTransactionSelect) {
            props.onTransactionSelect(transactionId);
        }
    };

    const handleTransactionClick = (transaction : any) => {
        //console.log("Selected Transaction test:", transaction);
        if (props.getTransactionSelected) {
            props.getTransactionSelected(transaction); 
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="overflow-x-auto">
            <TableContainer component={Paper} elevation={0}>
                <Table className="min-w-full">
                    <TableHead className="bg-gray-50">
                        <TableRow >
                            {props.enableCheckbox && (
                                <TableCell padding="checkbox" />
                            )}
                            <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </TableCell>
                            <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </TableCell>
                            <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </TableCell>
                            <TableCell className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody className="divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                            <TableRow
                                key={transaction.transactionId}
                                hover
                                selected={props.selectedTransaction === transaction.transactionId}
                                onClick={() => {
                                    handleRowSelection(transaction.transactionId);
                                    handleTransactionClick(transaction); 
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {props.enableCheckbox && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={props.selectedTransaction === transaction.transactionId}
                                            onChange={() => handleRowSelection(transaction.transactionId)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className="px-6 py-4 text-sm text-gray-900">
                                    {formatDate(transaction.transactionDate)}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-gray-900">
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {transaction.categories.length > 0 && (
                                            <Chip
                                                icon={React.createElement(getCategory(transaction).Icon)}
                                                label={transaction.categories[0]}
                                                size="small"
                                                color="primary"
                                            />
                                        )}
                                        {props.enableSubCat && (
                                            transaction.categories.slice(1).map((subcategory, index) => (
                                            <Chip
                                                key={index}
                                                label={subcategory}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )))}
                                    </Stack>
                                </TableCell>

                                <TableCell className="px-6 py-4 text-sm text-gray-900">
                                    {transaction.payee}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-right" sx={{
                                    color: transaction.amount < 0 ? 'error.main' : 'success.main',
                                    fontWeight: 500
                                }}>
                                    {formatAmount(transaction.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {props.enablePagination && props.paging && (
                    <TablePagination
                        component="div"
                        count={props.paging.paging.totalRows}
                        page={(props.page || 1) - 1}
                        rowsPerPage={props.rowsPerPage || 10}
                        onPageChange={props.onPageChange || (() => { })}
                        onRowsPerPageChange={props.onRowsPerPageChange || (() => { })}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        sx={{ borderTop: 1, borderColor: 'divider' }}
                    />
                )}
            </TableContainer>
        </div>
    );
};

export default TransactionTable;