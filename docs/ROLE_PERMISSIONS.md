# Role-Based Access Control (RBAC) Matrix

## User Roles Overview

The GT Automotive application implements three distinct user roles, each with specific permissions and their own interface.

### 1. Customer Role
- **Purpose**: Self-service access for vehicle owners
- **Interface**: Customer portal with limited, personal data access
- **Primary Users**: Vehicle owners seeking service

### 2. Staff Role (Technician/Sales Rep)
- **Purpose**: Daily operational tasks and customer service
- **Interface**: Staff dashboard for service delivery
- **Primary Users**: Mechanics, tire technicians, sales representatives

### 3. Admin Role (Owner/Manager)
- **Purpose**: Complete business management and oversight
- **Interface**: Administrative dashboard with full access
- **Primary Users**: Business owners, managers, supervisors

## Detailed Permissions Matrix

| Feature/Action | Customer | Staff | Admin | Notes |
|----------------|----------|-------|-------|-------|
| **Authentication** |
| Self-register | ✅ | ❌ | ❌ | Customers only |
| Create staff accounts | ❌ | ❌ | ✅ | Admin only |
| Reset own password | ✅ | ✅ | ✅ | All users |
| Reset others' passwords | ❌ | ❌ | ✅ | Admin only |
| View audit logs | ❌ | ❌ | ✅ | Admin only |
| **Customer Management** |
| View own profile | ✅ | ❌ | ✅ | |
| Edit own profile | ✅ | ❌ | ✅ | |
| View all customers | ❌ | ✅ | ✅ | |
| Create new customers | ❌ | ✅ | ✅ | |
| Edit any customer | ❌ | ✅ | ✅ | |
| Delete customers | ❌ | ❌ | ✅ | Admin only |
| View customer notes | ❌ | ✅ | ✅ | |
| **Vehicle Management** |
| View own vehicles | ✅ | ❌ | ✅ | |
| Add own vehicles | ✅ | ❌ | ✅ | |
| View all vehicles | ❌ | ✅ | ✅ | |
| Edit any vehicle | ❌ | ✅ | ✅ | |
| View service history | ✅ (own) | ✅ | ✅ | |
| **Tire Inventory** |
| View inventory | ❌ | ✅ | ✅ | |
| Add inventory | ❌ | ✅ | ✅ | |
| Adjust stock levels | ❌ | ✅ | ✅ | |
| Set prices | ❌ | ❌ | ✅ | Admin only |
| View cost prices | ❌ | ❌ | ✅ | Admin only |
| Delete inventory items | ❌ | ❌ | ✅ | Admin only |
| **Invoicing** |
| View own invoices | ✅ | ❌ | ✅ | |
| View all invoices | ❌ | ✅ | ✅ | |
| Create invoices | ❌ | ✅ | ✅ | |
| Edit invoices | ❌ | ✅ | ✅ | |
| Delete invoices | ❌ | ❌ | ✅ | Admin only |
| Print invoices | ✅ (own) | ✅ | ✅ | |
| Email invoices | ✅ (own) | ✅ | ✅ | |
| Apply discounts | ❌ | Limited | ✅ | Staff has limits |
| Override prices | ❌ | ❌ | ✅ | Admin only |
| View payment history | ✅ (own) | ✅ | ✅ | |
| **Appointments** |
| View own appointments | ✅ | ❌ | ✅ | |
| Request appointments | ✅ | ✅ | ✅ | |
| View all appointments | ❌ | ✅ | ✅ | |
| Schedule appointments | ❌ | ✅ | ✅ | |
| Modify any appointment | ❌ | ✅ | ✅ | |
| Cancel appointments | ✅ (own) | ✅ | ✅ | |
| View technician schedules | ❌ | ✅ | ✅ | |
| **Reports** |
| View own history | ✅ | ✅ | ✅ | |
| Daily sales report | ❌ | ✅ | ✅ | |
| Inventory reports | ❌ | ✅ | ✅ | |
| Financial reports | ❌ | ❌ | ✅ | Admin only |
| Employee performance | ❌ | ❌ | ✅ | Admin only |
| Profit/loss statements | ❌ | ❌ | ✅ | Admin only |
| Export reports | ❌ | ✅ | ✅ | |
| **System Settings** |
| Manage services catalog | ❌ | ❌ | ✅ | Admin only |
| Configure tax rates | ❌ | ❌ | ✅ | Admin only |
| Set business hours | ❌ | ❌ | ✅ | Admin only |
| Manage email templates | ❌ | ❌ | ✅ | Admin only |
| Configure notifications | ✅ (own) | ✅ (own) | ✅ | |

## Interface Routing

### Customer Portal Routes
```
/customer/
├── login
├── register
├── dashboard
├── profile
├── vehicles
├── appointments
├── invoices
└── service-history
```

### Staff Dashboard Routes
```
/staff/
├── login
├── dashboard
├── customers
├── inventory
├── invoices
├── appointments
├── reports
└── settings
```

### Admin Dashboard Routes
```
/admin/
├── login
├── dashboard
├── users
├── customers
├── inventory
├── invoices
├── appointments
├── reports
├── analytics
└── settings
```

## Security Implementation Notes

1. **JWT Token Structure**
   - Include role claim in JWT
   - Validate role on every API request
   - Implement role-specific token expiration

2. **API Middleware**
   - Create role validation middleware
   - Implement data filtering based on role
   - Log all admin actions for audit trail

3. **Database Considerations**
   - Add role field to users table
   - Create audit log table for admin actions
   - Implement row-level security where applicable

4. **Frontend Guards**
   - Implement route guards based on role
   - Hide/show UI elements based on permissions
   - Redirect unauthorized access attempts

## Business Rules

1. **Customer Data Isolation**
   - Customers can only see their own data
   - No cross-customer data visibility
   - Email verification required for registration

2. **Staff Limitations**
   - Cannot view financial totals/profits
   - Cannot modify prices or tax rates
   - Limited discount authority (e.g., max 10%)

3. **Admin Oversight**
   - All admin actions are logged
   - Can impersonate other users for support
   - Has emergency override capabilities

## Implementation Status

1. **Phase 1**: ✅ Basic role separation (Customer vs Staff/Admin) - COMPLETE
2. **Phase 2**: ✅ Full three-role implementation - COMPLETE (Aug 15, 2025)
3. **Phase 3**: 🔄 Granular permissions within roles - In Progress
4. **Phase 4**: 📋 Custom role creation capability (future)

**Note:** As of August 15, 2025, the three-role authentication system with JWT and role-based guards has been fully implemented as part of EPIC-02.