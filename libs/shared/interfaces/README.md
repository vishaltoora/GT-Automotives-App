# @gt-automotive/shared-interfaces

This library contains TypeScript interfaces and types shared across the GT Automotive application.

## Overview

Shared interfaces ensure type safety and consistency between frontend and backend applications, providing a single source of truth for data structures.

## Available Interfaces

### Authentication Interfaces

- **IUser**: User entity interface
- **IRole**: Role definition
- **IPermission**: Permission structure
- **IAuthResponse**: Authentication response
- **IAuthToken**: JWT token structure

### Business Entity Interfaces

- **ICustomer**: Customer entity
- **IVehicle**: Vehicle information
- **ITire**: Tire inventory item
- **IInvoice**: Invoice structure
- **IAppointment**: Appointment data
- **IAuditLog**: Audit log entry

### Request/Response Interfaces

- **IPaginatedResponse<T>**: Paginated API response
- **IApiError**: Error response structure
- **ISearchParams**: Search parameters
- **IFilterOptions**: Filter options

## Usage

### Import in TypeScript/React

```typescript
import { IUser, IRole } from '@gt-automotive/shared-interfaces';

interface Props {
  user: IUser;
  role: IRole;
}
```

### Import in NestJS

```typescript
import { ICustomer, IPaginatedResponse } from '@gt-automotive/shared-interfaces';

async findAll(): Promise<IPaginatedResponse<ICustomer>> {
  // Implementation
}
```

## Interface Examples

### IUser Interface
```typescript
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
  role?: IRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ITire Interface
```typescript
export interface ITire {
  id: string;
  brand: string;
  model: string;
  size: string;
  type: 'new' | 'used';
  quantity: number;
  price: number;
  cost?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  photos?: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### IPaginatedResponse Interface
```typescript
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Type Guards

The library also provides type guards for runtime type checking:

```typescript
export function isUser(obj: any): obj is IUser {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}
```

## Enums

### UserRole Enum
```typescript
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}
```

### InvoiceStatus Enum
```typescript
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}
```

## Building

Run `nx build shared-interfaces` to build the library.

## Testing

Run `nx test shared-interfaces` to execute unit tests.

## Contributing

When adding new interfaces:
1. Follow TypeScript naming conventions (prefix with 'I')
2. Document complex properties
3. Consider optional vs required fields
4. Export from appropriate subdirectory
5. Export from main index.ts
6. Add corresponding type guards if needed

## Best Practices

- Keep interfaces focused and single-purpose
- Use composition over inheritance
- Document complex business logic
- Consider versioning for breaking changes
- Use enums for fixed sets of values
