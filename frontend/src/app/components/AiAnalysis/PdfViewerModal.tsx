import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Box,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

interface PdfViewerModalProps {
  open: boolean;
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onDownload: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  open,
  pdfUrl,
  loading,
  error,
  onClose,
  onDownload
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          height: '90vh',
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Monthly Financial Report
        <Box>
          {pdfUrl && (
            <Tooltip title="Download Report">
              <IconButton onClick={onDownload} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'error.main'
          }}>
            {error}
          </Box>
        ) : pdfUrl ? (
          <embed
            src={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerModal;