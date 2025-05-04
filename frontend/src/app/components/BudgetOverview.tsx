import { useEffect, useState } from "react";
import BudgetCircle from "./BudgetCircle";
import { Budget } from "../models/Budget";
import { categories } from "../models/TransactionCategory";

const BudgetOverview = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loadingState, setLoadingState] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchAndSetBudgets = async () => {
            try {
                const userId = localStorage.getItem("userId") || "";
                const budgets = await fetchBudgets(userId);
                setBudgets(budgets);
            } catch (error) {
                setError("Failed to fetch budgets");
            } finally {
                setLoadingState(false);
            }
        };

        fetchAndSetBudgets();
    }, []);

    async function fetchBudgets(userId: string): Promise<Budget[]> {
        try {
            const response = await fetch(
                `https://localhost:7105/api/Budget/list-of-budgets?userId=${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'accept': '*/*'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Budget[] = await response.json();
            setLoadingState(false);
            return data;
        } catch (error) {
            console.error('Error fetching budgets:', error);
            throw error;
        }
    }

    console.log("Budgets:", budgets);

    return (
        <div className="w-full m-h-full md:w-5/12 lg:w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-md mb-5">Budget Overview</h2>
            <div className="flex justify-center items-center w-full">
                <div className="grid grid-cols-2 gap-4 w-fullp-7">
                    {loadingState ? (
                        <div className="flex items-center justify-center h-full"><p>Loading budgets...</p></div>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : !loadingState && budgets && budgets.map ((budget, index) => (
                        <BudgetCircle
                            key={index}
                            label={budget.category}
                            budgetAmount={budget.totalAmount}
                            budgetSpent={budget.spentAmount}
                            color={categories[index % categories.length].color}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
};

export default BudgetOverview;