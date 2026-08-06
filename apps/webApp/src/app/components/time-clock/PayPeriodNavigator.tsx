import { Box, Button, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  PayPeriod,
  isCurrentPayPeriod,
  nextPayPeriod,
  payPeriodFor,
  payPeriodLabel,
  previousPayPeriod,
} from '../../utils/payPeriod';

interface PayPeriodNavigatorProps {
  period: PayPeriod;
  onChange: (period: PayPeriod) => void;
  disabled?: boolean;
}

/**
 * Steps through semi-monthly pay periods.
 *
 * There is no forward step past the period containing today: hours for a period
 * that has not started yet are always zero, and a control that only ever leads
 * to an empty view reads as broken.
 */
export function PayPeriodNavigator({
  period,
  onChange,
  disabled,
}: PayPeriodNavigatorProps) {
  const isCurrent = isCurrentPayPeriod(period);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton
        size="small"
        aria-label="Previous pay period"
        onClick={() => onChange(previousPayPeriod(period))}
        disabled={disabled}
      >
        <ChevronLeft fontSize="small" />
      </IconButton>
      <Box sx={{ minWidth: 190, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {payPeriodLabel(period)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isCurrent ? 'Current pay period' : 'Pay period'}
        </Typography>
      </Box>
      <IconButton
        size="small"
        aria-label="Next pay period"
        onClick={() => onChange(nextPayPeriod(period))}
        disabled={disabled || isCurrent}
      >
        <ChevronRight fontSize="small" />
      </IconButton>
      {!isCurrent && (
        <Button
          size="small"
          onClick={() => onChange(payPeriodFor(new Date()))}
          disabled={disabled}
        >
          This Period
        </Button>
      )}
    </Box>
  );
}

export default PayPeriodNavigator;
