import React from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Tooltip,
  IconButton,
  FormControl,
  FormLabel,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Customer } from '../../requests/customer.requests';

interface CustomerSelectionFieldProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
  onAddCustomer: () => void;
  loading: boolean;
  disabled?: boolean;
  showAddButton?: boolean;
}

export const CustomerSelectionField: React.FC<CustomerSelectionFieldProps> = ({
  customers,
  selectedCustomer,
  onCustomerChange,
  onAddCustomer,
  loading,
  disabled = false,
  showAddButton = true,
}) => {
  return (
    <FormControl component="fieldset" required fullWidth>
      <FormLabel component="legend">Search or Add Customer</FormLabel>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}>
        <Autocomplete
          fullWidth
          options={customers}
          value={selectedCustomer}
          onChange={(_, value) => onCustomerChange(value)}
          getOptionLabel={(customer) =>
            customer.businessName
              ? `${customer.businessName} (${customer.firstName} ${customer.lastName})`
              : `${customer.firstName} ${customer.lastName}`
          }
          filterOptions={(options, { inputValue }) => {
            // Filter by name, business name, or phone number
            const filterValue = inputValue.toLowerCase();
            return options.filter((customer) => {
              const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
              const businessName = customer.businessName?.toLowerCase() || '';
              const phone = customer.phone?.toLowerCase() || '';

              return (
                fullName.includes(filterValue) ||
                businessName.includes(filterValue) ||
                phone.includes(filterValue)
              );
            });
          }}
          renderOption={(props, customer) => (
            <li {...props} key={customer.id}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ fontWeight: 600 }}>
                  {customer.businessName
                    ? `${customer.businessName}`
                    : `${customer.firstName} ${customer.lastName}`}
                </Box>
                {customer.businessName && (
                  <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    {customer.firstName} {customer.lastName}
                  </Box>
                )}
                {customer.phone && (
                  <Box sx={{ fontSize: '0.875rem', color: 'primary.main' }}>
                    {customer.phone}
                  </Box>
                )}
              </Box>
            </li>
          )}
          loading={loading}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer (search by name or phone)"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        {showAddButton && (
          <Tooltip title="Add New Customer">
            <IconButton
              onClick={onAddCustomer}
              color="primary"
              sx={{
                mt: 0.5,
                border: '1px dashed',
                borderColor: 'primary.main',
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </FormControl>
  );
};
