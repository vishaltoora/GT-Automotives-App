import React from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  FormLabel,
} from '@mui/material';
import { User } from '../../requests/user.requests';
import { AvailableSlot } from '../../requests/appointment.requests';

interface EmployeeChipSelectorProps {
  employees: User[];
  selectedEmployees: User[];
  availableSlots: AvailableSlot[];
  scheduledTime: string;
  onEmployeeToggle: (employee: User) => void;
  loading?: boolean;
}

export const EmployeeChipSelector: React.FC<EmployeeChipSelectorProps> = ({
  employees,
  selectedEmployees,
  availableSlots,
  scheduledTime,
  onEmployeeToggle,
  loading = false,
}) => {
  if (loading) {
    return (
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 1 }}>
          Assign to Employee(s) (Optional)
        </FormLabel>
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <span>Loading employees...</span>
        </Box>
      </FormControl>
    );
  }

  if (employees.length === 0) {
    return (
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 1 }}>
          Assign to Employee(s) (Optional)
        </FormLabel>
        <Alert severity="info">No employees available</Alert>
      </FormControl>
    );
  }

  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Assign to Employee(s) (Optional)
      </FormLabel>
      <Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {employees.map((employee) => {
            const isSelected = selectedEmployees.some((e) => e.id === employee.id);

            // Determine availability status
            let isAvailable = true;
            let isDisabled = false;
            let statusText = '';

            if (availableSlots.length > 0) {
              const exactMatch = availableSlots.find(
                (slot) =>
                  slot.employeeId === employee.id &&
                  slot.startTime === scheduledTime
              );

              const hasAnySlots = availableSlots.some(
                (slot) => slot.employeeId === employee.id
              );

              if (exactMatch) {
                isAvailable = exactMatch.available;
                isDisabled = !exactMatch.available;
                statusText = isAvailable ? '✅' : '❌';
              } else if (hasAnySlots) {
                isDisabled = true;
                statusText = '❌';
              } else {
                statusText = '⚠️';
              }
            }

            return (
              <Chip
                key={employee.id}
                label={`${employee.firstName} ${employee.lastName} ${statusText}`}
                onClick={() => {
                  if (!isDisabled) {
                    onEmployeeToggle(employee);
                  }
                }}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                disabled={isDisabled}
                sx={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                  borderWidth: isSelected ? 2 : 1,
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected
                    ? undefined
                    : isAvailable && availableSlots.length > 0
                    ? 'success.dark'
                    : 'text.primary',
                  backgroundColor: isSelected
                    ? undefined
                    : isAvailable && availableSlots.length > 0
                    ? 'rgba(46, 125, 50, 0.08)'
                    : undefined,
                  borderColor:
                    isAvailable && !isSelected && availableSlots.length > 0
                      ? 'success.main'
                      : 'divider',
                  '& .MuiChip-label': {
                    color: isSelected
                      ? 'white'
                      : isAvailable && availableSlots.length > 0
                      ? 'success.dark'
                      : 'text.primary',
                  },
                  '&:hover': {
                    backgroundColor: isDisabled
                      ? undefined
                      : isSelected
                      ? 'primary.dark'
                      : isAvailable
                      ? 'rgba(46, 125, 50, 0.15)'
                      : 'action.hover',
                    transform: !isDisabled ? 'scale(1.02)' : undefined,
                    boxShadow: !isDisabled ? 1 : undefined,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            );
          })}
        </Box>
        <Box
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            mt: 1,
          }}
        >
          {selectedEmployees.length === 0
            ? 'Click to select employees or leave empty for auto-assignment'
            : `${selectedEmployees.length} employee${
                selectedEmployees.length > 1 ? 's' : ''
              } selected`}
          {availableSlots.length > 0 && (
            <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
              Status: ✅ Available | ❌ Not Available | ⚠️ No Schedule Set
            </Box>
          )}
        </Box>
      </Box>
    </FormControl>
  );
};
