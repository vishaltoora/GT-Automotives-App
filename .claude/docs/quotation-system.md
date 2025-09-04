# Quotation System Documentation

## Overview
The GT Automotive Quotation System provides a comprehensive solution for creating, managing, and converting quotes to invoices. This system allows staff and administrators to generate professional quotes for customers without affecting inventory or creating permanent customer records.

## Features

### Core Functionality
- **Create Quotations**: Generate professional quotes with customer information and tire/service items
- **Print Quotes**: Generate print-ready quotations with GT branding
- **Manage Quotes**: View, edit, and delete existing quotations
- **Convert to Invoice**: Transform accepted quotes into invoices
- **Status Tracking**: Monitor quote status (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED, CONVERTED)

### Key Components

#### Frontend Components
- **QuotationDialog** (`apps/webApp/src/app/components/quotations/QuotationDialog.tsx`)
  - Modal dialog for creating and editing quotes
  - Integrated tire selection from inventory
  - Real-time total calculation with GST/PST
  - Save & Print functionality

- **QuotationFormContent** (`apps/webApp/src/app/components/quotations/QuotationFormContent.tsx`)
  - Customer information fields
  - Vehicle details (optional)
  - Line items management
  - Tax configuration

- **QuotationList** (`apps/webApp/src/app/pages/quotations/QuotationList.tsx`)
  - Searchable list of all quotations
  - Status filtering
  - Quick actions (View, Edit, Delete, Convert)

#### Backend Services
- **QuotationsService** (`server/src/quotations/quotations.service.ts`)
  - Quote creation with automatic numbering
  - Tax calculations (GST/PST)
  - Quote-to-invoice conversion
  - Search and filtering capabilities

- **QuotationsController** (`server/src/quotations/quotations.controller.ts`)
  - REST API endpoints
  - Role-based access control (ADMIN, STAFF)
  - JWT authentication integration

#### Database Schema
```prisma
model Quotation {
  id                String   @id @default(uuid())
  quotationNumber   String   @unique
  customerName      String
  businessName      String?
  phone             String?
  email             String?
  address           String?
  vehicleMake       String?
  vehicleModel      String?
  vehicleYear       Int?
  items             QuotationItem[]
  subtotal          Decimal  @db.Decimal(10, 2)
  taxRate           Decimal  @db.Decimal(5, 4)
  taxAmount         Decimal  @db.Decimal(10, 2)
  gstRate           Decimal? @db.Decimal(5, 4)
  gstAmount         Decimal? @db.Decimal(10, 2)
  pstRate           Decimal? @db.Decimal(5, 4)
  pstAmount         Decimal? @db.Decimal(10, 2)
  total             Decimal  @db.Decimal(10, 2)
  status            QuotationStatus @default(DRAFT)
  validUntil        DateTime?
  notes             String?
  createdBy         String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  convertedToInvoiceId String?
}
```

## API Endpoints

### Create Quotation
```http
POST /api/quotations
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "John Doe",
  "businessName": "ABC Company",
  "phone": "250-555-0123",
  "email": "john@example.com",
  "address": "123 Main St, Prince George, BC",
  "items": [
    {
      "itemType": "TIRE",
      "description": "Michelin - 225/65R17",
      "quantity": 4,
      "unitPrice": 250.00,
      "tireId": "tire-uuid"
    }
  ],
  "gstRate": 0.05,
  "pstRate": 0.07,
  "validUntil": "2025-10-04",
  "notes": "Installation included"
}
```

### Get All Quotations
```http
GET /api/quotations
Authorization: Bearer <token>
```

### Update Quotation
```http
PATCH /api/quotations/:id
Authorization: Bearer <token>
```

### Convert to Invoice
```http
POST /api/quotations/:id/convert
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "vehicleId": "vehicle-uuid"  // optional
}
```

## Business Logic

### Quotation Number Generation
- Format: `Q{timestamp}-{random}`
- Example: `Q58168536-P3VD`
- Ensures uniqueness through database constraint

### Tax Calculation
- **GST**: Default 5% (configurable)
- **PST**: Default 7% (configurable)
- **Total Tax**: GST + PST applied to subtotal
- Formula: `total = subtotal + (subtotal * gstRate) + (subtotal * pstRate)`

### Status Workflow
1. **DRAFT** → Initial state
2. **SENT** → Quote sent to customer
3. **ACCEPTED** → Customer accepted the quote
4. **CONVERTED** → Converted to invoice
5. **REJECTED** → Customer declined
6. **EXPIRED** → Past validity date

### Print Format
- Professional layout with GT branding
- Includes company registration: "16472991 Canada INC."
- Terms & conditions section
- Validity period display
- Itemized pricing with taxes

## Security & Permissions

### Role Requirements
- **Create/Edit/Delete**: ADMIN, STAFF roles only
- **View**: ADMIN, STAFF roles only
- **Convert to Invoice**: ADMIN, STAFF roles only
- Customers cannot access quotation endpoints

### Data Isolation
- Quotes are not linked to customer accounts
- No inventory impact until converted to invoice
- Separate from customer portal visibility

## Implementation Notes

### Frontend Integration
```typescript
// Import the service
import { quotationService } from '../../services/quotation.service';

// Create a quote
const quote = await quotationService.createQuote({
  customerName: 'John Doe',
  items: [...],
  gstRate: 0.05,
  pstRate: 0.07
});

// Print a quote
quotationService.printQuote(quote);
```

### Error Handling
- Validation for required fields (customerName, items)
- Minimum one item required
- Proper error messages via ErrorContext
- Fallback print methods for popup blockers

## Recent Fixes (September 2025)

### Variable Name Mismatch
- **Issue**: ReferenceError in QuotationsService.create
- **File**: `server/src/quotations/quotations.service.ts:51`
- **Fix**: Changed `quotationData.validUntil` to `quoteData.validUntil`
- **Impact**: Resolved "Failed to create quote" error

## Future Enhancements
- Email quote to customer
- PDF export functionality
- Quote templates
- Bulk quote operations
- Quote expiry notifications
- Customer portal quote viewing
- Quote revision history
- Approval workflow