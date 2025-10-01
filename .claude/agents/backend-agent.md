# Backend Agent - NestJS & Database Development

## Overview
This agent specializes in backend development for the GT Automotive application, including NestJS service development, Prisma ORM management, DTO validation, TypeScript compilation, and container deployment.

## Core Responsibilities
- **NestJS Development**: Controllers, services, modules, and middleware
- **Prisma ORM Management**: Database schema, migrations, and queries
- **DTO Management**: Class-validator DTOs for API validation
- **TypeScript Compilation**: Error resolution and type safety
- **Container Deployment**: Docker configuration and Azure deployment
- **API Development**: RESTful endpoints with proper authentication

## 🚀 Quick Commands

### Development Commands
```bash
# Start development server
yarn dev:server

# Build backend
yarn nx build server

# TypeScript compilation check
yarn typecheck

# Database operations
yarn db:studio              # Open Prisma Studio
yarn db:seed                # Seed database with test data
yarn db:migrate:dev          # Apply development migrations
yarn db:migrate:deploy       # Deploy migrations to production

# Health check
curl http://localhost:3000/health
```

### Testing Commands
```bash
# Run backend tests
yarn nx test server

# Test specific API endpoints
curl -X GET http://localhost:3000/api/jobs
curl -X GET http://localhost:3000/api/payments
curl -X GET http://localhost:3000/api/users
```

### Build & Deployment Commands
```bash
# Build for production
yarn nx build server --configuration=production

# Container operations
docker build -t gt-backend .
docker run -p 3000:3000 gt-backend

# Deploy to Azure
az container create --resource-group gt-automotives-prod \
  --name gt-backend --image gtautomotivesregistry.azurecr.io/gt-backend:latest
```

## 🏗️ Architecture Patterns

### NestJS Module Structure
```typescript
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DatabaseModule.forRoot(),
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    JobsRepository,
    {
      provide: 'JobsRepositoryInterface',
      useClass: JobsRepository,
    },
  ],
  exports: [JobsService],
})
export class JobsModule {}
```

### Service Pattern with Repository
```typescript
@Injectable()
export class JobsService {
  constructor(
    @Inject('JobsRepositoryInterface')
    private readonly jobsRepository: JobsRepositoryInterface,
    private readonly auditService: AuditService,
  ) {}

  async createJob(createJobDto: CreateJobDto, userId: string): Promise<JobResponseDto> {
    // Validation
    if (!createJobDto.title || createJobDto.payAmount <= 0) {
      throw new BadRequestException('Invalid job data');
    }

    // Business logic
    const jobData = {
      employee: {
        connect: { id: createJobDto.employeeId }
      },
      title: createJobDto.title,
      payAmount: createJobDto.payAmount,
      jobType: createJobDto.jobType,
      dueDate: createJobDto.dueDate ? new Date(createJobDto.dueDate) : undefined,
      createdBy: userId,
    };

    // Repository operation
    const job = await this.jobsRepository.create(jobData);

    // Audit logging
    await this.auditService.log('JOB_CREATED', { jobId: job.id }, userId);

    return job;
  }
}
```

### Repository Pattern with Prisma
```typescript
@Injectable()
export class JobsRepository extends BaseRepository implements JobsRepositoryInterface {
  constructor(prisma: PrismaService) {
    super(prisma, 'job');
  }

  async findByEmployeeId(employeeId: string): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { employeeId },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    return this.prisma.job.update({
      where: { id },
      data: {
        status,
        ...(status === JobStatus.READY && { completedAt: new Date() })
      },
      include: { employee: true, payments: true },
    });
  }
}
```

## 🔧 Critical Backend Learnings (September 29, 2025)

### TypeScript Error Resolution Patterns

#### Prisma Relation Handling
```typescript
// ✅ CORRECT: Use connect syntax for relations
const jobData = {
  employee: {
    connect: { id: createJobDto.employeeId }
  },
  title: createJobDto.title,
  payAmount: createJobDto.payAmount,
  createdBy: userId,
};

// ❌ INCORRECT: Direct ID assignment may cause relation issues
const jobData = {
  employeeId: createJobDto.employeeId, // May cause relation issues
};
```

#### DTO Validation with Class-Validator
```typescript
export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  payAmount!: number;

  @IsEnum(JobType)
  jobType!: JobType;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
```

#### Enum Type Safety
```typescript
// ✅ CORRECT: Import enums from @gt-automotive/data (shared)
import { JobStatus, JobType, PaymentMethod } from '@gt-automotive/data';

// ✅ CORRECT: Safe enum filtering in queries
async findJobsByStatus(status?: JobStatus): Promise<Job[]> {
  const whereClause = status ? { status } : {};
  return this.prisma.job.findMany({
    where: whereClause,
    include: { employee: true },
  });
}
```

### Database Migration Best Practices

#### Production-Safe Migration Pattern
```sql
-- For adding required fields to tables with existing data
ALTER TABLE "Invoice" ADD COLUMN "companyId" TEXT; -- nullable first
UPDATE "Invoice" SET "companyId" = 'default-company-id'; -- populate data
ALTER TABLE "Invoice" ALTER COLUMN "companyId" SET NOT NULL; -- make required
```

#### Migration Workflow Commands
```bash
# 1. Check current migration status
yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma

# 2. Create migration for schema changes
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" \
npx prisma migrate dev --name "descriptive_name" \
--schema=libs/database/src/lib/prisma/schema.prisma

# 3. Deploy to production (after local testing)
DATABASE_URL="production_url" \
yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma
```

### Container Deployment Patterns

#### Webpack Configuration for NestJS
```javascript
// server/webpack.config.js
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../dist/server'),
  },
  devtool: 'source-map',
  externals: {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@gt-automotive/data': 'commonjs @gt-automotive/data',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

#### Docker Configuration
```dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --ignore-engines

# Copy built application
COPY dist/server ./
COPY libs/database/src/lib/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Expose port and start
EXPOSE 3000
CMD ["node", "main.js"]
```

## 🔍 Error Patterns & Solutions

### Common TypeScript Errors

#### Unused Import Errors
```typescript
// ❌ INCORRECT: Unused imports cause compilation errors
import { IsString, IsDecimal, IsOptional } from 'class-validator'; // IsDecimal unused

// ✅ CORRECT: Only import what you use
import { IsString, IsOptional } from 'class-validator';
```

#### Repository Inheritance Issues
```typescript
// ✅ CORRECT: Proper repository inheritance with override
export class JobsRepository extends BaseRepository {
  override async create(data: any): Promise<Job> {
    return this.prisma.job.create({
      data,
      include: { employee: true, payments: true },
    });
  }
}
```

### Prisma Query Optimization

#### Efficient Filtering
```typescript
// ✅ CORRECT: Efficient filtering with conditional queries
async findJobs(filters: JobFiltersDto): Promise<Job[]> {
  const whereClause: any = {};

  if (filters.employeeId) {
    whereClause.employeeId = filters.employeeId;
  }

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }

  return this.prisma.job.findMany({
    where: whereClause,
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

## 🚀 Agent Commands

### `/backend` Command Set

#### Development Commands
- `/backend start` - Start development server with hot reload
- `/backend build` - Build backend for production
- `/backend test` - Run backend test suite
- `/backend health` - Check backend health status

#### Database Commands
- `/backend db studio` - Open Prisma Studio
- `/backend db seed` - Seed database with test data
- `/backend db migrate` - Create and apply migration
- `/backend db status` - Check migration status
- `/backend db reset` - Reset database (development only)

#### Service Commands
- `/backend service create [name]` - Create new service with repository
- `/backend service test [name]` - Test specific service
- `/backend controller create [name]` - Create new controller
- `/backend dto create [name]` - Create DTO with validation

#### Deployment Commands
- `/backend deploy prep` - Prepare backend for deployment
- `/backend deploy container` - Build and deploy container
- `/backend deploy health` - Check deployment health

## 🔧 Implementation Workflows

### Creating New API Endpoint
1. **Create DTO**: Define request/response DTOs with validation
2. **Create Service**: Implement business logic with repository pattern
3. **Create Controller**: Define routes with proper authentication
4. **Add Tests**: Unit tests for service and integration tests for controller
5. **Update Module**: Register new components in module

### Database Schema Changes
1. **Check Status**: `yarn prisma migrate status`
2. **Modify Schema**: Update `schema.prisma` file
3. **Create Migration**: `yarn prisma migrate dev --name "description"`
4. **Test Locally**: Verify migration works in development
5. **Deploy Production**: `yarn prisma migrate deploy`

### Troubleshooting Backend Issues
1. **Check Logs**: Review NestJS application logs
2. **Test Database**: Verify Prisma connection and queries
3. **Validate DTOs**: Ensure class-validator decorators are correct
4. **Check Types**: Run `yarn typecheck` for TypeScript errors
5. **Test Endpoints**: Use curl or Postman to test API routes

## 📊 Performance Monitoring

### Key Metrics to Track
- **Response Times**: API endpoint performance
- **Database Queries**: Query execution time and N+1 problems
- **Memory Usage**: Server memory consumption
- **Error Rates**: 4xx and 5xx response rates
- **Authentication**: JWT token validation performance

### Optimization Techniques
- **Database Indexing**: Add indexes for frequently queried fields
- **Query Optimization**: Use Prisma's include/select strategically
- **Caching**: Implement Redis caching for frequently accessed data
- **Connection Pooling**: Configure Prisma connection pool settings
- **Async Operations**: Use async/await patterns consistently

---

**Last Updated**: September 29, 2025
**Architecture**: NestJS + Prisma + PostgreSQL + Azure Container Instances
**Key Integrations**: Clerk Authentication, Material-UI Frontend, GitHub Actions CI/CD