import React from 'react';
import { Box, FormControl, FormLabel } from '@mui/material';
import { CrudAutocomplete } from '../common/CrudAutocomplete';
import { Customer } from '../../requests/customer.requests';

interface CustomerSelectionFieldProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
  onAddCustomer: () => void;
  /** Opens the customer dialog for the row's customer. Omit to hide edit. */
  onEditCustomer?: (customer: Customer) => void;
  loading: boolean;
  disabled?: boolean;
  showAddButton?: boolean;
}

const customerLabel = (customer: Customer) =>
  customer.businessName
    ? `${customer.businessName} (${customer.firstName} ${customer.lastName})`
    : `${customer.firstName} ${customer.lastName}`;

export const CustomerSelectionField: React.FC<CustomerSelectionFieldProps> = ({
  customers,
  selectedCustomer,
  onCustomerChange,
  onAddCustomer,
  onEditCustomer,
  loading,
  disabled = false,
  showAddButton = true,
}) => {
  return (
    <FormControl component="fieldset" required fullWidth>
      <FormLabel component="legend">Search or Add Customer</FormLabel>
      <Box sx={{ mt: 1 }}>
        <CrudAutocomplete<Customer>
          label="Customer (search by name or phone)"
          entityLabel="customer"
          options={customers}
          value={selectedCustomer}
          onChange={onCustomerChange}
          getOptionId={(customer) => customer.id}
          getOptionLabel={customerLabel}
          // Staff search by whatever they have to hand — phone as often as name.
          getOptionSearchText={(customer) =>
            [customer.businessName, customer.phone].filter(Boolean).join(' ')
          }
          renderOptionContent={(customer) => (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ fontWeight: 600 }}>
                {customer.businessName
                  ? customer.businessName
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
          )}
          loading={loading}
          disabled={disabled}
          required
          onAdd={showAddButton ? onAddCustomer : undefined}
          onEdit={onEditCustomer}
        />
      </Box>
    </FormControl>
  );
};
