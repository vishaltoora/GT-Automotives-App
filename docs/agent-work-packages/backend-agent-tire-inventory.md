# Backend Agent Work Package - Tire Inventory Module

## Overview
Implement the complete backend for tire inventory management following the repository pattern established in the authentication module.

## API Contract
All endpoints are defined in `libs/shared/interfaces/src/lib/tire.interface.ts` under `ITireAPIEndpoints`.

## Files to Create/Modify

### 1. Repository Layer
**File:** `server/src/tires/repositories/tire.repository.ts`
```typescript
// Implement following methods:
- findAll(filters: ITireFilters, pagination: IPagination): Promise<ITireSearchResult>
- findById(id: string): Promise<Tire | null>
- create(data: CreateTireDto): Promise<Tire>
- update(id: string, data: UpdateTireDto): Promise<Tire>
- delete(id: string): Promise<boolean>
- adjustStock(id: string, adjustment: StockAdjustmentDto): Promise<Tire>
- findLowStock(): Promise<Tire[]>
- getInventoryReport(): Promise<InventoryReport>
```

### 2. Service Layer
**File:** `server/src/tires/tires.service.ts`
```typescript
// Business logic:
- Validate stock adjustments
- Check for low stock after changes
- Filter cost field based on user role
- Handle image uploads
- Generate inventory reports
- Audit log all changes
```

### 3. Controller Layer
**File:** `server/src/tires/tires.controller.ts`
```typescript
// Endpoints to implement:
GET    /api/tires              # Public (filtered by role)
GET    /api/tires/:id          # Public (filtered by role)
POST   /api/tires              # @Roles('staff', 'admin')
PUT    /api/tires/:id          # @Roles('staff', 'admin')
DELETE /api/tires/:id          # @Roles('admin')
POST   /api/tires/:id/adjust-stock  # @Roles('staff', 'admin')
GET    /api/tires/low-stock    # @Roles('staff', 'admin')
GET    /api/tires/reports/inventory # @Roles('admin')
POST   /api/tires/:id/images   # @Roles('staff', 'admin')
DELETE /api/tires/:id/images/:imageId # @Roles('staff', 'admin')
```

### 4. Module Configuration
**File:** `server/src/tires/tires.module.ts`
```typescript
// Register:
- TireRepository
- TiresService
- TiresController
- Import AuditRepository for logging
```

### 5. DTOs
**Files to use:** `libs/shared/dto/src/lib/tire/tire.dto.ts`
- Already created with validation rules
- Use class-transformer to exclude cost field for non-admins

### 6. Database Migrations
**File:** Create new migration if needed
```bash
yarn prisma migrate dev --name add_tire_images_table
```

## Business Rules to Implement

1. **Stock Management:**
   - Stock cannot go below 0
   - Log all stock adjustments in audit table
   - Trigger low stock alert when quantity <= minStock

2. **Role-Based Access:**
   - Customers: Can view tires but not cost
   - Staff: Full CRUD except delete, cannot see cost
   - Admin: Full access including cost and delete

3. **Image Handling:**
   - Max 5 images per tire
   - Only used tires require images
   - Validate image size (max 5MB)
   - Store images in public/uploads/tires/

4. **Search & Filter:**
   - Full-text search on brand, model, size
   - Filter by type, condition, price range
   - Sort by any field
   - Paginate results (default 20 per page)

## Security Requirements

1. **Input Validation:**
   - Use DTOs with class-validator
   - Sanitize all string inputs
   - Validate price/cost are positive numbers

2. **Authorization:**
   - Use @Roles() decorator on all protected endpoints
   - Check user role before returning cost field
   - Verify ownership for image deletion

3. **Audit Logging:**
   - Log all CREATE, UPDATE, DELETE operations
   - Include user ID, action, old/new values
   - Store in audit_logs table

## Error Handling

```typescript
// Standard error responses:
- 400: Invalid input data
- 401: Unauthorized (no token)
- 403: Forbidden (wrong role)
- 404: Tire not found
- 409: Conflict (e.g., negative stock)
- 500: Internal server error
```

## Testing Requirements

1. **Unit Tests:**
   - Test repository methods
   - Test service business logic
   - Test role-based filtering

2. **Integration Tests:**
   - Test full API flow
   - Test role permissions
   - Test stock adjustments

## Performance Considerations

1. **Database:**
   - Index on (brand, model, size) already exists
   - Add index on condition for used tire queries
   - Use transactions for stock adjustments

2. **Caching:**
   - Cache tire catalog for 5 minutes
   - Invalidate cache on any update

## Dependencies

```typescript
// Required imports:
import { PrismaService } from '@gt-automotive/database';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
```

## Acceptance Criteria

- [ ] All endpoints working as specified
- [ ] Role-based access properly enforced
- [ ] Stock adjustments are atomic
- [ ] Low stock alerts triggered
- [ ] Images upload/delete working
- [ ] Inventory reports accurate
- [ ] All changes logged in audit
- [ ] Error handling comprehensive
- [ ] Performance under 200ms response time

## Example Usage

```typescript
// Get tires (customer view - no cost)
GET /api/tires
Response: { items: [{ id, brand, model, price, ... }], total: 100 }

// Adjust stock (staff)
POST /api/tires/123/adjust-stock
Body: { quantity: -4, type: 'remove', reason: 'Sold to customer' }

// Get inventory report (admin only)
GET /api/tires/reports/inventory
Response: { totalValue: 50000, totalCost: 35000, ... }
```

## Notes

- Follow the existing repository pattern from UserRepository
- Maintain consistency with existing error handling
- Use transactions for critical operations
- Test with all three user roles