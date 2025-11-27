import React from 'react';
import { Grid, TextField, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { generateTimeOptions } from '../../utils/timeUtils';

interface DateTimeSelectorProps {
  date: Date;
  time: string;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  date,
  time,
  onDateChange,
  onTimeChange,
}) => {
  const timeOptions = generateTimeOptions();

  return (
    <>
      {/* Date Picker */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <DatePicker
          label="Date"
          value={date}
          onChange={onDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
            },
          }}
        />
      </Grid>

      {/* Time Selector */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Autocomplete
          options={timeOptions}
          getOptionLabel={(option) => option.label}
          value={timeOptions.find((opt) => opt.value === time) || undefined}
          onChange={(_, newValue) => {
            if (newValue) {
              onTimeChange(newValue.value);
            }
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={(params) => (
            <TextField {...params} label="Start Time" required />
          )}
          disableClearable
        />
      </Grid>
    </>
  );
};
