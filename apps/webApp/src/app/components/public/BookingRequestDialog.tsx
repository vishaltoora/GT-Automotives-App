import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Close as CloseIcon, LocationOn as LocationIcon, Store as StoreIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

interface BookingRequestDialogProps {
  open: boolean;
  onClose: () => void;
}

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

export function BookingRequestDialog({ open, onClose }: BookingRequestDialogProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    appointmentType: 'AT_GARAGE',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: '',
    requestedDate: '',
    requestedTime: '',
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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success]);

  const handleClose = () => {
    setFormData({
      appointmentType: 'AT_GARAGE',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      serviceType: '',
      requestedDate: '',
      requestedTime: '',
      notes: '',
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

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
    // Address is only required for mobile service
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

  const handleSubmit = async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (loadError) {
    console.error('Google Maps API load error:', loadError);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={window.innerWidth < 600} // Full screen on mobile
      sx={{
        '& .MuiDialog-paper': {
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: '100vh', sm: '90vh' },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.primary.main,
          color: 'white',
          pb: 2,
          px: { xs: 2, sm: 3 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 700,
        }}
      >
        Book an Appointment
        <Button
          onClick={handleClose}
          sx={{ color: 'white', minWidth: 'auto', p: { xs: 0.5, sm: 1 } }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ mt: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Booking request submitted successfully! We'll contact you shortly to confirm your appointment.
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={{ xs: 2, sm: 2 }}>
              {/* Appointment Type Selection */}
              <Grid size={{ xs: 12 }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary.main,
                      mb: 1,
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
                      gap: { xs: 2, sm: 2 },
                    }}
                  >
                    <FormControlLabel
                      value="AT_GARAGE"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StoreIcon sx={{ color: colors.primary.main, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                              At Garage
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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
                      }}
                    />
                    <FormControlLabel
                      value="MOBILE_SERVICE"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ color: colors.secondary.main, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                              Mobile Service
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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

              {/* Address with Google Places Autocomplete - Only for Mobile Service */}
              {formData.appointmentType === 'MOBILE_SERVICE' && (
                <Grid size={{ xs: 12 }}>
                  {isLoaded ? (
                    <Autocomplete
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
                    </Autocomplete>
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
                <TextField
                  fullWidth
                  label="Requested Time"
                  required
                  type="time"
                  value={formData.requestedTime}
                  onChange={handleChange('requestedTime')}
                  disabled={submitting}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { step: 900 }, // 15-minute intervals
                  }}
                />
              </Grid>

              {/* Additional Notes */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={3}
                  placeholder="Tell us more about your service needs..."
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  disabled={submitting}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: { xs: 2, sm: 2 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                * We'll contact you shortly to confirm your appointment and provide a quote if needed.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: { xs: 1, sm: 0 },
        }}
      >
        {!success && (
          <>
            <Button
              onClick={handleClose}
              disabled={submitting}
              fullWidth={window.innerWidth < 600}
              sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              fullWidth={window.innerWidth < 600}
              sx={{
                backgroundColor: colors.primary.main,
                fontSize: { xs: '0.9rem', sm: '0.875rem' },
                py: { xs: 1.5, sm: 1 },
                '&:hover': {
                  backgroundColor: colors.primary.dark,
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
