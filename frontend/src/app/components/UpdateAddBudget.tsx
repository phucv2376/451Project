import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import { categories } from "../models/TransactionCategory"
import Select from "@mui/material/Select"
import InputAdornment from "@mui/material/InputAdornment"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Button from "@mui/material/Button"

type Props = {
    title: string,
    handleInputChange: any,
    handleSelectChange: any,
    handleCancel: any,
    handleEvent: any,
    eventButton: string,
    amountValue: any
}


const UpdateAddBudget = (props: Props) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">
                        {props.title}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
{/*                     
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                onChange={props.handleSelectChange}
                                label="Category"
                                name="categories"
                                defaultValue={props.categoryValue}
                            >
                                {categories.map((cat, index) => (
                                    <MenuItem key={index} value={cat.category.toString()}>
                                        <cat.Icon style={{ marginRight: '6px' }} />
                                        {cat.category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl> */}

                        <TextField
                            label="Budget Amount"
                            name="amount"
                            placeholder="00.00"
                            onChange={props.handleInputChange}
                            defaultValue={props.amountValue}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            fullWidth
                        />
                    </div>
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
                            onClick={props.handleEvent}
                        >
                            {props.eventButton}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateAddBudget;