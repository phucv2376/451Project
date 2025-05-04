import { InputLabel, MenuItem, TextField, InputAdornment } from "@mui/material";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { categories } from "../models/TransactionCategory";
import { transactionTypes } from "../models/TransactionType";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

interface Props {
    header: string,
    loadTransactions: any,
    transaction: any
    setTransaction: any,
    eventButtonTitle: string,
    eventButton: any,
    selectedTransaction: any,
    handleCancel: any,
    edit?: boolean
}

const AddEditTransactionComponent = (props: Props) => {
    const [errorTransaction, setErrorTransaction] = useState<string | null>(null);
    const [date, setDate] = useState<Dayjs | null>(dayjs());

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

    // Generalized handler for Selects
    const handleEditSelectChange = <T extends Record<string, any>>(
        setter: React.Dispatch<React.SetStateAction<T>>
    ) => (event: SelectChangeEvent<string | string[]>) => {
        const { name, value } = event.target;
        setter(prev => ({
            ...prev,
            [name]: value
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
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">
                        {props.header}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        <FormControl fullWidth>
                            <InputLabel>Transaction Type</InputLabel>
                            <Select
                                //onChange={handleTransactionType}
                                onChange={handleSelectChange(props.setTransaction)}
                                value={props.transaction.transactionType || ""}
                                label="Transaction Type"
                                name="transactionType"
                                // defaultValue={props.edit ? props.transaction.transactionType : ""}
                            >
                                {transactionTypes.map((type, index) => (
                                    <MenuItem key={type} value={type.toString()}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                onChange={props.edit ? handleEditSelectChange(props.setTransaction) 
                                    : handleSelectChange(props.setTransaction)}
                                value={props.edit ? props.transaction.category : props.transaction.categories || []} // Ensure controlled component
                                label="Category"
                                name={props.edit ? "category" : "categories"}
                                // defaultValue={props.edit ? props.transaction.categories : ""}
                            >
                                {categories.map((cat, index) => (
                                    <MenuItem key={index} value={cat.category.toString()}>
                                        <cat.Icon style={{ marginRight: '6px' }} />
                                        {cat.category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Date"
                                value={date}
                                onChange={handleDateChange(props.setTransaction, "transactionDate")}
                                defaultValue={props.edit ? props.transaction.transactionDate : ""}
                            />
                        </LocalizationProvider>

                        <TextField
                            label="Amount"
                            name="amount"
                            placeholder="00.00"
                            defaultValue={props.edit ? Math.abs(props.transaction.amount) : ""}
                            onChange={handleInputChange(props.setTransaction)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            name="payee"
                            defaultValue={props.edit ? props.transaction.payee : ""}
                            //value={showAddTransaction ?  : ""}
                            onChange={handleInputChange(props.setTransaction)}
                            placeholder="e.g., Groceries at Walmart"
                            fullWidth
                            className="md:col-span-2"
                        />
                    </div>
                    {errorTransaction && (
                        <div className='w-full'>
                            <div className="text-red-500">{errorTransaction}</div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outlined"
                            onClick={props.handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={props.eventButton}
                        >
                            {props.eventButtonTitle}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
};
export default AddEditTransactionComponent;