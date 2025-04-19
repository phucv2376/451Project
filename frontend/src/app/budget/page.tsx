"use client";
import NavBar from "../components/NavBar";
import { categories } from "../models/TransactionCategory";
import { createBudget, getBudgetList } from "../services/budgetService";

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { Gauge } from '@mui/x-charts/Gauge';
import { Collapse } from "@mui/material";
import { useEffect, useState } from "react";
import BudgetBarGraph from "../components/BudgetBarGraph";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from '@mui/material';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { transactionTypes } from "../models/TransactionType";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Budget } from "../models/Budget";

const BudgetPage = () => {
    const transactions = [
        { description: 'Overdraft', date: 'April 2, 2025', amount: -22.50 },
        { description: 'Overdraft', date: 'April 2, 2025', amount: -9.99 },
        { description: 'Wire Transfer', date: 'April 1, 2025', amount: -5.75 },
    ];
    const [newBudget, setNewBudget] = useState<Budget>({
        userId: "",
        totalAmount: 0,
        title: "test",
        category: ""
    });
    const [budgetList, setBudgetList] = useState<Budget[]>([]);

    const [showChart, setShowChart] = useState(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
    const [showAddBudget, setShowAddBudget] = useState(false);
    const [errorBudget, setErrorBudget] = useState<string | null>(null);
    const [userId, setUserId] = useState('');


    const fetchBudgets = async (userId: string) => {
        const result = await getBudgetList(userId);
        if (result.success) {
            console.log(result.data);
            if(result.data != null){
                setBudgetList(result.data);
            }
        } else {
            //errorBudget(result.message || "Failed to load budgets");
        }
        //setLoading(false);
    };

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            setNewBudget(prev => ({
                ...prev,
                userId: storedUserId
            }));
            fetchBudgets(storedUserId);
        }
    }, []);
    // Add this useEffect to track budgetList changes
    useEffect(() => {
        console.log("Updated budget list: ", budgetList);
    }, [budgetList]); // This runs whenever budgetList changes

    const handleShowAddBudget = () => {
        setShowAddBudget(true);
    }
    const handleCancel = () => {
        setShowAddBudget(false);
    }
    const handleAddBudget = async () => {
        const result = await createBudget(newBudget);

        if (result.success) {
            console.log("Budget created successfully");
            handleCancel();
        } else {
            console.error("Error creating budget:", result.message);
            setErrorBudget(result.message || "Failed to create budget.");
        }
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewBudget(prev => ({
            ...prev,
            totalAmount: Number(value)  // Convert string to number
        }));
    };
    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setNewBudget(prev => ({
            ...prev,
            category: e.target.value
        }));
    };


    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            <NavBar />
            <div className="w-full lg:ml-[5%] lg:w-3/4 h-full">
                {/* <div className="flex justify-center">
					<Gauge
						width={300}
						height={300}
						value={60}
						startAngle={-90}
						endAngle={90}
						cornerRadius={10}
					/>
				</div> */}

                {/*heading*/}
                <div className="mt-16 flex justify-between mb-3">
                    <p>Budgets</p>
                    <div className="flex items-center gap-2">

                        <IconButton
                            aria-label="delete"
                            color="error"
                        //disabled={!selectedTransaction}
                        //onClick={handleDeleteTransaction}
                        >
                            <DeleteIcon />
                        </IconButton>
                        <IconButton
                            aria-label="edit"
                            color="primary"
                        //disabled={!selectedTransaction}
                        //onClick={handleShowEditTransaction}
                        >
                            <EditIcon />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            size="small"
                            onClick={handleShowAddBudget}
                        >
                            Add Budget
                        </Button>
                    </div>
                </div>
                {(showAddBudget) && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-6">
                                    Add Budget
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                                    <FormControl fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            //value={category}
                                            onChange={handleSelectChange}
                                            //value={newTransaction.categories || []} // Ensure controlled component
                                            label="Category"
                                            name="categories"
                                        >
                                            {categories.map((cat, index) => (
                                                <MenuItem key={index} value={cat.category.toString()}>
                                                    <cat.Icon style={{ marginRight: '6px' }} />
                                                    {cat.category}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Budget Amount"
                                        name="amount"
                                        placeholder="00.00"
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                        fullWidth
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
                                        onClick={handleAddBudget}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/*Budgets*/}
                <div className="flex flex-col gap-4">
                    {categories.map((cat, index) => (
                        <div key={index}
                            className="bg-white rounded-lg border-gray-200 shadow-sm p-4 cursor-pointer"
                            onClick={() => setActiveCategoryIndex(activeCategoryIndex === index ? null : index)}
                        >
                            <div className="flex items-center">
                                <cat.Icon
                                    className="mr-6"
                                    style={{
                                        color: cat.color,
                                        width: "35px",
                                        height: "35px"
                                    }}
                                />
                                <div className="flex-1">
                                    {cat.category}
                                    <div className="text-sm text-gray-500 mt-1">
                                        $400 Budgeted {/* Text below category */}
                                    </div>
                                </div>
                                {/* Budget Progress Bar */}
                                <div className="w-[83%] bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div
                                        className="bg-indigo-500 h-2.5 rounded-full"
                                        style={{
                                            width: 42,
                                            backgroundColor: cat.color // Use category color if desired
                                        }}
                                    ></div>
                                </div>

                            </div>
                            <Collapse in={activeCategoryIndex === index}>
                                <div className="flex">
                                    <BudgetBarGraph />
                                    <TableContainer
                                        component={Paper}
                                        elevation={0}
                                        sx={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            maxWidth: 300,
                                            ml: 2 // Add some margin to separate from the chart
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ p: 2, pb: 1, fontWeight: 600 }}>
                                            Top Transactions of the Month
                                        </Typography>
                                        <Table size="small">

                                            <TableBody>
                                                {transactions.map((transaction, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>
                                                            <div>
                                                                <Typography variant="body2">{transaction.description}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {transaction.date}
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
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </Collapse>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BudgetPage;