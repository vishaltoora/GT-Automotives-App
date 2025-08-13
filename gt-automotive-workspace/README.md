# GT Automotive Management System

A comprehensive web application for managing a small business that sells new and used tires and provides automotive mechanical services.

## Features

- **Three-Role System**: Customer, Staff, and Admin interfaces with role-based permissions
- **Tire Inventory Management**: Track new and used tire inventory with automatic stock management
- **Customer & Vehicle Tracking**: Complete customer database with vehicle information
- **Professional Invoicing**: Generate and print invoices in multiple formats (8.5x11, thermal, PDF)
- **Appointment Scheduling**: Online booking system with automated reminders
- **Business Analytics**: Comprehensive reporting and analytics (admin-only)

## Tech Stack

- **Monorepo**: Nx workspace
- **Frontend**: React 18 + TypeScript + Material UI
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk (identity verification)
- **Authorization**: Local role & permission management
- **Validation**: Yup schemas
- **State Management**: React Query

## Project Structure

```
gt-automotive-workspace/
├── apps/
│   ├── webApp/          # React frontend application
│   └── server/          # NestJS backend API
├── libs/
│   ├── shared/
│   │   ├── dto/         # Shared DTOs
│   │   ├── validation/  # Yup validation schemas
│   │   └── interfaces/  # TypeScript interfaces
│   └── database/        # Prisma database library
├── docker-compose.yml   # PostgreSQL development setup
└── .env.example        # Environment variables template
```

## Prerequisites

- Node.js 18+ 
- yarn 1.22+
- Docker & Docker Compose (for PostgreSQL)
- Clerk account (for authentication)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/vishaltoora/GT-Automotives-App.git
cd GT-Automotives-App/gt-automotive-workspace

# Install dependencies
yarn install
```

### 2. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Wait for database to be ready
sleep 5

# Generate Prisma client
yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma

# Run database migrations
yarn prisma migrate dev --schema=libs/database/src/lib/prisma/schema.prisma --name init
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Clerk API keys:
# - VITE_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - CLERK_WEBHOOK_SECRET
```

### 4. Clerk Setup

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys to `.env`
4. Configure webhook endpoint: `http://localhost:3333/webhooks/clerk`
5. Select webhook events: `user.created`, `user.updated`, `user.deleted`

### 5. Seed Database (Optional)

```bash
# Create initial roles and permissions
yarn prisma db seed --schema=libs/database/src/lib/prisma/schema.prisma
```

### 6. Start Development Servers

```bash
# Start both frontend and backend
yarn dev

# Or start individually:
yarn dev:web    # Frontend on http://localhost:4200
yarn dev:server # Backend on http://localhost:3333
```

## Available Scripts

```bash
# Development
yarn dev              # Start all services
yarn dev:web          # Start frontend only
yarn dev:server       # Start backend only

# Database
yarn db:generate      # Generate Prisma client
yarn db:migrate       # Run migrations
yarn db:seed          # Seed database
yarn db:studio        # Open Prisma Studio

# Testing
yarn test             # Run all tests
yarn test:web         # Test frontend
yarn test:server      # Test backend

# Building
yarn build            # Build all apps
yarn build:web        # Build frontend
yarn build:server     # Build backend

# Linting
yarn lint             # Lint all projects
yarn lint:fix         # Fix linting issues

# Nx Commands
yarn nx graph                 # View project dependency graph
yarn nx affected:test         # Test affected projects
yarn nx affected:build        # Build affected projects
```

## Development Workflow

### Adding a New Feature

1. Check which epic it belongs to in `/docs/epics/`
2. Verify role permissions needed
3. Create API endpoint with role checks
4. Build UI components for each role
5. Test with all three user types
6. Update documentation

### Testing Role Permissions

```typescript
// Test as Customer
- Can only see own data
- Cannot access staff/admin features

// Test as Staff  
- Can see all customer data
- Cannot see financial totals
- Cannot modify prices

// Test as Admin
- Has complete access
- Can manage users and roles
- Can view financial reports
```

## API Documentation

### Base URL
```
Development: http://localhost:3333
Production: https://api.gtautomotive.com
```

### Authentication
All API requests require a Bearer token from Clerk:
```
Authorization: Bearer <clerk-jwt-token>
```

### Main Endpoints

```
# Auth
GET    /auth/me              # Get current user with permissions

# Customers
GET    /customers            # List customers (role-based)
POST   /customers            # Create customer (staff/admin)
GET    /customers/:id        # Get customer details
PUT    /customers/:id        # Update customer
DELETE /customers/:id        # Delete customer (admin only)

# Vehicles
GET    /vehicles             # List vehicles
POST   /vehicles             # Create vehicle
PUT    /vehicles/:id         # Update vehicle
DELETE /vehicles/:id         # Delete vehicle

# Tires
GET    /tires                # List tire inventory
POST   /tires                # Add tire (admin only)
PUT    /tires/:id            # Update tire
DELETE /tires/:id            # Delete tire (admin only)

# Invoices
GET    /invoices             # List invoices (role-based)
POST   /invoices             # Create invoice (staff/admin)
GET    /invoices/:id         # Get invoice details
PUT    /invoices/:id         # Update invoice
DELETE /invoices/:id         # Delete invoice (admin only)

# Appointments
GET    /appointments         # List appointments (role-based)
POST   /appointments         # Create appointment
PUT    /appointments/:id     # Update appointment
DELETE /appointments/:id     # Delete appointment
```

## Database Management

### Access Database UI
```bash
# Option 1: Adminer (included in docker-compose)
open http://localhost:8080
# Server: postgres
# Username: postgres
# Password: postgres
# Database: gt_automotive

# Option 2: Prisma Studio
yarn prisma studio --schema=libs/database/src/lib/prisma/schema.prisma
```

### Reset Database
```bash
# Drop all tables and re-run migrations
yarn prisma migrate reset --schema=libs/database/src/lib/prisma/schema.prisma
```

## Deployment

### Production Build
```bash
# Build all applications
yarn build

# Frontend output: dist/apps/webApp
# Backend output: dist/apps/server
```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CLERK_SECRET_KEY=sk_live_...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Ensure Docker is running: `docker ps`
   - Check PostgreSQL logs: `docker logs gt_automotive_postgres`

2. **Clerk authentication not working**
   - Verify API keys in `.env`
   - Check webhook configuration in Clerk dashboard

3. **Prisma client errors**
   - Regenerate client: `yarn db:generate`
   - Check schema path is correct

4. **Port already in use**
   - Frontend: Change port in `apps/webApp/project.json`
   - Backend: Change port in `.env` (API_PORT)

## Contributing

1. Create a feature branch: `git checkout -b feature/epic-XX-description`
2. Make your changes
3. Run tests: `yarn test`
4. Commit: `git commit -m "Epic-XX: Add feature"`
5. Push: `git push origin feature/epic-XX-description`
6. Create pull request

## License

Private - GT Automotive

## Support

For questions or issues, contact the development team or create an issue in the [GitHub repository](https://github.com/vishaltoora/GT-Automotives-App/issues).