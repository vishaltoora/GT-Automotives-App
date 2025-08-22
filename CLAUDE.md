# CLAUDE.md - GT Automotive Documentation Index

This file provides guidance to Claude Code (claude.ai/code) when working with the GT Automotive application. Documentation has been modularized for better performance.

## Quick Reference

### 📁 Documentation Structure
- **[Project Overview](.claude/docs/project-overview.md)** - Application summary, status, and roadmap
- **[Authentication](.claude/docs/authentication.md)** - Clerk setup, user roles, and permissions
- **[Tech Stack](.claude/docs/tech-stack.md)** - Technologies, frameworks, and architecture
- **[Development Setup](.claude/docs/development-setup.md)** - Environment setup and commands
- **[Development Guidelines](.claude/docs/development-guidelines.md)** - Code style, patterns, and best practices
- **[Business Rules](.claude/docs/business-rules.md)** - Requirements and domain logic
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

---

## 🔄 Recent Updates

### December 2024 - Invoice Printing Enhancements
- ✅ **Logo Integration**: Implemented actual GT logo from `/images-and-logos/logo.png`
- ✅ **Business Registration**: Added "16472991 Canada INC." to invoice headers
- ✅ **Print Quality**: Improved print CSS to minimize browser headers/footers
- ✅ **Error Fixes**: Resolved invoice printing runtime errors
- ✅ **Brand Consistency**: Applied GT brand colors throughout invoices

---

**Last Updated:** December 2024 - Invoice printing enhancements completed
**Note:** For detailed information on any topic, refer to the specific documentation file linked above.