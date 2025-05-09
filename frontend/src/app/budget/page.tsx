"use client";
import NavBar from "../components/NavBar";
import { categories } from "../models/TransactionCategory";
import { createBudget, deleteBudget, getBudgetList, updateBudget } from "../services/budgetService";
import UpdateAddBudget from "../components/UpdateAddBudget";
import TopTransactionsTable from "../components/TopTransactionsTable";
import BudgetBarGraph from "../components/BudgetBarGraph";
import { Budget } from "../models/Budget";

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { Collapse } from "@mui/material";
import { useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { ShoppingBasket, PriorityHighOutlined } from "@mui/icons-material"; // or any default icon

const BudgetPage = () => {
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
        setErrorBudget(null); // Bashir added this line to clear error message on cancel
    }
    const handleBudgetCancel = (e?: React.MouseEvent) => {
        // Stop event propagation if event exists
        e?.stopPropagation();
        setShowUpdateBudget(false);
        setErrorBudget(null); // Bashir added this line to clear error message on cancel

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
            setErrorBudget(null); // Bashir added this line to clear error message on success
            
        } else {
            console.error("Error creating budget:", result.message);
            setErrorBudget(result.message);
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
            setErrorBudget(null); // Bashir added this line to clear error message on success
        } else {
            console.error("Error:", result.message);
            setErrorBudget(result.message);
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
            setErrorBudget(null); // Bashir added this line to clear error message on success
        } else {
            console.error("Error:", result.message);
            setErrorBudget(result.message);
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

    const collapseCategoryIndex = (index: number | null) => {
        if (!showUpdateBudget) {
            setActiveCategoryIndex(activeCategoryIndex === index ? null : index);
        }
    }

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen w-full">
            <NavBar />
            {/* Error Message Display Bashir added this section to display error messages*/} 
            {errorBudget && (
            <div className="fixed top-20 right-4 z-50">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                <span className="mr-4">{errorBudget}</span>
                <button
                    className="text-red-700 hover:text-red-900"
                    onClick={() => setErrorBudget(null)}
                >
                    ×
                </button>
                </div>
            </div>
            )}
            <div className="w-full lg:ml-[5%] lg:w-3/4 h-full mb-5">

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
                    <UpdateAddBudget
                        title="Add Budget"
                        handleInputChange={handleInputChange}
                        handleCancel={handleCancel}
                        handleSelectChange={handleSelectChange}
                        handleEvent={handleAddBudget}
                        eventButton="Add"
                        addBudget={true}
                        budgetList={budgetList.map(budget => budget.category)}
                    />
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
                                        <TopTransactionsTable
                                            userId={userId}
                                            category={budget.category || 'Uncategorized'}
                                        />
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
                                                eventButton="Update"
                                                addBudget={false}
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