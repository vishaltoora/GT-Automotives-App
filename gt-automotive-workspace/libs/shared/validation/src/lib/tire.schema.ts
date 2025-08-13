import * as yup from 'yup';

export const tireTypes = ['ALL_SEASON', 'SUMMER', 'WINTER', 'PERFORMANCE', 'OFF_ROAD', 'RUN_FLAT'] as const;
export const tireConditions = ['NEW', 'USED_EXCELLENT', 'USED_GOOD', 'USED_FAIR'] as const;

export const createTireSchema = yup.object({
  brand: yup.string().required('Brand is required'),
  model: yup.string().required('Model is required'),
  size: yup.string()
    .matches(/^\d{3}\/\d{2}R\d{2}$/, 'Invalid tire size format (e.g., 225/65R17)')
    .required('Size is required'),
  type: yup.string()
    .oneOf([...tireTypes], 'Invalid tire type')
    .required('Type is required'),
  condition: yup.string()
    .oneOf([...tireConditions], 'Invalid tire condition')
    .required('Condition is required'),
  quantity: yup.number()
    .min(0, 'Quantity cannot be negative')
    .integer('Quantity must be a whole number')
    .required('Quantity is required'),
  price: yup.number()
    .min(0, 'Price cannot be negative')
    .required('Price is required'),
  cost: yup.number()
    .min(0, 'Cost cannot be negative')
    .optional(),
  location: yup.string().optional(),
  minStock: yup.number()
    .min(0, 'Minimum stock cannot be negative')
    .integer('Minimum stock must be a whole number')
    .default(5),
  imageUrl: yup.string().url('Invalid URL format').optional(),
});

export const updateTireSchema = yup.object({
  brand: yup.string().optional(),
  model: yup.string().optional(),
  size: yup.string()
    .matches(/^\d{3}\/\d{2}R\d{2}$/, 'Invalid tire size format (e.g., 225/65R17)')
    .optional(),
  type: yup.string()
    .oneOf([...tireTypes], 'Invalid tire type')
    .optional(),
  condition: yup.string()
    .oneOf([...tireConditions], 'Invalid tire condition')
    .optional(),
  quantity: yup.number()
    .min(0, 'Quantity cannot be negative')
    .integer('Quantity must be a whole number')
    .optional(),
  price: yup.number()
    .min(0, 'Price cannot be negative')
    .optional(),
  cost: yup.number()
    .min(0, 'Cost cannot be negative')
    .optional(),
  location: yup.string().optional(),
  minStock: yup.number()
    .min(0, 'Minimum stock cannot be negative')
    .integer('Minimum stock must be a whole number')
    .optional(),
  imageUrl: yup.string().url('Invalid URL format').optional(),
});