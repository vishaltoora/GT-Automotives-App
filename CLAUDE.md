# CLAUDE.md - GT Automotive Documentation Index

This file provides guidance to Claude Code (claude.ai/code) when working with the GT Automotive application. Documentation has been modularized for better performance.

## Quick Reference

### 📁 Documentation Structure
- **[Development Status](.claude/docs/development-status.md)** - Current system status and progress overview
- **[Project Overview](.claude/docs/project-overview.md)** - Application summary, status, and roadmap
- **[Authentication](.claude/docs/authentication.md)** - Clerk setup, user roles, and permissions
- **[User Management](.claude/docs/user-management.md)** - Complete user management system documentation
- **[API Documentation](.claude/docs/api-documentation.md)** - Comprehensive REST API reference
- **[Grid Modernization](.claude/docs/grid-modernization.md)** - Material-UI Grid updates and best practices
- **[Tech Stack](.claude/docs/tech-stack.md)** - Technologies, frameworks, and architecture
- **[Development Setup](.claude/docs/development-setup.md)** - Environment setup and commands
- **[Development Guidelines](.claude/docs/development-guidelines.md)** - Code style, patterns, and best practices
- **[UI Components](.claude/docs/ui-components.md)** - Component documentation and usage guidelines
- **[Business Rules](.claude/docs/business-rules.md)** - Requirements and domain logic
- **[Customer Management Enhancements](.claude/docs/customer-management-enhancements.md)** - Recent B2B support and invoice improvements
- **[Lightsail Deployment Plan](.claude/docs/lightsail-deployment-plan.md)** - AWS Lightsail deployment architecture and CI/CD setup
- **[Troubleshooting](.claude/docs/troubleshooting.md)** - Common issues and solutions
- **[Completed Work](.claude/docs/completed-work.md)** - Detailed log of implemented features

## 🚀 Quick Start

### Development Mode (No Authentication)
```bash
cd gt-automotives-app
yarn install --ignore-engines
# Comment out VITE_CLERK_PUBLISHABLE_KEY in apps/webApp/.env.local
yarn dev
```

### Production Mode (With Clerk)
```bash
cd gt-automotives-app
yarn install
# Ensure Clerk keys are set in .env files
yarn db:migrate
yarn db:seed
yarn dev
```

## 📊 Current Status
- **Progress:** 5 of 8 Epics Complete (62.5%)
- **Next:** EPIC-06 - Appointment Scheduling
- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000/api
- **Admin User:** vishal.alawalpuria@gmail.com

## 🔑 Key Information

### Three User Roles
1. **Customer** - Self-service portal (`/customer/*`)
2. **Staff** - Operational dashboard (`/staff/*`)
3. **Admin** - Full system control (`/admin/*`)

### Technology Highlights
- **Frontend:** React 18 + TypeScript + Material-UI
- **Backend:** NestJS + Clerk Auth + PostgreSQL
- **Monorepo:** Nx workspace with shared libraries
- **Theme:** Custom branding with GT logo animations

### Important Commands
```bash
yarn dev           # Start both frontend and backend
yarn db:studio     # Open Prisma Studio
yarn nx reset      # Clear Nx cache
yarn lint          # Run linting
yarn test          # Run tests
```

## 📚 Additional Resources
- **GitHub:** https://github.com/vishaltoora/GT-Automotives-App
- **Issues:** https://github.com/vishaltoora/GT-Automotives-App/issues
- **Detailed Docs:** `/docs/` directory
- **Permissions Matrix:** `/docs/ROLE_PERMISSIONS.md`

## 🎯 Development Priorities
1. Always test with all three user roles
2. Maintain customer data isolation
3. Use theme colors (no hardcoded values)
4. Follow repository pattern for database operations
5. Log all admin actions for audit trail

## ⚠️ Critical Rules
- Customers see ONLY their own data
- Staff cannot modify prices
- Financial reports are admin-only
- All authentication flows use Clerk (or MockClerkProvider in dev)
- Invoice printing must support 8.5x11, thermal, and PDF formats
- **Never use browser dialogs** (window.alert, window.confirm) - use custom dialog system
- **All errors must use ErrorContext** for consistent user experience

---

## 🔄 Recent Updates

### August 27, 2025 - User Management System & Material-UI Modernization
- ✅ **Complete User Management**: Full admin interface for creating/managing staff and admin users
- ✅ **Professional User Dialogs**: CreateUserDialog and EditUserDialog with validation and Clerk integration
- ✅ **Username Support**: Dual login capability (username or email) with enhanced authentication flow
- ✅ **Branded Login UI**: Professional GT Automotive login page with logo, colors, and responsive design
- ✅ **Admin-only Registration**: Disabled public signup for enhanced security
- ✅ **Material-UI Grid Modernization**: Updated all Grid components to modern `size` prop syntax
- ✅ **Deprecation Warning Fixes**: Eliminated all Grid deprecation warnings with proper item props
- ✅ **Logout Fixes**: Resolved logout functionality across all layouts (Admin/Staff/Customer)
- ✅ **Enhanced Documentation**: Created comprehensive user management and Grid modernization docs

### August 26, 2025 - TypeScript Build System & Development Environment Fixes
- ✅ **Build System Resolution**: Fixed all TypeScript compilation errors preventing CI/CD builds
- ✅ **Server-Side TypeScript Fixes**: Resolved DTOs with definite assignment assertions, auth strategy issues, repository inheritance
- ✅ **Module Compatibility**: Fixed CommonJS/ESM compatibility issues in shared libraries for Node.js server compatibility  
- ✅ **Enum Import Resolution**: Updated tire-related components to import TireType/TireCondition from @prisma/client instead of shared interfaces
- ✅ **Development Servers**: Both frontend (localhost:4200) and backend (localhost:3000) now running successfully
- ✅ **Production Build**: Vite build now completes successfully in ~29.5 seconds with proper chunking
- ✅ **Code Cleanup**: Removed unused React imports and fixed Grid component import issues
- ✅ **Error Handling**: Enhanced error handling with proper type checking and audit log fixes

### August 26, 2025 - Customer System Overhaul & UI Enhancements
- ✅ **Customer Independence**: Removed User-Customer relationship - customers are now external entities
- ✅ **Direct Properties**: firstName, lastName, email (optional), phone (optional) stored directly on Customer
- ✅ **Data Migration**: Successfully migrated existing customer data from User to Customer records
- ✅ **Authentication Fix**: Fixed role case sensitivity (ADMIN, STAFF, CUSTOMER) for proper authorization
- ✅ **Confirmation Dialog System**: Created reusable confirmation dialog to replace window.confirm/alert
- ✅ **Custom Error Dialog System**: Comprehensive error handling with branded dialogs, expandable details, and helper functions
- ✅ **UI Improvements**: Email field editable, default address "Prince George, BC", consistent "No phone"/"No email" display
- ✅ **Printable Invoice Fix**: Fixed customer name display and removed contact info from printed invoices
- ✅ **Invoice List Enhancement**: Removed vehicle column, improved customer name display, replaced browser alerts with custom dialogs


### August 2025 - Customer Management & Invoice System Enhancements
- ✅ **Business Name Support**: Added optional business name field for commercial customers
- ✅ **Enhanced Customer Forms**: Updated CustomerForm and CustomerList with business name support
- ✅ **Invoice Dialog Improvements**: Enhanced invoice creation workflow with better state management
- ✅ **Duplicate Prevention**: Improved customer creation process to prevent duplicates in invoice system
- ✅ **Database Migration**: Successfully added business name field via migration `20250826145527`
- ✅ **Service Layer Updates**: Enhanced customer services and DTOs for business name handling
- ✅ **Dialog-Based Invoice Creation**: Converted Admin Dashboard quick actions from navigation to modal dialog
- ✅ **Grid Component Fixes**: Fixed Grid2 import issues and updated to use modern Material-UI Grid syntax
- ✅ **Material-UI Updates**: Verified latest versions (7.3.1) and resolved import compatibility
- ✅ **Build System Fixes**: Resolved ESM/CommonJS compatibility issues in shared libraries

### August 2025 - Home Page Component Refactoring
- ✅ **Component Modularization**: Split 1900-line Home.tsx into 9 focused components
- ✅ **Better Organization**: Created `/components/home` directory structure
- ✅ **Improved Maintainability**: Each component has single responsibility
- ✅ **TypeScript Enhancements**: Proper interfaces and type definitions
- ✅ **Performance**: Better code splitting with smaller components

### December 2024 - Invoice Printing Enhancements
- ✅ **Logo Integration**: Implemented actual GT logo from `/images-and-logos/logo.png`
- ✅ **Business Registration**: Added "16472991 Canada INC." to invoice headers
- ✅ **Print Quality**: Improved print CSS to minimize browser headers/footers
- ✅ **Error Fixes**: Resolved invoice printing runtime errors
- ✅ **Brand Consistency**: Applied GT brand colors throughout invoices

### August 2025 - Tire System Improvements & UI Enhancements
- ✅ **Tire Model Field Removal**: Eliminated tire model field from schema to simplify tire identification
- ✅ **Image Display Fixes**: Fixed tire image sizing issues in both table and grid views
- ✅ **Table View Enhancement**: Replaced tire images with emoji-based type indicators for cleaner display
- ✅ **Invoice Display Fix**: Resolved "undefined" issue when adding tires to invoices
- ✅ **Schema Migration**: Completed database migration removing model field (20250825151521)
- ✅ **Display Format Update**: Changed tire display from "Brand Model - Size" to "Brand - Size"
- ✅ **Visual Type System**: Implemented emoji-based tire type indicators (🌤️ All Season, ❄️ Winter, etc.)

---

**Last Updated: August 26, 2025 - TypeScript build system fixes and development environment stability
**Note:** For detailed information on any topic, refer to the specific documentation file linked above.
