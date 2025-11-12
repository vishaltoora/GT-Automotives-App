import React from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  AutocompleteRenderOptionState,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface AutocompleteWithAddProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  onAddNew: () => void;
  getOptionLabel: (option: T) => string;
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: T, state: AutocompleteRenderOptionState) => React.ReactNode;
  label: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  filterOptions?: (options: T[], state: any) => T[];
  addButtonTooltip?: string;
  freeSolo?: boolean;
  onInputChange?: (event: React.SyntheticEvent, value: string, reason: string) => void;
}

/**
 * Reusable Autocomplete component with an external "Add New" button
 * Follows the pattern from AppointmentDialog for a cleaner UI
 *
 * @example
 * // Customer selection with add button
 * <AutocompleteWithAdd
 *   options={customers}
 *   value={selectedCustomer}
 *   onChange={setSelectedCustomer}
 *   onAddNew={() => setCustomerDialogOpen(true)}
 *   getOptionLabel={(customer) => `${customer.firstName} ${customer.lastName}`}
 *   label="Customer"
 *   placeholder="Search by name or phone"
 *   addButtonTooltip="Add New Customer"
 * />
 */
export function AutocompleteWithAdd<T>({
  options,
  value,
  onChange,
  onAddNew,
  getOptionLabel,
  renderOption,
  label,
  placeholder,
  loading = false,
  disabled = false,
  required = false,
  size = 'medium',
  filterOptions,
  addButtonTooltip = 'Add New',
  freeSolo = false,
  onInputChange,
}: AutocompleteWithAddProps<T>) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Autocomplete
        fullWidth
        options={options}
        value={value}
        onChange={(_, newValue) => onChange(newValue as T | null)}
        getOptionLabel={(option) => getOptionLabel(option as T)}
        renderOption={renderOption}
        filterOptions={filterOptions}
        loading={loading}
        disabled={disabled}
        freeSolo={freeSolo}
        onInputChange={onInputChange}
        size={size}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {!disabled && (
        <Tooltip title={addButtonTooltip}>
          <IconButton
            onClick={onAddNew}
            color="primary"
            sx={{
              mt: size === 'small' ? 0.25 : 0.5,
              border: '1px dashed',
              borderColor: 'primary.main',
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
