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

**Current Phase:** Documentation Complete, Ready for Development

### Completed
- ✅ 8 Epics fully documented
- ✅ 75+ Tasks defined
- ✅ Role permissions matrix created
- ✅ 12-week development timeline
- ✅ Technology stack selected
- ✅ Database schema planned

### Next Steps
1. Initialize project structure (EPIC-01)
2. Set up development environment
3. Implement three-role authentication (EPIC-02)
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

## Technology Stack

### Frontend
- **Framework:** React or Vue.js
- **Routing:** Role-based with protected routes
- **State Management:** Context API or Vuex
- **UI Components:** Material-UI or Vuetify
- **Print Styling:** Custom CSS for invoices

### Backend
- **Framework:** Node.js with Express or Django
- **Authentication:** JWT with role claims
- **API Design:** RESTful with role-based middleware
- **Validation:** Express-validator or Django forms

### Database
- **Primary:** PostgreSQL or MySQL
- **Schema includes:**
  - users (with role field)
  - customers
  - vehicles
  - tires (inventory)
  - invoices
  - appointments
  - audit_logs

### Services
- **PDF Generation:** PDFKit or jsPDF
- **Email:** SendGrid or AWS SES
- **SMS:** Twilio
- **File Storage:** Local or AWS S3

## Key Features (8 Epics)

1. **EPIC-01: Project Setup** - Infrastructure and environment
2. **EPIC-02: Authentication** - Three-role system with JWT
3. **EPIC-03: Tire Inventory** - New/used tire management
4. **EPIC-04: Customer Management** - Customers and vehicles
5. **EPIC-05: Invoicing** - Creation and printing (8.5x11, thermal, PDF)
6. **EPIC-06: Appointments** - Scheduling with reminders
7. **EPIC-07: Reporting** - Business analytics (admin-only)
8. **EPIC-08: Customer Portal** - Self-service interface

## Development Setup

### Prerequisites
```bash
# Required software
- Node.js 18+ or Python 3.9+
- PostgreSQL 13+ or MySQL 8+
- Git
- npm or yarn
```

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gt_automotive_dev
DB_USER=gt_app_user
DB_PASSWORD=secure_password

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Email Service
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@gtautomotive.com

# SMS Service (optional)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# App Configuration
APP_ENV=development
APP_PORT=3000
API_PORT=5000
```

### Initial Setup Commands
```bash
# Clone repository
git clone https://github.com/vishaltoora/GT-Automotives-App.git
cd GT-Automotives-App

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database
createdb gt_automotive_dev
npm run migrate

# Seed initial data
npm run seed
```

## Build and Run Commands

### Development
```bash
# Frontend (React/Vue)
cd frontend
npm run dev        # Start development server on :3000

# Backend (Node.js/Express)
cd backend
npm run dev        # Start API server on :5000

# Database
npm run migrate    # Run migrations
npm run seed       # Seed test data
```

### Production
```bash
# Frontend
npm run build      # Build for production
npm run preview    # Preview production build

# Backend
npm start          # Start production server

# Full stack
npm run start:all  # Start both frontend and backend
```

### Testing
```bash
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:e2e   # End-to-end tests
npm run test:roles # Test role permissions
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

## File Structure
```
gt-automotive-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Shared components
│   │   │   ├── customer/    # Customer portal
│   │   │   ├── staff/       # Staff dashboard
│   │   │   └── admin/       # Admin interface
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API calls
│   │   ├── utils/           # Helpers
│   │   └── styles/          # CSS/SCSS
│   └── public/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Auth, roles, etc.
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helpers
│   │   └── validators/    # Input validation
│   └── config/
├── database/
│   ├── migrations/        # Schema changes
│   └── seeds/            # Test data
└── docs/
    ├── epics/            # Epic descriptions
    ├── tasks/            # Task details
    └── ROLE_PERMISSIONS.md
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

## Notes

### Current Limitations
- GitHub token needs proper permissions for issue creation
- No payment processing integration yet
- SMS notifications are optional in V1

### Future Enhancements (V2)
- Mobile applications
- Online payment processing
- Advanced analytics dashboard
- Inventory forecasting
- Customer loyalty program
- Integration with accounting software

### Important Links
- **Documentation:** `/docs/README.md`
- **Roadmap:** `/docs/PROJECT_ROADMAP.md`
- **Permissions:** `/docs/ROLE_PERMISSIONS.md`
- **Repository:** https://github.com/vishaltoora/GT-Automotives-App

### Contact
For questions about implementation details, refer to the epic and task documentation in `/docs/` or create an issue in the repository.

---

**Last Updated:** When implementing new features, always consider the three-role system and ensure proper access control, especially for financial data and customer information.