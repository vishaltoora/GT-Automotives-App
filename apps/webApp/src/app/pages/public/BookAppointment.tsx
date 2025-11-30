import {
  Box,
  Container,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Button,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Paper,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationOn as LocationIcon, Store as StoreIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { useLoadScript, Autocomplete as GoogleAutocomplete } from '@react-google-maps/api';
import { generateTimeOptions } from '../../utils/timeUtils';

interface BookingFormData {
  appointmentType: 'AT_GARAGE' | 'MOBILE_SERVICE';
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  serviceType: string;
  requestedDate: string;
  requestedTime: string;
  notes: string;
}

const libraries: ("places")[] = ["places"];

const SERVICE_TYPES = [
  { value: 'TIRE_CHANGE', label: 'Tire Mount Balance' },
  { value: 'TIRE_ROTATION', label: 'Tire Rotation' },
  { value: 'TIRE_REPAIR', label: 'Tire Repair' },
  { value: 'TIRE_SWAP', label: 'Tire Swap' },
  { value: 'TIRE_BALANCE', label: 'Tire Balance' },
  { value: 'OIL_CHANGE', label: 'Oil Change' },
  { value: 'BRAKE_SERVICE', label: 'Brake Service' },
  { value: 'MECHANICAL_WORK', label: 'Mechanical Work' },
  { value: 'ENGINE_DIAGNOSTIC', label: 'Engine Diagnostic' },
  { value: 'OTHER', label: 'Other Service' },
];

export function BookAppointment() {
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Generate time slot options
  const timeOptions = generateTimeOptions();

  const [formData, setFormData] = useState<BookingFormData>({
    appointmentType: 'AT_GARAGE',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: '',
    requestedDate: today, // Default to today's date
    requestedTime: '09:00', // Default to 9:00 AM
    notes: '',
  });
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
    libraries,
  });

  const handleChange = (field: keyof BookingFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError(null);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setFormData({ ...formData, address: place.formatted_address });
      }
    }
  };

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (formData.appointmentType === 'MOBILE_SERVICE' && !formData.address.trim()) {
      setError('Address is required for mobile service');
      return false;
    }
    if (!formData.serviceType) {
      setError('Service type is required');
      return false;
    }
    if (!formData.requestedDate) {
      setError('Requested date is required');
      return false;
    }
    if (!formData.requestedTime) {
      setError('Requested time is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/booking-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit booking request');
      }

      setSuccess(true);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    console.error('Google Maps API load error:', loadError);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.neutral[50], py: { xs: 2, sm: 4, md: 6 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            mb: { xs: 2, sm: 3 },
            color: colors.primary.main,
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            px: { xs: 1, sm: 2 },
          }}
        >
          Back to Home
        </Button>

        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: colors.primary.main }}>
              Book Appointment Request
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' } }}>
              Fill out the form below and we'll contact you shortly to confirm your appointment
            </Typography>
          </Box>

          {success ? (
            <Alert severity="success" sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Booking Request Submitted Successfully!
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                We'll contact you shortly to confirm your appointment and provide a quote if needed.
                Redirecting you to the home page...
              </Typography>
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Appointment Type Selection */}
                <Grid size={{ xs: 12 }}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel
                      component="legend"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.main,
                        mb: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.1rem' },
                        '&.Mui-focused': {
                          color: colors.primary.main,
                        },
                      }}
                    >
                      Service Location
                    </FormLabel>
                    <RadioGroup
                      value={formData.appointmentType}
                      onChange={handleChange('appointmentType')}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <FormControlLabel
                        value="AT_GARAGE"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
                            <StoreIcon sx={{ color: colors.primary.main, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }} />
                            <Box>
                              <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.1rem' } }}>
                                At Garage
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' } }}>
                                Bring your vehicle to our shop
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{
                          border: `2px solid ${formData.appointmentType === 'AT_GARAGE' ? colors.primary.main : '#e0e0e0'}`,
                          borderRadius: 2,
                          p: { xs: 1.5, sm: 2 },
                          flex: 1,
                          m: 0,
                          backgroundColor: formData.appointmentType === 'AT_GARAGE' ? `${colors.primary.main}10` : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: colors.primary.main,
                          },
                        }}
                      />
                      <FormControlLabel
                        value="MOBILE_SERVICE"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
                            <LocationIcon sx={{ color: colors.secondary.main, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }} />
                            <Box>
                              <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.1rem' } }}>
                                Mobile Service
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' } }}>
                                We come to your location
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{
                          border: `2px solid ${formData.appointmentType === 'MOBILE_SERVICE' ? colors.secondary.main : '#e0e0e0'}`,
                          borderRadius: 2,
                          p: { xs: 1.5, sm: 2 },
                          flex: 1,
                          m: 0,
                          backgroundColor: formData.appointmentType === 'MOBILE_SERVICE' ? `${colors.secondary.main}10` : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: colors.secondary.main,
                          },
                        }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* Customer Name */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    required
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    disabled={submitting}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    required
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    disabled={submitting}
                  />
                </Grid>

                {/* Contact Information */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    required
                    type="tel"
                    placeholder="(250) 123-4567"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    disabled={submitting}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={submitting}
                  />
                </Grid>

                {/* Address - Only for Mobile Service */}
                {formData.appointmentType === 'MOBILE_SERVICE' && (
                  <Grid size={{ xs: 12 }}>
                    {isLoaded ? (
                      <GoogleAutocomplete
                        onLoad={onLoad}
                        onPlaceChanged={onPlaceChanged}
                        options={{
                          componentRestrictions: { country: 'ca' },
                          types: ['address'],
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Service Address"
                          required
                          placeholder="Enter your service location"
                          value={formData.address}
                          onChange={handleChange('address')}
                          disabled={submitting}
                          slotProps={{
                            formHelperText: {
                              sx: { fontSize: { xs: '0.7rem', sm: '0.75rem' } },
                            },
                          }}
                          helperText="Start typing to search for your address"
                        />
                      </GoogleAutocomplete>
                    ) : (
                      <TextField
                        fullWidth
                        label="Service Address"
                        required
                        placeholder="Enter your service location"
                        value={formData.address}
                        onChange={handleChange('address')}
                        disabled={submitting || !isLoaded}
                        slotProps={{
                          formHelperText: {
                            sx: { fontSize: { xs: '0.7rem', sm: '0.75rem' } },
                          },
                        }}
                        helperText={!isLoaded ? "Loading address autocomplete..." : "Enter your full address"}
                      />
                    )}
                  </Grid>
                )}

                {/* Service Type */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Type of Service Needed"
                    required
                    value={formData.serviceType}
                    onChange={handleChange('serviceType')}
                    disabled={submitting}
                  >
                    {SERVICE_TYPES.map((service) => (
                      <MenuItem key={service.value} value={service.value}>
                        {service.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Requested Date and Time */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Requested Date"
                    required
                    type="date"
                    value={formData.requestedDate}
                    onChange={handleChange('requestedDate')}
                    disabled={submitting}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: today },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={timeOptions}
                    getOptionLabel={(option) => option.label}
                    value={timeOptions.find((opt) => opt.value === formData.requestedTime) || timeOptions[8]} // Default to 9:00 AM (index 8)
                    onChange={(_, newValue) => {
                      if (newValue) {
                        setFormData({ ...formData, requestedTime: newValue.value });
                      }
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                      <TextField {...params} label="Requested Time" required />
                    )}
                    disabled={submitting}
                    disableClearable
                  />
                </Grid>

                {/* Additional Notes */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={4}
                    placeholder="Tell us more about your service needs..."
                    value={formData.notes}
                    onChange={handleChange('notes')}
                    disabled={submitting}
                  />
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Box sx={{ mt: { xs: 3, sm: 4 }, display: 'flex', gap: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={submitting}
                  fullWidth={window.innerWidth < 600}
                  sx={{
                    py: { xs: 1.5, sm: 1.25 },
                    fontSize: { xs: '0.9375rem', sm: '0.875rem' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  fullWidth={window.innerWidth < 600}
                  sx={{
                    backgroundColor: colors.primary.main,
                    py: { xs: 1.5, sm: 1.25 },
                    fontSize: { xs: '0.9375rem', sm: '0.875rem' },
                    '&:hover': {
                      backgroundColor: colors.primary.dark,
                    },
                  }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                * We'll contact you shortly to confirm your appointment and provide a quote if needed.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
