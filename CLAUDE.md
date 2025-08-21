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

**Current Phase:** Core Features Development - 5 of 8 Epics Complete (62.5%), Ready for Appointment Scheduling (EPIC-06)

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
- ✅ **EPIC-02 COMPLETE:** Three-role authentication system with full Clerk integration
- ✅ **EPIC-03 COMPLETE:** Tire inventory management with full CRUD operations
- ✅ **EPIC-04 COMPLETE:** Customer and vehicle management with relationship linking
- ✅ Shared libraries created (DTOs, validation, interfaces)
- ✅ CI/CD pipelines configured with GitHub Actions
- ✅ Development environment ready with Docker Compose
- ✅ Repository pattern implemented for database operations
- ✅ Role-based routing and guards implemented
- ✅ Full Clerk authentication configured and working
- ✅ Clerk keys integrated (publishable and secret keys)
- ✅ JWKS endpoint configured for JWT verification
- ✅ Fixed login redirect and authentication flow
- ✅ ES6 module imports for browser compatibility
- ✅ **Public-Facing Website COMPLETE:** Professional theme system and all public pages implemented
- ✅ **Animated Hero Sections:** Modern GT logo design with pulsing circles and floating service icons
- ✅ **MUI Grid2 Migration:** All components updated to latest Material-UI Grid syntax
- ✅ **Redesigned Contact Page:** Professional layout with modern form design
- ✅ Comprehensive theme system with consistent branding
- ✅ Responsive mobile navigation with hamburger menu
- ✅ Reusable component library for public interface
- ✅ **Inventory Management COMPLETE:** Full tire inventory system with stock tracking
- ✅ **Customer Management COMPLETE:** Full customer profiles with contact info
- ✅ **Vehicle Management COMPLETE:** Vehicle tracking with VIN validation and mileage
- ✅ **EPIC-05 COMPLETE:** Invoicing system with comprehensive billing features
- ✅ **Mobile Tire Service Pricing:** Complete pricing structure with 6 service categories
- ✅ **Contact Information Updated:** New phone (250-570-2333) and email (gt-automotives@outlook.com)
- ✅ **Service Area Defined:** 20km free service zone with detailed area listings
- ✅ **Clerk JWT Verification:** Dual strategy authentication with Clerk JWT and local JWT
- ✅ **Admin User Created:** Vishal Toora configured with full admin access
- ✅ **Admin Dashboard Redesigned:** Modern UI with gradient stat cards and business insights
- ✅ **Navigation Bar Update:** GT logo integrated across all layouts (Admin, Staff, Customer)
- ✅ **Consistent Branding:** Unified design system across all user interfaces

### GitHub Integration
- **Repository:** https://github.com/vishaltoora/GT-Automotives-App
- **Issues:** https://github.com/vishaltoora/GT-Automotives-App/issues
- **Milestone:** https://github.com/vishaltoora/GT-Automotives-App/milestone/1
- **Quick Reference:** `/docs/GITHUB_STATUS.md`

### Next Steps
1. ~~Initialize project structure~~ ✅ COMPLETE
2. ~~Set up development environment (EPIC-01)~~ ✅ COMPLETE
3. ~~Implement three-role authentication (EPIC-02)~~ ✅ COMPLETE
4. ~~Implement tire inventory management (EPIC-03)~~ ✅ COMPLETE
5. ~~Implement customer and vehicle management (EPIC-04)~~ ✅ COMPLETE
6. ~~Build invoicing system (EPIC-05)~~ ✅ COMPLETE
7. Add appointment scheduling ([Issue #6](https://github.com/vishaltoora/GT-Automotives-App/issues/6)) - EPIC-06
8. Implement reporting & analytics ([Issue #7](https://github.com/vishaltoora/GT-Automotives-App/issues/7)) - EPIC-07
9. Build customer portal ([Issue #8](https://github.com/vishaltoora/GT-Automotives-App/issues/8)) - EPIC-08

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
- **Theme System:** Custom colors.ts and theme.ts for consistent branding ✅
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
2. **[EPIC-02: Authentication](https://github.com/vishaltoora/GT-Automotives-App/issues/2)** - Three-role system with Clerk ✅ **COMPLETE**
3. **[EPIC-03: Tire Inventory](https://github.com/vishaltoora/GT-Automotives-App/issues/3)** - New/used tire management ✅ **COMPLETE**
4. **[EPIC-04: Customer Management](https://github.com/vishaltoora/GT-Automotives-App/issues/4)** - Customers and vehicles ✅ **COMPLETE**
5. **[EPIC-05: Invoicing](https://github.com/vishaltoora/GT-Automotives-App/issues/5)** - Creation and printing (8.5x11, thermal, PDF)
6. **[EPIC-06: Appointments](https://github.com/vishaltoora/GT-Automotives-App/issues/6)** - Scheduling with reminders
7. **[EPIC-07: Reporting](https://github.com/vishaltoora/GT-Automotives-App/issues/7)** - Business analytics (admin-only)
8. **[EPIC-08: Customer Portal](https://github.com/vishaltoora/GT-Automotives-App/issues/8)** - Self-service interface

## Authentication with Clerk (Production Mode)

The application uses Clerk for authentication with the following configuration:

### Clerk Instance Details
- **Instance:** clean-dove-53
- **Frontend API:** https://clean-dove-53.clerk.accounts.dev
- **JWKS URL:** https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json

### Configuration Files
- **Frontend Key:** Set in `apps/webApp/.env.local` as `VITE_CLERK_PUBLISHABLE_KEY`
- **Backend Key:** Set in `server/.env` as `CLERK_SECRET_KEY`
- **Documentation:** `/docs/CLERK_CONFIG.md`

### How Authentication Works
1. Users sign in/up through Clerk at `/login` or `/register`
2. New users automatically get "customer" role
3. JWT tokens are verified using Clerk's JWKS endpoint via `ClerkJwtStrategy`
4. Role-based routing redirects users to appropriate dashboards
5. Dual JWT strategy support: Clerk JWT (primary) and local JWT (fallback)

### Admin User (Vishal Toora)
- **Email:** vishal.alawalpuria@gmail.com
- **Clerk ID:** user_31JM1BAB2lrW82JVPgrbBekTx5H
- **Role:** Admin (full system access)
- **Database ID:** cmekadftv003xvbokv2ioi7op
- **Status:** Active and ready for login

## Development Mode (Without Clerk)

To run without Clerk authentication:

### Setup
1. Comment out `VITE_CLERK_PUBLISHABLE_KEY` in `apps/webApp/.env.local`
2. Restart servers - the app will use `MockClerkProvider`
3. Access the application with automatic mock authentication

### Mock User Details
- **Email:** customer@example.com
- **Name:** Test Customer
- **Role:** Customer (automatically assigned)
- **Access:** Full customer portal features

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

# Clerk Authentication (Required for production)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlYW4tZG92ZS01My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_z1yz3LAc4dQglp0oCUWxscpuKWqh8mnCsYHT5hYjxB
CLERK_JWKS_URL=https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_... # Configure in Clerk dashboard

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

### Troubleshooting Commands
```bash
# Clear Nx cache
yarn nx reset

# Check running servers
ps aux | grep -E "(vite|nest)"
lsof -i :4200 -i :3000

# Install with version override
yarn install --ignore-engines

# Start frontend only
cd apps/webApp && yarn vite --host

# Start backend only
cd server && yarn start:dev
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

### Using the Theme System
```javascript
// Import theme colors in components
import { colors } from '../../theme/colors';

// Use in Material-UI sx prop
<Box sx={{ 
  backgroundColor: colors.primary.main,
  color: colors.text.primary,
  background: colors.gradients.hero
}} />

// Access theme in components
import { useTheme } from '@mui/material';
const theme = useTheme();
```

### MUI Grid2 Migration (August 19, 2025)
All components have been updated to use MUI Grid2 syntax:
```javascript
// Updated import (NEW)
import { Grid } from '@mui/material';  // This now imports Grid2

// Usage remains the same
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    Content here
  </Grid>
</Grid>
```

### Component Development
- Always use theme colors instead of hardcoded values
- Create reusable components in `/components/public/`
- Follow the established pattern for service cards and CTAs
- Use animated hero sections with GT logo and floating icons
- Ensure all components are fully responsive
- Test on mobile devices using browser dev tools

### Animated Hero Pattern (August 19, 2025)
All public pages now feature consistent animated hero sections:
```javascript
// Hero structure (used across all public pages)
<Box sx={{ /* animated gradient background */ }}>
  <Grid container spacing={4} alignItems="center">
    <Grid xs={12} md={6}>
      {/* Animated GT logo with pulsing circles */}
      <Box sx={{ /* logo animation styles */ }}>
        <Typography>GT</Typography>
        {/* Floating service icons */}
      </Box>
    </Grid>
    <Grid xs={12} md={6}>
      {/* Page content */}
      <Typography variant="h1">{pageTitle}</Typography>
      <Typography variant="h5">{pageSubtitle}</Typography>
      {/* Action buttons */}
    </Grid>
  </Grid>
</Box>
```

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
│   │   │   │   ├── theme/        # Theme configuration ✅
│   │   │   │   │   ├── colors.ts
│   │   │   │   │   └── theme.ts
│   │   │   │   ├── components/
│   │   │   │   │   └── public/   # Public components ✅
│   │   │   │   │       ├── Hero.tsx
│   │   │   │   │       ├── ServiceCard.tsx
│   │   │   │   │       ├── FeatureHighlight.tsx
│   │   │   │   │       ├── CTASection.tsx
│   │   │   │   │       └── TestimonialCard.tsx
│   │   │   │   └── pages/
│   │   │   │       └── public/   # Public pages ✅
│   │   │   │           ├── Home.tsx
│   │   │   │           ├── Services.tsx
│   │   │   │           ├── About.tsx
│   │   │   │           └── Contact.tsx
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

## Common Issues & Solutions

### Blank Pages / Nothing Displayed
**Problem:** Pages show blank content, no errors in terminal
**Solution:** Fixed by replacing CommonJS `require()` with ES6 imports in:
- `apps/webApp/src/app/hooks/useAuth.ts`
- `apps/webApp/src/app/pages/auth/Login.tsx`
- `apps/webApp/src/app/pages/auth/Register.tsx`

### Login Redirects to Home
**Problem:** After login, user redirected to home instead of dashboard
**Solution:** Remove hardcoded `afterSignInUrl` from Clerk SignIn component

### TypeScript Compilation Errors
**Problem:** Build fails with "Cannot find module" errors
**Solution:** 
```bash
yarn nx reset        # Clear Nx cache
yarn install --ignore-engines
```

### Node Version Incompatibility
**Problem:** Vite requires newer Node version
**Solution:** Use `yarn install --ignore-engines` or update Node.js

### Cannot Access Customer Dashboard
**Problem:** Customer dashboard shows "page can't be reached"
**Solution:** Ensure both servers are running:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api

## Completed Work

### EPIC-01: Project Setup & Infrastructure ✅
**Completed on:** August 15, 2025

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

#### Quick Start (Development Mode - No Clerk):
```bash
cd gt-automotives-app
yarn install --ignore-engines  # Use --ignore-engines if Node version mismatch
# Comment out VITE_CLERK_PUBLISHABLE_KEY in apps/webApp/.env.local

# Start both servers
yarn dev

# Or start separately:
# Terminal 1: cd apps/webApp && yarn vite --host
# Terminal 2: cd server && yarn start:dev
```

#### Quick Start (Production Mode - With Clerk):
```bash
cd gt-automotives-app
yarn install
# Ensure Clerk keys are set in .env files
yarn db:migrate
yarn db:seed
yarn dev
```

#### Current Status:
✅ **Application is running and tested!**
- Database migrated with all tables
- Frontend running on http://localhost:4200
- Backend API running on http://localhost:3000/api
- Public-facing website complete with all pages

#### Demo Data Created:
**Users:**
- Admin: admin@gtautomotive.com (password: Admin@123)
- Staff: staff@gtautomotive.com (password: Staff@123)
- Customer: customer@example.com (password: Customer@123)

**Inventory:**
- 5 tire models in stock (Michelin, Bridgestone, Goodyear, Continental, BF Goodrich)
- Roles and permissions configured
- Sample customer profile created

### EPIC-02: User Authentication & Management ✅
**Completed on:** August 15, 2025

#### What Was Implemented:

**Backend (NestJS):**
- **Repository Pattern:** Complete separation of database logic
  - UserRepository, RoleRepository, AuditRepository
  - BaseRepository abstract class
- **Authentication Module:** JWT-based authentication with Clerk integration
  - JWT strategy with Passport
  - Role-based guards (@Roles, @Public, @CurrentUser decorators)
  - Clerk webhook handler for user sync
- **User Management:** Full CRUD operations with role assignment
- **Audit Logging:** Track all admin actions
- **Password Security:** bcryptjs for local authentication
- **CORS Configuration:** Enabled for frontend communication

**Frontend (React):**
- **Clerk Provider:** Optional integration (works without keys)
- **useAuth Hook:** Centralized authentication state
- **Guard Components:** AuthGuard and RoleGuard for route protection
- **Authentication Pages:** Login, Register, Unauthorized
- **Role-Based Layouts:**
  - PublicLayout: No authentication required
  - CustomerLayout: Customer portal with sidebar navigation
  - StaffLayout: Staff dashboard with operational tools
  - AdminLayout: Full admin panel with complete access
- **Dashboard Pages:** Customized for each role
- **Protected Routing:** Automatic redirects based on role

**Repository Structure:**
```
server/src/
├── auth/
│   ├── decorators/
│   ├── guards/
│   ├── strategies/
│   └── webhooks/
├── users/
│   └── repositories/
├── roles/
│   └── repositories/
└── audit/
    └── repositories/
```

#### API Endpoints Created:
- `POST /api/auth/login` - Local authentication
- `POST /api/auth/register` - Customer self-registration
- `GET /api/auth/me` - Get current user
- `POST /api/webhooks/clerk` - Clerk webhook for user sync
- `GET /api/users` - List all users (Staff/Admin)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `PUT /api/users/:id/role` - Assign role (Admin only)
- `DELETE /api/users/:id` - Deactivate user (Admin only)

#### Running Without Clerk:
The application can run in development mode without Clerk API keys:
1. Frontend shows instructions for setting up Clerk
2. Public pages are fully accessible
3. Protected routes redirect to login
4. Backend gracefully handles missing Clerk configuration

### Development Mode Authentication ✅
**Implemented on:** August 15, 2025

#### What Was Fixed:
- **MockClerkProvider:** Complete mock implementation of Clerk hooks
- **Conditional Imports:** ES6 imports with runtime selection
- **Development Bypass:** Automatic customer authentication
- **Browser Compatibility:** Removed CommonJS require() statements

#### Files Modified:
- `apps/webApp/src/app/providers/MockClerkProvider.tsx` (new)
- `apps/webApp/src/app/providers/ClerkProvider.tsx`
- `apps/webApp/src/app/hooks/useAuth.ts`
- `apps/webApp/src/app/pages/auth/Login.tsx`
- `apps/webApp/src/app/pages/auth/Register.tsx`
- `apps/webApp/src/app/layouts/CustomerLayout.tsx`

### Public-Facing Website & Theme System ✅
**Completed on:** August 15, 2025
**Redesigned on:** August 18, 2025

#### What Was Implemented:

**Theme System:**
- **colors.ts:** Comprehensive brand color palette
  - Primary colors (professional blue)
  - Secondary colors (energetic orange)
  - Semantic colors (success, warning, error, info)
  - Gradients for hero sections
  - Social media colors
- **theme.ts:** Material-UI theme configuration
  - Custom typography scales
  - Responsive breakpoints
  - Component overrides
  - Consistent spacing system

**Reusable Public Components:**
- **Hero:** Eye-catching banner with CTAs and gradient backgrounds
- **ServiceCard:** Service display with pricing, features, and categories
- **FeatureHighlight:** Grid layout for showcasing business features
- **CTASection:** Call-to-action sections with multiple variants
- **TestimonialCard:** Customer review cards with ratings (removed in redesign)

**Public Pages Completed:**

1. **Home Page (`/`):** - **REDESIGNED August 18-19, 2025**
   - **New Hero Section:**
     - Title: "Professional Tire & Auto Services"
     - Subheading: "Expert tire installation, mobile services, and mechanical repairs by certified technicians at competitive prices"
     - Action buttons: "Browse Tires" and "Contact Us" (replaced Get Quote and Emergency)
     - Animated gradient background with floating elements
   - **Quick Actions Bar:** 4 primary service buttons with icons
   - **Statistics Bar:** 5,000+ customers served, 10,000+ tires sold, 15+ years experience, 100% satisfaction
   - **Services Section:** CSS Grid layout with equal-width cards (3 per row on desktop)
   - **Mobile Emergency Service:** Redesigned banner without phone numbers
   - **Why Choose Us:** Single-row flexbox layout with smaller, equal-sized cards
   - **Tire Brands:** Grid display with 🛞 emoji for each brand
   - **Get in Touch:** 3 equal-width cards (Call Us, Email Us, Business Hours)
   - **Why GT Automotive:** CSS Grid with equal-width items
   - **Service Area:** Simple text-based section for "Prince George and 100km radius"
   - **Removed Sections:** Current promotions, customer testimonials, town cards, main hub card, emergency response card

2. **Services Page (`/services`):**
   - Tabbed interface (All/Tire/Mechanical services)
   - 10+ detailed service cards with pricing
   - "Why Choose Us" section
   - Service statistics
   - Professional service descriptions

3. **About Page (`/about`):**
   - Company story and journey
   - Timeline of milestones (2010-2023)
   - Meet the team section (6 team members)
   - Core values display
   - Awards & certifications
   - Statistics and achievements

4. **Contact Page (`/contact`):** - **REDESIGNED August 19, 2025**
   - Animated hero section with GT logo and floating icons
   - Modern contact form with professional styling
   - Business hours and location information
   - Multiple contact methods (phone, email, address)
   - Service area coverage details
   - Emergency contact information
   - Fully responsive design with MUI Grid2

**Navigation & Layout:**
- GT Automotive logo integrated in header
- Responsive navigation with mobile hamburger menu
- Active state indicators for current page
- Professional footer with:
  - Company information
  - Quick links
  - Contact details
  - Business hours
  - Social media links

#### Key Features:
- ✅ **Fully Responsive:** Works perfectly on all devices
- ✅ **Interactive Elements:** Hover effects, smooth animations
- ✅ **Consistent Theme:** Uses theme colors throughout
- ✅ **Professional Design:** Modern, clean layout
- ✅ **User-Friendly Navigation:** Mobile menu, active states
- ✅ **Business Information:** Complete contact details, hours
- ✅ **Strategic CTAs:** Call-to-actions throughout for conversion
- ✅ **Animated Branding:** Consistent GT logo animation across all pages
- ✅ **MUI Grid2 Syntax:** Modern Material-UI Grid implementation

#### Accessing Public Pages:
```bash
cd gt-automotives-app
yarn dev  # Starts both frontend and backend

# Visit:
# http://localhost:4200         - Home page
# http://localhost:4200/services - Services catalog
# http://localhost:4200/about    - Company information
# http://localhost:4200/contact  - Contact form and details
```

### EPIC-03: Tire Inventory Management ✅
**Completed on:** August 16, 2025

#### What Was Implemented:

**Backend (NestJS):**
- **Complete REST API:** Full CRUD operations for tire management
  - Public endpoints for customers to browse inventory
  - Staff endpoints for stock management (no price changes)
  - Admin endpoints with full control including pricing
- **Repository Pattern:** TireRepository for database operations
- **Stock Management:** Adjustment tracking (add/remove/set)
- **Low Stock Alerts:** Automatic detection when quantity ≤ minStock
- **Inventory Reports:** Financial metrics and analytics (admin only)
- **Audit Logging:** All inventory changes tracked
- **Search & Filter:** Advanced search with multiple criteria
- **Bulk Operations:** Support for bulk price updates

**Frontend (React):**
- **TireList Component:** 
  - Grid and list view modes
  - Advanced filtering and sorting
  - Pagination support
  - Export to CSV functionality
- **TireForm:** Create and edit tires with validation
- **TireDetails:** Detailed view with stock status
- **InventoryDashboard:** 
  - Analytics and metrics
  - Low stock alerts
  - Quick actions
- **Role-Based Features:**
  - Customers: Browse inventory, see prices
  - Staff: Manage stock, cannot change prices
  - Admin: Full control including costs
- **Real-time Updates:** React Query for data synchronization
- **Responsive Design:** Mobile-optimized interface

**Components Created:**
```
apps/webApp/src/app/
├── pages/inventory/
│   ├── TireList.tsx          # Main inventory list
│   ├── TireListSimple.tsx    # Simplified view
│   ├── TireForm.tsx          # Create/edit form
│   ├── TireFormSimple.tsx    # Simple form variant
│   ├── TireDetails.tsx       # Detailed view
│   └── InventoryDashboard.tsx # Analytics dashboard
├── components/inventory/
│   ├── TireCard.tsx          # Tire display card
│   ├── TireFilter.tsx        # Filter component
│   ├── StockAdjustmentDialog.tsx # Stock adjustment UI
│   └── TireImageUpload.tsx   # Image upload component
├── hooks/
│   └── useTires.ts           # React Query hooks
└── services/
    └── tire.service.ts       # API client
```

#### Key Features:
- ✅ **Full CRUD Operations:** Create, read, update, delete tires
- ✅ **Stock Tracking:** Real-time inventory levels
- ✅ **Low Stock Alerts:** Automatic alerts at 5 units
- ✅ **Used Tire Support:** Condition ratings (Excellent/Good/Fair)
- ✅ **Advanced Search:** Filter by brand, model, size, type, condition, price
- ✅ **Inventory Reports:** Total value, cost analysis, stock by brand/type
- ✅ **Role-Based Access:** Different features for each user role
- ✅ **Audit Trail:** All changes logged with user and timestamp
- ✅ **Export Functionality:** Download inventory data as CSV
- ✅ **Responsive UI:** Works on desktop, tablet, and mobile

#### Accessing Tire Inventory:
```bash
# Start the application
cd gt-automotives-app
yarn dev

# Access inventory pages:
# http://localhost:4200/inventory         - Tire list (all users)
# http://localhost:4200/inventory/new     - Add tire (staff/admin)
# http://localhost:4200/inventory/:id     - View tire details
# http://localhost:4200/inventory/:id/edit - Edit tire (staff/admin)
# http://localhost:4200/inventory/dashboard - Analytics (staff/admin)
```

## Notes

### Current Status
- ✅ Clerk authentication fully configured and working with dual JWT strategy
- ✅ All environment variables properly set
- ✅ Backend running on port 3000 with Clerk JWT verification via JWKS
- ✅ Frontend running on port 4200 with Clerk SignIn/SignUp
- ✅ Role-based routing and guards functional with case-insensitive checking
- ✅ Development and production modes both supported
- ✅ Vishal Toora configured as admin user with full system access

### Authentication Files (August 20, 2025)
- **Created:** `server/src/auth/strategies/clerk-jwt.strategy.ts` - Clerk JWT verification
- **Modified:** `server/src/auth/guards/jwt-auth.guard.ts` - Dual strategy support
- **Modified:** `server/src/auth/auth.module.ts` - Added ClerkJwtStrategy provider
- **Modified:** `apps/webApp/src/app/hooks/useAuth.ts` - Admin user handling
- **Modified:** `apps/webApp/src/app/guards/RoleGuard.tsx` - Case-insensitive roles
- **Modified:** `libs/database/src/lib/prisma/seed.ts` - Added Vishal as admin
- **Created:** `scripts/update-vishal-clerk-id.ts` - Clerk ID update script

### Current Limitations
- No payment processing integration yet
- SMS notifications are optional in V1
- Webhook synchronization optional (users get default customer role)
- Image upload uses URLs (file upload ready but not implemented)

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

### Admin Dashboard UI Redesign ✅
**Completed on:** August 20, 2025

#### What Was Implemented:

**Navigation Updates (All Layouts):**
- **GT Logo Integration:** Professional branding with GT Automotives logo in all navigation bars
- **Consistent Header Design:** White header bar with clean borders matching public site
- **User Profile Section:** Avatar display with role indicators in sidebar
- **Responsive Mobile Navigation:** Optimized for all screen sizes with hamburger menu
- **Dark Gradient Sidebar:** Professional appearance with 280px width for better readability
- **Active State Indicators:** Visual feedback with colored borders and backgrounds

**Admin Dashboard Redesign:**
- **Modern Stat Cards:** 
  - Gradient backgrounds with glassmorphism effects
  - Equal-width cards using CSS Grid layout
  - Trend indicators with up/down arrows and percentages
  - Full horizontal space utilization
- **Quick Actions Section (75% width):**
  - 6 equal-width action cards using CSS Grid
  - Hover effects with elevation changes
  - Icon-based navigation for common tasks
  - Responsive grid: 1 column (mobile) → 6 columns (large screens)
- **Recent Activity Feed (25% width):**
  - Compact sidebar design
  - Status icons with color coding
  - Chronological activity listing
- **System Health Monitoring:**
  - Animated progress bars for metrics
  - Database performance tracking
  - Storage usage indicators
  - API response time monitoring
- **Business Insights Section:**
  - 6 equal-width metric cards
  - CSS Grid for perfect horizontal space usage
  - Key performance indicators
  - Hover animations for interactivity

**Color-Coded Elements:**
- Orange accent for admin-specific actions
- Blue accent for staff-specific actions  
- Consistent use of brand colors from theme system

### EPIC-04: Customer and Vehicle Management ✅
**Completed on:** August 17, 2025

#### What Was Implemented:

**Backend (NestJS):**
- **Customer Module:** Complete CRUD operations with repository pattern
  - Customer profiles with contact information
  - Customer statistics (total spent, vehicle count, appointments)
  - Search functionality by name, email, phone, or address
- **Vehicle Module:** Full vehicle management system
  - Vehicle tracking linked to customers
  - VIN validation and uniqueness checks
  - Mileage tracking with validation (cannot decrease)
  - Search by make, model, VIN, or license plate
- **Role-Based Access:** 
  - Customers see only their own data
  - Staff can manage all customers/vehicles (no deletion)
  - Admin has full control including deletion
- **Audit Logging:** All customer and vehicle changes tracked

**Frontend (React):**
- **Customer Components:**
  - `CustomerList`: Display all customers with statistics
  - `CustomerForm`: Add/edit customer profiles
- **Vehicle Components:**
  - `VehicleList`: Display all vehicles with owner info
  - `VehicleForm`: Add/edit vehicles with autocomplete for makes
- **Services:** API clients for customer and vehicle operations
- **Routes:** Protected routes with role-based access
- **Navigation:** Updated staff and admin layouts with menu items

#### Key Features:
- ✅ **Customer-Vehicle Relationships:** Properly linked with referential integrity
- ✅ **Data Validation:** Phone numbers, emails, VIN format
- ✅ **Search & Filter:** Advanced search across multiple fields
- ✅ **Statistics:** Customer spending, vehicle service history
- ✅ **Cascade Operations:** Proper handling of related data

### Contact
For questions about implementation details, refer to the epic and task documentation in `/docs/` or create an issue in the repository.

---

**Last Updated:** August 20, 2025 - Complete Admin Dashboard UI redesign with modern interface. Implemented gradient stat cards with equal-width CSS Grid layout for full horizontal space utilization. Updated all navigation bars (Admin, Staff, Customer) with GT Automotives logo and consistent branding. Quick Actions section now uses 75% width with 6 equal-width cards, Recent Activity uses 25% as compact sidebar. Added Business Insights section with 6 metric cards using CSS Grid. System Health monitoring with animated progress bars. Dark gradient sidebar with user profiles and active state indicators. Previous updates: Clerk authentication with dual JWT strategy, Vishal Toora admin user setup, public website with Mobile Tire Service pricing. Frontend: http://localhost:4200, Backend: http://localhost:3000. EPIC-01 through EPIC-05 completed (62.5% MVP). Ready for EPIC-06 (Appointment Scheduling).