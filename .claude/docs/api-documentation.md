# API Documentation

This document provides comprehensive documentation for the GT Automotive application REST API endpoints.

## Base URL

**Development**: `http://localhost:3000/api`  
**Production**: `https://gt-automotive-api.com/api` (when deployed)

## Authentication

All protected endpoints require JWT authentication via Clerk integration.

### Headers
```
Authorization: Bearer <clerk-jwt-token>
Content-Type: application/json
```

### Authentication Flow
1. Client authenticates with Clerk
2. Clerk provides JWT token
3. Token included in Authorization header for API requests
4. Server validates token using Clerk JWKS

## User Management Endpoints

### Create Admin/Staff User
**POST** `/users/admin-staff`

Creates a new admin or staff user account.

**Access**: Admin only

**Request Body**:
```json
{
  "email": "staff@gtautomotive.com",
  "username": "staff_user",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0123",
  "roleName": "STAFF",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "staff@gtautomotive.com",
    "username": "staff_user",
    "firstName": "John",
    "lastName": "Doe",
    "role": {
      "id": "role_123",
      "name": "STAFF"
    },
    "createdAt": "2025-08-27T12:00:00Z"
  }
}
```

### List All Users
**GET** `/users`

Retrieves all system users.

**Access**: Admin only

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (ADMIN, STAFF, CUSTOMER)
- `search` (optional): Search by name or email

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "admin@gtautomotive.com",
        "username": "admin_user",
        "firstName": "Admin",
        "lastName": "User",
        "role": {
          "name": "ADMIN"
        },
        "createdAt": "2025-08-27T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

### Get User Details
**GET** `/users/:id`

Retrieves detailed information about a specific user.

**Access**: Admin, or user viewing their own data

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@gtautomotive.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0123",
    "role": {
      "id": "role_123",
      "name": "STAFF",
      "description": "Staff member with operational access"
    },
    "createdAt": "2025-08-27T12:00:00Z",
    "updatedAt": "2025-08-27T12:00:00Z"
  }
}
```

### Update User
**PUT** `/users/:id`

Updates user information.

**Access**: Admin, or user updating their own data

**Request Body**:
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+1-555-9999"
}
```

### Delete User
**DELETE** `/users/:id`

Deactivates a user account.

**Access**: Admin only

**Response**:
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### Change User Role
**PUT** `/users/:id/role`

Changes a user's role.

**Access**: Admin only

**Request Body**:
```json
{
  "roleName": "ADMIN"
}
```

## Authentication Endpoints

### User Authentication
**POST** `/auth/login`

Authenticates user credentials (handled primarily by Clerk).

### Sync User Data
**POST** `/auth/sync`

Synchronizes user data between Clerk and local database.

**Request Body**:
```json
{
  "clerkUserId": "user_clerk_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Get Current User
**GET** `/auth/me`

Retrieves current authenticated user information.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@gtautomotive.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "permissions": ["read:customers", "write:invoices"]
  }
}
```

## Customer Management Endpoints

### Create Customer
**POST** `/customers`

Creates a new customer record.

**Access**: Admin, Staff

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "businessName": "Smith Auto", // optional
  "email": "jane@example.com", // optional
  "phone": "+1-555-0123", // optional
  "address": "123 Main St, Prince George, BC"
}
```

### List Customers
**GET** `/customers`

Retrieves all customers.

**Access**: Admin, Staff

**Query Parameters**:
- `page`, `limit`: Pagination
- `search`: Search by name or email
- `hasBusinessName`: Filter business customers

### Search Customers
**GET** `/customers/search`

Search customers with advanced filtering.

**Query Parameters**:
- `q`: Search query
- `type`: personal | business | all

### Get Customer Details
**GET** `/customers/:id`

Retrieves detailed customer information.

**Access**: Admin, Staff, Customer (own data only)

### Update Customer
**PATCH** `/customers/:id`

Updates customer information.

**Access**: Admin, Staff, Customer (own data only)

### Delete Customer
**DELETE** `/customers/:id`

Deletes a customer record.

**Access**: Admin only

## Tire Inventory Endpoints

### List Tires
**GET** `/tires`

Retrieves tire inventory.

**Access**: All authenticated users

**Query Parameters**:
- `page`, `limit`: Pagination
- `brand`: Filter by brand
- `size`: Filter by size
- `type`: Filter by type (ALL_SEASON, WINTER, SUMMER)
- `condition`: Filter by condition (NEW, USED)

### Get Tire Details
**GET** `/tires/:id`

Retrieves detailed tire information.

### Create Tire
**POST** `/tires`

Adds new tire to inventory.

**Access**: Admin, Staff

**Request Body**:
```json
{
  "brand": "Michelin",
  "size": "225/65R17",
  "type": "ALL_SEASON",
  "condition": "NEW",
  "quantity": 4,
  "priceEach": 299.99,
  "description": "High-performance all-season tire"
}
```

### Update Tire
**PUT** `/tires/:id`

Updates tire information.

**Access**: Admin, Staff

### Delete Tire
**DELETE** `/tires/:id`

Removes tire from inventory.

**Access**: Admin only

### Adjust Stock
**POST** `/tires/:id/adjust-stock`

Adjusts tire stock quantity.

**Access**: Admin, Staff

**Request Body**:
```json
{
  "adjustment": -2,
  "reason": "Sold to customer"
}
```

### Low Stock Report
**GET** `/tires/reports/low-stock`

Retrieves low stock tire report.

**Access**: Admin, Staff

## Invoice Management Endpoints

### Create Invoice
**POST** `/invoices`

Creates a new invoice.

**Access**: Admin, Staff

**Request Body**:
```json
{
  "customerId": "customer_123",
  "vehicleId": "vehicle_123", // optional
  "items": [
    {
      "type": "tire",
      "tireId": "tire_123",
      "quantity": 4,
      "priceEach": 299.99
    },
    {
      "type": "service",
      "description": "Tire installation",
      "quantity": 1,
      "priceEach": 50.00
    }
  ],
  "taxRate": 0.12,
  "notes": "Customer notes"
}
```

### List Invoices
**GET** `/invoices`

Retrieves invoices with filtering.

**Access**: Admin, Staff, Customer (own invoices only)

**Query Parameters**:
- `customerId`: Filter by customer
- `status`: Filter by payment status
- `dateFrom`, `dateTo`: Date range filter

### Search Invoices
**GET** `/invoices/search`

Search invoices with combined filtering. When `customerName` and `invoiceNumber` have the same value, performs an OR search across both fields.

**Access**: Admin, Staff, Customer (own invoices only)

**Query Parameters**:
- `customerName` (string): Search by customer first name, last name, or business name (case-insensitive)
- `invoiceNumber` (string): Search by invoice number (case-insensitive, partial match)
- `status` (enum): Filter by status (DRAFT, PENDING, PAID, CANCELLED, REFUNDED)
- `companyId` (string): Filter by company
- `startDate` (string): Filter invoices from this date (ISO format)
- `endDate` (string): Filter invoices until this date (ISO format)

**Combined Search Behavior**:
When `customerName` and `invoiceNumber` are both provided with the same value, the backend performs an OR search:
- Matches invoice number containing the search term
- OR matches customer first name containing the search term
- OR matches customer last name containing the search term
- OR matches customer business name containing the search term

**Example Request**:
```
GET /invoices/search?customerName=john&invoiceNumber=john&status=PENDING
```
This will find invoices where:
- Invoice number contains "john" (e.g., "INV-JOHN-001")
- OR customer name contains "john" (e.g., "John Doe", "Johnson Corp")

### Get Invoice Details
**GET** `/invoices/:id`

Retrieves detailed invoice information.

**Access**: Admin, Staff, Customer (own invoice only)

### Update Invoice
**PATCH** `/invoices/:id`

Updates invoice information.

**Access**: Admin, Staff

### Mark Invoice as Paid
**POST** `/invoices/:id/pay`

Marks invoice as paid.

**Access**: Admin, Staff

**Request Body**:
```json
{
  "paymentMethod": "cash",
  "amountPaid": 1249.99,
  "notes": "Payment received"
}
```

### Delete Invoice
**DELETE** `/invoices/:id`

Deletes an invoice.

**Access**: Admin only

### Cash Report
**GET** `/invoices/cash-report`

Generates cash flow report.

**Access**: Admin only

**Query Parameters**:
- `dateFrom`, `dateTo`: Date range

## Vehicle Management Endpoints

### Create Vehicle
**POST** `/vehicles`

Creates a new vehicle record.

**Access**: Admin, Staff, Customer (own vehicles only)

**Request Body**:
```json
{
  "customerId": "customer_123",
  "year": 2020,
  "make": "Toyota",
  "model": "Camry",
  "vin": "1234567890ABCDEFG",
  "licensePlate": "ABC123",
  "mileage": 45000
}
```

### List Vehicles
**GET** `/vehicles`

Retrieves vehicles with filtering.

**Query Parameters**:
- `customerId`: Filter by customer

### Get Vehicles by Customer
**GET** `/vehicles/customer/:customerId`

Retrieves all vehicles for a specific customer.

### Update Vehicle
**PATCH** `/vehicles/:id`

Updates vehicle information.

### Update Vehicle Mileage
**PATCH** `/vehicles/:id/mileage`

Updates vehicle mileage.

**Request Body**:
```json
{
  "mileage": 47000
}
```

### Delete Vehicle
**DELETE** `/vehicles/:id`

Deletes a vehicle record.

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad request / Validation error
- `401`: Unauthorized / Authentication required
- `403`: Forbidden / Insufficient permissions
- `404`: Not found
- `409`: Conflict / Resource already exists
- `422`: Unprocessable entity / Business logic error
- `500`: Internal server error

### Common Error Codes
- `AUTHENTICATION_REQUIRED`: User not authenticated
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `DUPLICATE_RESOURCE`: Resource already exists
- `BUSINESS_RULE_VIOLATION`: Business logic constraint violated

## Rate Limiting

### Limits
- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **Admin endpoints**: 200 requests per minute

### Headers
Response includes rate limiting headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Clerk Webhook
**POST** `/webhooks/clerk`

Handles user events from Clerk (user creation, updates, deletion).

**Security**: Verified with Clerk webhook signature

## Development & Testing

### API Base URLs
- **Development**: `http://localhost:3000/api`
- **Testing**: Use development server for testing

### Authentication for Testing
1. Start development servers
2. Login through frontend application
3. Extract JWT token from browser developer tools
4. Use token in API requests

### Sample cURL Requests

#### Create User (Admin)
```bash
curl -X POST http://localhost:3000/api/users/admin-staff \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@test.com",
    "username": "teststaff",
    "firstName": "Test",
    "lastName": "Staff",
    "roleName": "STAFF",
    "password": "TestPassword123!"
  }'
```

#### Get Customer List
```bash
curl -X GET "http://localhost:3000/api/customers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Invoice
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_123",
    "items": [
      {
        "type": "tire",
        "tireId": "tire_123",
        "quantity": 4,
        "priceEach": 299.99
      }
    ],
    "taxRate": 0.12
  }'
```

---

## SMS/Text Messaging Endpoints

### Send SMS Webhook (Telnyx)
**POST** `/sms/webhook`

Receives delivery status updates from Telnyx.

**Access**: Public (no authentication required)

**Request Body** (Telnyx webhook format):
```json
{
  "data": {
    "event_type": "message.delivered",
    "payload": {
      "id": "msg_abc123"
    }
  }
}
```

**Response**:
```json
{
  "success": true
}
```

### Get SMS History
**GET** `/sms/history`

Retrieves SMS message history with filtering.

**Access**: Admin only

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by message type
- `status` (optional): Filter by status
- `startDate` (optional): Start date filter (ISO-8601)
- `endDate` (optional): End date filter (ISO-8601)

**Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "sms_123",
        "to": "+12506499699",
        "from": "+12366015757",
        "body": "Hi John, your appointment is confirmed!",
        "type": "APPOINTMENT_CONFIRMATION",
        "status": "DELIVERED",
        "cost": 0.004,
        "segments": 1,
        "sentAt": "2025-10-23T10:00:00Z",
        "deliveredAt": "2025-10-23T10:00:05Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

### Get/Update SMS Preferences
**GET/POST** `/sms/preferences/customer` - Customer preferences
**GET/POST** `/sms/preferences/user` - Staff/Admin preferences

**Access**: Authenticated user (own preferences only)

**Request Body** (POST):
```json
{
  "optedIn": true,
  "appointmentReminders": true,
  "serviceUpdates": true,
  "promotional": false
}
```

### Get SMS Statistics
**GET** `/sms/statistics`

**Access**: Admin only

**Response**:
```json
{
  "totalMessages": 250,
  "delivered": 240,
  "deliveryRate": 96.0,
  "totalCost": 1.00,
  "optInRate": 80.0
}
```

### SMS Types
- `APPOINTMENT_CONFIRMATION` - Immediate booking confirmation
- `APPOINTMENT_REMINDER` - 1-hour before reminder
- `STAFF_APPOINTMENT_ALERT` - New assignment alert
- `ADMIN_DAILY_SUMMARY` - End-of-day metrics
- And more (see SMS Feature Manager agent)

## Purchase/Expense Invoice Endpoints

### List Purchase/Expense Invoices
**GET** `/purchase-expense-invoices`

Retrieves purchase and expense invoices with pagination and filtering.

**Access**: Admin, Staff, Accountant

**Query Parameters**:
- `type` (enum): Filter by type (PURCHASE, EXPENSE)
- `search` (string): Search by vendor name (case-insensitive, partial match)
- `vendorId` (string): Filter by vendor ID
- `category` (enum): Filter by category
- `startDate` (string): Filter from date (ISO format)
- `endDate` (string): Filter until date (ISO format)
- `page` (number): Page number (1-indexed, default: 1)
- `limit` (number): Items per page (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": "inv_123",
      "type": "PURCHASE",
      "vendorId": "vendor_123",
      "vendorName": "ABC Tire Supply",
      "description": "Tire inventory restock",
      "invoiceDate": "2026-01-09",
      "amount": 1000.00,
      "gstRate": 5,
      "gstAmount": 50.00,
      "pstRate": 7,
      "pstAmount": 70.00,
      "taxAmount": 120.00,
      "totalAmount": 1120.00,
      "category": "TIRES",
      "notes": null,
      "imageUrl": null,
      "createdAt": "2026-01-09T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

**Categories**:
- **Purchase**: TIRES, PARTS, TOOLS, SUPPLIES
- **Expense**: RENT, UTILITIES, INSURANCE, ADVERTISING, OFFICE_SUPPLIES, PROFESSIONAL_FEES, MAINTENANCE, VEHICLE, TRAVEL, TRAINING, SOFTWARE, OTHER

### Create Purchase/Expense Invoice
**POST** `/purchase-expense-invoices`

Creates a new purchase or expense invoice.

**Access**: Admin, Staff, Accountant

**Request Body**:
```json
{
  "type": "PURCHASE",
  "vendorId": "vendor_123",
  "vendorName": "ABC Tire Supply",
  "description": "Tire inventory restock",
  "invoiceDate": "2026-01-09",
  "amount": 1000.00,
  "gstRate": 5,
  "pstRate": 7,
  "hstRate": 0,
  "totalAmount": 1120.00,
  "category": "TIRES",
  "notes": "Monthly restock order"
}
```

### Update Purchase/Expense Invoice
**PUT** `/purchase-expense-invoices/:id`

Updates an existing invoice.

**Access**: Admin, Staff, Accountant

### Delete Purchase/Expense Invoice
**DELETE** `/purchase-expense-invoices/:id`

Deletes an invoice.

**Access**: Admin only

### Upload Invoice Image
**POST** `/purchase-expense-invoices/:id/upload`

Uploads an image/receipt for the invoice.

**Access**: Admin, Staff, Accountant

**Content-Type**: multipart/form-data

**Form Fields**:
- `file`: Image file (JPEG, PNG, PDF)

### Delete Invoice Image
**DELETE** `/purchase-expense-invoices/:id/image`

Removes the attached image from an invoice.

**Access**: Admin, Staff, Accountant

### Get Invoice Image URL
**GET** `/purchase-expense-invoices/:id/image-url`

Retrieves a signed URL for viewing the invoice image.

**Access**: Admin, Staff, Accountant

**Response**:
```json
{
  "imageUrl": "https://storage.azure.com/invoices/..."
}
```

---

**Last Updated**: January 9, 2026
**Version**: 2.2
**API Version**: v1