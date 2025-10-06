# Purchase & Expense Invoice System with Azure Blob Storage

## 📋 Overview

Complete system design for tracking business purchases and expenses with invoice image storage using Azure Blob Storage (equivalent to AWS S3).

## 🎯 Requirements

### Business Requirements
1. **Purchase Invoices** - Track inventory/parts purchases from suppliers
2. **Expense Invoices** - Track business expenses (rent, utilities, tools, etc.)
3. **Image Storage** - Store scanned/photographed invoice images
4. **Metadata** - Description, vendor, date, amount, category
5. **Audit Trail** - Track who entered what and when
6. **Search & Filter** - Find invoices by date range, vendor, category
7. **Reports** - Monthly expense summaries, vendor spending analysis

### Technical Requirements
1. Secure image storage with Azure Blob Storage
2. Cost-effective storage solution
3. Fast image upload and retrieval
4. Image URL stored in database
5. Proper access control (Admin only)

## 💰 Azure Blob Storage Cost Analysis

### Storage Tiers
| Tier | Cost (per GB/month) | Best For |
|------|---------------------|----------|
| **Hot** | $0.0184 | Frequently accessed (< 3 months old) |
| **Cool** | $0.0100 | Infrequently accessed (> 3 months old) |
| **Archive** | $0.0020 | Rarely accessed (> 1 year old) |

### Recommended Approach: **Lifecycle Management**
- New invoices → **Hot tier** (current year)
- Old invoices → **Cool tier** (> 1 year)
- Archived invoices → **Archive tier** (> 3 years)

### Cost Estimate
Assuming:
- Average invoice image: 500 KB
- 100 invoices/month = 50 MB/month
- Annual storage: 600 MB

**Monthly Costs**:
- Storage (Hot): 0.6 GB × $0.0184 = **$0.01/month**
- Storage (with lifecycle): Even less!
- Bandwidth (first 100 GB free)
- Operations: ~$0.01/month
- **Total: ~$0.02-0.05/month** (negligible!)

### Storage Account SKU Recommendation
**LRS (Locally Redundant Storage)** - $0.0208/GB/month
- 3 copies in same datacenter
- 99.999999999% (11 nines) durability
- Lowest cost option
- Perfect for invoice images (not mission-critical data loss scenario)

## 🗄️ Database Schema Design

### New Models

```prisma
// Purchase Invoice - for inventory/parts purchases
model PurchaseInvoice {
  id              String               @id @default(cuid())
  invoiceNumber   String?              // Vendor's invoice number
  vendorId        String?              // Optional vendor relationship
  vendorName      String               // Free-text vendor name (if no vendorId)
  description     String               // What was purchased
  invoiceDate     DateTime             // Date on the invoice
  dueDate         DateTime?            // Payment due date
  amount          Decimal              @db.Decimal(10, 2)
  taxAmount       Decimal?             @db.Decimal(10, 2)
  totalAmount     Decimal              @db.Decimal(10, 2)
  category        PurchaseCategory     // Categorization
  status          InvoiceStatus        @default(PENDING)
  paymentDate     DateTime?            // When it was paid
  paymentMethod   PaymentMethod?
  notes           String?              // Additional notes
  imageUrl        String?              // Azure Blob Storage URL
  imageName       String?              // Original filename
  imageSize       Int?                 // File size in bytes
  createdBy       String               // User who created it
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  vendor          Vendor?              @relation(fields: [vendorId], references: [id])
  creator         User                 @relation(fields: [createdBy], references: [id])

  @@index([invoiceDate])
  @@index([vendorId])
  @@index([category])
  @@index([status])
}

// Expense Invoice - for business expenses
model ExpenseInvoice {
  id              String               @id @default(cuid())
  invoiceNumber   String?              // Vendor's invoice number
  vendorId        String?              // Optional vendor relationship
  vendorName      String               // Free-text vendor name
  description     String               // Expense description
  invoiceDate     DateTime             // Date on the invoice
  amount          Decimal              @db.Decimal(10, 2)
  taxAmount       Decimal?             @db.Decimal(10, 2)
  totalAmount     Decimal              @db.Decimal(10, 2)
  category        ExpenseCategory      // Categorization
  status          InvoiceStatus        @default(PENDING)
  paymentDate     DateTime?            // When it was paid
  paymentMethod   PaymentMethod?
  isRecurring     Boolean              @default(false) // Rent, utilities, etc.
  recurringPeriod RecurringPeriod?     // MONTHLY, QUARTERLY, YEARLY
  notes           String?
  imageUrl        String?              // Azure Blob Storage URL
  imageName       String?              // Original filename
  imageSize       Int?                 // File size in bytes
  createdBy       String               // User who created it
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  vendor          Vendor?              @relation(fields: [vendorId], references: [id])
  creator         User                 @relation(fields: [createdBy], references: [id])

  @@index([invoiceDate])
  @@index([vendorId])
  @@index([category])
  @@index([status])
}

// Vendor - Suppliers and service providers
model Vendor {
  id                String             @id @default(cuid())
  name              String             @unique
  contactPerson     String?
  email             String?
  phone             String?
  address           String?
  taxId             String?            // Tax ID / Business Number
  paymentTerms      String?            // "Net 30", "Due on receipt", etc.
  isActive          Boolean            @default(true)
  notes             String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  purchaseInvoices  PurchaseInvoice[]
  expenseInvoices   ExpenseInvoice[]

  @@index([name])
}

// Enums
enum PurchaseCategory {
  TIRES              // Tire inventory purchases
  PARTS              // Auto parts
  TOOLS              // Tools and equipment
  SUPPLIES           // Shop supplies
  OTHER              // Other purchases
}

enum ExpenseCategory {
  RENT               // Shop rent
  UTILITIES          // Electricity, water, gas, internet
  INSURANCE          // Business insurance
  ADVERTISING        // Marketing and advertising
  OFFICE_SUPPLIES    // Office supplies
  PROFESSIONAL_FEES  // Accounting, legal, etc.
  MAINTENANCE        // Building/equipment maintenance
  VEHICLE            // Company vehicle expenses
  TRAVEL             // Travel expenses
  TRAINING           // Staff training
  SOFTWARE           // Software subscriptions
  OTHER              // Other expenses
}

enum InvoiceStatus {
  PENDING            // Not yet paid
  PAID               // Fully paid
  OVERDUE            // Past due date
  CANCELLED          // Cancelled invoice
}

enum PaymentMethod {
  CASH
  CHECK
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  OTHER
}

enum RecurringPeriod {
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}
```

## 🏗️ Azure Blob Storage Architecture

### Storage Structure
```
gt-automotive-invoices/
├── purchase-invoices/
│   ├── 2025/
│   │   ├── 01/
│   │   │   ├── invoice-abc123-original.pdf
│   │   │   ├── invoice-def456-scan.jpg
│   │   ├── 02/
│   ├── 2024/
├── expense-invoices/
│   ├── 2025/
│   │   ├── 01/
│   │   ├── 02/
```

**Benefits**:
- Organized by type and date
- Easy to implement lifecycle policies
- Simple backup strategies
- Clear audit trail

### Security Model
1. **Private Container** - No public access
2. **SAS Tokens** - Temporary URLs for viewing (1-hour expiry)
3. **RBAC** - Role-based access control
4. **Encryption at Rest** - Automatic Azure encryption
5. **Encryption in Transit** - HTTPS only

### Access Pattern
```typescript
// Upload flow
1. Frontend uploads to backend API
2. Backend validates file (size, type, user permissions)
3. Backend uploads to Azure Blob Storage
4. Backend stores blob URL in database
5. Backend returns success with database record

// View flow
1. Frontend requests invoice details
2. Backend checks user permissions
3. Backend generates SAS token (1-hour expiry)
4. Backend returns invoice data + temporary image URL
5. Frontend displays image using temporary URL
```

## 🔧 Implementation Plan

### Phase 1: Azure Storage Setup (Day 1)
**Tasks**:
1. Create Azure Storage Account
   ```bash
   az storage account create \
     --name gtautomotiveinvoices \
     --resource-group gt-automotives-prod \
     --location canadacentral \
     --sku Standard_LRS \
     --kind StorageV2 \
     --access-tier Hot \
     --https-only true \
     --min-tls-version TLS1_2
   ```

2. Create Blob Containers
   ```bash
   az storage container create \
     --name purchase-invoices \
     --account-name gtautomotiveinvoices \
     --public-access off

   az storage container create \
     --name expense-invoices \
     --account-name gtautomotiveinvoices \
     --public-access off
   ```

3. Configure Lifecycle Management
   ```json
   {
     "rules": [
       {
         "name": "MoveOldInvoicesToCool",
         "type": "Lifecycle",
         "definition": {
           "filters": {
             "blobTypes": ["blockBlob"]
           },
           "actions": {
             "baseBlob": {
               "tierToCool": {
                 "daysAfterModificationGreaterThan": 365
               },
               "tierToArchive": {
                 "daysAfterModificationGreaterThan": 1095
               }
             }
           }
         }
       }
     ]
   }
   ```

4. Set up CORS for frontend access
   ```bash
   az storage cors add \
     --services b \
     --methods GET POST PUT \
     --origins https://gt-automotives.com \
     --allowed-headers '*' \
     --exposed-headers '*' \
     --max-age 3600 \
     --account-name gtautomotiveinvoices
   ```

**Cost**: ~$0.02-0.05/month initially

### Phase 2: Database Migration (Day 1-2)
**Tasks**:
1. Create Vendor model migration
2. Create PurchaseInvoice model migration
3. Create ExpenseInvoice model migration
4. Add enums for categories and status
5. Seed initial data (common vendors, categories)

**Files**:
- `libs/database/src/lib/prisma/schema.prisma`
- Migration scripts

### Phase 3: Backend API Development (Day 2-4)
**Tasks**:
1. **Vendor Management**
   - CRUD operations for vendors
   - Vendor search and autocomplete

2. **Azure Blob Service**
   ```typescript
   // server/src/common/services/azure-blob.service.ts
   - uploadInvoiceImage(file, type, date)
   - generateSasUrl(blobName, expiryMinutes)
   - deleteInvoiceImage(blobName)
   - getInvoiceImage(blobName)
   ```

3. **Purchase Invoice API**
   - POST /api/purchase-invoices (with image upload)
   - GET /api/purchase-invoices (list with filters)
   - GET /api/purchase-invoices/:id (with SAS token for image)
   - PUT /api/purchase-invoices/:id
   - DELETE /api/purchase-invoices/:id
   - POST /api/purchase-invoices/:id/mark-paid

4. **Expense Invoice API**
   - POST /api/expense-invoices (with image upload)
   - GET /api/expense-invoices (list with filters)
   - GET /api/expense-invoices/:id (with SAS token for image)
   - PUT /api/expense-invoices/:id
   - DELETE /api/expense-invoices/:id
   - POST /api/expense-invoices/:id/mark-paid

5. **Reports API**
   - GET /api/reports/expenses-summary (monthly breakdown)
   - GET /api/reports/vendor-spending (spending by vendor)
   - GET /api/reports/category-breakdown (pie chart data)

**Libraries**:
```json
{
  "@azure/storage-blob": "^12.x",
  "@azure/identity": "^4.x",
  "multer": "^1.4.5-lts.1"
}
```

### Phase 4: Frontend Development (Day 5-7)
**Components**:
1. **Vendor Management**
   - `/admin/vendors` - Vendor list
   - VendorDialog - Create/Edit vendor

2. **Purchase Invoices**
   - `/admin/purchase-invoices` - Invoice list with filters
   - PurchaseInvoiceDialog - Create/Edit with image upload
   - PurchaseInvoiceDetails - View invoice with image preview
   - Image upload component (drag & drop, file picker)
   - Image preview/lightbox component

3. **Expense Invoices**
   - `/admin/expense-invoices` - Invoice list with filters
   - ExpenseInvoiceDialog - Create/Edit with image upload
   - ExpenseInvoiceDetails - View invoice with image preview

4. **Reports & Analytics**
   - `/admin/reports/expenses` - Expense reports dashboard
   - Monthly trend charts
   - Category breakdown pie chart
   - Vendor spending analysis
   - Export to PDF/Excel

**Features**:
- Drag & drop image upload
- Image preview before upload
- Lightbox for viewing invoice images
- Auto-categorization suggestions
- Recurring expense templates
- Bulk upload support (future)
- OCR integration (future - extract data from images)

### Phase 5: Testing & Deployment (Day 8-9)
**Tasks**:
1. Unit tests for services
2. Integration tests for API
3. E2E tests for critical flows
4. Security testing (file upload validation, SAS token expiry)
5. Performance testing (image upload/download speed)
6. Production deployment
7. User training/documentation

## 🔒 Security Best Practices

### File Upload Validation
```typescript
// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Validation
- Check file type
- Check file size
- Scan for malware (optional)
- Generate unique filename
- Sanitize original filename
```

### Access Control
```typescript
// Only ADMIN role can:
- Create purchase/expense invoices
- Upload invoice images
- Delete invoices
- View all invoices
- Generate reports

// Audit logging
- Log all uploads
- Log all deletions
- Log all access to sensitive data
```

### Data Protection
1. **Encryption at Rest** - Azure automatic encryption
2. **Encryption in Transit** - HTTPS only, TLS 1.2+
3. **Access Logs** - Enable Azure Storage Analytics
4. **Backup** - Daily database backups include URLs
5. **Retention Policy** - Keep for 7 years (tax requirement)

## 📊 Reporting & Analytics

### Key Reports
1. **Monthly Expense Summary**
   - Total expenses by month
   - Trend chart (12 months)
   - Comparison to previous year

2. **Category Breakdown**
   - Expenses by category (pie chart)
   - Top 5 expense categories
   - Category trends over time

3. **Vendor Analysis**
   - Top vendors by spending
   - Payment terms compliance
   - Vendor concentration risk

4. **Cash Flow Forecast**
   - Upcoming payments (next 30 days)
   - Recurring expenses projection
   - Budget vs actual

## 🚀 Future Enhancements

### Phase 2 Features (Future)
1. **OCR Integration** - Extract data from invoice images
   - Azure Form Recognizer (AI service)
   - Auto-fill invoice fields
   - Cost: ~$1.50 per 1000 pages

2. **Email Integration**
   - Forward invoices to email
   - Auto-import from email

3. **Multi-currency Support**
   - Handle USD, CAD invoices
   - Exchange rate tracking

4. **Approval Workflow**
   - Manager approval for large expenses
   - Multi-level approval chains

5. **Integration with Accounting**
   - Export to QuickBooks
   - Export to Xero
   - Export to Wave

## 💡 Alternative Solutions Considered

### Option 1: GitHub Repository (Not Recommended)
- ❌ Not designed for binary files
- ❌ Limited storage (1 GB free)
- ❌ No lifecycle management
- ❌ Version control overhead

### Option 2: Database BLOB Storage (Not Recommended)
- ❌ Expensive (PostgreSQL storage is pricier)
- ❌ Slower performance
- ❌ Database bloat
- ❌ Backup complexity

### Option 3: Azure Blob Storage (RECOMMENDED) ✅
- ✅ Designed for this use case
- ✅ Extremely cheap ($0.02/month)
- ✅ Automatic lifecycle management
- ✅ Excellent performance
- ✅ Built-in CDN integration
- ✅ SAS token security
- ✅ Infinite scalability

## 📋 Implementation Checklist

### Azure Setup
- [ ] Create Storage Account
- [ ] Create Blob Containers
- [ ] Configure lifecycle policies
- [ ] Set up CORS rules
- [ ] Generate connection string
- [ ] Add to GitHub Secrets
- [ ] Test upload/download

### Database
- [ ] Add Vendor model
- [ ] Add PurchaseInvoice model
- [ ] Add ExpenseInvoice model
- [ ] Add enums
- [ ] Create migrations
- [ ] Seed initial data
- [ ] Update User model relations

### Backend
- [ ] Install Azure SDK
- [ ] Create AzureBlobService
- [ ] Create VendorController
- [ ] Create PurchaseInvoiceController
- [ ] Create ExpenseInvoiceController
- [ ] Add file upload middleware
- [ ] Add validation
- [ ] Add permission checks
- [ ] Create DTOs
- [ ] Add unit tests

### Frontend
- [ ] Create Vendor components
- [ ] Create PurchaseInvoice components
- [ ] Create ExpenseInvoice components
- [ ] Add image upload component
- [ ] Add image preview component
- [ ] Add filters and search
- [ ] Create reports dashboard
- [ ] Add navigation menu items
- [ ] E2E testing

### Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Admin guide
- [ ] Backup procedures
- [ ] Troubleshooting guide

## 🎯 Success Metrics

- **Cost**: < $1/month for storage
- **Performance**: Image upload < 3 seconds
- **Availability**: 99.9% uptime
- **User Adoption**: 100% of invoices digitized
- **Time Saved**: 2 hours/week on invoice management

---

**Estimated Timeline**: 9-10 days
**Estimated Cost**: $0.02-0.05/month (storage only)
**ROI**: Massive time savings, better organization, easier tax preparation

Ready to implement? Let me know if you'd like me to start with Phase 1!
