import * as yup from 'yup';

export const createCustomerSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .required('Phone number is required'),
  address: yup.string().optional(),
});

export const updateCustomerSchema = yup.object({
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  phone: yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  address: yup.string().optional(),
});