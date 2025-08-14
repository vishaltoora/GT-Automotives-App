import * as yup from 'yup';

export const createVehicleSchema = yup.object({
  customerId: yup.string().required('Customer ID is required'),
  make: yup.string().required('Vehicle make is required'),
  model: yup.string().required('Vehicle model is required'),
  year: yup.number()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Invalid year')
    .required('Year is required'),
  vin: yup.string()
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format')
    .optional(),
  licensePlate: yup.string().optional(),
  mileage: yup.number()
    .min(0, 'Mileage cannot be negative')
    .optional(),
});

export const updateVehicleSchema = yup.object({
  make: yup.string().optional(),
  model: yup.string().optional(),
  year: yup.number()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Invalid year')
    .optional(),
  vin: yup.string()
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format')
    .optional(),
  licensePlate: yup.string().optional(),
  mileage: yup.number()
    .min(0, 'Mileage cannot be negative')
    .optional(),
});