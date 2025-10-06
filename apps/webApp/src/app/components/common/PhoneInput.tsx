import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

// Format phone number as XXX-XXX-XXXX for display
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);

  // Format as XXX-XXX-XXXX
  if (limitedDigits.length <= 3) {
    return limitedDigits;
  } else if (limitedDigits.length <= 6) {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  } else {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
};

// Strip formatting to get digits only (for backend)
const stripPhoneFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

interface PhoneInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void; // Returns digits only (no dashes)
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = '555-123-4567',
  label = 'Phone (Optional)',
  ...textFieldProps
}) => {
  // Format the value for display
  const displayValue = formatPhoneNumber(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip all formatting and pass only digits to parent
    const digitsOnly = stripPhoneFormatting(e.target.value);
    onChange(digitsOnly);
  };

  return (
    <TextField
      {...textFieldProps}
      label={label}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};
