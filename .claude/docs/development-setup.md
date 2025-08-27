# Development Setup

## Prerequisites
```bash
# Required software
- Node.js 18+
- PostgreSQL 13+
- Git
- Yarn 1.22+
```

## Environment Variables
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

## Initial Setup Commands
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

## Troubleshooting Commands
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
## Recent Build Fixes (August 2025)

The development environment has been stabilized with recent TypeScript and build system fixes:

- **Clean Builds**: All TypeScript compilation errors resolved
- **Module Compatibility**: Shared libraries properly configured for both frontend (Vite/ESM) and backend (Node.js/CommonJS) 
- **Enum Imports**: Tire-related components now import types directly from @prisma/client for better reliability
- **Development Servers**: Both servers start successfully with `yarn dev`

If you encounter build issues, try:
1. `yarn nx reset` - Clear Nx cache
2. `yarn build` - Verify production build works
3. Check that shared libraries use CommonJS module format


## Recent Build Fixes (August 2025)

The development environment has been stabilized with recent TypeScript and build system fixes:

- **Clean Builds**: All TypeScript compilation errors resolved
- **Module Compatibility**: Shared libraries properly configured for both frontend (Vite/ESM) and backend (Node.js/CommonJS) 
- **Enum Imports**: Tire-related components now import types directly from @prisma/client for better reliability
- **Development Servers**: Both servers start successfully with `yarn dev`

If you encounter build issues, try:
1. `yarn nx reset` - Clear Nx cache
2. `yarn build` - Verify production build works
3. Check that shared libraries use CommonJS module format

