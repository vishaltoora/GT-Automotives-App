# Prisma ORM - Comprehensive Learning Guide

*Last Updated: September 24, 2025*

## Overview

Prisma is a next-generation TypeScript ORM (Object-Relational Mapping) that provides type-safe database access, automated migrations, and a powerful query engine. It consists of three main tools: Prisma Schema, Prisma Client, and Prisma Migrate.

## Core Components

### 1. Prisma Schema (`schema.prisma`)
The central configuration file that defines your database structure, data models, and client generation.

#### Basic Structure
```prisma
// Database connection
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Client generation
generator client {
  provider = "prisma-client-js"
}

// Data models
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String?
  userId   Int
  user     User   @relation(fields: [userId], references: [id])
}
```

#### Key Schema Elements

**Datasources**
- Define database connection details
- Support multiple providers: `postgresql`, `mysql`, `sqlite`, `mongodb`, `sqlserver`
- Use environment variables for sensitive data: `env("DATABASE_URL")`

**Generators**
- Configure client generation: `prisma-client-js` (default)
- Support multiple generators for different outputs
- Custom output paths and additional options

**Models**
- Define database tables/collections
- Use PascalCase naming convention
- Support various field types and attributes

**Field Types**
```prisma
model Example {
  // Scalar types
  id        Int       @id @default(autoincrement())
  email     String    @unique
  age       Int?      // Optional field
  isActive  Boolean   @default(true)
  score     Float
  metadata  Json

  // DateTime with defaults
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Enums
  role      Role      @default(USER)

  // Relations
  posts     Post[]
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### 2. Prisma Client
Auto-generated, type-safe database client that provides intuitive query methods.

#### Basic Usage
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CRUD Operations
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice'
  }
})

const users = await prisma.user.findMany({
  where: {
    email: {
      contains: '@prisma.io'
    }
  },
  include: {
    posts: true
  }
})
```

#### Query Capabilities

**Filtering & Conditions**
```typescript
// Basic filtering
const users = await prisma.user.findMany({
  where: {
    email: 'alice@prisma.io',
    age: { gte: 18 },
    name: { startsWith: 'A' }
  }
})

// Complex conditions
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: 'prisma' } },
      { content: { contains: 'database' } }
    ],
    AND: [
      { published: true },
      { user: { email: { endsWith: '@company.com' } } }
    ]
  }
})
```

**Sorting & Pagination**
```typescript
const users = await prisma.user.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { name: 'asc' }
  ],
  skip: 10,
  take: 5
})
```

**Relations & Includes**
```typescript
// Include related data
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    }
  }
})

// Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        title: true
      }
    }
  }
})
```

**Aggregation**
```typescript
const stats = await prisma.user.aggregate({
  _count: { id: true },
  _avg: { age: true },
  _sum: { score: true },
  where: { active: true }
})

const groupedUsers = await prisma.user.groupBy({
  by: ['role'],
  _count: { id: true },
  having: {
    id: { _count: { gte: 10 } }
  }
})
```

### 3. Prisma Migrate
Database schema migration system for evolving your database structure safely.

#### Common Commands
```bash
# Initialize Prisma in existing project
npx prisma init

# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add-user-table

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Open Prisma Studio
npx prisma studio
```

#### Migration Workflow

**Development Process**
1. Modify `schema.prisma`
2. Run `prisma migrate dev --name descriptive-name`
3. Prisma generates SQL migration file
4. Migration is automatically applied to development database
5. Prisma Client is regenerated

**Production Deployment**
1. Commit migration files to version control
2. Deploy application code
3. Run `prisma migrate deploy` in production
4. Ensure database backup before migration

## Advanced Features

### Transactions
```typescript
// Interactive transactions
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'alice@prisma.io', name: 'Alice' }
  })

  await tx.post.create({
    data: {
      title: 'Hello World',
      userId: user.id
    }
  })

  return user
})

// Sequential transactions
const [deleteUsers, createUser] = await prisma.$transaction([
  prisma.user.deleteMany({ where: { active: false } }),
  prisma.user.create({ data: { email: 'new@user.com' } })
])
```

### Raw SQL Queries
```typescript
// Raw query
const users = await prisma.$queryRaw`
  SELECT * FROM "User"
  WHERE "age" > ${18}
  ORDER BY "createdAt" DESC
`

// Execute raw SQL
await prisma.$executeRaw`
  UPDATE "User"
  SET "lastLogin" = NOW()
  WHERE "id" = ${userId}
`
```

### Client Extensions
```typescript
const prisma = new PrismaClient().$extends({
  model: {
    user: {
      // Custom method
      async findByEmail(email: string) {
        return this.findFirst({ where: { email } })
      }
    }
  },
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`
        }
      }
    }
  }
})
```

## Best Practices

### Schema Design

**1. Use Descriptive Model Names**
```prisma
// Good
model BlogPost { ... }
model UserProfile { ... }

// Avoid
model Data { ... }
model Item { ... }
```

**2. Consistent Field Naming**
```prisma
model User {
  id         Int      @id @default(autoincrement())
  email      String   @unique
  firstName  String   // camelCase for multi-word fields
  lastName   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**3. Proper Relations**
```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId]) // Index foreign keys
}
```

**4. Use Enums for Fixed Values**
```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### Query Optimization

**1. Select Only Needed Fields**
```typescript
// Avoid
const user = await prisma.user.findFirst() // Gets all fields

// Prefer
const user = await prisma.user.findFirst({
  select: { id: true, email: true }
})
```

**2. Use Proper Indexing**
```prisma
model User {
  email    String  @unique
  status   String
  category String

  @@index([status, category]) // Compound index for common queries
}
```

**3. Batch Operations**
```typescript
// Avoid multiple single operations
for (const data of items) {
  await prisma.item.create({ data })
}

// Prefer batch operations
await prisma.item.createMany({
  data: items
})
```

### Error Handling

**1. Handle Unique Constraint Violations**
```typescript
try {
  const user = await prisma.user.create({
    data: { email: 'duplicate@email.com' }
  })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      throw new Error('Email already exists')
    }
  }
  throw error
}
```

**2. Use Transactions for Data Integrity**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.account.update({
    where: { id: fromAccountId },
    data: { balance: { decrement: amount } }
  })

  await tx.account.update({
    where: { id: toAccountId },
    data: { balance: { increment: amount } }
  })
})
```

## Performance Optimization

### 1. Connection Pooling
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5'
    }
  }
})
```

### 2. Query Analysis
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

// Custom query event handling
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})
```

### 3. Pagination Strategies
```typescript
// Cursor-based pagination (recommended for large datasets)
const posts = await prisma.post.findMany({
  take: 10,
  cursor: lastPostId ? { id: lastPostId } : undefined,
  skip: lastPostId ? 1 : 0,
  orderBy: { id: 'asc' }
})

// Offset pagination (simpler but less efficient)
const posts = await prisma.post.findMany({
  skip: page * pageSize,
  take: pageSize
})
```

## Testing Strategies

### 1. Database Seeding
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'alice@test.com', name: 'Alice' },
      { email: 'bob@test.com', name: 'Bob' }
    ]
  })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
```

### 2. Test Database Setup
```typescript
// Use separate test database
const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL

// Reset database between tests
beforeEach(async () => {
  await prisma.user.deleteMany()
  await prisma.post.deleteMany()
})
```

## Common Issues & Solutions

### 1. Migration Issues
**Problem**: Migration conflicts in team development
**Solution**:
- Always pull latest migrations before creating new ones
- Use descriptive migration names
- Reset database if migrations are conflicted: `prisma migrate reset`

### 2. Type Generation Issues
**Problem**: Types not updating after schema changes
**Solution**: Run `prisma generate` after schema modifications

### 3. Connection Pool Exhaustion
**Problem**: "Too many connections" errors
**Solution**:
- Properly close connections: `await prisma.$disconnect()`
- Configure connection limits
- Use connection pooling (PgBouncer for PostgreSQL)

### 4. Performance Issues
**Problem**: Slow queries
**Solution**:
- Add database indexes
- Use `select` instead of returning all fields
- Implement proper pagination
- Analyze query execution plans

### 5. Deployment Issues
**Problem**: Prisma Client not found in production
**Solution**:
- Include `prisma generate` in build step
- Ensure `@prisma/client` is in dependencies (not devDependencies)
- Set `binaryTargets` in generator for specific platforms

## Environment Configuration

### Development Setup
```bash
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

# Package.json scripts
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

### Production Deployment
```bash
# Build process
npm run build
prisma migrate deploy
prisma generate

# Environment variables
DATABASE_URL="postgresql://user:pass@host:5432/proddb?sslmode=require"
```

## Integration with Frameworks

### Next.js
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### NestJS
```typescript
// prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
  }
}
```

## Monitoring & Observability

### Query Performance Monitoring
```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn(`Slow query detected: ${e.duration}ms`)
    console.warn(e.query)
  }
})
```

### Health Checks
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' })
  }
})
```

## Conclusion

Prisma provides a modern, type-safe approach to database management with excellent developer experience. Key benefits include:

- **Type Safety**: Compile-time query validation and auto-completion
- **Developer Experience**: Intuitive API and excellent tooling
- **Database Agnostic**: Support for multiple database systems
- **Migration Management**: Robust schema evolution system
- **Performance**: Query optimization and connection pooling

By following these patterns and best practices, you can build scalable, maintainable applications with Prisma ORM.

## Additional Resources

- [Official Documentation](https://www.prisma.io/docs)
- [Prisma Examples](https://github.com/prisma/prisma-examples)
- [Discord Community](https://pris.ly/discord)
- [Prisma Blog](https://www.prisma.io/blog)