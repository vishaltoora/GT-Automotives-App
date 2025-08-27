# GT Automotive Management System

A comprehensive automotive service management application built for GT Automotive, featuring tire inventory management, customer relationship management, invoicing, and user administration.

![GT Automotive](apps/webApp/src/app/images-and-logos/logo.png)

## 🚀 Current Status

- **EPIC-01:** ✅ Project Setup & Infrastructure (Complete - Aug 15, 2025)
- **EPIC-02:** ✅ User Authentication & Management (Complete - Aug 27, 2025)
- **EPIC-03:** ✅ Tire Inventory Management (Complete - Aug 16, 2025)
- **EPIC-04:** ✅ Customer & Vehicle Management (Complete - Aug 17, 2025)
- **EPIC-05:** ✅ Invoicing System (Complete - Aug 19, 2025)
- **Progress:** 5 of 8 epics complete (62.5% MVP)
- **Latest:** Complete user management system with professional admin interface, branded authentication, and Material-UI Grid modernization

## 📞 Contact Information

- **Main Phone:** (250) 570-2333
- **Email:** gt-automotives@outlook.com
- **Team Contacts:**
  - Johny (Mechanic/Tire Specialist): (250) 986-9191
  - Harjinder Gill (Sales/Marketing): (250) 565-1571
  - Vishal (Sales/Marketing): (250) 649-9699
  - Karan (Tire Specialist): (250) 986-9794

## 📌 Features

### Implemented
- ✅ **Three-Role Authentication System**: Customer, Staff, and Admin with role-based permissions
- ✅ **Repository Pattern**: Clean architecture with separated database logic
- ✅ **Role-Based Routing**: Protected routes with automatic redirects
- ✅ **Audit Logging**: Track all admin actions
- ✅ **Development Mode**: Runs without Clerk API keys for easy setup
- ✅ **Tire Inventory Management**: Full CRUD with stock tracking and low stock alerts
- ✅ **Customer Management**: Complete customer profiles with contact information
- ✅ **Vehicle Tracking**: Vehicle database with VIN validation and mileage tracking
- ✅ **Customer-Vehicle Relationships**: Properly linked with referential integrity
- ✅ **Advanced Search & Filter**: Multi-criteria search for inventory, customers, and vehicles
- ✅ **Statistics & Reports**: Customer spending, vehicle service history, inventory metrics
- ✅ **Public Website**: Professional landing pages with animated hero sections
- ✅ **Modern UI**: All pages feature animated GT logo with floating service icons
- ✅ **MUI Grid2**: Updated to latest Material-UI Grid syntax across all components
- ✅ **Mobile Tire Service**: Complete pricing structure with work hours and emergency rates
- ✅ **Service Area Coverage**: 20km free service zone with detailed area listings

### Recent Updates (August 27, 2025)
- ✅ **Complete User Management System**: Professional admin interface for creating and managing staff/admin users
- ✅ **Enhanced Authentication**: Username/email dual login with branded GT Automotive login page
- ✅ **Material-UI Grid Modernization**: Updated all Grid components to modern `size` prop syntax
- ✅ **Professional UI Components**: CreateUserDialog and EditUserDialog with comprehensive validation
- ✅ **Security Enhancements**: Admin-only user creation, disabled public registration
- ✅ **Build System Fixes**: Resolved all TypeScript compilation errors, production builds working
- ✅ **Documentation**: Comprehensive API documentation and user management guides

### In Development
- 🔄 **Appointment Scheduling**: Online booking with reminders

### Planned
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
│   │       │   │   └── public/  # Public-facing pages
│   │       │   ├── components/  # Reusable components
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

## 🗺️ Service Areas (20km Free Zone)

### North & Northeast
- Hart Highway (to Salmon Valley)
- Chief Lake Road Area
- North Nechako
- Cranbrook Hill

### South & Southwest
- Pineview
- Buckhorn
- West Lake
- Blackwater

### East & Southeast
- Upper Fraser
- Tabor Lake
- Red Rock
- Mud River

### West & Northwest
- Miworth
- Beaverly
- North Kelly
- West Austin

**City Areas**: All neighborhoods within Prince George city limits including Downtown, College Heights, VLA, Heritage, Spruceland, Foothills, Crescents, Lakewood, and Charella Gardens.

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
yarn install
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
yarn db:seed
```

### 3. Start Development

```bash
# Start both frontend and backend
yarn dev

# Or use separate terminals:
# Terminal 1:
yarn dev:server

# Terminal 2:
yarn dev:web
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

### Tire Inventory
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/tires` | List all tires | All |
| POST | `/api/tires` | Add tire | Staff/Admin |
| PUT | `/api/tires/:id` | Update tire | Staff/Admin |
| DELETE | `/api/tires/:id` | Delete tire | Admin |
| POST | `/api/tires/:id/adjust-stock` | Adjust stock | Staff/Admin |

### Customers & Vehicles
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/customers` | List customers | Staff/Admin |
| POST | `/api/customers` | Add customer | Staff/Admin |
| GET | `/api/vehicles` | List vehicles | Staff/Admin |
| POST | `/api/vehicles` | Add vehicle | Staff/Admin |

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
yarn install --ignore-engines
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

### Server Stops on File Changes
This is normal behavior during development. Simply restart with:
```bash
yarn dev
```

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

**Last Updated:** August 27, 2025 | **Version:** 2.0.0 | **Status:** Active Development - User Management & Grid Modernization Complete