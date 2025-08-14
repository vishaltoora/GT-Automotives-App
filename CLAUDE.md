# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the GT Automotive application.

## Project Overview

GT Automotive is a comprehensive web application for managing a small business that sells new and used tires and provides automotive mechanical services. The application handles:
- New and used tire inventory management
- Customer and vehicle tracking
- Professional invoice generation with printing
- Appointment scheduling
- Business reporting and analytics

### Three User Interfaces
1. **Customer Portal** (`/customer/*`) - Self-service for vehicle owners
2. **Staff Dashboard** (`/staff/*`) - Operational tools for technicians/sales reps  
3. **Admin Interface** (`/admin/*`) - Complete control for owners/managers

## Project Status

**Current Phase:** Foundation Complete, Ready for Feature Development

### Completed
- ✅ 8 Epics fully documented and created as GitHub issues (#1-#8)
- ✅ 75+ Tasks defined (2 sample tasks created: #9, #10)
- ✅ Role permissions matrix created
- ✅ 12-week development timeline established
- ✅ Technology stack selected and implemented
- ✅ Database schema planned and implemented with Prisma
- ✅ GitHub milestone created (Version 1.0 - MVP Release)
- ✅ 8 custom labels configured
- ✅ Repository pushed to GitHub
- ✅ **EPIC-01 COMPLETE:** Nx monorepo initialized with React frontend and NestJS backend
- ✅ Shared libraries created (DTOs, validation, interfaces)
- ✅ CI/CD pipelines configured with GitHub Actions
- ✅ Development environment ready with Docker Compose

### GitHub Integration
- **Repository:** https://github.com/vishaltoora/GT-Automotives-App
- **Issues:** https://github.com/vishaltoora/GT-Automotives-App/issues
- **Milestone:** https://github.com/vishaltoora/GT-Automotives-App/milestone/1
- **Quick Reference:** `/docs/GITHUB_STATUS.md`

### Next Steps
1. ~~Initialize project structure~~ ✅ COMPLETE
2. ~~Set up development environment (EPIC-01)~~ ✅ COMPLETE
3. Implement three-role authentication ([Issue #2](https://github.com/vishaltoora/GT-Automotives-App/issues/2)) - EPIC-02
4. Begin core feature development

## User Roles & Permissions

### Customer Role
- Self-registration enabled
- View own data only (invoices, appointments, vehicles)
- Request appointments online
- Download invoices as PDF

### Staff Role (Technician/Sales)
- Create and manage invoices
- View all customers
- Manage inventory (no price changes)
- Schedule appointments
- View operational reports

### Admin Role (Owner/Manager)
- Full system access
- User management
- Financial reports
- Price controls
- Business analytics

**See `/docs/ROLE_PERMISSIONS.md` for complete permissions matrix**

## Technology Stack (Implemented)

### Frontend
- **Framework:** React 18 + TypeScript ✅
- **Routing:** React Router with role-based protected routes
- **State Management:** React Query + Context API
- **UI Components:** Material-UI (MUI) ✅
- **Print Styling:** Custom CSS for invoices

### Backend
- **Framework:** NestJS + TypeScript ✅
- **Authentication:** Clerk (identity) + Local roles/permissions ✅
- **API Design:** RESTful with role-based guards
- **Validation:** Class-validator + Yup schemas ✅

### Database
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

### Infrastructure
- **Monorepo:** Nx workspace ✅
- **Package Manager:** Yarn ✅
- **Shared Libraries:** DTOs, validation, interfaces ✅
- **CI/CD:** GitHub Actions ✅
- **Development DB:** Docker Compose with PostgreSQL ✅

### Services (Planned)
- **PDF Generation:** PDFKit or jsPDF
- **Email:** SendGrid or AWS SES
- **SMS:** Twilio (optional)
- **File Storage:** Local or AWS S3

## Key Features (8 Epics)

1. **[EPIC-01: Project Setup](https://github.com/vishaltoora/GT-Automotives-App/issues/1)** - Infrastructure and environment ✅ **COMPLETE**
2. **[EPIC-02: Authentication](https://github.com/vishaltoora/GT-Automotives-App/issues/2)** - Three-role system with JWT
3. **[EPIC-03: Tire Inventory](https://github.com/vishaltoora/GT-Automotives-App/issues/3)** - New/used tire management
4. **[EPIC-04: Customer Management](https://github.com/vishaltoora/GT-Automotives-App/issues/4)** - Customers and vehicles
5. **[EPIC-05: Invoicing](https://github.com/vishaltoora/GT-Automotives-App/issues/5)** - Creation and printing (8.5x11, thermal, PDF)
6. **[EPIC-06: Appointments](https://github.com/vishaltoora/GT-Automotives-App/issues/6)** - Scheduling with reminders
7. **[EPIC-07: Reporting](https://github.com/vishaltoora/GT-Automotives-App/issues/7)** - Business analytics (admin-only)
8. **[EPIC-08: Customer Portal](https://github.com/vishaltoora/GT-Automotives-App/issues/8)** - Self-service interface

## Development Setup

### Prerequisites
```bash
# Required software
- Node.js 18+
- PostgreSQL 13+
- Git
- Yarn 1.22+
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gt_automotive"

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Application
API_PORT=3000
WEB_PORT=4200
VITE_API_URL=http://localhost:3000

# Email Service
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@gtautomotive.com

# SMS Service (optional)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# JWT (for internal use)
JWT_SECRET=your-local-jwt-secret
JWT_EXPIRES_IN=24h

# Environment
NODE_ENV=development
```

### Initial Setup Commands
```bash
# Clone repository
git clone https://github.com/vishaltoora/GT-Automotives-App.git
cd gt-automotives-app

# Install dependencies
yarn install

# Start PostgreSQL with Docker
yarn docker:up

# Setup database
yarn db:generate
yarn db:migrate

# Seed initial data
yarn db:seed
```

## Build and Run Commands

### Development
```bash
# Start both frontend and backend
yarn dev

# Or start individually:
yarn dev:web       # Frontend on http://localhost:4200
yarn dev:server    # Backend on http://localhost:3000

# Database
yarn db:migrate    # Run migrations
yarn db:seed       # Seed test data
yarn db:studio     # Open Prisma Studio
```

### Production
```bash
# Build all applications
yarn build

# Or build individually:
yarn build:web     # Build frontend
yarn build:server  # Build backend

# Database migrations
yarn db:migrate:prod
```

### Testing
```bash
yarn test          # Run all tests
yarn test:web      # Test frontend
yarn test:server   # Test backend
yarn lint          # Run linting
yarn lint:fix      # Fix linting issues
```

## Testing Approach

### Role-Based Testing
Always test features with all three roles:
1. **Customer:** Can only see own data
2. **Staff:** Can see all customer data but no financial totals
3. **Admin:** Has complete access

### Critical Test Scenarios
- Invoice printing in all formats
- Customer data isolation
- Inventory deduction on sale
- Appointment scheduling conflicts
- Role permission boundaries

## Development Guidelines

### API Endpoint Patterns
```javascript
// Public endpoints
POST   /api/auth/register      // Customer registration
POST   /api/auth/login         // All users

// Protected endpoints (with role checks)
GET    /api/invoices          // Role-based filtering
POST   /api/invoices          // Staff, Admin only
GET    /api/reports/financial // Admin only
```

### Code Style
- Use async/await over callbacks
- Implement proper error handling
- Add role checks at controller level
- Log all admin actions
- Use transactions for critical operations

### Git Workflow
```bash
# Feature branches
git checkout -b feature/epic-XX-description

# Commit format
git commit -m "Epic-XX: Add specific feature

- Implementation detail 1
- Implementation detail 2"
```

## Important Business Rules

### Invoice Printing
- **Must support:** 8.5x11 paper, thermal receipt (80mm), PDF
- **Include:** Company logo, full address, tax number
- **Customer copy:** Shows all details
- **Design:** Professional with clear line items

### Inventory Management
- Automatic deduction on invoice creation
- Low stock alerts at 5 units
- Used tires require condition rating
- Photos required for used tires

### Data Access Rules
- Customers see ONLY their own data
- Staff cannot modify prices
- Financial reports are admin-only
- All admin actions are logged

## File Structure (Actual)
```
gt-automotives-app/
├── apps/
│   ├── webApp/              # React frontend ✅
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── assets/
│   │   │   └── styles.css
│   │   ├── public/
│   │   └── vite.config.ts
│   └── server/              # NestJS backend ✅
│       ├── src/
│       │   ├── app/
│       │   └── main.ts
│       ├── dist/            # Compiled output
│       └── webpack.config.js
├── libs/
│   ├── shared/
│   │   ├── dto/             # Shared DTOs ✅
│   │   ├── validation/      # Yup schemas ✅
│   │   └── interfaces/      # TypeScript interfaces ✅
│   └── database/            # Prisma integration ✅
│       └── src/lib/prisma/
│           ├── migrations/
│           ├── schema.prisma
│           └── seed.ts
├── server-e2e/              # E2E tests ✅
├── docker-compose.yml       # PostgreSQL dev setup ✅
├── nx.json                  # Nx configuration ✅
├── package.json            # Scripts and dependencies ✅
├── yarn.lock               # Yarn lock file ✅
├── scripts/                 # Utility scripts
│   └── create-github-issues.sh
└── docs/
    ├── epics/            # Epic descriptions
    ├── tasks/            # Task details
    ├── ROLE_PERMISSIONS.md
    ├── PROJECT_ROADMAP.md
    └── GITHUB_STATUS.md
```

## Common Development Tasks

### Adding a New Feature
1. Check which epic it belongs to
2. Verify role permissions needed
3. Create API endpoint with role checks
4. Build UI components for each role
5. Test with all three user types
6. Update documentation

### Testing Role Permissions
```javascript
// Example middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/invoices', requireRole(['staff', 'admin']), createInvoice);
```

### Generating Test Invoices
```javascript
// Test invoice data
const testInvoice = {
  customer_id: 1,
  vehicle_id: 1,
  items: [
    { type: 'tire', id: 1, quantity: 4, price: 125.00 },
    { type: 'service', description: 'Installation', price: 80.00 }
  ],
  tax_rate: 0.0825,
  payment_method: 'card'
};
```

## Security Considerations

### Authentication
- JWT tokens expire in 24 hours
- Refresh tokens for extended sessions
- Role claim must be validated on every request

### Data Protection
- Customer data isolation is critical
- Use parameterized queries (no SQL injection)
- Validate all input
- Sanitize output
- HTTPS required in production

### Audit Logging
- Log all admin actions
- Track inventory adjustments
- Record price changes
- Monitor failed login attempts

## Performance Optimization

### Database
- Index frequently searched fields
- Use pagination for large lists
- Optimize invoice queries with joins
- Cache frequently accessed data

### Frontend
- Lazy load role-specific components
- Implement virtual scrolling for long lists
- Optimize images (especially tire photos)
- Use print CSS to reduce invoice render time

## Deployment Checklist

### Before Production
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Email service configured
- [ ] Backup strategy in place
- [ ] Error monitoring setup
- [ ] Admin user created
- [ ] Test data removed

## Completed Work

### EPIC-01: Project Setup & Infrastructure ✅
**Completed on:** August 14, 2025

#### What Was Implemented:
- **Nx Monorepo:** Full workspace configuration with apps and libs
- **Frontend (webApp):** React 18 + TypeScript + Material UI
- **Backend (server):** NestJS + TypeScript  
- **Database:** PostgreSQL + Prisma ORM with complete schema
- **Shared Libraries:**
  - `@gt-automotive/shared-dto` - Data transfer objects
  - `@gt-automotive/shared-validation` - Yup validation schemas
  - `@gt-automotive/shared-interfaces` - TypeScript interfaces
  - `@gt-automotive/database` - Prisma service and models
- **Authentication:** Clerk integration ready (keys needed)
- **CI/CD:** GitHub Actions workflows for testing and deployment
- **Development Environment:** Docker Compose for PostgreSQL (or local PostgreSQL)

#### Quick Start:
```bash
cd gt-automotives-app
yarn install
# If Docker available: yarn docker:up
# Otherwise use local PostgreSQL
yarn db:generate
yarn db:migrate
NODE_ENV=development yarn db:seed
yarn dev
```

#### Current Status:
✅ **Application is running and tested!**
- Database migrated with all tables
- Frontend running on http://localhost:4200
- Backend API running on http://localhost:3000/api

#### Demo Data Created:
**Users:**
- Admin: admin@gtautomotive.com
- Staff: staff@gtautomotive.com
- Customer: customer@example.com

**Inventory:**
- 5 tire models in stock (Michelin, Bridgestone, Goodyear, Continental, BF Goodrich)
- Roles and permissions configured
- Sample customer profile created

## Notes

### Current Limitations
- No payment processing integration yet
- SMS notifications are optional in V1
- Clerk API keys needed for authentication
- Backend running on port 3000 (not 3333 as originally planned)

### Future Enhancements (V2)
- Mobile applications
- Online payment processing
- Advanced analytics dashboard
- Inventory forecasting
- Customer loyalty program
- Integration with accounting software

### Important Links
- **Workspace Root:** `/Users/vishaltoora/projects/gt-automotives-app`
- **Frontend URL:** http://localhost:4200
- **Backend URL:** http://localhost:3000/api
- **Documentation:** `/docs/README.md`
- **Roadmap:** `/docs/PROJECT_ROADMAP.md`
- **Permissions:** `/docs/ROLE_PERMISSIONS.md`
- **GitHub Status:** `/docs/GITHUB_STATUS.md`
- **Repository:** https://github.com/vishaltoora/GT-Automotives-App
- **Issues:** https://github.com/vishaltoora/GT-Automotives-App/issues
- **Milestone:** https://github.com/vishaltoora/GT-Automotives-App/milestone/1

### Contact
For questions about implementation details, refer to the epic and task documentation in `/docs/` or create an issue in the repository.

---

**Last Updated:** August 14, 2025 - Project structure updated, workspace paths corrected