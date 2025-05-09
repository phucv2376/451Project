import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { DetailedDailyCashFlowDto } from './../../models/DetailedDailyCashFlow';

interface CashFlowChartProps {
  data: DetailedDailyCashFlowDto[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const originalDate = payload[0].payload.originalDate;
    return (
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 2
      }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {format(new Date(originalDate), 'EEEE, MMM dd yyyy')}
        </Typography>
        <Box mt={1}>
          <Typography variant="body2" color="#2e7d32">
            Income: ${payload[0].value.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="#d32f2f">
            Expense: ${payload[1].value.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="#1976d2">
            Net Flow: ${payload[2].value.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const theme = useTheme();

  const formattedData = data.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'MMM dd'),
    originalDate: item.date
  }));

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap={15}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme.palette.divider}
            vertical={false}
          />
          
          <XAxis
            dataKey="displayDate"
            tick={{ fill: theme.palette.text.secondary }}
            tickLine={{ stroke: theme.palette.divider }}
          />
          
          <YAxis
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            tick={{ fill: theme.palette.text.secondary }}
            tickLine={{ stroke: theme.palette.divider }}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: theme.palette.action.hover }}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            iconSize={14}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: theme.palette.text.primary }}>
                {value}
              </span>
            )}
          />
          
          <Bar
            dataKey="income"
            name="Income"
            fill="#388e3c"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
          
          <Bar
            dataKey="expense"
            name="Expense"
            fill="#d32f2f"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
          
          <Bar
            dataKey="netCashFlow"
            name="Net Cash Flow"
            fill="#1976d2"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CashFlowChart;