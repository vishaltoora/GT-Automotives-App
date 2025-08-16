# @gt-automotive/database

This library contains the Prisma ORM integration and database management for the GT Automotive application.

## Overview

The database library provides:
- Prisma client configuration
- Database schema definitions
- Migration management
- Seed data scripts
- Database utilities

## Database Schema

The PostgreSQL database includes the following tables:

### Core Tables
- **users**: User accounts with authentication
- **roles**: User role definitions (Customer, Staff, Admin)
- **permissions**: Granular permission definitions
- **role_permissions**: Role-permission mapping

### Business Tables
- **customers**: Customer profiles
- **vehicles**: Customer vehicles
- **tires**: Tire inventory
- **invoices**: Sales invoices
- **invoice_items**: Invoice line items
- **appointments**: Service appointments
- **audit_logs**: Admin action tracking

## Setup

### Prerequisites
- PostgreSQL 13+ installed
- Node.js 18+
- Database connection string

### Environment Configuration

Create a `.env` file in the server directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/gt_automotive"
```

### Database Commands

```bash
# Generate Prisma Client
yarn db:generate

# Create and run migrations
yarn db:migrate

# Run migrations in production
yarn db:migrate:prod

# Seed the database
NODE_ENV=development yarn db:seed

# Open Prisma Studio (GUI)
yarn db:studio

# Reset database (development only)
yarn db:reset
```

## Prisma Client Usage

### Import in NestJS Services

```typescript
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class TireService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tire.findMany({
      where: { isActive: true },
      orderBy: { brand: 'asc' }
    });
  }
}
```

### Repository Pattern

```typescript
import { BaseRepository } from '@gt-automotive/database';

@Injectable()
export class TireRepository extends BaseRepository<Tire> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tire');
  }

  async findLowStock(threshold: number = 5) {
    return this.prisma.tire.findMany({
      where: { quantity: { lte: threshold } }
    });
  }
}
```

## Schema Examples

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  firstName     String
  lastName      String
  phone         String?
  roleId        String
  role          Role      @relation(fields: [roleId], references: [id])
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  invoices      Invoice[]
  auditLogs     AuditLog[]
}
```

### Tire Model
```prisma
model Tire {
  id            String    @id @default(cuid())
  brand         String
  model         String
  size          String
  type          TireType
  quantity      Int       @default(0)
  price         Decimal   @db.Decimal(10, 2)
  cost          Decimal?  @db.Decimal(10, 2)
  condition     TireCondition?
  photos        String[]
  location      String?
  lowStockAlert Int       @default(5)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  invoiceItems  InvoiceItem[]
}
```

## Migrations

### Creating a New Migration

```bash
# After schema changes
yarn prisma migrate dev --name add_tire_location

# Review the generated SQL
cat libs/database/src/lib/prisma/migrations/[timestamp]_add_tire_location/migration.sql
```

### Migration Best Practices
- Always backup before production migrations
- Test migrations on staging first
- Use descriptive migration names
- Review generated SQL before applying
- Never edit existing migrations

## Seed Data

The seed script creates demo data for development:

### Default Users
- Admin: admin@gtautomotive.com / Admin@123
- Staff: staff@gtautomotive.com / Staff@123  
- Customer: customer@example.com / Customer@123

### Sample Data
- 5 tire brands with inventory
- Sample customers and vehicles
- Demo invoices and appointments

## Database Utilities

### Soft Deletes
```typescript
// Instead of hard delete
await prisma.tire.delete({ where: { id } });

// Use soft delete
await prisma.tire.update({
  where: { id },
  data: { deletedAt: new Date() }
});
```

### Transactions
```typescript
await prisma.$transaction(async (tx) => {
  const invoice = await tx.invoice.create({ data: invoiceData });
  await tx.tire.updateMany({
    where: { id: { in: tireIds } },
    data: { quantity: { decrement: 1 } }
  });
  return invoice;
});
```

## Troubleshooting

### Connection Issues
```bash
# Test database connection
yarn prisma db pull

# Check connection string
echo $DATABASE_URL
```

### Migration Conflicts
```bash
# Reset migrations (development only)
yarn prisma migrate reset

# Force sync (development only)
yarn prisma db push
```

## Building

Run `nx build database` to build the library.

## Testing

Run `nx test database` to execute unit tests.

## Security Notes

- Never commit `.env` files
- Use connection pooling in production
- Enable SSL for remote connections
- Implement row-level security where needed
- Regular backups are essential
