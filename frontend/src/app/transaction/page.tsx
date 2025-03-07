"use client";

import * as React from 'react';
import { useState } from 'react';
import NavBar from "../components/NavBar";
import { categories } from "../models/TransactionCategory";
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
import { Transaction } from '../models/Transaction';

const TransactionPage = () => {
	const [category, setCategory] = useState('');
	const [showAddTransaction, setShowAddTransaction] = useState(true);
	const transactionList = [
		{
			id: '0',
			date: new Date(),
			amount: 323.20,
			description: 'Groceries',
			category: categories[0]
		},
		{
			id: '1',
			date: new Date(),
			amount: 12.40,
			description: 'Uber',
			category: categories[1]
		},
		{
			id: '3',
			date: new Date(),
			amount: 2576.00,
			description: 'Tuition',
			category: categories[3]
		},
		{
			id: '2',
			date: new Date(),
			amount: 23.57,
			description: 'Movie',
			category: categories[2]
		},
		{
			id: '5',
			date: new Date(),
			amount: 292.30,
			description: 'Job',
			category: categories[5]
		}
	]
	const handleChange = (event: SelectChangeEvent) => {
		setCategory(event.target.value as string);
	};

	const handleCancel = () => {
		setShowAddTransaction(false);
	}

	const handleShowAddTransaction = () => {
		setShowAddTransaction(true);
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
									<DeleteIcon />
								</IconButton>
								<IconButton aria-label="edit" disabled color="primary">
									<EditIcon />
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
								transactions={transactionList}
								enablePagination={true}
								enableCheckbox={true}
							/>
						</div>
					</div>
					{showAddTransaction && (
						<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-10">
							<div className="bg-white rounded-lg border p-5 border-gray-200 w-1/3 h-2/3 ml-[25vh]">
								<p className="font-bold mb-5">Add Transaction</p>
								<div className='flex flex-row'>
									<div className='flex-1'>
										<p>Date</p>
										<LocalizationProvider dateAdapter={AdapterDayjs}>
											<DateField
												size="small"
											/>
										</LocalizationProvider>
									</div>
									<div className='flex-1'>
										<p>Transaction Description</p>
										<TextField
											id="outlined-size-small"
											variant="outlined"
											size="small"
											helperText="e.g. groceries"
										/>
									</div>
								</div>
								<div className='flex flex-row'>
									<div className='flex-1'>
										<p>Category</p>
										<Select
											sx={{ minWidth: 200 }}
											size="small"
											labelId="demo-simple-select-label"
											id="demo-simple-select"
											value={category}
											onChange={handleChange}
										>
											{categories.map((cat, index) => (
												<MenuItem key={index} value={cat.category}>
													<cat.Icon style={{ color: cat.color, marginRight: '6px' }} />
													{cat.category}
												</MenuItem>
											))}
										</Select>
									</div>
									<div className='flex-1'>
										<p>Amount</p>
										<TextField className="mb-4"
											id="outlined-start-adornment"
											size="small"
											placeholder="00.00"
											slotProps={{
												input: {
													startAdornment: <InputAdornment position="start">$</InputAdornment>,
												},
											}}
											sx={{ width: 120 }}
											variant="outlined"
										/>
									</div>
								</div>
								<Button variant="contained">Add</Button>
								<Button
									variant="outlined"
									onClick={handleCancel}
								>
									Cancel</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TransactionPage;