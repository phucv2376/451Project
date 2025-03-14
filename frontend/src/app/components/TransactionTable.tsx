import React, { useState } from "react";
import { Transaction, TransactionListResponse } from "../models/Transaction";
import { Checkbox, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, TablePagination } from "@mui/material";
import { getCategory } from "../models/TransactionCategory";

type Props = {
    transactions: Transaction[];
    paging?: TransactionListResponse;
    enablePagination?: boolean; 
    enableCheckbox?: boolean;
    page?: number;
    rowsPerPage?: number;
    onPageChange?: any;
    onRowsPerPageChange?: any
};

const TransactionTable = (props: Props) => {
    //const [page, setPage] = useState(props.paging.paging.curPage);
    //const [rowsPerPage, setRowsPerPage] = useState(props.paging.paging.totalRows);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    
    // Slice the transactions if pagination is enabled
    const paginatedTransactions = props.enablePagination
    ? props.transactions.slice(
        (props.page ?? 0) * (props.rowsPerPage ?? 10), 
        (props.page ?? 0) * (props.rowsPerPage ?? 10) + (props.rowsPerPage ?? 10)
      )
    : props.transactions;

    // // Handle page change
    // const handleChangePage = (event: unknown, newPage: number) => {
    //     setPage(newPage);
    // };

    // // Handle rows per page change
    // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setRowsPerPage(parseInt(event.target.value, 10));
    //     setPage(0); // Reset to the first page
    // };

    
    // Handle row selection
    const handleRowSelection = (transactionId: string) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(transactionId)) {
            newSelectedRows.delete(transactionId);
        } else {
            newSelectedRows.add(transactionId);
        }
        setSelectedRows(newSelectedRows);
    };

    
    // Handle "Select All" checkbox
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const allRowIds = paginatedTransactions.map((transaction) => transaction.transactionId);
            setSelectedRows(new Set(allRowIds));
        } else {
            setSelectedRows(new Set());
        }
    };

    return (
        <div className="overflow-x-auto">
            <TableContainer component={Paper}>
                <Table className="min-w-full">
                    {/* Table Header */}
                    <TableHead className="bg-gray-100">
                        <TableRow>
                            {/* Checkbox column (conditionally rendered) */}
                            {props.enableCheckbox && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={
                                            selectedRows.size > 0 && selectedRows.size < paginatedTransactions.length
                                        }
                                        checked={selectedRows.size === paginatedTransactions.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
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

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-200">
                        {props.transactions.map((transaction) => (
                            <TableRow
                                key={transaction.transactionId}
                                hover={props.enableCheckbox} // Enable hover only if checkboxes are enabled
                                selected={props.enableCheckbox && selectedRows.has(transaction.transactionId)} // Highlight selected rows only if checkboxes are enabled
                                onClick={() => props.enableCheckbox && handleRowSelection(transaction.transactionId)} // Handle row selection only if checkboxes are enabled
                                style={{ cursor: props.enableCheckbox ? "pointer" : "default" }} // Change cursor only if checkboxes are enabled
                            >

                                {/* Checkbox column (conditionally rendered) */}
                                {props.enableCheckbox && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedRows.has(transaction.transactionId)}
                                            onChange={() => handleRowSelection(transaction.transactionId)}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className="px-6 py-4 text-sm text-gray-900">
                                    {new Date(transaction.transactionDate).toDateString()}                               
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-gray-900 ">
                                    <div className="flex gap-2">
                                        <div style={{ color: getCategory(transaction).color }}>
                                            {React.createElement(getCategory(transaction).Icon)}
                                        </div>
                                        {getCategory(transaction).category}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-gray-900">
                                    {transaction.payee}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-right text-gray-900">
                                    ${transaction.amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                <tfoot>
                    <tr>
                        {props.enablePagination && (
                            <TablePagination sx={{ borderBottom: "none" }}
                                count={props.paging?.paging.totalRows!}
                                rowsPerPage={props.rowsPerPage!}
                                page={props.page!}
                                onPageChange={props.onPageChange}
                                onRowsPerPageChange={props.onRowsPerPageChange}
                            />
                        )}
                    </tr>
                </tfoot>
            </Table>
            </TableContainer>
        </div>
    );
};

export default TransactionTable;