import { Chip } from '@mui/material';

function StatusChip({ status }) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'warning',
    },
    in_progress: {
      label: 'In Progress',
      color: 'info',
    },
    completed: {
      label: 'Completed',
      color: 'success',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      label={currentStatus.label}
      color={currentStatus.color}
      size="small"
      sx={{ mt: 1 }}
    />
  );
}

export default StatusChip;