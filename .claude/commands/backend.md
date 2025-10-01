# Backend Commands

Backend development and management commands for the GT Automotive NestJS application.

## Usage
```
/backend <subcommand> [arguments]
```

## Available Commands

### Development Commands

#### `/backend start`
Start the backend development server with hot reload
```bash
yarn dev:server
```

#### `/backend build [environment]`
Build the backend application
- `dev` - Development build (default)
- `prod` - Production build
```bash
yarn nx build server
yarn nx build server --configuration=production
```

#### `/backend test [pattern]`
Run backend tests
```bash
yarn nx test server
yarn nx test server --testNamePattern="JobsService"
```

#### `/backend health`
Check backend health status and connectivity
```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/detailed
```

### Database Commands

#### `/backend db studio`
Open Prisma Studio for database management
```bash
yarn db:studio
```

#### `/backend db seed`
Seed the database with test data
```bash
yarn db:seed
```

#### `/backend db migrate [name]`
Create and apply a new database migration
```bash
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" \
npx prisma migrate dev --name "add_new_field" \
--schema=libs/database/src/lib/prisma/schema.prisma
```

#### `/backend db status`
Check database migration status
```bash
yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma
```

#### `/backend db reset`
Reset the database (development only)
```bash
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" \
npx prisma migrate reset --force --schema=libs/database/src/lib/prisma/schema.prisma
```

#### `/backend db deploy`
Deploy migrations to production
```bash
DATABASE_URL="production_url" \
yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma
```

### Code Generation Commands

#### `/backend service create <name>`
Create a new service with repository pattern
- Creates service class with dependency injection
- Creates repository interface and implementation
- Creates basic CRUD operations
- Updates module with new providers

#### `/backend controller create <name>`
Create a new controller with standard REST endpoints
- Creates controller class with route decorators
- Adds authentication guards
- Creates basic CRUD endpoints
- Updates module with new controller

#### `/backend dto create <name>`
Create DTO with class-validator decorators
- Creates CreateDto with validation
- Creates UpdateDto with Partial<CreateDto> pattern
- Creates ResponseDto for API responses
- Includes proper TypeScript types

#### `/backend module create <name>`
Create a new feature module
- Creates module with proper imports
- Sets up dependency injection
- Configures exports for other modules

### Testing Commands

#### `/backend test unit [service]`
Run unit tests for specific service
```bash
yarn nx test server --testPathPattern="jobs.service.spec"
```

#### `/backend test integration [controller]`
Run integration tests for controller
```bash
yarn nx test server --testPathPattern="jobs.controller.spec"
```

#### `/backend test coverage`
Generate test coverage report
```bash
yarn nx test server --coverage
```

### Deployment Commands

#### `/backend deploy prep`
Prepare backend for deployment
- Run TypeScript compilation check
- Run tests
- Build production bundle
- Validate environment variables

#### `/backend deploy container`
Build and deploy Docker container
```bash
# Build container
docker build -t gt-backend .

# Deploy to Azure
az container create --resource-group gt-automotives-prod \
  --name gt-backend --image gtautomotivesregistry.azurecr.io/gt-backend:latest
```

#### `/backend deploy health`
Check deployment health status
```bash
curl https://gt-automotives-backend.com/health
```

### Debugging Commands

#### `/backend logs [service]`
View application logs
- Shows recent backend logs
- Filters by service if specified
- Includes error traces and performance metrics

#### `/backend debug [endpoint]`
Debug specific API endpoint
- Tests endpoint with sample data
- Shows request/response details
- Validates authentication flow

#### `/backend lint`
Run linting and code quality checks
```bash
yarn lint
yarn typecheck
```

## Command Examples

### Create a complete feature
```bash
/backend module create notifications
/backend service create notifications
/backend controller create notifications
/backend dto create notification
/backend test unit notifications
```

### Database workflow
```bash
/backend db status                    # Check current state
/backend db migrate "add_notifications" # Create migration
/backend test integration            # Validate changes
/backend db deploy                   # Deploy to production
```

### Development workflow
```bash
/backend start                       # Start dev server
/backend health                      # Check if running
/backend test coverage              # Run tests
/backend lint                       # Check code quality
```

### Deployment workflow
```bash
/backend deploy prep                 # Prepare for deployment
/backend build prod                  # Build production
/backend deploy container           # Deploy to Azure
/backend deploy health              # Verify deployment
```

## Implementation Notes

- All commands run from the project root directory
- Database commands use environment-specific connection strings
- Service creation follows repository pattern with dependency injection
- DTOs use class-validator for request validation
- Tests include both unit and integration test templates
- Deployment commands integrate with Azure Container Instances
- Health checks validate database connectivity and service status

## Related Files

- **Backend Agent**: `.claude/agents/backend-agent.md` - Comprehensive backend development guide
- **Development Guidelines**: `.claude/docs/development-guidelines.md` - Code patterns and best practices
- **Troubleshooting**: `.claude/docs/troubleshooting.md` - Common issues and solutions
- **Container Deployment**: `.claude/docs/backend-container-deployment-config.md` - Deployment configuration