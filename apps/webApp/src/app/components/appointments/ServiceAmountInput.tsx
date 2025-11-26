import React, { useMemo } from 'react';
import {
  Box,
  TextField,
  Typography,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';

interface ServiceAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

// Tax rates for BC (GST 5% + PST 7% = 12%)
const GST_RATE = 0.05;
const PST_RATE = 0.07;

/**
 * ServiceAmountInput Component
 *
 * Input field for service amount with automatic tax calculation display
 * Shows GST (5%), PST (7%), and total amount with taxes
 */
export const ServiceAmountInput: React.FC<ServiceAmountInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  // Calculate taxes
  const taxCalculation = useMemo(() => {
    const subtotal = value || 0;
    const gstAmount = subtotal * GST_RATE;
    const pstAmount = subtotal * PST_RATE;
    const totalAmount = subtotal + gstAmount + pstAmount;

    return {
      subtotal,
      gstAmount: Number(gstAmount.toFixed(2)),
      pstAmount: Number(pstAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }, [value]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Allow empty string
    if (inputValue === '') {
      onChange(0);
      return;
    }

    // Parse as float and validate
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    }
  };

  return (
    <Box>
      {/* Service Amount Input */}
      <TextField
        fullWidth
        label="Service Amount (before taxes)"
        type="number"
        value={value || ''}
        onChange={handleAmountChange}
        error={!!error}
        helperText={error || 'Enter the base service amount (GST and PST will be calculated automatically)'}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MoneyIcon color="action" />
            </InputAdornment>
          ),
        }}
        inputProps={{
          min: 0,
          step: 0.01,
        }}
        sx={{ mb: 2 }}
      />

      {/* Tax Breakdown Display */}
      {value > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderColor: 'primary.main',
            borderWidth: 2,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Tax Breakdown
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {/* Subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" fontWeight={500}>
                ${taxCalculation.subtotal.toFixed(2)}
              </Typography>
            </Box>

            {/* GST */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                GST (5%):
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${taxCalculation.gstAmount.toFixed(2)}
              </Typography>
            </Box>

            {/* PST */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                PST (7%):
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${taxCalculation.pstAmount.toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" color="primary">
                Total to Charge:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={700}>
                ${taxCalculation.totalAmount.toFixed(2)} CAD
              </Typography>
            </Box>
          </Box>

          {/* Info text */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}
          >
            This total amount will be charged via Square payment form
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ServiceAmountInput;
