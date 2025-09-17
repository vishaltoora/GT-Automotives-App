# CLAUDE.md - GT Automotive Documentation Index

This file provides guidance to Claude Code (claude.ai/code) when working with the GT Automotive application. Documentation has been modularized for better performance.

## Quick Reference

### 📁 Documentation Structure
- **[Development Status](.claude/docs/development-status.md)** - Current system status and progress overview
- **[Project Overview](.claude/docs/project-overview.md)** - Application summary, status, and roadmap
- **[Authentication](.claude/docs/authentication.md)** - Clerk setup, user roles, and permissions
- **[Clerk Custom Domain Setup](.claude/docs/clerk-custom-domain-setup.md)** - Complete guide for Clerk custom domain configuration
- **[Authentication Troubleshooting](.claude/docs/authentication-troubleshooting.md)** - Complete guide for resolving authentication issues
- **[Reverse Proxy Implementation](.claude/docs/reverse-proxy-implementation.md)** - Web App reverse proxy setup and Mixed Content resolution ⭐ NEW
- **[User Management](.claude/docs/user-management.md)** - Complete user management system documentation
- **[API Documentation](.claude/docs/api-documentation.md)** - Comprehensive REST API reference
- **[Grid Modernization](.claude/docs/grid-modernization.md)** - Material-UI Grid updates and best practices
- **[Tech Stack](.claude/docs/tech-stack.md)** - Technologies, frameworks, and architecture
- **[Development Setup](.claude/docs/development-setup.md)** - Environment setup and commands
- **[Development Guidelines](.claude/docs/development-guidelines.md)** - Code style, patterns, and best practices
- **[UI Components](.claude/docs/ui-components.md)** - Component documentation and usage guidelines
- **[Business Rules](.claude/docs/business-rules.md)** - Requirements and domain logic
- **[Customer Management Enhancements](.claude/docs/customer-management-enhancements.md)** - Recent B2B support and invoice improvements
- **[Azure Deployment Plan](.claude/docs/azure-deployment-plan.md)** - Azure App Service deployment architecture and configuration
- **[Azure Implementation Guide](.claude/docs/azure-implementation-guide.md)** - Step-by-step Azure deployment implementation
- **[Backend Container Deployment Config](.claude/docs/backend-container-deployment-config.md)** - Complete Docker containerization guide with architectural fixes ⭐ NEW
- **[Production Deployment Checklist](.claude/docs/production-deployment-checklist.md)** - Complete deployment verification checklist
- **[Security](.claude/docs/security.md)** - Security measures, authentication, and best practices
- **[Performance](.claude/docs/performance.md)** - Performance optimization strategies and monitoring
- **[Testing](.claude/docs/testing.md)** - Testing strategy, frameworks, and best practices
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
- **Production URL:** https://gt-automotives.com ✅ (HTTPS + Custom Auth Domain + Reverse Proxy)
- **Production WWW:** https://www.gt-automotives.com ✅
- **Backend API:** https://gt-automotives.com/api ✅ (Reverse Proxy to Internal HTTP)
- **Frontend Hosting:** Azure Web App with integrated reverse proxy ✅
- **Authentication:** Clerk Custom Domain (clerk.gt-automotives.com) ✅
- **Security:** Mixed Content errors resolved ✅
- **Progress:** 6 of 8 Epics Complete (75%)
- **Next:** EPIC-06 - Appointment Scheduling
- **Dev Frontend:** http://localhost:4200 (with Clerk Auth)
- **Dev Backend:** http://localhost:3000/api
- **Admin User:** vishal.alawalpuria@gmail.com
- **SSL/DNS:** Namecheap DNS + Azure SSL + Clerk Certificates
- **Deployment:** GitHub Actions CI/CD ✅

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
./deploy-frontend.sh  # Deploy to production
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

## 🤖 Specialized Agents & Workflows
- **DTO Manager** (`.claude/agents/dto-manager.md`) - Creates and manages DTOs with class-validator
- **Enhanced Git Workflows** (`.claude/scripts/git-workflows-enhanced.sh`) - Build-validated git operations  
- **Integration Workflows** (`.claude/workflows/dto-git-integration.md`) - Combined DTO + Git workflows
- **Commands**: `/dto create|update|validate|fix-imports` - DTO management commands

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

### September 16, 2025 - Clerk SDK Authorization Fix & Backend Deployment ✅
- ✅ **Clerk SDK Authorization Issue Resolved**: Fixed "Failed to create user in Clerk: Unauthorized" errors
- ✅ **Backend Code Updates**: Updated `users.service.ts` and `auth.service.ts` to use `createClerkClient` with proper configuration
- ✅ **Environment Variables**: Added missing `CLERK_API_URL=https://api.clerk.com` to production backend container
- ✅ **Container Redeployment**: Recreated Azure Container Instance with complete Clerk environment variable set
- ✅ **Authentication Flow Verified**: Login → Loading → Admin Dashboard redirect works properly
- ✅ **Debug Logging Enhanced**: Added comprehensive authentication state logging for future troubleshooting
- ✅ **Documentation Updated**: Enhanced authentication troubleshooting guide with Clerk SDK best practices
- ✅ **Root Cause**: Default `clerkClient` import doesn't include authentication configuration - requires explicit client creation
- ⚠️ **Known Issues**: User creation and POST request issues persist in both production and local environments (requires local debugging)

### September 15, 2025 - Backend Container Architecture Resolution & Azure Deployment ✅
- ✅ **Architecture Analysis**: Identified webpack bundling anti-pattern causing Prisma client failures
- ✅ **Webpack Externals Fix**: Configured externals for @prisma/client, .prisma/client, and @gt-automotive/shared-dto
- ✅ **Shared Library Resolution**: Fixed node_modules structure for monorepo shared libraries
- ✅ **Docker Optimization**: Switched from Alpine to node:20-slim for better Node.js compatibility
- ✅ **Container Deployment**: Successfully deployed to Azure Container Instances (gt-automotives-backend-working.canadacentral.azurecontainer.io:3000)
- ✅ **Health Verification**: Full API functionality confirmed with health endpoints responding correctly
- ✅ **Production Stability**: Resolved all CrashLoopBackOff issues and container initialization failures
- ✅ **Comprehensive Documentation**: Created complete backend container deployment configuration guide

### September 12, 2025 - Mixed Content Resolution & Reverse Proxy Implementation ✅
- ✅ **Mixed Content Errors Resolved**: Fixed HTTPS/HTTP blocking that prevented API communication
- ✅ **Web App Reverse Proxy**: Implemented Express.js proxy using http-proxy-middleware
- ✅ **GitHub Actions Update**: Modified deployment to create integrated proxy server
- ✅ **Frontend Configuration**: Updated API URL to use https://gt-automotives.com/api
- ✅ **Authentication Flow Fixed**: Resolved Clerk routing issues causing page reloads
- ✅ **SSL Termination**: Proper HTTPS for all external requests, internal HTTP communication
- ✅ **Security Architecture**: Complete HTTPS endpoint coverage eliminating browser security errors
- ✅ **Documentation**: Created comprehensive reverse proxy implementation guide

### September 11, 2025 - Production Deployment Complete with Custom Auth Domain ✅
- ✅ **Azure Web App Deployment**: Migrated from Azure Storage to Web App Service for better reliability
- ✅ **GitHub Actions CI/CD**: Automated deployment pipeline with proper Nx monorepo build support
- ✅ **Clerk Custom Domain Setup**: Successfully configured clerk.gt-automotives.com with full DNS verification
- ✅ **DNS Configuration**: Added 5 CNAME records in Namecheap for complete Clerk integration
- ✅ **SSL Certificates**: Automatic SSL provisioning for custom authentication domain
- ✅ **TypeScript Build Fixes**: Resolved Prisma type imports for CI/CD compatibility
- ✅ **Workflow Conflict Resolution**: Removed old conflicting deployment workflows
- ✅ **GitHub Secrets Management**: Configured production secrets for secure deployment
- ✅ **Authentication Working**: Full production authentication with custom domain operational
- ✅ **Documentation Updates**: Created comprehensive guides for Clerk custom domain and troubleshooting

### September 9, 2025 - Complete Production HTTPS Deployment ✅
- ✅ **Custom Domain HTTPS**: Successfully configured https://gt-automotives.com with SSL
- ✅ **Cloudflare Integration**: Flexible SSL mode with Page Rules for Azure Storage compatibility
- ✅ **Environment Variable Fix**: Updated getEnvVar utility for proper Vite environment variable access
- ✅ **Clerk Authentication**: Working on both local development and production with real Clerk provider
- ✅ **Frontend Rebuild**: Deployed latest build with Clerk authentication to Azure Storage
- ✅ **DNS Resolution**: Fixed nameserver configuration and DNS propagation
- ✅ **Security Architecture**: Maintained Azure backend/database isolation with Cloudflare SSL termination

### September 8, 2025 - Production Deployment & HTTPS Setup
- ✅ **Cloudflare SSL/CDN**: Complete HTTPS setup with custom domain (gt-automotives.com)
- ✅ **Azure Container Deployment**: Production backend deployed to Azure Container Instances
- ✅ **Frontend Deployment**: Static website hosting via Azure Storage with CDN
- ✅ **DNS Configuration**: Cloudflare DNS management and SSL certificate
- ✅ **Deployment Automation**: Created deploy-frontend.sh for streamlined deployments
- ✅ **Documentation Update**: Comprehensive production deployment guides

### September 5, 2025 - Azure Infrastructure Setup
- ✅ **Azure Resource Setup**: Resource group, database, container registry, and storage
- ✅ **Database Migration**: Azure PostgreSQL Flexible Server configuration
- ✅ **Container Registry**: Docker image management for backend deployment
- ✅ **Environment Configuration**: Production environment variables and secrets
- ✅ **Monitoring Foundation**: Basic health checks and logging setup

### September 4, 2025 - System Stability & Bug Fixes
- ✅ **Quotation System Fixes**: Resolved "Failed to load quotations" and update failures
- ✅ **Admin Layout Improvements**: Fixed full-height drawer and transparent app bar positioning
- ✅ **Dashboard Navigation**: Fixed broken quick navigation links and three-dot menus
- ✅ **Date Format Validation**: Improved ISO-8601 DateTime format handling
- ✅ **TypeScript Interface Consistency**: Unified Quotation → Quote type references
- ✅ **Modern Popover Menus**: Enhanced user experience with Material-UI popovers

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

**Last Updated: September 16, 2025 - Clerk SDK authorization issues resolved, user creation endpoint debugging pending**
**Note:** For detailed information on any topic, refer to the specific documentation file linked above.
