"use client";

import React, { useEffect, useState } from 'react';
import { 
  Box, CircularProgress, Typography, Grid, Paper, useTheme, Fade, Button
} from '@mui/material';
import SpendingAnalysis from './../components/AiAnalysis/SpendingAnalysis';
import ForecastChart from './../components/AiAnalysis/ForecastChart';
import CashFlowChart from './../components/AiAnalysis/CashFlowChart';
import PdfViewerModal from './../components/AiAnalysis/PdfViewerModal';
import NavBar from "../components/NavBar";
import { getQuarterlyAnalysis, fetchForecast, getMonthlyCashflow, fetchMonthlyReport } from '../services/api';
import { ChatWidget } from '../components/AiAnalysis/ChatWidget';
import { DetailedSpendingAnalysis } from '../models/SpendingAnalysis';
import { SpendingForecastResponse } from '../models/forecast';
import { DetailedDailyCashFlowDto } from '../models/DetailedDailyCashFlow';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';



const AIAnalysisPage = () => {
  const theme = useTheme();
  const [analysis, setAnalysis] = useState<DetailedSpendingAnalysis | null>(null);
  const [forecast, setForecast] = useState<SpendingForecastResponse | null>(null);
  const [cashFlow, setCashFlow] = useState<DetailedDailyCashFlowDto[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    analysis: false,
    forecast: true,
    cashFlow: true
  });
  const [errors, setErrors] = useState({
    analysis: null as string | null,
    forecast: null as string | null,
    cashFlow: null as string | null
  });
  const [userId, setUserId] = useState<string | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);

  

  useEffect(() => {
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoadingStates(prev => ({ ...prev, forecast: false, cashFlow: false }));
        return;
      }

      try {
        
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

         await Promise.allSettled([forecastPromise, cashFlowPromise]);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setLoadingStates(prev => ({ ...prev, forecast: false, cashFlow: false }));
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // New handler for spending analysis
  const handleShowSpendingAnalysis = async () => {
    if (!userId) return;

    setAnalysisModalOpen(true);
    setLoadingStates(prev => ({ ...prev, analysis: true }));
    setErrors(prev => ({ ...prev, analysis: null }));
  
      try {
        const data = await getQuarterlyAnalysis(userId);
        setAnalysis(data as DetailedSpendingAnalysis);
      } catch (err) {
        setErrors(prev => ({ ...prev, analysis: 'Failed to load spending analysis' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, analysis: false }));
      }
  };


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

  const handleOpenReport = async () => {
    if (!userId) return;
    
    setReportLoading(true);
    setReportError(null);
    setOpenPdfModal(true);
  
    try {
      const pdfBlob = await fetchMonthlyReport(userId);
      if (pdfBlob instanceof Blob) {
        const url = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
        setPdfUrl(url);
      } else {
        throw new Error('Invalid PDF Blob received');
      }
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };
  
  const handleClosePdfModal = () => {
    setOpenPdfModal(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleDownloadReport = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'monthly-financial-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen w-full">
      <NavBar />
      <Box sx={{ flex: 1, p: 4, maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <AutoGraphIcon sx={{ 
                fontSize: 40, 
                color: theme.palette.primary.main,
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' }
              }} />
              <Box>
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: 600,
                  letterSpacing: '-0.5px'
                }}>
                  AI-Powered Financial Analysis
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Intelligent insights powered by advanced AI algorithms
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
  
        {/* Action Buttons Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 1
                }}>
                  <InsightsIcon color="primary" />
                  <Typography variant="h6">AI Insights</Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleShowSpendingAnalysis}
                  disabled={loadingStates.analysis}
                  startIcon={<AutoGraphIcon />}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {loadingStates.analysis ? 'Analyzing...' : 'Show Spending Analysis'}
                </Button>
                <Typography variant="caption" color="text.secondary" align="center">
                  Detailed spending breakdown and recommendations
                </Typography>
              </Box>
            </Fade>
          </Grid>
  
          <Grid item xs={12} md={6}>
            <Fade in timeout={800} style={{ transitionDelay: '400ms' }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 1
                }}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6">Financial Reports</Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenReport}
                  disabled={reportLoading}
                  startIcon={<DescriptionIcon />}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {reportLoading ? 'Generating...' : 'Generate PDF Report'}
                </Button>
                <Typography variant="caption" color="text.secondary" align="center">
                  Monthly financial overview and projections
                </Typography>
              </Box>
            </Fade>
          </Grid>
        </Grid>
  
        {/* Charts Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={800} style={{ transitionDelay: '600ms' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2,
                  px: 1
                }}>
                  <TrendingUpIcon sx={{ 
                    color: theme.palette.primary.main,
                    fontSize: 32
                  }} />
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    Spending Forecast
                  </Typography>
                </Box>
                {loadingStates.forecast ? (
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
            <Fade in timeout={800} style={{ transitionDelay: '800ms' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2,
                  px: 1
                }}>
                  <AccountBalanceWalletIcon sx={{ 
                    color: theme.palette.primary.main,
                    fontSize: 32
                  }} />
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    Cash Flow Analysis
                  </Typography>
                </Box>
                {loadingStates.cashFlow ? (
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
  
        {/* Modals */}
        <PdfViewerModal
          open={openPdfModal}
          pdfUrl={pdfUrl}
          loading={reportLoading}
          error={reportError}
          onClose={handleClosePdfModal}
          onDownload={handleDownloadReport}
        />
  
        <Dialog
          open={analysisModalOpen}
          onClose={() => setAnalysisModalOpen(false)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              height: '80vh',
              borderRadius: 3,
              overflow: 'hidden',
              background: theme.palette.background.paper
            }
          }}
        >
    <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 2,
        px: 3
      }}>
        AI Spending Analysis
        <IconButton onClick={() => setAnalysisModalOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loadingStates.analysis ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <CircularProgress />
          </Box>
        ) : errors.analysis ? (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'error.main',
            p: 3
          }}>
            <ErrorOutlineIcon />
            <Typography>{errors.analysis}</Typography>
          </Box>
        ) : analysis ? (
          <Box sx={{ overflowY: 'auto', height: '100%' }}>
            <SpendingAnalysis analysis={analysis} />
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
      
      </Box>

      <ChatWidget />
    </div>

    
  );
};

export default AIAnalysisPage;