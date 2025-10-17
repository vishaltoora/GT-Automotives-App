import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Grid,
  Typography,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) return;

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null as any };

interface MainTextMatchedSubstrings {
  offset: number;
  length: number;
}

interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
  main_text_matched_substrings: readonly MainTextMatchedSubstrings[];
}

interface PlaceType {
  description: string;
  place_id: string;
  structured_formatting: StructuredFormatting;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value: fieldValue,
  onChange: setFieldValue,
  label = 'Address',
  disabled = false,
  fullWidth = true,
  required = false,
  error = false,
  helperText,
}) => {
  const [value, setValue] = useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<readonly PlaceType[]>([]);
  const loaded = useRef(false);

  // Load Google Maps script once
  if (typeof window !== 'undefined' && !loaded.current) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`,
        document.querySelector('head'),
        'google-maps'
      );
    }
    loaded.current = true;
  }

  // Throttled fetch function
  const fetch = useMemo(
    () =>
      throttle(
        (
          request: { input: string; componentRestrictions?: { country: string } },
          callback: (results?: readonly PlaceType[]) => void
        ) => {
          autocompleteService.current?.getPlacePredictions(request, callback);
        },
        200
      ),
    []
  );

  // Initialize autocomplete service
  useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (
        window as any
      ).google.maps.places.AutocompleteService();
    }

    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch(
      {
        input: inputValue,
        componentRestrictions: { country: 'ca' }, // Restrict to Canada
      },
      (results?: readonly PlaceType[]) => {
        if (active) {
          let newOptions: readonly PlaceType[] = [];

          if (value) {
            newOptions = [value];
          }

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  // Sync with external fieldValue
  useEffect(() => {
    if (fieldValue) {
      const placeholderValue = {
        place_id: 'placeholder',
        description: fieldValue,
        structured_formatting: {
          main_text: fieldValue,
          secondary_text: '',
          main_text_matched_substrings: [{ offset: 0, length: 0 }],
        },
      };
      setOptions([placeholderValue]);
      setValue(placeholderValue);
    }
  }, [fieldValue]);

  const handleChange = (event: any, newValue: PlaceType | null) => {
    if (newValue) {
      setFieldValue(newValue.description);
      setValue(newValue);
    } else {
      setFieldValue('');
      setValue(null);
    }
    setOptions(newValue ? [newValue, ...options] : options);
  };

  // Fallback if no API key
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <TextField
        fullWidth={fullWidth}
        label={label}
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText || 'Google Maps API not configured'}
      />
    );
  }

  return (
    <Autocomplete
      id="google-address-autocomplete"
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.description
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      autoHighlight
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={handleChange}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth={fullWidth}
          required={required}
          error={error}
          helperText={helperText}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password',
          }}
        />
      )}
      renderOption={(props, option) => {
        const matches =
          option.structured_formatting?.main_text_matched_substrings || [];
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match: any) => [
            match.offset,
            match.offset + match.length,
          ])
        );

        return (
          <li {...props} key={option.place_id}>
            <Grid container alignItems="center">
              <Grid item>
                <Box
                  component={LocationOnIcon}
                  sx={{ color: 'text.secondary', mr: 2 }}
                />
              </Grid>
              <Grid item xs>
                {parts.map((part: any, index: number) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                    }}
                  >
                    {part.text}
                  </span>
                ))}
                {option.structured_formatting?.secondary_text && (
                  <Typography variant="body2" color="text.secondary">
                    {option.structured_formatting.secondary_text}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </li>
        );
      }}
    />
  );
};
