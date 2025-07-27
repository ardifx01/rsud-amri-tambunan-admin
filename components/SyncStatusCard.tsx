import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { SyncLog } from '@/types';

interface SyncStatusCardProps {
  lastLog: SyncLog | null;
}

const SyncStatusCard: React.FC<SyncStatusCardProps> = ({ lastLog }) => {
  if (!lastLog) {
    return (
      <Card sx={{ minWidth: 275, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status Sinkronisasi
          </Typography>
          <Typography color="text.secondary">Memuat status...</Typography>
        </CardContent>
      </Card>
    );
  }

  const { timestamp, message, hasNewData } = lastLog;

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status Sinkronisasi
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {hasNewData ? (
            <>
              <CheckCircleIcon color="success" fontSize="small" />
              <Chip label="Ada Data Baru" color="success" size="small" />
            </>
          ) : (
            <>
              <CancelIcon color="warning" fontSize="small" />
              <Chip label="Tidak ada perubahan" color="warning" size="small" />
            </>
          )}
        </Box>
        <Typography variant="caption" display="block" gutterBottom>
          {timestamp}
        </Typography>
        <Typography variant="body2" component="div">
          {message}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SyncStatusCard;