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
import FilterListIcon from '@mui/icons-material/FilterList';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Transaction, TransactionListResponse } from '../models/Transaction';
import { transactionTypes } from '../models/TransactionType';
import { deleteTransaction, getTransactions } from '../services/transactionService';

const TransactionPage = () => {
    const [category, setCategory] = useState('');
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showEditTransaction, setShowEditTransaction] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionPaging, setTransactionPaging] = useState<TransactionListResponse>({
        paging: {
            totalRows: 0,
            totalPages: 0,
            curPage: 0,
            hasNextPage: false,
            hasPrevPage: false,
            nextPageURL: "",
            prevPageURL: ""
        },
        data: []
    });

    const loadTransactions = async (page: number) => {
        const storedUserId = localStorage.getItem('userId');

        if (!storedUserId) {
            setError("User ID not found");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const result = await getTransactions(storedUserId, rowsPerPage, page);
            if (result.success && result.data) {
                setTransactions(result.data.data);
                setTransactionPaging(result.data);
                setCurrentPage(page);
                setError(null);
            } else {
                setError(result.message || "No data found");
                setTransactions([]);
            }
        } catch (error) {
            setError("An error occurred while loading transactions");
            console.error(error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            loadTransactions(0); // Load first page when userId is set
        }
    }, []);

    const handlePageChange = (event: unknown, newPage: number) => {
        if (event) {
            // @ts-ignore
            event.preventDefault?.();
        }   
        newPage = newPage + 1;
        setCurrentPage(newPage);
        loadTransactions(newPage);
    };


    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event) {
            event.preventDefault();
        }
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(0);
    };

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value as string);
    };

    const handleCancel = () => {
        setShowAddTransaction(false);
        setShowEditTransaction(false);
    };

    const handleShowAddTransaction = () => {
        setShowAddTransaction(true);
    };

    const handleShowEditTransaction = () => {
        if (selectedTransaction) {
            setShowEditTransaction(true);
        }
    };

    const handleTransactionType = (event: SelectChangeEvent) => {
        setTransactionType(event.target.value as string);
    };

    const handleDeleteTransaction = async () => {
        if (selectedTransaction && userId) {
            const result = await deleteTransaction(selectedTransaction, userId);
            if (result.success) {
                loadTransactions(currentPage); // Reload current page after deletion
                setSelectedTransaction(null);
            } else {
                setError(result.message || "Failed to delete transaction");
            }
        }
    };

    const handleTransactionSelect = (transactionId: string) => {
        setSelectedTransaction(transactionId === selectedTransaction ? null : transactionId);
    };

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            <NavBar />

            <div className="w-full lg:ml-[5%] lg:w-3/4 p-6">
                <div className="h-full">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        {/* Header Section */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-gray-800">Transactions</h1>
                                    <Button
                                        startIcon={<FilterListIcon />}
                                        onClick={() => setShowFilters(!showFilters)}
                                        size="small"
                                        color="inherit"
                                    >
                                        Filters
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconButton 
                                        aria-label="delete" 
                                        color="error"
                                        disabled={!selectedTransaction}
                                        onClick={handleDeleteTransaction}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton 
                                        aria-label="edit" 
                                        color="primary"
                                        disabled={!selectedTransaction}
                                        onClick={handleShowEditTransaction}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleShowAddTransaction}
                                        size="small"
                                    >
                                        Add Transaction
                                    </Button>
                                </div>
                            </div>

                            {/* Filters Section */}
                            <Collapse in={showFilters}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Transaction Type</InputLabel>
                                        <Select
                                            value={transactionType}
                                            onChange={handleTransactionType}
                                            label="Transaction Type"
                                        >
                                            {transactionTypes.map((type, index) => (
                                                <MenuItem key={index} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={category}
                                            onChange={handleCategoryChange}
                                            label="Category"
                                        >
                                            {/* Add your categories here */}
                                        </Select>
                                    </FormControl>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateField
                                            label="Date"
                                            size="small"
                                            sx={{ width: '100%' }}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </Collapse>
                        </div>

                        {/* Table Section */}
                        <div className="overflow-x-auto">
                            {error && (
                                <div className="p-4 text-red-500">{error}</div>
                            )}
                            {loading ? (
                                <div className="p-4">Loading transactions...</div>
                            ) : (
                                <TransactionTable
                                    paging={transactionPaging}
                                    transactions={transactions}
                                    enablePagination={true}
                                    enableCheckbox={true}
                                    page={currentPage}
                                    rowsPerPage={rowsPerPage}
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    selectedTransaction={selectedTransaction}
                                    onTransactionSelect={handleTransactionSelect}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Modals */}
            {(showAddTransaction || showEditTransaction) && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-6">
                                {showAddTransaction ? 'Add Transaction' : 'Edit Transaction'}
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <FormControl fullWidth>
                                    <InputLabel>Transaction Type</InputLabel>
                                    <Select
                                        value={transactionType}
                                        onChange={handleTransactionType}
                                        label="Transaction Type"
                                    >
                                        {transactionTypes.map((type, index) => (
                                            <MenuItem key={index} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={category}
                                        onChange={handleCategoryChange}
                                        label="Category"
                                    >
                                        {/* Add your categories here */}
                                    </Select>
                                </FormControl>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateField
                                        label="Date"
                                        sx={{ width: '100%' }}
                                    />
                                </LocalizationProvider>

                                <TextField
                                    label="Amount"
                                    placeholder="0.00"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    fullWidth
                                />

                                <TextField
                                    label="Description"
                                    placeholder="e.g., Groceries at Walmart"
                                    fullWidth
                                    className="md:col-span-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                >
                                    {showAddTransaction ? 'Add' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionPage;