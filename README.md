# GT Automotive Management System

A comprehensive web application for managing a small business that sells new and used tires and provides automotive mechanical services.

## 🚀 Current Status

- **EPIC-01:** ✅ Project Setup & Infrastructure (Complete - Aug 15, 2025)
- **EPIC-02:** ✅ User Authentication & Management (Complete - Aug 15, 2025)
- **EPIC-03:** ✅ Tire Inventory Management (Complete - Aug 16, 2025)
- **EPIC-04:** 📅 Customer & Vehicle Management (Next)
- **Application:** Running with 3 of 8 epics complete

## 📌 Features

### Implemented
- ✅ **Three-Role Authentication System**: Customer, Staff, and Admin with role-based permissions
- ✅ **Repository Pattern**: Clean architecture with separated database logic
- ✅ **Role-Based Routing**: Protected routes with automatic redirects
- ✅ **Audit Logging**: Track all admin actions
- ✅ **Development Mode**: Runs without Clerk API keys for easy setup
- ✅ **Tire Inventory Management**: Full CRUD with stock tracking and low stock alerts
- ✅ **Advanced Search & Filter**: Multi-criteria search for inventory
- ✅ **Inventory Reports**: Financial metrics and analytics (admin-only)
- ✅ **Stock Adjustments**: Track all inventory changes with audit trail
- ✅ **Public Website**: Professional landing pages with services catalog

### In Development
- 🔄 **Customer & Vehicle Tracking**: Complete customer database
- 🔄 **Professional Invoicing**: Multiple print formats (8.5x11, thermal, PDF)

### Planned
- 📋 **Appointment Scheduling**: Online booking with reminders
- 📋 **Business Analytics**: Comprehensive reporting dashboards
- 📋 **Customer Portal**: Self-service interface for customers

## 🛠 Tech Stack

- **Monorepo**: Nx workspace
- **Frontend**: React 18 + TypeScript + Material UI
- **Backend**: NestJS + TypeScript + Repository Pattern
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk (optional) + JWT
- **State Management**: React Query + Context API
- **Validation**: Class-validator + Yup schemas

## 📁 Project Structure

```
gt-automotives-app/
├── apps/
│   ├── webApp/              # React frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── guards/      # Auth & Role guards
│   │       │   ├── hooks/       # Custom hooks
│   │       │   ├── layouts/     # Role-based layouts
│   │       │   ├── pages/       # Route pages
│   │       │   └── providers/   # Context providers
│   │       └── main.tsx
│   └── server/              # NestJS backend
│       └── src/
│           ├── auth/        # Authentication module
│           ├── users/       # User management
│           ├── roles/       # Role management
│           └── audit/       # Audit logging
├── libs/
│   ├── shared/
│   │   ├── dto/            # Data transfer objects
│   │   ├── validation/     # Validation schemas
│   │   └── interfaces/     # TypeScript interfaces
│   └── database/           # Prisma ORM
├── docker-compose.yml      # PostgreSQL setup
└── docs/                   # Documentation
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ (v20.13.1 recommended)
- Yarn 1.22+
- PostgreSQL 13+ (local or Docker)
- Git

### 1. Clone and Install

```bash
git clone https://github.com/vishaltoora/GT-Automotives-App.git
cd gt-automotives-app
npm install --legacy-peer-deps
```

### 2. Database Setup

```bash
# Option 1: Using Docker
yarn docker:up

# Option 2: Use local PostgreSQL
# Update DATABASE_URL in server/.env

# Generate Prisma client
yarn db:generate

# Run migrations
yarn db:migrate

# Seed with test data
NODE_ENV=development yarn db:seed
```

### 3. Start Development (No Clerk Required)

```bash
# Start both frontend and backend
npx nx serve server &
npx nx serve webApp

# Or use separate terminals:
# Terminal 1:
npx nx serve server

# Terminal 2:
npx nx serve webApp
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api

### 4. Test Users (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gtautomotive.com | Admin@123 |
| Staff | staff@gtautomotive.com | Staff@123 |
| Customer | customer@example.com | Customer@123 |

## 🔐 Authentication Setup (Optional)

The app works without Clerk, but for full authentication:

### 1. Get Clerk API Keys
1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys

### 2. Configure Environment

Create `apps/webApp/.env.local`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Create `server/.env`:
```env
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your-secret-key
```

### 3. Configure Webhook
- Endpoint: `http://localhost:3000/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

## 📝 Available Scripts

```bash
# Development
yarn dev              # Start all services
yarn dev:web          # Frontend only
yarn dev:server       # Backend only

# Database
yarn db:generate      # Generate Prisma client
yarn db:migrate       # Run migrations
yarn db:seed          # Seed test data
yarn db:studio        # Prisma Studio GUI

# Testing
yarn test             # Run all tests
yarn lint             # Lint code
yarn typecheck        # Type checking

# Building
yarn build            # Build all apps
yarn build:web        # Build frontend
yarn build:server     # Build backend

# Nx Commands
npx nx graph          # View dependency graph
npx nx affected:test  # Test affected projects
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Local login | No |
| POST | `/api/auth/register` | Customer registration | No |
| GET | `/api/auth/me` | Get current user | Yes |

### User Management
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/users` | List all users | Staff/Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| PUT | `/api/users/:id/role` | Assign role | Admin |
| DELETE | `/api/users/:id` | Deactivate user | Admin |

## 🏗 Repository Pattern

The backend uses a clean repository pattern:

```typescript
// Service Layer (Business Logic)
UsersService → UserRepository → Prisma → Database

// Example:
class UsersService {
  constructor(private userRepository: UserRepository) {}
  
  async findAll() {
    return this.userRepository.findAll();
  }
}
```

## 🛡 Role-Based Access

### Customer
- ✅ View own data (invoices, vehicles, appointments)
- ✅ Self-registration
- ❌ Cannot see other customers
- ❌ No access to staff/admin features

### Staff
- ✅ View all customers
- ✅ Create invoices
- ✅ Manage inventory (no prices)
- ❌ Cannot see financial reports
- ❌ Cannot manage users

### Admin
- ✅ Full system access
- ✅ User management
- ✅ Financial reports
- ✅ Price controls
- ✅ All actions logged

## 🐛 Troubleshooting

### Node Version Issues
```bash
# If you see vite engine incompatibility:
npm install --legacy-peer-deps
```

### Lock File Conflicts
```bash
# Remove lock files and reinstall:
rm yarn.lock package-lock.json
npm install --legacy-peer-deps
```

### Database Connection
```bash
# Check PostgreSQL is running:
docker ps
# Or check local PostgreSQL:
psql -U postgres -d gt_automotive
```

### Ports in Use
- Frontend: Change in `apps/webApp/vite.config.ts`
- Backend: Change PORT in `server/.env`

## 📚 Documentation

- [Project Roadmap](docs/PROJECT_ROADMAP.md)
- [Role Permissions](docs/ROLE_PERMISSIONS.md)
- [GitHub Issues](https://github.com/vishaltoora/GT-Automotives-App/issues)
- [Epic Documentation](docs/epics/)
- [Claude AI Instructions](CLAUDE.md)

## 🤝 Contributing

1. Check open issues in GitHub
2. Create feature branch: `git checkout -b feature/epic-XX-description`
3. Follow existing code patterns
4. Test with all three roles
5. Create pull request

## 📄 License

Private - GT Automotive

## 💬 Support

- Create an issue in [GitHub](https://github.com/vishaltoora/GT-Automotives-App/issues)
- Check [CLAUDE.md](CLAUDE.md) for AI assistant instructions
- Review [docs/](docs/) for detailed documentation

---

**Last Updated:** August 15, 2025 | **Version:** 0.2.0 | **Status:** Active Development