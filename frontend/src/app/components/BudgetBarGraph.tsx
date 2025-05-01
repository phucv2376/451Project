import { BarChart } from '@mui/x-charts/BarChart';
import { format, subMonths } from 'date-fns';
import { getMonthlyCategoryData } from '../services/budgetService';
import { useEffect, useState } from 'react';

export default function BasicBars({ userId, category }: { userId: string, category: string }) {
    const [monthlyData, setMonthlyData] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getMonthlyCategoryData(userId, category);
            setMonthlyData(data);
        };

        fetchData();
    }, [userId, category]);

    // Generate month names for xAxis
    const getLastFourMonths = () => {
        return Array.from({ length: 4 }, (_, i) => {
            return format(subMonths(new Date(), 3 - i), 'MMMM');
        });
    };

    function addLabels<T extends { dataKey: keyof typeof translations }>(series: T[]) {
        return series.map((item) => ({
          ...item,
          label: translations[item.dataKey],
          valueFormatter: (v: number | null) => (v ? `$ ${v.toLocaleString()}k` : '-'),
        }));
      }
      

    return (
        <BarChart
            xAxis={[{
                scaleType: 'band',
                data: getLastFourMonths()
            }]}
            yAxis={[{
                position: 'left',
                disableLine: false,
                disableTicks: true,
            }]}
            series={[{
                data: monthlyData
            }]}
            colors={['#1976d2']}

            width={700}
            height={350}
            grid={{
                horizontal: true,
                vertical: false,
            }}
        />
    );
}