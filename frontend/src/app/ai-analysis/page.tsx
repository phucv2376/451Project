"use client";

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Grid, Paper, useTheme, Fade } from '@mui/material';
import SpendingAnalysis from './../components/AiAnalysis/SpendingAnalysis';
import ForecastChart from './../components/AiAnalysis/ForecastChart';
import CashFlowChart from './../components/AiAnalysis/CashFlowChart';
import NavBar from "../components/NavBar";
import { getQuarterlyAnalysis, fetchForecast, getMonthlyCashflow } from '../services/api';
import { DetailedSpendingAnalysis } from '../models/SpendingAnalysis';
import { SpendingForecastResponse } from '../models/forecast';
import { DetailedDailyCashFlowDto } from '../models/DetailedDailyCashFlow';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const AIAnalysisPage = () => {
  const theme = useTheme();
  const [analysis, setAnalysis] = useState<DetailedSpendingAnalysis | null>(null);
  const [forecast, setForecast] = useState<SpendingForecastResponse | null>(null);
  const [cashFlow, setCashFlow] = useState<DetailedDailyCashFlowDto[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    analysis: true,
    forecast: true,
    cashFlow: true
  });
  const [errors, setErrors] = useState({
    analysis: null as string | null,
    forecast: null as string | null,
    cashFlow: null as string | null
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoadingStates({ analysis: false, forecast: false, cashFlow: false });
        return;
      }

      try {
        // Fetch all data independently
        const analysisPromise = getQuarterlyAnalysis(userId)
          .then(data => {
            setAnalysis(data as DetailedSpendingAnalysis);
            setLoadingStates(prev => ({ ...prev, analysis: false }));
            setErrors(prev => ({ ...prev, analysis: null }));
          })
          .catch(err => {
            console.error('Error fetching analysis:', err);
            setLoadingStates(prev => ({ ...prev, analysis: false }));
            setErrors(prev => ({ ...prev, analysis: 'Failed to load spending analysis' }));
          });

        const forecastPromise = fetchForecast(userId)
          .then(data => {
            setForecast(data as SpendingForecastResponse);
            setLoadingStates(prev => ({ ...prev, forecast: false }));
            setErrors(prev => ({ ...prev, forecast: null }));
          })
          .catch(err => {
            console.error('Error fetching forecast:', err);
            setLoadingStates(prev => ({ ...prev, forecast: false }));
            setErrors(prev => ({ ...prev, forecast: 'Failed to load forecast data' }));
          });

        const cashFlowPromise = getMonthlyCashflow(userId)
          .then(data => {
            setCashFlow(data as DetailedDailyCashFlowDto[]);
            setLoadingStates(prev => ({ ...prev, cashFlow: false }));
            setErrors(prev => ({ ...prev, cashFlow: null }));
          })
          .catch(err => {
            console.error('Error fetching cash flow:', err);
            setLoadingStates(prev => ({ ...prev, cashFlow: false }));
            setErrors(prev => ({ ...prev, cashFlow: 'Failed to load cash flow data' }));
          });

        await Promise.allSettled([analysisPromise, forecastPromise, cashFlowPromise]);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setLoadingStates({ analysis: false, forecast: false, cashFlow: false });
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const ErrorDisplay = ({ message }: { message: string | null }) => (
    message ? (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        color: 'error.main',
        p: 2,
        borderRadius: 1,
        bgcolor: 'error.main' + '10'
      }}>
        <ErrorOutlineIcon />
        <Typography>{message}</Typography>
      </Box>
    ) : null
  );

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen w-full">
      <NavBar />
      <Box sx={{ flex: 1, p: 4, maxWidth: '1400px', margin: '0 auto' }}>
        <Fade in timeout={1000}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <AutoGraphIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  AI-Powered Financial Analysis
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Intelligent insights powered by advanced AI algorithms
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>

        <Grid container spacing={4}>
          {/* Spending Analysis Section */}
          <Grid item xs={12}>
            <Fade in timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Box>
                {loadingStates.analysis ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <ErrorDisplay message={errors.analysis} />
                    {analysis && <SpendingAnalysis analysis={analysis} />}
                  </>
                )}
              </Box>
            </Fade>
          </Grid>

          {/* Charts Section */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Spending Forecast
                  </Typography>
                </Box>
                {loadingStates.forecast ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <ErrorDisplay message={errors.forecast} />
                    {forecast && <ForecastChart forecast={forecast.forecast} startDate={forecast.startDate} />}
                  </>
                )}
              </Paper>
            </Fade>
          </Grid>

          <Grid item xs={12} md={6}>
            <Fade in timeout={1000} style={{ transitionDelay: '600ms' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccountBalanceWalletIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Cash Flow Analysis
                  </Typography>
                </Box>
                {loadingStates.cashFlow ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <ErrorDisplay message={errors.cashFlow} />
                    {cashFlow.length > 0 && <CashFlowChart data={cashFlow} />}
                  </>
                )}
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default AIAnalysisPage;