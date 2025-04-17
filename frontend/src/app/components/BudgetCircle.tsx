import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

type Props = {
    progressValue: number; // Progress value (0-100)
    color: string; // Color of the progress bar
    label: string
};

const BudgetCircle = (props: Props) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-3"> 
            <Box position="relative" display="inline-flex">
                {/* Gray Background (Remaining Progress) */}
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
                    value={props.progressValue} // Set the progress value
                    size={90} // Size of the progress bar
                    thickness={6} // Thickness of the progress bar
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
                    <Typography variant="caption" component="div" color="black" className="font-bold">
                        {`${props.progressValue}%`}
                    </Typography>
                </Box>
            </Box>
            <p className="text-sm">{props.label}</p>
        </div>
    );
};

export default BudgetCircle;