import { BarChart } from '@mui/x-charts/BarChart';

export default function BasicBars() {

  return (
    <BarChart
      xAxis={[{ scaleType: 'band', data: ['January', 'February', 'March', 'April']}]}
      series={[{ data: [200.32,350.94,122.17,53.20]}]}
      colors={['#1976d2']}
      width={700}
      height={350}
     
    />
  );
}