"use client";
import NavBar from "../components/NavBar";
import { categories } from "../models/TransactionCategory";

import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { Gauge } from '@mui/x-charts/Gauge';
import { Collapse } from "@mui/material";
import { useState } from "react";
import BudgetBarGraph from "../components/BudgetBarGraph";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";



const BudgetPage = () => {
	const [showChart, setShowChart] = useState(false);
	const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

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
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						size="small"
					>
						Add Budget
					</Button>
				</div>
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
								<BudgetBarGraph />
								<TableContainer component={Paper} elevation={0}
								/>

							</Collapse>
						</div>

					))}
				</div>
			</div>
		</div>
	);
};

export default BudgetPage;