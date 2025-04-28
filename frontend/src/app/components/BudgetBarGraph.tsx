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

  return (
    <BarChart
      xAxis={[{
        scaleType: 'band',
        data: getLastFourMonths() // Dynamic months
      }]}
      series={[{
        data: monthlyData,
      }]}
      colors={['#1976d2']}
      width={700}
      height={350}
    />
  );
}