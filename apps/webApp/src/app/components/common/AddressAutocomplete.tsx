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

  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Load Google Maps script once
  useEffect(() => {
    if (typeof window === 'undefined' || loaded.current) return;

    const existingScript = document.querySelector('#google-maps');
    if (existingScript) {
      // Script already exists, check if Google is loaded
      if ((window as any).google?.maps?.places) {
        setGoogleLoaded(true);
      } else {
        // Wait for it to load
        existingScript.addEventListener('load', () => setGoogleLoaded(true));
      }
      loaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);
    loaded.current = true;
  }, []);

  // Throttled fetch function
  const fetch = useMemo(
    () =>
      throttle(
        (
          request: { input: string; componentRestrictions?: { country: string }; types?: string[] },
          callback: (results?: readonly PlaceType[]) => void
        ) => {
          autocompleteService.current?.getPlacePredictions(request, callback);
        },
        200
      ),
    []
  );

  // Initialize autocomplete service when Google loads
  useEffect(() => {
    if (googleLoaded && !autocompleteService.current && (window as any).google?.maps?.places) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }
  }, [googleLoaded]);

  // Fetch predictions when input changes
  useEffect(() => {
    let active = true;

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
        types: ['address'], // Include all address types (street addresses, routes, etc.)
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
  }, [value, inputValue, fetch, googleLoaded]);

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

  const handleChange = (event: any, newValue: PlaceType | string | null) => {
    if (typeof newValue === 'string') {
      // User typed a custom address (freeSolo mode)
      setFieldValue(newValue);
      setValue(null);
    } else if (newValue) {
      // User selected from dropdown
      setFieldValue(newValue.description);
      setValue(newValue);
      setOptions([newValue, ...options]);
    } else {
      setFieldValue('');
      setValue(null);
    }
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
      freeSolo // Allow custom addresses not in Google Places
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
        // For freeSolo mode, also update the field value as user types
        if (event?.type === 'change') {
          setFieldValue(newInputValue);
        }
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
              <Grid size="auto">
                <Box
                  component={LocationOnIcon}
                  sx={{ color: 'text.secondary', mr: 2 }}
                />
              </Grid>
              <Grid size="grow">
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
