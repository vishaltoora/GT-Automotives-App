import * as yup from 'yup';

export const appointmentStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;

export const createAppointmentSchema = yup.object({
  customerId: yup.string().required('Customer ID is required'),
  vehicleId: yup.string().optional(),
  scheduledDate: yup.date()
    .min(new Date(), 'Appointment date must be in the future')
    .required('Scheduled date is required'),
  scheduledTime: yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .required('Scheduled time is required'),
  duration: yup.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .default(60),
  serviceType: yup.string().required('Service type is required'),
  status: yup.string()
    .oneOf([...appointmentStatuses], 'Invalid appointment status')
    .default('SCHEDULED'),
  notes: yup.string().optional(),
});

export const updateAppointmentSchema = yup.object({
  scheduledDate: yup.date()
    .min(new Date(), 'Appointment date must be in the future')
    .optional(),
  scheduledTime: yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional(),
  duration: yup.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional(),
  serviceType: yup.string().optional(),
  status: yup.string()
    .oneOf([...appointmentStatuses], 'Invalid appointment status')
    .optional(),
  notes: yup.string().optional(),
});