import { Chip } from '@mui/material';

function StatusChip({ status }) {
  return (
    <Chip
      label={status === 'completed' ? 'Completed' : 'Pending'}
      color={status === 'completed' ? 'success' : 'warning'}
      size="small"
      sx={{ mt: 1 }}
    />
  );
}

export default StatusChip;