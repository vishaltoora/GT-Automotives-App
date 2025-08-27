# User Management System

This document covers the comprehensive user management system implemented for GT Automotive, including authentication, authorization, and user administration features.

## Overview

The user management system provides secure, role-based access control with administrative capabilities for creating and managing user accounts. The system integrates with Clerk authentication for secure user management.

## User Roles

### Admin
- **Full system access** - All features and data
- **User management** - Create/edit/delete all user types
- **Financial reports** - Access to all financial data
- **System configuration** - Modify system settings
- **Audit logs** - View all system activities

### Staff
- **Operational access** - Day-to-day business operations
- **Customer management** - Create/edit customers and vehicles
- **Inventory management** - Manage tire inventory (no price changes)
- **Invoice creation** - Create and manage invoices
- **Limited reports** - Operational reports only

### Customer
- **Self-service portal** - Personal account management
- **Vehicle management** - View and manage their vehicles
- **Invoice viewing** - View their invoices and payment history
- **Appointment booking** - Schedule service appointments
- **Tire browsing** - View available tire inventory

## Authentication Features

### Login System
- **Dual Login**: Users can login with either username or email
- **Clerk Integration**: Secure authentication via Clerk
- **Role-based Redirects**: Automatic redirect to appropriate dashboard
- **Professional UI**: Branded login page with GT Automotive styling

### Security Features
- **Admin-only Registration**: Public signup is disabled
- **Role Verification**: Server-side role validation on all endpoints
- **Session Management**: Secure session handling via Clerk
- **Password Requirements**: Enforced via Clerk configuration

## User Management UI

### Admin Dashboard Features
- **User Creation Dialog**: Professional form for creating admin/staff users
- **User Editing**: Modify existing user details and roles
- **User List**: Comprehensive view of all system users
- **Role Management**: Change user roles with proper validation

### User Creation Process
1. **Access Control**: Only admins can create users
2. **Form Validation**: Required fields and format validation
3. **Clerk Integration**: Automatic Clerk user creation
4. **Database Sync**: Local user record creation with role assignment
5. **Error Handling**: Comprehensive error management and user feedback

## Technical Implementation

### Frontend Components

#### CreateUserDialog
- **Location**: `apps/webApp/src/components/users/CreateUserDialog.tsx`
- **Features**: Form validation, role selection, Clerk integration
- **Props**: Open state, onClose callback, onUserCreated callback

#### EditUserDialog
- **Location**: `apps/webApp/src/components/users/EditUserDialog.tsx`
- **Features**: User data editing, role changes, validation
- **Props**: User object, open state, callbacks

#### UserManagement Page
- **Location**: `apps/webApp/src/pages/admin/UserManagement.tsx`
- **Features**: User listing, search, creation, editing
- **Access**: Admin-only via route protection

### Backend Implementation

#### Users Controller
- **Location**: `server/src/users/users.controller.ts`
- **Endpoints**:
  - `POST /api/users/admin-staff` - Create admin/staff users
  - `GET /api/users` - List all users
  - `PUT /api/users/:id` - Update user details
  - `DELETE /api/users/:id` - Deactivate user account

#### Users Service
- **Location**: `server/src/users/users.service.ts`
- **Features**:
  - Clerk integration for user creation
  - Role management and validation
  - User data synchronization
  - Error handling and logging

### Database Schema

#### User Table
```sql
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  username  String?  @unique
  firstName String
  lastName  String
  phone     String?
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Role Table
```sql
model Role {
  id          String @id @default(uuid())
  name        String @unique // ADMIN, STAFF, CUSTOMER
  description String
  users       User[]
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/sync` - Sync Clerk user data
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users` - List users (Admin only)
- `POST /api/users/admin-staff` - Create admin/staff (Admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/role` - Change user role

## Security Considerations

### Access Control
- **Route Protection**: Role-based route guards on frontend
- **API Security**: Role decorators on all sensitive endpoints
- **Data Isolation**: Users only see data they're authorized for
- **Audit Logging**: All administrative actions are logged

### Authentication Security
- **Clerk Integration**: Industry-standard authentication provider
- **JWT Tokens**: Secure token-based authentication
- **Role Validation**: Server-side role verification on every request
- **Session Security**: Secure session management and timeout

## Configuration

### Environment Variables
```bash
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_KEY=clerk-jwt-key

# Database
DATABASE_URL="postgresql://..."
```

### Clerk Setup
1. **Application Configuration**: Set up Clerk application
2. **User Metadata**: Configure role information in user metadata
3. **JWT Template**: Create JWT template for role claims
4. **Webhooks**: Configure webhooks for user synchronization

## Usage Examples

### Creating a Staff User (Admin)
```typescript
const createStaffUser = async (userData: CreateUserData) => {
  const response = await fetch('/api/users/admin-staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'staff@gtautomotive.com',
      username: 'staff_user',
      firstName: 'Staff',
      lastName: 'Member',
      phone: '555-0123',
      roleName: 'STAFF',
      password: 'SecurePassword123!'
    })
  });
  
  if (!response.ok) throw new Error('Failed to create user');
  return await response.json();
};
```

### Checking User Role (Frontend)
```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { role, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <LoginPage />;
  
  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'STAFF':
      return <StaffDashboard />;
    case 'CUSTOMER':
      return <CustomerPortal />;
    default:
      return <Unauthorized />;
  }
};
```

## Development Guidelines

### Adding New Roles
1. **Database Update**: Add new role to Role table
2. **Enum Update**: Update role enums in shared libraries
3. **Route Guards**: Update route protection logic
4. **UI Updates**: Add role-specific UI components
5. **API Updates**: Update role validation decorators

### User Management Best Practices
- **Always validate roles** on both frontend and backend
- **Log administrative actions** for audit trails
- **Use proper error handling** for user feedback
- **Test with all role types** during development
- **Follow principle of least privilege**

## Troubleshooting

### Common Issues

#### User Creation Fails
- **Check Clerk configuration** - Verify API keys and settings
- **Database connectivity** - Ensure database is accessible
- **Validation errors** - Check required fields and formats
- **Role assignment** - Verify role exists in database

#### Login Issues
- **Clerk integration** - Check Clerk dashboard for errors
- **Role synchronization** - Verify user roles are properly synced
- **JWT configuration** - Ensure JWT template is correctly configured
- **Network issues** - Check API connectivity

#### Permission Errors
- **Role verification** - Ensure user has correct role assigned
- **Route protection** - Check route guards are properly implemented
- **API authorization** - Verify role decorators on endpoints
- **Token validity** - Check JWT token expiration and validity

## Future Enhancements

### Planned Features
- **Multi-factor Authentication**: Enhanced security via MFA
- **Password Policies**: Configurable password requirements  
- **User Groups**: Group-based permission management
- **Session Management**: Advanced session control and monitoring
- **Activity Logging**: Detailed user activity tracking

### Considerations
- **Scalability**: Design for growing user base
- **Performance**: Optimize user lookup and authentication
- **Security**: Regular security audits and updates
- **Compliance**: Ensure GDPR/privacy compliance as needed

---

**Last Updated**: August 27, 2025
**Version**: 1.0
**Author**: GT Automotive Development Team