import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, addDays } from 'date-fns';

interface ForecastChartProps {
  forecast: number[];
  startDate: string;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecast, startDate }) => {
  const theme = useTheme();
  
  const data = forecast.map((value, index) => ({
    date: format(addDays(new Date(startDate), index), 'MMM dd'),
    forecast: value,
  }));

  // Calculate min and max values for Y-axis
  const minValue = Math.min(...forecast);
  const maxValue = Math.max(...forecast);
  const valueRange = maxValue - minValue;
  
  // Calculate a more appropriate scale factor based on the value range
  const scaleFactor = valueRange > 0 ? valueRange * 0.2 : 1; // 20% of the range
  
  // Set Y-axis domain with dynamic padding based on the scale factor
  const yAxisDomain = [
    Math.floor(minValue - scaleFactor),
    Math.ceil(maxValue + scaleFactor)
  ];

  return (
    <Box sx={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme.palette.divider}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={yAxisDomain}
            tickMargin={10}
            width={80}
            allowDataOverflow={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}
            labelStyle={{ color: theme.palette.text.primary }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Forecasted Spending']}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke={theme.palette.primary.main}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorForecast)"
            name="Forecasted Spending"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ForecastChart;