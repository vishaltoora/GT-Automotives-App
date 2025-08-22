# Technology Stack

## Frontend
- **Framework:** React 18 + TypeScript ✅
- **Routing:** React Router with role-based protected routes
- **State Management:** React Query + Context API
- **UI Components:** Material-UI (MUI) ✅
- **Theme System:** Custom colors.ts and theme.ts for consistent branding ✅
- **Print Styling:** Custom CSS for invoices

## Backend
- **Framework:** NestJS + TypeScript ✅
- **Authentication:** Clerk (identity) + Local roles/permissions ✅
- **API Design:** RESTful with role-based guards
- **Validation:** Class-validator + Yup schemas ✅

## Database
- **Primary:** PostgreSQL + Prisma ORM ✅
- **Schema includes:**
  - users (with roleId linking to roles table) ✅
  - roles & permissions (RBAC) ✅
  - customers ✅
  - vehicles ✅
  - tires (inventory) ✅
  - invoices ✅
  - appointments ✅
  - audit_logs ✅

## Infrastructure
- **Monorepo:** Nx workspace ✅
- **Package Manager:** Yarn ✅
- **Shared Libraries:** DTOs, validation, interfaces ✅
- **CI/CD:** GitHub Actions ✅
- **Development DB:** Docker Compose with PostgreSQL ✅

## Services (Planned)
- **PDF Generation:** PDFKit or jsPDF
- **Email:** SendGrid or AWS SES
- **SMS:** Twilio (optional)
- **File Storage:** Local or AWS S3