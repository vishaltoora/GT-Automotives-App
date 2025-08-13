import * as yup from 'yup';

export const invoiceStatuses = ['DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'REFUNDED'] as const;
export const paymentMethods = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'CHECK', 'E_TRANSFER', 'FINANCING'] as const;
export const invoiceItemTypes = ['TIRE', 'SERVICE', 'PART', 'OTHER'] as const;

export const createInvoiceItemSchema = yup.object({
  tireId: yup.string().optional(),
  itemType: yup.string()
    .oneOf([...invoiceItemTypes], 'Invalid item type')
    .required('Item type is required'),
  description: yup.string().required('Description is required'),
  quantity: yup.number()
    .min(1, 'Quantity must be at least 1')
    .integer('Quantity must be a whole number')
    .required('Quantity is required'),
  unitPrice: yup.number()
    .min(0, 'Unit price cannot be negative')
    .required('Unit price is required'),
});

export const createInvoiceSchema = yup.object({
  customerId: yup.string().required('Customer ID is required'),
  vehicleId: yup.string().optional(),
  items: yup.array()
    .of(createInvoiceItemSchema)
    .min(1, 'At least one item is required')
    .required('Invoice items are required'),
  taxRate: yup.number()
    .min(0, 'Tax rate cannot be negative')
    .max(1, 'Tax rate cannot exceed 100%')
    .required('Tax rate is required'),
  status: yup.string()
    .oneOf([...invoiceStatuses], 'Invalid invoice status')
    .default('DRAFT'),
  paymentMethod: yup.string()
    .oneOf([...paymentMethods], 'Invalid payment method')
    .optional(),
  notes: yup.string().optional(),
});

export const updateInvoiceSchema = yup.object({
  status: yup.string()
    .oneOf([...invoiceStatuses], 'Invalid invoice status')
    .optional(),
  paymentMethod: yup.string()
    .oneOf([...paymentMethods], 'Invalid payment method')
    .optional(),
  notes: yup.string().optional(),
});