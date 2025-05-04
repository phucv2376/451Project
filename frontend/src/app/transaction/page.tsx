"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';

import NavBar from "../components/NavBar";
import TransactionTable from "../components/TransactionTable";
import AddEditTransactionComponent from '../components/AddEditTransactionComponent';

import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField, DatePicker } from '@mui/x-date-pickers';
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
import dayjs, { Dayjs } from 'dayjs';

import {
    Transaction,
    TransactionListResponse,
    AddEditTransaction,
    EditTransaction,
    FilteredTransaction,
    AddTransaction
} from '../models/Transaction';
import { transactionTypes } from '../models/TransactionType';
import { categories } from '../models/TransactionCategory';
import {
    deleteTransaction,
    getTransactions,
    createTransaction,
    updateTransaction
} from '../services/transactionService';
import { set } from 'date-fns';

const TransactionPage = () => {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [date, setDate] = useState<Dayjs | null>(dayjs());

    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showEditTransaction, setShowEditTransaction] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorTransaction, setErrorTransaction] = useState<string | null>(null);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const [newTransaction, setNewTransaction] = useState<AddEditTransaction>({
        userId: "",
        transactionDate: dayjs().toDate(),
        amount: 0,
        payee: "",
        transactionType: "",
        categories: []
    });
    const [editTransaction, setEditTransaction] = useState<EditTransaction>({
        userId: "",
        transactionDate: dayjs().toDate(),
        amount: 0,
        payee: "",
        transactionType: "",
        category: "",
        transactionId: ""
    });
    const [filterTransaction, setFilterTransaction] = useState<FilteredTransaction>({
        MinAmount: null,
        MaxAmount: null,
        StartDate: null,
        EndDate: null,
        Category: null
    });
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
            const result = await getTransactions(storedUserId, rowsPerPage, page, filterTransaction);
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
            setNewTransaction(prev => ({
                ...prev,
                userId: storedUserId // Use storedUserId directly
            }));
            setEditTransaction(prev => ({
                ...prev,
                userId: storedUserId // Use storedUserId directly
            }));
            loadTransactions(0); // Load first page when userId is set
        }
    }, []);
    useEffect(() => {
        loadTransactions(currentPage);
    }, [rowsPerPage]); // Add rowsPerPage as a dependency

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

    // const sanitizeTransaction = (transaction: transaction): EditTransaction => {
    //     return {
    //       amount: transaction.amount,
    //       transactionDate: transaction.transactionDate,
    //       userId: transaction.userId,
    //       payee: transaction.payee,
    //       transactionType: transaction.transactionType,
    //       transactionId: transaction.transactionId,
    //       category: transaction.categories[0] || "",
    //     };
    //   };

    // Usage in your component
    const getTransactionInfo = (transaction: AddTransaction) => {
        //const sanitized = sanitizeTransaction(transaction);
        let tempEditTransaction: any = { ...transaction };
        tempEditTransaction.amount = Math.abs(transaction.amount);
        tempEditTransaction.category = transaction.categories[0] || "";
        tempEditTransaction.transactionType = transaction.amount > 0 ? "Income" : transaction.amount < 0 ? "Expense" : "";
        delete tempEditTransaction.categories;
        tempEditTransaction.userId = userId || "";
        setEditTransaction(tempEditTransaction);
    };


    const handleCancel = () => {
        setShowAddTransaction(false);
        setShowEditTransaction(false);
        setAmount('');
        setDescription('');
        setTransactionType('');
        setNewTransaction(prev => ({
            ...prev,
            categories: [],
            transactionType: ''
        }));

        setDate(null);
        setErrorTransaction(null);
    };
    const handleClear = () => {
        setFilterTransaction(prev => ({
            ...prev,
            Category: null,
            MinAmount: null,
            MaxAmount: null,
            StartDate: null,
            EndDate: null
        }));
    }
    const handleShowAddTransaction = () => {
        setShowAddTransaction(true);
    };

    const handleAddTransaction = async () => {
        const result = await createTransaction(newTransaction);

        if (result.success) {
            console.log("Transaction created:", result.data);
            handleCancel();
            loadTransactions(currentPage);
            // Refresh transactions list or show success message
        } else {
            console.error("Error:", result.message);
            // Show error to user
            setErrorTransaction(result.message || "Failed.");
        }
    };

    const handleShowEditTransaction = () => {
        if (selectedTransaction) {
            setShowEditTransaction(true);
        }
    };

    const handleEditTransaction = async () => {
        if (selectedTransaction !== null) {
            console.log("handleEditTransaction: ", editTransaction);
            const result = await updateTransaction(selectedTransaction, editTransaction);

            if (result.success) {
                console.log("Transaction updated: ");
                handleCancel();
                loadTransactions(currentPage);
            }
            else {
                console.error("Error:", result.message);
                // Show error to user
                setErrorTransaction(result.message || "Failed.");
            }

        }
    }
    // Generalized handler for TextFields
    const handleInputChange = <T extends Record<string, any>>(
        setter: React.Dispatch<React.SetStateAction<T>>
    ) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: value }));
    };

    // Generalized handler for Selects
    const handleSelectChange = <T extends Record<string, any>>(
        setter: React.Dispatch<React.SetStateAction<T>>
    ) => (event: SelectChangeEvent<string | string[]>) => {
        const { name, value } = event.target;
        setter(prev => ({
            ...prev,
            [name]: name === "categories" ? (Array.isArray(value) ? value : [value]) : value
        }));
    };
    const handleDateChange = <T extends Record<string, any>>(
        setter: React.Dispatch<React.SetStateAction<T>>,
        fieldName: keyof T  // Dynamic field name
    ) => (newValue: Dayjs | null) => {
        setter(prev => ({
            ...prev,
            [fieldName]: newValue ? newValue.toDate() : null
        }));
    };
    const handleDeleteTransaction = async () => {
        console.log(selectedTransaction);
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
        console.log("Selected transactions", selectedTransaction);
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
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateField
                                            label="Start Date"
                                            //value={filterTransaction.StartDate || null}
                                            value={filterTransaction.StartDate ? dayjs(filterTransaction.StartDate) : null}
                                            onChange={handleDateChange(setFilterTransaction, "StartDate")}
                                            size="small"
                                            sx={{ width: '100%' }}
                                        />
                                    </LocalizationProvider>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateField
                                            label="End Date"
                                            value={filterTransaction.EndDate ? dayjs(filterTransaction.EndDate) : null}
                                            //value={endDateFilter}
                                            onChange={handleDateChange(setFilterTransaction, "EndDate")}
                                            size="small"
                                            sx={{ width: '100%' }}
                                        />
                                    </LocalizationProvider>

                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            onChange={handleSelectChange(setFilterTransaction)}
                                            value={filterTransaction.Category || []} // Ensure controlled component
                                            label="Category"
                                            name="Category"
                                        >
                                            {categories.map((cat, index) => (
                                                <MenuItem key={index} value={cat.category}>
                                                    <cat.Icon style={{ marginRight: '6px' }} />
                                                    {cat.category}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel htmlFor="min-amount">Min</InputLabel>
                                        <OutlinedInput
                                            id="min-amount"
                                            value={filterTransaction.MinAmount || ""}
                                            onChange={handleInputChange(setFilterTransaction)}
                                            name="MinAmount"
                                            label="Min"
                                            placeholder="00.00"
                                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                        />
                                    </FormControl>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel htmlFor="max-amount">Max</InputLabel>
                                        <OutlinedInput
                                            id="max-amount"
                                            value={filterTransaction.MaxAmount || ""}
                                            onChange={handleInputChange(setFilterTransaction)}
                                            name="MaxAmount"
                                            label="Max"
                                            placeholder="00.00"
                                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                        />
                                    </FormControl>

                                </div>
                                <div className='flex justify-start mt-2 gap-3'>
                                    <Button
                                        variant="outlined"
                                        onClick={() => loadTransactions(0)}
                                    >
                                        Filter
                                    </Button>
                                    <Button
                                        variant='outlined'
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </Button>
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
                                    enableSubCat={true}
                                    enableCheckbox={true}
                                    page={currentPage}
                                    rowsPerPage={rowsPerPage}
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    selectedTransaction={selectedTransaction}
                                    onTransactionSelect={handleTransactionSelect}
                                    getTransactionSelected={getTransactionInfo}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Modals */}
            {(showAddTransaction) && (
                <AddEditTransactionComponent
                    header="Add Transaction"
                    setTransaction={setNewTransaction}
                    transaction={newTransaction}
                    eventButton={handleAddTransaction}
                    eventButtonTitle='Add'
                    handleCancel={handleCancel}
                    selectedTransaction={selectedTransaction}
                    loadTransactions={() => loadTransactions(currentPage)}
                    edit={false}
                />
            )}
            {(showEditTransaction) && (
                <AddEditTransactionComponent
                    header="Edit Transaction"
                    setTransaction={setEditTransaction}
                    transaction={editTransaction}
                    eventButton={handleEditTransaction}
                    eventButtonTitle='Save Changes'
                    selectedTransaction={selectedTransaction}
                    handleCancel={handleCancel}
                    edit={true}
                    loadTransactions={() => loadTransactions(currentPage)}
                />
            )}
        </div>
    );
};

export default TransactionPage;