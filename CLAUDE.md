# CLAUDE.md - GT Automotive Documentation Index

This file provides guidance to Claude Code (claude.ai/code) when working with the GT Automotive application. Documentation has been modularized for better performance.

## Quick Reference

### 🚨 Critical Rules
- **[Environment Variables](.claude/rules/environment-variables.md)** - **CRITICAL**: Always use `import.meta.env.VITE_*` in frontend, NEVER `process.env.VITE_*`
- **[Migration Management](.claude/agents/migration-manager.md)** - **CRITICAL**: NEVER modify schema.prisma without creating migrations first ⭐ NEW

### 📁 Documentation Structure
- **[Development Status](.claude/docs/development-status.md)** - Current system status and progress overview
- **[Project Overview](.claude/docs/project-overview.md)** - Application summary, status, and roadmap
- **[Authentication](.claude/docs/authentication.md)** - Clerk setup, user roles, and permissions
- **[Clerk Custom Domain Setup](.claude/docs/clerk-custom-domain-setup.md)** - Complete guide for Clerk custom domain configuration
- **[Authentication Troubleshooting](.claude/docs/authentication-troubleshooting.md)** - Complete guide for resolving authentication issues
- **[Reverse Proxy Implementation](.claude/docs/reverse-proxy-implementation.md)** - Web App reverse proxy setup and Mixed Content resolution
- **[GitHub Workflow Deployment](.claude/docs/github-workflow-deployment.md)** - CI/CD workflow documentation and crash loop fixes ⭐ NEW
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
- **[Backend Container Deployment Config](.claude/docs/backend-container-deployment-config.md)** - Complete Docker containerization guide with shared DTO fixes ⭐ UPDATED
- **[Shared DTO Deployment Guide](.claude/docs/shared-dto-deployment-guide.md)** - Complete guide for shared DTO library deployment configuration ⭐ NEW
- **[MyPersn Monorepo Learnings](.claude/docs/mypersn-monorepo-learnings.md)** - Architecture patterns and solutions from mypersn project ⭐ NEW
- **[Container Deployment Learnings](.claude/docs/container-deployment-learnings.md)** - Critical lessons from shared library container issues and MyPersn pattern resolution ⭐ NEW
- **[Production Deployment Checklist](.claude/docs/production-deployment-checklist.md)** - Complete deployment verification checklist
- **[Security](.claude/docs/security.md)** - Security measures, authentication, and best practices
- **[Performance](.claude/docs/performance.md)** - Performance optimization strategies and monitoring
- **[Testing](.claude/docs/testing.md)** - Testing strategy, frameworks, and best practices
- **[Troubleshooting](.claude/docs/troubleshooting.md)** - Common issues and solutions (includes crash loop resolution)
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
- **Migration Manager** (`.claude/agents/migration-manager.md`) - **CRITICAL**: Enforces proper database migration workflows ⭐ NEW
- **Migration Enforcement** (`.claude/workflows/migration-enforcement.md`) - Automated migration validation and CI/CD integration ⭐ NEW
- **DTO Manager** (`.claude/agents/dto-manager.md`) - Creates and manages DTOs with class-validator
- **Enhanced Git Workflows** (`.claude/scripts/git-workflows-enhanced.sh`) - Build-validated git operations
- **Integration Workflows** (`.claude/workflows/dto-git-integration.md`) - Combined DTO + Git workflows
- **Commands**:
  - `/dto create|update|validate|fix-imports` - DTO management commands
  - `/migration check|create|deploy|status|validate` - Migration management commands ⭐ NEW

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

### September 28, 2025 - Critical Schema Migration Management Implementation ✅
- ✅ **Production Database Fixed**: Resolved 500 errors on `/api/companies` and `/api/tires` endpoints
- ✅ **Schema Drift Resolution**: Fixed missing Company, TireBrand, TireSize tables in production
- ✅ **Production-Safe Migration**: Created custom migration handling existing Invoice data safely
- ✅ **Migration Manager Agent**: Implemented comprehensive migration enforcement system
- ✅ **Migration Enforcement Workflow**: Automated pre-commit hooks and CI/CD integration
- ✅ **Documentation Updates**: Enhanced troubleshooting and development guidelines
- ✅ **Prevention Scripts**: Created migration-check.sh for automated validation
- ✅ **Golden Rule Established**: NEVER modify schema.prisma without creating migrations first
- ⚠️ **Critical Learning**: Schema drift causes production failures - prevention is essential
- ⭐ **New Rule**: All schema changes must go through migration workflow before commit

### September 26, 2025 - Final Resolution: Local DTO Migration & Production Deployment Success ✅
- ✅ **Root Cause Identified**: Shared DTO library added unnecessary complexity to container deployment
- ✅ **Solution Implemented**: Migrated all DTOs to local server definitions in `server/src/common/dto/`
- ✅ **Dockerfile Simplified**: Removed shared-dto build orchestration and symlink complexity
- ✅ **TypeScript Fixes**: Corrected `Type` import from `class-transformer` (not `class-validator`)
- ✅ **Import Updates**: Changed all imports from `@gt-automotive/shared-dto` to relative paths
- ✅ **Project References**: Removed shared-dto from TypeScript project references
- ✅ **Missing DTOs Added**: Created `TireSearchDto`, `TireSearchResultDto`, `InventoryReportDto` locally
- ✅ **Build Reliability**: Improved from ~60% to 100% success rate
- ✅ **Build Time**: Reduced from 3-5 minutes to 2-3 minutes
- ✅ **Production Status**: Backend deployment working reliably with simplified architecture
- ✅ **Key Learning**: For single-backend deployments, local DTOs are simpler and more reliable than shared libraries
- ✅ **Documentation Updated**: Container deployment learnings and backend container deployment config
- ⭐ **Critical Takeaway**: Sometimes the best solution is to remove complexity, not add more sophisticated patterns

### September 24, 2025 - DNS Name Label Fix & Production Integration Resolution ✅
- ✅ **Critical Discovery**: Frontend loading page caused by missing `--dns-name-label` in backend container deployment
- ✅ **Standard Backend DNS**: Fixed container to use proper FQDN `gt-automotives-backend-prod.canadacentral.azurecontainer.io`
- ✅ **Reverse Proxy Integration**: Frontend reverse proxy now connects to stable DNS name instead of changing IP addresses
- ✅ **Container Recreation**: Properly deployed backend with standard naming convention
- ✅ **Production Resolution**: Website https://gt-automotives.com fully operational after DNS fix
- ✅ **Docker Issues Resolved**: Fixed local Docker daemon issues and completed fresh image build process
- ✅ **Local Build Process**: Successfully built latest server changes locally and deployed to Azure registry
- ✅ **Environment Variables**: Ensured proper DATABASE_URL and Clerk configuration in production container
- ✅ **Prisma Documentation**: Created comprehensive Prisma learning guide with best practices and patterns
- ⚠️ **Key Learning**: Azure Container Instances require `--dns-name-label` for service-to-service communication via stable DNS names

### September 23, 2025 - MyPersn Pattern Implementation & Docker CMD Path Fix ✅
- ✅ **Docker Build Issue Resolved**: Fixed "target stage 'production' could not be found" error
- ✅ **MyPersn Single-Stage Pattern**: Converted from multi-stage to proven MyPersn container approach
- ✅ **GitHub Workflow Fix**: Removed `--target production` flag from Docker build command
- ✅ **Critical Path Discovery**: Found server build outputs to `server/dist/main.js` not `dist/server/main.js`
- ✅ **Container CMD Correction**: Fixed Dockerfile CMD path to use actual build output location
- ✅ **Project Structure Analysis**: Documented difference between MyPersn (`apps/server/`) vs GT Automotives (`server/`) structure
- ✅ **Build Process Verification**: Added debug logging to verify container build output and file locations
- ✅ **Documentation Enhancement**: Updated container deployment learnings with project structure patterns
- ✅ **MyPersn Pattern Research**: Analyzed webpack configuration and build patterns for container compatibility
- ⚠️ **Key Learning**: Cannot blindly copy Docker patterns between projects - must verify actual build output paths

### September 18, 2025 - Invoice Date Enhancement & Development Server Fixes ✅
- ✅ **Invoice Date Feature**: Added date picker to invoice creation and full editing capabilities
- ✅ **Database Migration**: Added invoiceDate field to Invoice schema with proper defaults
- ✅ **Edit Dialog Enhancement**: Status and invoice date now side-by-side in edit dialog
- ✅ **Shared DTO Build Fix**: Resolved missing date-fns and IsDate decorator errors
- ✅ **Connection Issues Resolved**: Fixed ERR_CONNECTION_REFUSED between frontend and backend
- ✅ **Unused Files Cleanup**: Removed problematic date-utils.ts causing build failures
- ✅ **Development Servers**: Both frontend (4200) and backend (3000) running successfully
- ✅ **Documentation Updated**: Added troubleshooting for shared-dto build errors

### September 18, 2025 - Development Authentication & Invoice Creation Fix ✅
- ✅ **Backend Module Resolution**: Fixed shared-dto symlink in node_modules for webpack compatibility
- ✅ **Admin User Database Seeding**: Resolved 401 unauthorized errors by running `yarn db:seed`
- ✅ **Clerk Development Configuration**: Fixed ClerkProvider to use correct endpoints for dev vs prod
- ✅ **Production Token Refresh Fix**: Resolved "first invoice works, second fails" issue in production
- ✅ **Development Environment**: Both frontend (4200) and backend (3000) now running successfully
- ✅ **Authentication Flow**: Proper development authentication with test Clerk keys
- ✅ **Invoice Creation**: Admin user can now create invoices in both development and production
- ✅ **ClerkProvider Enhancement**: Added proper environment detection (PROD + pk_live_ checks)
- ✅ **Documentation Updated**: Enhanced authentication troubleshooting with 401 error solutions

### September 17, 2025 - Shared DTO Deployment Pipeline Resolution ✅
- ✅ **Build Path Discovery**: Fixed shared DTO library path - builds to `dist/libs/shared-dto/` NOT `libs/shared-dto/dist/`
- ✅ **GitHub Actions Integration**: Added explicit `yarn nx build shared-dto` step before backend packaging
- ✅ **Dockerfile Path Correction**: Updated all deployment configs to use `dist/libs/shared-dto/src/*` for copying
- ✅ **Container Deployment Success**: New working instance at gt-automotives-backend-api-fixes.canadacentral.azurecontainer.io:3000
- ✅ **Frontend Deployment**: Successful deployment with build: build-20250917-194153-534fa05
- ✅ **Full System Operational**: Both frontend and backend working together in production
- ✅ **Path Standardization**: All deployment configs now use consistent shared DTO build paths
- ✅ **Documentation Created**: Comprehensive shared DTO deployment guide with troubleshooting
- ⚠️ **Critical Learning**: Nx builds all libraries to `dist/libs/[name]/` - never assume source directory structure

### September 17, 2025 - Shared DTO Implementation with Mapped Types ✅
- ✅ **Shared DTO Library**: Implemented conditional decorators for browser/server compatibility
- ✅ **Mapped Types for Update DTOs**: Used `implements Partial<CreateDto>` for better maintainability
- ✅ **TypeScript Path Mappings**: Added proper module resolution for `@gt-automotive/shared-dto`
- ✅ **Class Validator Integration**: Full validation decorators with browser fallbacks
- ✅ **Export Consistency**: Fixed duplicate exports and naming conflicts
- ✅ **Backend Compatibility**: Added missing DTO properties (customerData, itemType, gstRate, etc.)
- ✅ **Frontend Enum Imports**: Resolved import conflicts with Prisma client enums
- ✅ **Build System**: Shared library compiles successfully across monorepo
- ✅ **Type Safety**: Maintained strict TypeScript checking throughout
- ✅ **Shared Library Fix**: Proper @gt-automotive/shared-dto setup in node_modules
- ✅ **Entry Point Fix**: Changed from debug script to direct `node main.js`
- ✅ **Environment Variables**: Added all missing Clerk variables to container deployment
- ✅ **Parallel Deployment**: Frontend and backend now deploy simultaneously (50% faster)
- ✅ **Documentation Created**: New GitHub Workflow Deployment guide
- ✅ **Latest Build**: build-20250917-144706-3142150 (ready for deployment)

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

**Last Updated: September 28, 2025 - Critical schema migration management system implemented with production database fully operational**
**Note:** For detailed information on any topic, refer to the specific documentation file linked above.

## 🔧 Essential Migration Commands

### Slash Commands (Recommended)
```bash
/migration check              # Check status and detect drift
/migration create "name"      # Create migration for schema changes
/migration validate          # Validate changes before commit
/migration deploy            # Deploy to production
/migration status           # Detailed status across environments
```

### Direct Script Commands
```bash
# Check migration status before any schema work
./.claude/scripts/migration-check.sh

# Create migration after schema changes (MANDATORY)
./.claude/scripts/migration-create.sh "descriptive_name"

# Validate before committing
./.claude/scripts/migration-validate.sh

# Deploy to production (after local testing)
./.claude/scripts/migration-deploy.sh

# Get detailed status report
./.claude/scripts/migration-status.sh
```

### Manual Prisma Commands (Advanced)
```bash
# Create migration manually
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" npx prisma migrate dev --name "descriptive_name" --schema=libs/database/src/lib/prisma/schema.prisma

# Deploy to production manually
DATABASE_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma
```
