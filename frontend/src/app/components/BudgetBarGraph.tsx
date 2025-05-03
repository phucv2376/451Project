import { BarChart } from '@mui/x-charts/BarChart';
import { format, subMonths } from 'date-fns';
import { fourMonthsSummary } from '../services/budgetService';
import { useEffect, useState } from 'react';
import { MonthSummary } from '../models/Budget';
import { Transaction } from '../models/Transaction';

interface Props {
    userId: string,
    category: string
}

const BudgetBarGraph = (props: Props) => {
    const [monthlyData, setMonthlyData] = useState<MonthSummary[]>([]);
    const [topTransactions, setTopTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fourMonthsSummary(props.userId, props.category);
            if (result.success && result.data) {
                setMonthlyData(result.data);
            }
        };
        fetchData();
    }, []);

    const lastFourMonths = Array.from({ length: 4 }, (_, i) =>
        format(subMonths(new Date(), 3 - i), 'MMMM')
    );

    const chartSeries = [{
        data: lastFourMonths.map(month =>
            monthlyData.find(item => item.month === month)?.total || 0
        ),
        label: 'Total Spending', // Optional
        valueFormatter: (value: number) => 
            value >= 0 ? `$${value}` : `-$${Math.abs(value)}`,  // Currency formatting
        barLabel: false  // Shows formatted values on bars (boolean, not string)
    }];

    return (
        <BarChart
            xAxis={[{
                scaleType: 'band',
                data: lastFourMonths
            }]}
            yAxis={[{
                position: 'left',
                disableLine: false,
                disableTicks: true,
            }]}
            series={chartSeries}
            colors={['#1976d2']}

            width={700}
            height={350}
            grid={{
                horizontal: true,
                vertical: false,
            }}
            slotProps={{
                legend: {
                  hidden: true, // This hides the legend
                },
              }}
        />
    );
}

export default BudgetBarGraph;