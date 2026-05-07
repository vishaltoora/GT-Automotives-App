# AGENTS.md - GT Automotives Codex Guidance

This file provides guidance to Codex when working with the GT Automotives application. Claude Code continues to use `CLAUDE.md`; Codex uses this `AGENTS.md` companion so both assistants can share the same project rules and documentation.

## Quick Reference

### 🚨 Critical Rules
- **[Environment Variables](.claude/rules/environment-variables.md)** - **CRITICAL**: Always use `import.meta.env.VITE_*` in frontend, NEVER `process.env.VITE_*`
- **[Migration Management](.claude/agents/migration-manager.md)** - **CRITICAL**: NEVER modify schema.prisma without creating migrations first ⭐ NEW
- **Database Migrations** - **CRITICAL**: NEVER use `prisma db push` - ALWAYS use `prisma migrate dev` for local and `prisma migrate deploy` for production. Using `db push` causes schema drift between local and production databases, leading to failed deployments and data issues.

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
- **[Fluid Typography Implementation](.claude/docs/fluid-typography-implementation.md)** - Modern responsive typography with CSS clamp() ⭐ NEW
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
- **[GHCR Migration Guide](.claude/docs/ghcr-migration.md)** - Migration from Azure Container Registry to GitHub Container Registry (saves $5-7/mo) ⭐ NEW
- **[Docker Optimization](.claude/docs/docker-optimization.md)** - Docker image optimization strategy (87% size reduction) ⭐ NEW
- **[Docker Build Troubleshooting](.claude/docs/docker-build-troubleshooting.md)** - Docker build errors and solutions ⭐ NEW
- **[Production Deployment Checklist](.claude/docs/production-deployment-checklist.md)** - Complete deployment verification checklist
- **[Security](.claude/docs/security.md)** - Security measures, authentication, and best practices
- **[Performance](.claude/docs/performance.md)** - Performance optimization strategies and monitoring
- **[Testing](.claude/docs/testing.md)** - Testing strategy, frameworks, and best practices
- **[Troubleshooting](.claude/docs/troubleshooting.md)** - Common issues and solutions (includes crash loop resolution)
- **[Completed Work](.claude/docs/completed-work.md)** - Detailed log of implemented features
- **[SMS Integration Plan](.claude/docs/sms-integration-plan.md)** - Complete SMS/text messaging integration with Telnyx (Issue #60) ⭐ NEW

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
- **Backend Direct:** https://gt-automotives-backend-api.azurewebsites.net ✅
- **Frontend Hosting:** Azure Web App B1 with integrated reverse proxy ✅
- **Backend Hosting:** Azure Web App **B1** (Docker container 1.5GB - optimized) ✅
- **Docker Optimization:** 87% size reduction (11.5GB → 1.5GB) + B1 downgrade ✅
- **Authentication:** Clerk Custom Domain (clerk.gt-automotives.com) ✅
- **Security:** Mixed Content errors resolved ✅
- **Progress:** 6 of 8 Epics Complete (75%)
- **Next:** EPIC-06 - Appointment Scheduling
- **Dev Frontend:** http://localhost:4500 (with Clerk Auth)
- **Dev Backend:** http://localhost:3000/api
- **Admin User:** vishal.alawalpuria@gmail.com
- **SSL/DNS:** Namecheap DNS + Azure SSL + Clerk Certificates
- **Deployment:** Two-Step GitHub Actions CI/CD ✅
- **Container Registry:** GitHub Container Registry (FREE) ✅
- **Monthly Cost:** $42-47 (Frontend B1 $13 + Backend **B1** $13 + DB $16-21) 💰
- **Savings Achieved:** $156/year from B2 → B1 downgrade ✅

## 🔑 Key Information

### Five User Roles
1. **Customer** - Self-service portal (`/customer/*`)
2. **Staff** - Operational dashboard (`/staff/*`)
3. **Supervisor** - Elevated permissions (`/supervisor/*`)
4. **Accountant** - Financial access (`/accountant/*`)
5. **Admin** - Full system control (`/admin/*`)

### Technology Highlights
- **Frontend:** React 18 + TypeScript + Material-UI
- **Backend:** NestJS + Clerk Auth + PostgreSQL
- **Monorepo:** Nx workspace with shared libraries
- **Theme:** Custom branding with GT logo animations

### Important Commands
```bash
# Development
yarn dev           # Start both frontend and backend
yarn db:studio     # Open Prisma Studio
yarn nx reset      # Clear Nx cache
yarn lint          # Run linting
yarn test          # Run tests

# Deployment (Two-Step Process)
# Step 1: Push to main triggers GT-Automotive-Build (automatic)
git push origin main

# Step 2: Manually deploy via GitHub Actions UI
# Go to: Actions → GT-Automotive-Deploy → Run workflow
# Enter build number from Step 1
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
- **Migration Manager** (`.claude/agents/migration-manager.md`) - **CRITICAL**: Enforces proper database migration workflows
- **Migration Enforcement** (`.claude/workflows/migration-enforcement.md`) - Automated migration validation and CI/CD integration
- **SMS Feature Manager** (`.claude/agents/sms-feature-manager.md`) - Complete SMS/text messaging management and troubleshooting ⭐ NEW
- **DTO Manager** (`.claude/agents/dto-manager.md`) - Creates and manages DTOs with class-validator
- **Enhanced Git Workflows** (`.claude/scripts/git-workflows-enhanced.sh`) - Build-validated git operations
- **Integration Workflows** (`.claude/workflows/dto-git-integration.md`) - Combined DTO + Git workflows
- **Commands**:
  - `/dto create|update|validate|fix-imports` - DTO management commands
  - `/migration check|create|deploy|status|validate` - Migration management commands
  - `/sms test|history|preferences|troubleshoot` - SMS feature management ⭐ NEW

## ⚠️ Critical Rules
- Customers see ONLY their own data
- Staff cannot modify prices
- Financial reports are admin-only
- All authentication flows use Clerk (or MockClerkProvider in dev)
- Invoice printing must support 8.5x11, thermal, and PDF formats
- **Never use browser dialogs** (window.alert, window.confirm) - use custom dialog system
- **All errors must use ErrorContext** for consistent user experience

---

## Recent Updates

See `CLAUDE.md` and `.claude/docs/completed-work.md` for the detailed historical changelog. Keep this Codex guidance focused on current project rules.

## Essential Migration Commands

### Codex Skills and Claude Slash Commands

In Codex, use the generated skills in `.agents/skills/` for the same workflows. In Claude Code, the original slash commands remain available from `.claude/commands/`.

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
DATABASE_URL="$PRODUCTION_DATABASE_URL" yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma
```


<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors


<!-- nx configuration end-->
