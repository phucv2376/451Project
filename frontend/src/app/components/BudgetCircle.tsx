import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

type Props = {
    label: string
    budgetAmount: number; // Total budget amount
    budgetSpent: number; // Amount spent
    color: string; // Color of the progress bar
};

const BudgetCircle = (props: Props) => {
    const calculateProgress = () => {
        if (props.budgetAmount === 0) return 0; // Avoid division by zero
        const res = Math.round(props.budgetSpent / props.budgetAmount * 100)
        return res;
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-3">
            <Box position="relative" display="inline-flex">
                <CircularProgress
                    variant="determinate"
                    value={100} // Full circle
                    size={90}
                    thickness={6}
                    sx={{
                        color: '#e0e0e0', // Gray color for the remaining progress
                        position: 'absolute', // Position it behind the main progress bar
                    }}
                />
                {/* Main Progress Bar */}
                <CircularProgress
                    variant="determinate"
                    value={Math.min(100, calculateProgress())} //avoid exceeding 100%
                    size={90}
                    thickness={7}
                    sx={{
                        color: props.color, // Customize the color using the prop
                    }}
                />
                {/* Progress Text */}
                <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography
                        variant="caption"
                        component="div"
                        sx={{
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: '1rem', // equivalent to text-lg
                        }}
                    >
                        {`${calculateProgress()}%`}
                    </Typography>

                </Box>
            </Box>
            <p className="text-sm text-center text-nowrap">{props.label}</p>
        </div>
    );
};

export default BudgetCircle;