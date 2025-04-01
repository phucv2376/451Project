import axios from 'axios';
import https from 'https';

import API_BASE_URL from "@/app/config";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const axiosInstance = axios.create({
  httpsAgent: agent,
});

export const getQuarterlyAnalysis = async (userId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/AiAnalysis/QuarterlyTransactionAnalysis/${userId}`
  );
  return response.data;
};

export const fetchForecast = async (userId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/AiAnalysis/ForecastSpendingTrends/${userId}`,
    { httpsAgent: agent }
  );
  return response.data;
};

export const getMonthlyCashflow = async (userId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/Transaction/users/${userId}/month-cashflow`,
    { httpsAgent: agent }
  );
  return response.data;
}; 