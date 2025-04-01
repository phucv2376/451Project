import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Paper,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import TimelineIcon from '@mui/icons-material/Timeline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { DetailedSpendingAnalysis } from '../../models/SpendingAnalysis';

interface SpendingAnalysisProps {
  analysis: DetailedSpendingAnalysis;
}

const SpendingAnalysis: React.FC<SpendingAnalysisProps> = ({ analysis }) => {
  const theme = useTheme();
  
  const sections = [
    { title: 'Overview', content: analysis.overview, icon: <InsightsIcon /> },
    { title: 'Spending Trends', content: analysis.spendingTrends, icon: <TrendingUpIcon /> },
    { title: 'Category Analysis', content: analysis.categoryAnalysis, icon: <CategoryIcon /> },
    { title: 'Anomalies & Red Flags', content: analysis.anomaliesOrRedFlags, icon: <WarningIcon /> },
    { title: 'Time-Based Insights', content: analysis.timeBasedInsights, icon: <TimelineIcon /> },
    { title: 'Recommendations', content: analysis.recommendations, icon: <LightbulbIcon /> },
    { title: 'Risk Assessment', content: analysis.riskAssessment, icon: <AssessmentIcon /> },
    { title: 'Opportunities', content: analysis.opportunities, icon: <TrendingFlatIcon /> },
    { title: 'Future Projections', content: analysis.futureProjections, icon: <TimelineOutlinedIcon /> },
    { title: 'Comparative Analysis', content: analysis.comparativeAnalysis, icon: <CompareArrowsIcon /> },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Powered by advanced AI algorithms analyzing your spending patterns
        </Typography>
      </Paper>

      {sections.map((section, index) => (
        <Accordion 
          key={index} 
          sx={{ 
            mb: 1,
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              boxShadow: theme.shadows[2],
              transition: 'all 0.3s ease-in-out',
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            sx={{
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                gap: 2,
              }
            }}
          >
            <Box sx={{ 
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {section.icon}
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {section.title}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                  color: theme.palette.text.secondary
                }}
              >
                {section.content}
              </Typography>
              <LinearProgress 
                sx={{ 
                  mt: 2, 
                  height: 2, 
                  borderRadius: 1,
                  bgcolor: theme.palette.primary.main + '20',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 1,
                  }
                }} 
              />
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
      
      <Paper 
        elevation={0} 
        sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: theme.palette.background.default,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ 
            display: 'block', 
            textAlign: 'right',
            fontStyle: 'italic'
          }}
        >
          {analysis.disclaimer}
        </Typography>
      </Paper>
    </Box>
  );
};

export default SpendingAnalysis; 