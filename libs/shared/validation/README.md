# @gt-automotive/shared-validation

This library contains shared validation schemas using Yup for consistent validation across the frontend application.

## Overview

Validation schemas ensure data integrity and provide user-friendly error messages for form validation in the React frontend.

## Available Schemas

### Authentication Schemas

- **loginSchema**: Validates login form (email, password)
- **registerSchema**: Validates customer registration
- **passwordResetSchema**: Validates password reset requests
- **changePasswordSchema**: Validates password changes

### User Management Schemas

- **createUserSchema**: Admin user creation validation
- **updateUserSchema**: User profile update validation
- **roleAssignmentSchema**: Role change validation

### Tire Inventory Schemas (Coming Soon)

- **tireSchema**: Tire data validation
- **tireSearchSchema**: Search parameter validation
- **stockAdjustmentSchema**: Inventory adjustment validation

## Usage

### Form Validation with Formik

```typescript
import { loginSchema } from '@gt-automotive/shared-validation';
import { Formik } from 'formik';

<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={loginSchema}
  onSubmit={handleSubmit}
>
  {/* Form fields */}
</Formik>
```

### Standalone Validation

```typescript
import { registerSchema } from '@gt-automotive/shared-validation';

try {
  await registerSchema.validate(formData);
  // Data is valid
} catch (error) {
  // Handle validation errors
}
```

## Schema Examples

### Login Schema
```typescript
export const loginSchema = yup.object({
  email: yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
});
```

### Register Schema
```typescript
export const registerSchema = yup.object({
  email: yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .matches(/[0-9]/, 'Password must contain number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm password'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().matches(/^\d{10}$/, 'Invalid phone number')
});
```

## Building

Run `nx build shared-validation` to build the library.

## Testing

Run `nx test shared-validation` to execute unit tests.

## Contributing

When adding new schemas:
1. Create descriptive error messages
2. Consider internationalization needs
3. Test edge cases
4. Document validation rules
5. Export from index.ts

## Dependencies

- yup: Schema validation library
- @types/yup: TypeScript definitions
