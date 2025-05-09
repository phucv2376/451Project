import {
  CategorySpending,
  CategorySpendingResponse,
} from "../models/Transaction";
import { useState, useEffect } from "react";
import API_BASE_URL from "../config";
import {
  getCategoryByName,
  TransactionCategory,
} from "../models/TransactionCategory";
import { Tooltip } from "@mui/material";

const SpendingBreakdown = () => {
  const [catSpendingData, setCatSpendingData] = useState<CategorySpending[]>();
  const [totalSpending, setTotalSpending] = useState<number>(0);

  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);

  async function fetchSpendingPerCategory(): Promise<CategorySpendingResponse> {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `${API_BASE_URL}/Transaction/users/${userId}/spending-per-category`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return { success: false, data: [] };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Network error:", error);
      return { success: false, data: [] };
    }
  }

  function getTotal(catSpendingRes: CategorySpendingResponse) {
    const total: number = catSpendingRes.data.reduce(
      (acc: number, category: { totalAmount: number }) =>
        acc + category.totalAmount,
      0
    );
    return Math.abs(total);
  }

  useEffect(() => {
    fetchSpendingPerCategory().then((res) => {
      if (res.success) {
        setCatSpendingData(res.data);
        setTotalSpending(getTotal(res));
      }
    });
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mt-6 shadow-sm">
      <h2 className="font-bold text-md mb-4">Spending Breakdown</h2>
      <div className="h-7 rounded-lg overflow-hidden flex justify-center items-center">
        {catSpendingData &&
          catSpendingData.map((cat, i) => (
            <Tooltip 
            placement="top"
            key={i}
            arrow
            title={`${cat.category}: -$${Math.abs(cat.totalAmount)}`}>
              <div
                key={i}
                className={`h-3/4`}
                style={{
                  width: `${Math.abs((cat.totalAmount / totalSpending) * 100)}%`,
                  backgroundColor: `${getCategoryByName(cat.category).color}`,
                  height: hoveredIndex === i ? '100%' : '75%',
                  transition: 'height 0.2s ease',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              ></div>
            </Tooltip>
          ))}
      </div>
      <div className=" mt-5 grid-flow-col grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {catSpendingData &&
          catSpendingData.map((cat, i) => (
            <Legends
              key={i}
              transactionCategory={getCategoryByName(cat.category)}
            />
          ))}
      </div>
    </div>
  );
};
export default SpendingBreakdown;

interface LegendsProps {
  transactionCategory: TransactionCategory;
}

const Legends = (props: LegendsProps) => {
  return (
    <div className="flex items-center m-2">
      <div
        className="w-4 h-4 rounded-full mr-2"
        style={{ backgroundColor: `${props.transactionCategory.color}` }}
      ></div>
      <span className="ml-1 text-base text-gray-600">
        {props.transactionCategory.category}
      </span>
    </div>
  );
};
