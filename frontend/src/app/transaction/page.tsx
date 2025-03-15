"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';

import NavBar from "../components/NavBar";
import TransactionTable from "../components/TransactionTable";

import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


import { Transaction, TransactionListResponse } from '../models/Transaction';
import { transactionTypes } from '../models/TransactionType';
//import { categories } from "../models/TransactionCategory";
import { deleteTransaction } from '../services/transactionService';
import { getTransactions } from '../services/transactionService';


const TransactionPage = () => {
    const [category, setCategory] = useState('');
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showEditTransaction, setShowEditTransaction] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page

    const [transactions, setTransactions] = useState<Transaction[]>([{
        transactionId: "",
        transactionDate: new Date,
        amount: 0,
        category: "",
        payee: ""
    }]);
    const [transactionPaging, setTransactionPaging] = useState<TransactionListResponse>({
        paging: {
            totalRows: 10,
            totalPages: 0,
            curPage: 0,
            hasNextPage: false,
            hasPrevPage: false,
            nextPageURL: "",
            prevPageURL: ""
        },
        data: transactions,
    });

    const loadTransactions = async (page: number) => {
        if (!userId) {
            setError("User ID not found");
            //logout();
            return;
        }
        const result = await getTransactions(userId, rowsPerPage, page); // Fetch first page with 10 transactions
        if (result.success) {
            if (result.data) {
                //console.log(result.data);
                setTransactions(result.data.data);
                setTransactionPaging(result.data);
            } else {
                setError("No data found");
            }
        } else {
            setError(result.message || "An unknown error occurred");
        }
    }

    useEffect(() => {
        setUserId(localStorage.getItem('userId'));
    }, [userId]);

    useEffect(() => {
        console.log("In 1st" + transactionPaging.paging.curPage);

        loadTransactions(transactionPaging.paging.curPage);
    }, [userId, transactionPaging.paging.curPage, rowsPerPage]);

    const handlePageChange = (event: unknown, newPage: number) => {
        transactionPaging.paging.curPage = newPage;
        console.log(transactionPaging.paging.curPage);
        loadTransactions(transactionPaging.paging.curPage); // Fetch new page data
    };

    const handleRowsPerPageChange = () => {
        setRowsPerPage(rowsPerPage);
        transactionPaging.paging.curPage = 0; // Reset to the first page
        loadTransactions(transactionPaging.paging.curPage); // Fetch first page with new rows per page
    };



    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value as string);
    }

    const handleCancel = () => {
        setShowAddTransaction(false);
        setShowEditTransaction(false);
    }

    const handleShowAddTransaction = () => {
        setShowAddTransaction(true);
    }
    const handleShowEditTransaction = () => {
        setShowEditTransaction(true);
    }

    const handleTransactionType = (event: SelectChangeEvent) => {
        setTransactionType(event.target.value as string);
    }
    const handleDeleteTransaction = async () => {
        //const result = await deleteTransaction(transactionId, userId);
        /*
        if (result.success) {
            alert("Transaction deleted successfully!");
            //onDelete(); // Refresh the transaction list or update the UI
        } else {
            alert(`Failed to delete transaction: ${result.message}`);
        }
            */
    }

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            <NavBar />

            <div className="ml-[20%] mr-5 mt-5 w-3/4 h-full">
                <div className="h-full">
                    {/* White Container with Rounded Edges */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                        <div className="mb-5">
                            Filter
                        </div>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-md font-bold">Transaction History</h2>
                            <div className="justify-right">
                                <IconButton aria-label="delete" disabled color="primary">
                                    <DeleteIcon
                                        onClick={handleDeleteTransaction}
                                    />
                                </IconButton>
                                <IconButton aria-label="edit" color="primary">
                                    <EditIcon
                                        onClick={handleShowEditTransaction}
                                    />
                                </IconButton>
                                <IconButton aria-label="add" color="primary">
                                    <AddIcon
                                        onClick={handleShowAddTransaction}
                                    />
                                </IconButton>
                            </div>

                        </div>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <TransactionTable
                                paging={transactionPaging}
                                transactions={transactions}
                                enablePagination={true}
                                enableCheckbox={true}
                                page={transactionPaging.paging.curPage}
                                rowsPerPage={rowsPerPage}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleRowsPerPageChange}
                            />
                        </div>
                    </div>
                    {showEditTransaction && ( //grab info and fill in fields?
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-10">
                            <div className="bg-white rounded-lg border p-5 border-gray-200 w-1/3 h-[60%] ml-[25vh] relative">
                                <p className="font-bold mb-5">Edit Transaction</p>
                                <div className='flex mb-5'>
                                    <div className='flex-1 mr-2'>
                                        <p>Transaction Type</p>
                                        <Select
                                            id="simple-select"
                                            size="small"
                                            value={transactionType}
                                            onChange={handleTransactionType}
                                            sx={{ width: '100%' }}
                                        >
                                            {transactionTypes.map((type, index) => (
                                                <MenuItem key={index} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className='flex-1 ml-2'>
                                        <p>Category</p>
                                        <Select
                                            sx={{ width: '100%' }}
                                            size="small"
                                            id="simple-select"
                                            value={category}
                                            onChange={handleCategoryChange}
                                        >
                                            {/*categories.map((cat, index) => (
                                                <MenuItem key={index} value={cat.category}>
                                                    <cat.Icon style={{ color: cat.color, marginRight: '6px' }} />
                                                    {cat.category}
                                                </MenuItem>
                                            ))*/}
                                        </Select>
                                    </div>
                                </div>
                                <div className='flex mb-5'>
                                    <div className='flex-1 mr-2'>
                                        <p>Date</p>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}
                                        >
                                            <DateField
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                    <div className='flex-1 ml-2'>
                                        <p>Amount</p>
                                        <TextField
                                            id="outlined-start-adornment"
                                            size="small"
                                            placeholder="00.00"
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                },
                                            }}
                                            sx={{ width: '100%' }}
                                            variant="outlined"
                                        />
                                    </div>
                                </div>
                                <div className='flex'>
                                    <div className='flex-1'>
                                        <p>Transaction Description</p>
                                        <TextField
                                            id="outlined-size-small"
                                            variant="outlined"
                                            size="small"
                                            helperText="e.g. groceries"
                                            sx={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 space-x-2">
                                    <Button
                                        variant="contained"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                    >
                                        Cancel</Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showAddTransaction && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-10">
                            <div className="bg-white rounded-lg border p-5 border-gray-200 w-1/3 h-[60%] ml-[25vh] relative">
                                <p className="font-bold mb-5">Add Transaction</p>
                                <div className='flex mb-5'>
                                    <div className='flex-1 mr-2'>
                                        <p>Transaction Type</p>
                                        <Select
                                            id="simple-select"
                                            size="small"
                                            value={transactionType}
                                            onChange={handleTransactionType}
                                            sx={{ width: '100%' }}
                                        >
                                            {transactionTypes.map((type, index) => (
                                                <MenuItem key={index} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className='flex-1 ml-2'>
                                        <p>Category</p>
                                        <Select
                                            sx={{ width: '100%' }}
                                            size="small"
                                            id="simple-select"
                                            value={category}
                                            onChange={handleCategoryChange}
                                        >
                                            {/*categories.map((cat, index) => (
                                                <MenuItem key={index} value={cat.category}>
                                                    <cat.Icon style={{ color: cat.color, marginRight: '6px' }} />
                                                    {cat.category}
                                                </MenuItem>
                                            ))*/}
                                        </Select>
                                    </div>
                                </div>
                                <div className='flex mb-5'>
                                    <div className='flex-1 mr-2'>
                                        <p>Date</p>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}
                                        >
                                            <DateField
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                    <div className='flex-1 ml-2'>
                                        <p>Amount</p>
                                        <TextField
                                            id="outlined-start-adornment"
                                            size="small"
                                            placeholder="00.00"
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                },
                                            }}
                                            sx={{ width: '100%' }}
                                            variant="outlined"
                                        />
                                    </div>
                                </div>
                                <div className='flex'>
                                    <div className='flex-1'>
                                        <p>Transaction Description</p>
                                        <TextField
                                            id="outlined-size-small"
                                            variant="outlined"
                                            size="small"
                                            helperText="e.g. groceries"
                                            sx={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 space-x-2">
                                    <Button
                                        variant="contained"
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                    >
                                        Cancel</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionPage;