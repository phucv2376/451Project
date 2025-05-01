"use client";
import NavBar from "../components/NavBar";
import { categories } from "../models/TransactionCategory";
import { createBudget, deleteBudget, getBudgetList, updateBudget } from "../services/budgetService";
import UpdateAddBudget from "../components/UpdateAddBudget";

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
import { ShoppingBasket, PriorityHighOutlined } from "@mui/icons-material"; // or any default icon
import { Budget } from "../models/Budget";
import { red } from "@mui/material/colors";

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
    const [delBudget, setDelBudget] = useState<Budget>({
        userId: "",
        budgetId: ""
    })
    const [userUpdateBudget, setUserUpdateBudget] = useState<Budget>({
        budgetId: "",
        title: "test",
        totalAmount: 0
    })
    const [budgetList, setBudgetList] = useState<Budget[]>([]);

    const [showUpdateBudget, setShowUpdateBudget] = useState(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
    const [showAddBudget, setShowAddBudget] = useState(false);
    const [errorBudget, setErrorBudget] = useState<string | null>(null);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);



    const fetchBudgets = async (userId: string) => {
        const result = await getBudgetList(userId);
        if (result.success) {
            console.log(result.data);
            if (result.data != null) {
                setBudgetList(result.data);
            }
        } else {
            //errorBudget(result.message || "Failed to load budgets");
        }
        setLoading(false);
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

    const handleBudgetInfo = (budget: Budget) => {
        setDelBudget({
            userId: userId,
            budgetId: budget.budgetId
        })
        setUserUpdateBudget({
            budgetId: budget.budgetId,
            totalAmount: budget.totalAmount
        })
    }

    const handleShowAddBudget = () => {
        setShowAddBudget(true);
    }

    const handleShowUpdateBudget = () => {
        setShowUpdateBudget(true);
    }

    const handleCancel = () => { //add delete fields when cancel
        setShowAddBudget(false);
    }
    const handleBudgetCancel = (e?: React.MouseEvent) => {
        // Stop event propagation if event exists
        e?.stopPropagation();
        setShowUpdateBudget(false);

        // Optional: Clear any edit state if needed
        // setBudgetToEdit(null);
    };

    const handleAddBudget = async () => {
        const result = await createBudget(newBudget);

        if (result.success) {
            console.log("Budget created successfully");
            handleCancel();
            fetchBudgets(userId);
            setActiveCategoryIndex(null);
        } else {
            console.error("Error creating budget:", result.message);
            setErrorBudget(result.message || "Failed to create budget.");
        }
    };

    const handleUpdateBudget = async (userUpdateBudget: Budget) => {
        console.log(userUpdateBudget.title);

        const result = await updateBudget(userUpdateBudget);

        if (result.success) {
            console.log("Budget updated successfully");
            fetchBudgets(userId);
            setActiveCategoryIndex(null);
            setShowUpdateBudget(false);
        } else {
            console.error("Error:", result.message);
            setErrorBudget(result.message || "Failed to update budget");
        }
    }

    const handleDeleteBudget = async (delBudget: Budget) => {
        const result = await deleteBudget(delBudget);

        if (result.success) {
            console.log("Budget deleted successfully");
            // Refresh budgets list or update UI
            fetchBudgets(userId);
            setDelBudget(prev => ({
                ...prev,
                userId: userId,
                budgetId: ""
            }));
            setActiveCategoryIndex(null);
        } else {
            console.error("Error:", result.message);
            setErrorBudget(result.message || "Failed to delete budget");
        }
    }

    const handleSetDeleteBudget = () => {
        console.log(delBudget.category);
        handleDeleteBudget(delBudget);
    }

    const handleSetUpdateBudget = () => {
        console.log(userUpdateBudget.category);

        handleUpdateBudget(userUpdateBudget);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewBudget(prev => ({
            ...prev,
            totalAmount: Number(value)  // Convert string to number
        }));
        setUserUpdateBudget(prev => ({
            ...prev,
            title: "test",
            totalAmount: Number(value)
        }))
    };
    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setNewBudget(prev => ({
            ...prev,
            category: e.target.value
        }));
    };

    //const handleTotalAmountChange=

    const collapseCategoryIndex = (index: number | null) => {
        if (!showUpdateBudget) {
            setActiveCategoryIndex(activeCategoryIndex === index ? null : index);
        }
        console.log(index);
    }

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            <NavBar />
            <div className="w-full lg:ml-[5%] lg:w-3/4 h-full mb-5">
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
                    <p>Monthly Budgets</p>
                    <div className="flex items-center gap-2">

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
                <div className="flex flex-col gap-4 z-0">

                    {/* Empty state message - shows when no budgets exist */}
                    {budgetList.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No budgets created yet...
                        </div>
                    )}

                    {budgetList.map((budget, index) => {
                        const matchedCategory = categories.find(cat => cat.category === budget.category);
                        const categoryColor = matchedCategory?.color || '#6b7280'; // Default gray if no match
                        const CategoryIcon = matchedCategory?.Icon ?? ShoppingBasket; // Provide a default
                        return (
                            <div
                                key={budget.budgetId}
                                className="bg-white rounded-lg border-gray-200 shadow-sm p-4 cursor-pointer relative"
                                onClick={() => {
                                    collapseCategoryIndex(index);
                                    // setDelBudget({
                                    //     userId: userId,
                                    //     budgetId: budget.budgetId
                                    // });
                                    handleBudgetInfo(budget);
                                }}
                            >
                                <div className="flex items-center">
                                    <CategoryIcon
                                        className="mr-6"
                                        style={{
                                            color: categoryColor,
                                            width: "35px",
                                            height: "35px"
                                        }}
                                    />
                                    <div className="text-md flex flex-col mr-4">
                                        {budget.category}
                                        <div className="text-sm text-gray-500 mt-1">
                                            <div>${(budget.totalAmount ?? 0).toFixed(2)} Budgeted </div>
                                            <div>${(budget.spentAmount ?? 0).toFixed(2)} Spent</div>
                                        </div>
                                    </div>
                                    {/* Budget Progress Bar */}
                                    <div className="w-[83%] bg-gray-200 rounded-full h-2.5 mt-2 relative overflow-hidden">
                                        {/* Base progress bar (up to 100%) */}
                                        <div
                                            className="h-2.5 rounded-full absolute"
                                            style={{
                                                width: `${Math.min(100, ((budget.spentAmount ?? 0) / (budget.totalAmount ?? 1)) * 100)}%`,
                                                backgroundColor: categoryColor
                                            }}
                                        />
                                    </div>
                                    {/* Over-budget indicator (only shows when spent > total) */}
                                    {((budget.spentAmount ?? 0) > (budget.totalAmount ?? 0)) && (
                                        <div className="absolute top-2 right-2 group">
                                            <div className="relative">
                                                <PriorityHighOutlined className="h-6 w-10 text-red-500" />
                                                <div className="absolute hidden group-hover:block right-full top-1/2 
                                                -translate-y-1/2 mr-2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                    {Math.round(((budget.spentAmount ?? 0) / (budget.totalAmount ?? 1) * 100 - 100))}% over budget
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Collapse in={activeCategoryIndex === index}>
                                    <div className="flex">
                                        <BudgetBarGraph
                                            userId={userId}
                                            category={budget.category || 'Uncategorized'}
                                        />
                                        <TableContainer
                                            component={Paper}
                                            elevation={0}
                                            sx={{
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                maxWidth: 300,
                                                ml: 2
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

                                    <IconButton
                                        aria-label="delete"
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the parent div's onClick
                                            handleSetDeleteBudget();
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="edit"
                                        color="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowUpdateBudget();
                                            console.log("testing...", userUpdateBudget);

                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <div className="z-50">
                                        {(showUpdateBudget) && (
                                            <UpdateAddBudget
                                                title="Update Budget"
                                                handleInputChange={handleInputChange}
                                                handleCancel={handleBudgetCancel}
                                                handleEvent={handleSetUpdateBudget}
                                                handleSelectChange={handleSelectChange}
                                                eventButton="Update"
                                                amountValue={Math.abs(budget.totalAmount ?? 0).toFixed(2)}
                                            />
                                        )}
                                    </div>
                                </Collapse>

                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default BudgetPage;