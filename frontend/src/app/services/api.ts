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
  const response = await axiosInstance.get(
    `${API_BASE_URL}/AiAnalysis/ForecastSpendingTrends/${userId}`
  );
  return response.data;
};

export const getMonthlyCashflow = async (userId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/Transaction/users/${userId}/month-cashflow`
  );
  return response.data;
}; 

export const fetchMonthlyReport = async (userId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/Reports/monthly?userId=${userId}`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
};

// services/api.ts
// services/api.ts
// Updated streamChatResponse service
export const streamChatResponse = async (userId: string, message: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Chat/ask/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    return {
      async *[Symbol.asyncIterator]() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/(?<=\n)/);
            
            
            for (const line of lines) {
              if (line.endsWith('\n')) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  yield trimmed.slice(6);
                }
                buffer = buffer.slice(line.length);
              }
            }
          }

          // Process remaining buffer
          if (buffer.trim().startsWith('data: ')) {
            yield buffer.trim().slice(6);
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
  } catch (error) {
    console.error('Chat stream failed:', error);
    throw new Error('Failed to start chat stream');
  }
};
