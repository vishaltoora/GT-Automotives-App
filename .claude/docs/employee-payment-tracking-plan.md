# Employee Payment Tracking System - Comprehensive Plan

## 📋 Analysis Summary

Based on the existing GT Automotive codebase, I've identified:
- ✅ User management system with STAFF role (employees already exist)
- ✅ Invoice system architecture (good template for payment tracking)
- ✅ Audit logging capabilities
- ✅ Role-based permissions system
- ✅ Well-structured API patterns with repositories

## 🗄️ Database Schema Design

### New Models Required:

```prisma
model Job {
  id          String      @id @default(cuid())
  jobNumber   String      @unique @default(cuid())
  employeeId  String      // Foreign key to User (where role = STAFF)
  title       String      // Job description/title
  description String?     // Detailed job description
  payAmount   Decimal     @db.Decimal(10, 2)
  status      JobStatus   @default(PENDING)
  jobType     JobType     // Regular, Overtime, Bonus, Commission
  dueDate     DateTime?   // When payment is due
  completedAt DateTime?   // When job was completed
  createdBy   String      // Who assigned the job
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  employee    User        @relation(fields: [employeeId], references: [id])
  payments    Payment[]   // One job can have multiple payments (partial payments)

  @@index([employeeId])
  @@index([status])
  @@index([createdAt])
}

model Payment {
  id            String        @id @default(cuid())
  jobId         String
  employeeId    String        // Denormalized for faster queries
  amount        Decimal       @db.Decimal(10, 2)
  paymentMethod PaymentMethod
  status        PaymentStatus @default(PENDING)
  paidAt        DateTime?
  paidBy        String?       // Who processed the payment
  notes         String?
  reference     String?       // Check number, transaction ID, etc.
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  job           Job           @relation(fields: [jobId], references: [id])
  employee      User          @relation(fields: [employeeId], references: [id])

  @@index([employeeId])
  @@index([status])
  @@index([paidAt])
}

model PayrollPeriod {
  id        String   @id @default(cuid())
  startDate DateTime
  endDate   DateTime
  name      String   // "January 2025", "Week 1 Jan 2025"
  type      PeriodType // WEEKLY, MONTHLY, YEARLY
  createdAt DateTime @default(now())

  @@unique([startDate, endDate, type])
  @@index([startDate, endDate])
}

enum JobStatus {
  PENDING     // Job assigned, payment not yet due
  READY       // Job completed, ready for payment
  PAID        // Fully paid
  CANCELLED   // Job cancelled
  PARTIALLY_PAID // Some payments made, balance remaining
}

enum JobType {
  REGULAR     // Regular hourly/salary work
  OVERTIME    // Overtime pay
  BONUS       // Performance bonus
  COMMISSION  // Sales commission
  EXPENSE     // Expense reimbursement
  OTHER       // Other compensation
}

enum PaymentStatus {
  PENDING     // Payment scheduled but not made
  PAID        // Payment completed
  FAILED      // Payment failed
  CANCELLED   // Payment cancelled
}

enum PeriodType {
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}
```

## 🔌 API Endpoints Plan

### Job Management
```typescript
// Jobs Controller
POST   /api/jobs                    // Create new job for employee
GET    /api/jobs                    // List all jobs (with filters)
GET    /api/jobs/:id                // Get specific job
PUT    /api/jobs/:id                // Update job details
DELETE /api/jobs/:id                // Cancel job
PATCH  /api/jobs/:id/complete       // Mark job as completed

// Employee-specific jobs
GET    /api/employees/:id/jobs      // Get all jobs for specific employee
GET    /api/employees/:id/jobs/pending // Get pending jobs for employee
```

### Payment Management
```typescript
// Payments Controller
POST   /api/payments                // Create payment (mark job as paid)
GET    /api/payments                // List all payments (with filters)
GET    /api/payments/:id            // Get specific payment
PUT    /api/payments/:id            // Update payment details
DELETE /api/payments/:id            // Cancel payment

// Employee-specific payments
GET    /api/employees/:id/payments  // Get all payments for employee
```

### Reporting & Analytics
```typescript
// Payroll Reports Controller
GET    /api/payroll/summary         // Overall payroll summary
GET    /api/payroll/employees/:id   // Employee payroll summary
GET    /api/payroll/period          // Payroll for specific period
GET    /api/payroll/pending         // All pending payments summary
GET    /api/payroll/analytics       // Payroll analytics/trends

// Query params for period filtering
// ?startDate=2025-01-01&endDate=2025-01-31
// ?period=MONTHLY&year=2025&month=1
// ?period=YEARLY&year=2025
```

## 🎨 UI Components & User Experience Design

### Navigation Structure
```
Admin Dashboard
├── Employees
│   ├── Employee List
│   ├── Employee Details
│   └── Employee Payroll History
├── Payroll
│   ├── Job Management
│   │   ├── Create Job
│   │   ├── Job List (All/Pending/Completed)
│   │   └── Job Details
│   ├── Payment Processing
│   │   ├── Pending Payments
│   │   ├── Process Payment
│   │   └── Payment History
│   └── Reports
│       ├── Employee Summary
│       ├── Period Reports
│       ├── Pending Payments Dashboard
│       └── Payroll Analytics
```

### Key UI Components

#### 1. Job Management Components
- **CreateJobDialog**: Form to assign new job to employee
- **JobList**: Table showing all jobs with filters and status
- **JobCard**: Individual job display with actions
- **JobDetailsDialog**: View/edit job information

#### 2. Payment Processing Components
- **PendingPaymentsTable**: Shows all jobs ready for payment
- **ProcessPaymentDialog**: Form to record payment completion
- **PaymentHistory**: Table of all processed payments
- **PaymentStatusChip**: Visual status indicator

#### 3. Reporting Components
- **PayrollSummaryCard**: Key metrics for selected period
- **EmployeePayrollTable**: Employee-specific payroll summary
- **PeriodSelector**: Date range picker for reports
- **PayrollChart**: Visual analytics (bar/line charts)

#### 4. Dashboard Components
- **PayrollOverview**: Key metrics cards
- **PendingPaymentsSummary**: Quick view of outstanding payments
- **RecentPayments**: Latest payment activities
- **EmployeeQuickStats**: Employee payment summaries

### User Experience Flow

#### Creating a Job
1. Admin selects employee from dropdown
2. Enters job details (title, description, amount, due date)
3. Selects job type (Regular, Overtime, Bonus, etc.)
4. Job created with PENDING status
5. Auto-transitions to READY when marked complete

#### Processing Payment
1. View pending payments table
2. Select job(s) to pay
3. Choose payment method
4. Enter payment details (reference, notes)
5. Confirm payment
6. Job status updates to PAID
7. Payment record created with audit trail

#### Viewing Reports
1. Select reporting period (month/year/custom range)
2. Filter by employee (optional)
3. View summary metrics
4. Export to PDF/Excel
5. Drill down to individual transactions

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up basic job and payment tracking

**Tasks**:
1. **Database Schema**
   - Add Job, Payment, PayrollPeriod models to Prisma schema
   - Create migration scripts
   - Update User model to include payment relationships

2. **Backend API - Basic CRUD**
   - Create jobs module (controller, service, repository)
   - Create payments module (controller, service, repository)
   - Add basic validation and error handling
   - Implement audit logging for all payment operations

3. **Frontend - Core Components**
   - Create basic job management page
   - Simple job creation form
   - Basic job list table
   - Add payroll navigation to admin sidebar

**Deliverable**: Basic job creation and listing functionality

### Phase 2: Payment Processing (Week 3-4)
**Goal**: Complete payment workflow

**Tasks**:
1. **Payment Processing Logic**
   - Implement payment creation service
   - Add payment status transitions
   - Create payment validation rules
   - Add bulk payment processing

2. **Frontend - Payment UI**
   - Pending payments dashboard
   - Payment processing dialog
   - Payment history table
   - Status indicators and chips

3. **Business Logic**
   - Automatic job status updates
   - Payment method handling
   - Reference number generation
   - Email notifications (optional)

**Deliverable**: Complete payment processing workflow

### Phase 3: Reporting & Analytics (Week 5-6)
**Goal**: Add comprehensive reporting

**Tasks**:
1. **Reporting API**
   - Employee payroll summaries
   - Period-based reporting
   - Pending payments analytics
   - Export functionality

2. **Frontend - Reports**
   - Payroll summary dashboard
   - Employee-specific reports
   - Date range filters
   - Charts and visualizations

3. **Advanced Features**
   - PDF export for payroll reports
   - Excel export functionality
   - Email report delivery
   - Scheduled report generation

**Deliverable**: Full reporting and analytics suite

### Phase 4: Enhancement & Polish (Week 7-8)
**Goal**: Add advanced features and polish

**Tasks**:
1. **Advanced Features**
   - Bulk job creation
   - Payment templates
   - Recurring jobs/payments
   - Payment approval workflow

2. **UI/UX Improvements**
   - Mobile responsiveness
   - Advanced filtering
   - Search functionality
   - Performance optimizations

3. **Security & Compliance**
   - Enhanced audit logging
   - Role-based access control
   - Data export controls
   - Compliance reporting

**Deliverable**: Production-ready payroll system

## 📝 Git Issue Tasks

### Epic: Employee Payment Tracking System

**Main Epic Issue**:
```
Title: [EPIC] Employee Payment Tracking & Payroll Management System

Description:
Implement a comprehensive employee payment tracking system to manage job assignments, track payments, and generate payroll reports.

Features:
- Job assignment with payment amounts
- Payment status tracking (pending → paid)
- Employee payroll summaries by period
- Pending payments dashboard
- Comprehensive reporting and analytics

Acceptance Criteria:
- [ ] Admins can assign jobs to employees with payment amounts
- [ ] Jobs start as PENDING, can be marked as READY when complete
- [ ] Payments can be processed and tracked with full audit trail
- [ ] View total payments to employees by month/year/custom period
- [ ] Dashboard showing all pending payments
- [ ] Export payroll reports to PDF/Excel
- [ ] Full role-based access control

Estimated Effort: 8 weeks
Priority: Medium
Labels: enhancement, payroll, epic
```

**Phase 1 Tasks**:

```
Title: [Payroll] Create database schema for job and payment tracking

Description:
Add Prisma models for Job, Payment, and PayrollPeriod with proper relationships and indexes.

Tasks:
- [ ] Add Job model with employee relationship
- [ ] Add Payment model with job/employee relationships
- [ ] Add PayrollPeriod model for reporting
- [ ] Add enums for JobStatus, JobType, PaymentStatus, PeriodType
- [ ] Create database migration
- [ ] Update User model with payment relationships

Acceptance Criteria:
- [ ] All models have proper TypeScript types
- [ ] Database migration runs successfully
- [ ] Proper indexes for query performance
- [ ] Foreign key constraints properly defined

Labels: database, schema, phase-1
Estimated: 2 days
```

```
Title: [Payroll] Implement jobs API endpoints and business logic

Description:
Create complete jobs management API with CRUD operations and business logic.

Tasks:
- [ ] Create jobs module (controller, service, repository)
- [ ] Implement job creation with validation
- [ ] Add job listing with filters (employee, status, date)
- [ ] Add job update and status transitions
- [ ] Implement audit logging for all operations
- [ ] Add error handling and validation

API Endpoints:
- POST /api/jobs
- GET /api/jobs (with filters)
- GET /api/jobs/:id
- PUT /api/jobs/:id
- PATCH /api/jobs/:id/complete
- GET /api/employees/:id/jobs

Labels: backend, api, phase-1
Estimated: 3 days
```

```
Title: [Payroll] Create job management UI components

Description:
Build frontend components for job creation, listing, and management.

Tasks:
- [ ] Create CreateJobDialog component
- [ ] Build JobList table with sorting/filtering
- [ ] Add JobCard component for individual jobs
- [ ] Implement JobDetailsDialog for view/edit
- [ ] Add payroll navigation to admin sidebar
- [ ] Create basic job management page layout

Acceptance Criteria:
- [ ] Admins can create jobs for employees
- [ ] Job list shows all jobs with status filtering
- [ ] Jobs can be marked as complete
- [ ] Proper form validation and error handling
- [ ] Responsive design following app theme

Labels: frontend, ui, phase-1
Estimated: 4 days
```

**Phase 2 Tasks**:

```
Title: [Payroll] Implement payment processing API and workflow

Description:
Create payment processing system with status tracking and audit trail.

Tasks:
- [ ] Create payments module (controller, service, repository)
- [ ] Implement payment creation and validation
- [ ] Add payment status transitions
- [ ] Create bulk payment processing
- [ ] Add payment method handling
- [ ] Implement automatic job status updates

API Endpoints:
- POST /api/payments
- GET /api/payments (with filters)
- GET /api/payments/:id
- PUT /api/payments/:id
- GET /api/employees/:id/payments

Labels: backend, payments, phase-2
Estimated: 3 days
```

```
Title: [Payroll] Build payment processing UI components

Description:
Create user interface for processing payments and viewing payment history.

Tasks:
- [ ] Create PendingPaymentsTable component
- [ ] Build ProcessPaymentDialog with form validation
- [ ] Add PaymentHistory table with filtering
- [ ] Implement PaymentStatusChip indicators
- [ ] Create payment confirmation workflow
- [ ] Add bulk payment selection

Acceptance Criteria:
- [ ] View all pending payments in sortable table
- [ ] Process individual or bulk payments
- [ ] Payment history with search/filter
- [ ] Clear status indicators throughout
- [ ] Confirmation dialogs for payment actions

Labels: frontend, payments, phase-2
Estimated: 4 days
```

**Phase 3 Tasks**:

```
Title: [Payroll] Create reporting API and analytics

Description:
Implement comprehensive payroll reporting with period-based analytics.

Tasks:
- [ ] Create payroll reports controller
- [ ] Add employee payroll summary endpoints
- [ ] Implement period-based reporting (monthly/yearly)
- [ ] Create pending payments analytics
- [ ] Add export functionality (PDF/Excel)
- [ ] Implement report caching for performance

API Endpoints:
- GET /api/payroll/summary
- GET /api/payroll/employees/:id
- GET /api/payroll/period
- GET /api/payroll/pending
- GET /api/payroll/analytics

Labels: backend, reporting, phase-3
Estimated: 4 days
```

```
Title: [Payroll] Build reporting dashboard and analytics UI

Description:
Create comprehensive reporting interface with charts and export capabilities.

Tasks:
- [ ] Create PayrollSummaryCard components
- [ ] Build EmployeePayrollTable with grouping
- [ ] Add PeriodSelector for date range filtering
- [ ] Implement PayrollChart visualizations
- [ ] Create export functionality (PDF/Excel)
- [ ] Add PayrollOverview dashboard

Acceptance Criteria:
- [ ] View payroll summaries by employee and period
- [ ] Interactive charts showing payment trends
- [ ] Export reports in multiple formats
- [ ] Fast loading with proper data caching
- [ ] Mobile-responsive design

Labels: frontend, reporting, charts, phase-3
Estimated: 5 days
```

---

## 📊 Summary

**Total Estimated Timeline**: 8 weeks
**Key Features**: Job tracking, payment processing, comprehensive reporting
**Database Changes**: 3 new models + enums
**API Endpoints**: 15+ new endpoints
**UI Components**: 12+ new React components
**Benefits**: Complete payroll management, audit trail, automated reporting

This system will provide GT Automotive with professional-grade employee payment tracking, eliminating manual processes and providing clear financial visibility for payroll management.