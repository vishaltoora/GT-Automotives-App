# Integration Plan - Tire Inventory Module

## Overview
This document coordinates the integration between Backend and Frontend agents for the tire inventory feature.

## Shared Contract Location
All agents must use: `libs/shared/interfaces/src/lib/tire.interface.ts`

## Development Timeline

### Phase 1: Parallel Development (Days 1-3)
- **Backend Agent:** Implement all API endpoints
- **Frontend Agent:** Build UI with mock data
- **Both:** Use shared interfaces

### Phase 2: Integration (Day 4)
- Connect frontend to real APIs
- Fix any contract mismatches
- Handle edge cases

### Phase 3: Review (Day 5)
- **Code Review Agent:** Full review
- Fix identified issues
- Final testing

## API Endpoint Priority

### High Priority (Implement First)
1. GET /api/tires - List view
2. GET /api/tires/:id - Details view
3. POST /api/tires - Create new
4. PUT /api/tires/:id - Update existing

### Medium Priority
5. POST /api/tires/:id/adjust-stock - Stock management
6. GET /api/tires/low-stock - Alerts
7. POST /api/tires/:id/images - Image upload

### Low Priority
8. DELETE /api/tires/:id - Admin only
9. GET /api/tires/reports/inventory - Reports
10. DELETE /api/tires/:id/images/:imageId - Image management

## Mock Data for Frontend Development

```typescript
// Use this mock data until backend is ready
export const mockTires: ITire[] = [
  {
    id: '1',
    brand: 'Michelin',
    model: 'Pilot Sport 4S',
    size: '225/45R17',
    type: TireType.PERFORMANCE,
    condition: TireCondition.NEW,
    quantity: 12,
    price: 289.99,
    cost: 195.00, // Only for admin
    location: 'A1-B2',
    minStock: 5,
    imageUrl: '/placeholder-tire.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    brand: 'Bridgestone',
    model: 'Blizzak WS90',
    size: '215/55R16',
    type: TireType.WINTER,
    condition: TireCondition.NEW,
    quantity: 3, // Low stock
    price: 165.99,
    cost: 110.00,
    location: 'C3-D4',
    minStock: 5,
    imageUrl: '/placeholder-tire.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more mock data as needed
];

export const mockLowStockTires = mockTires.filter(t => t.quantity <= t.minStock);

export const mockInventoryReport = {
  totalValue: 15000,
  totalCost: 10000,
  totalItems: 150,
  lowStockItems: mockLowStockTires,
  byBrand: {
    'Michelin': 45,
    'Bridgestone': 38,
    'Goodyear': 32,
    'Continental': 35,
  },
  byType: {
    [TireType.ALL_SEASON]: 50,
    [TireType.WINTER]: 30,
    [TireType.SUMMER]: 25,
    [TireType.PERFORMANCE]: 45,
  },
};
```

## Integration Points

### 1. Authentication Token
Frontend must include JWT token in all requests:
```typescript
const config = {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
};
```

### 2. Role-Based Rendering
Frontend checks user role from auth context:
```typescript
const { user, isAdmin, isStaff } = useAuth();

// Show cost field only for admin
{isAdmin && <TextField label="Cost" value={tire.cost} />}

// Show actions based on role
{(isAdmin || isStaff) && <Button>Edit</Button>}
{isAdmin && <Button color="error">Delete</Button>}
```

### 3. Error Response Format
Backend returns consistent error format:
```typescript
{
  statusCode: 400,
  message: 'Validation failed',
  errors: [
    { field: 'price', message: 'Price must be positive' }
  ],
}
```

### 4. Image Upload
Use multipart/form-data for images:
```typescript
const formData = new FormData();
formData.append('image', file);
formData.append('isPrimary', 'true');

await axios.post(`/api/tires/${tireId}/images`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

## Testing Scenarios

### Integration Test Cases
1. **Create Tire Flow**
   - Admin creates tire with all fields
   - Staff creates tire without cost
   - Customer cannot create (403)

2. **Update Stock Flow**
   - Staff adjusts stock
   - Low stock alert triggers
   - Audit log created

3. **Search & Filter Flow**
   - Search by brand/model
   - Filter by type and condition
   - Pagination works

4. **Image Upload Flow**
   - Upload single image
   - Upload multiple images
   - Delete image
   - Set primary image

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Backend has CORS configured in main.ts

### Issue 2: Date Formatting
**Solution:** Use ISO 8601 format for all dates

### Issue 3: Decimal Precision
**Solution:** Use Decimal type in Prisma, number in TypeScript

### Issue 4: File Size Limits
**Solution:** Configure multer in backend, validate in frontend

## Success Criteria

### Backend Complete When:
- [ ] All endpoints return correct data
- [ ] Role-based filtering works
- [ ] Stock adjustments atomic
- [ ] Images uploading
- [ ] Audit logging functional

### Frontend Complete When:
- [ ] All pages rendering
- [ ] Forms validating
- [ ] Role-based UI working
- [ ] Images displaying
- [ ] Responsive design complete

### Integration Complete When:
- [ ] Frontend connects to all endpoints
- [ ] No CORS issues
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] All user roles tested

## Communication Protocol

### Daily Sync Points
1. **Morning:** Check blockers
2. **Midday:** Integration test
3. **Evening:** Progress update

### Issue Reporting
```markdown
**Issue:** [Brief description]
**Agent:** [Backend/Frontend]
**Severity:** [Critical/Major/Minor]
**Blocking:** [Yes/No]
**Details:** [Full description]
**Proposed Solution:** [If any]
```

### Contract Changes
If API contract needs changes:
1. Discuss in main thread
2. Update shared interface
3. Both agents pull changes
4. Update mock data if needed

## Final Checklist

### Before Integration
- [ ] Backend endpoints tested with Postman
- [ ] Frontend works with mock data
- [ ] Shared interfaces up to date
- [ ] Environment variables set

### During Integration
- [ ] Test each endpoint connection
- [ ] Verify data flow
- [ ] Check error handling
- [ ] Test with all roles

### After Integration
- [ ] Full E2E test
- [ ] Performance check
- [ ] Security review
- [ ] Documentation updated

## Notes

- Prioritize critical path first
- Communicate blockers immediately
- Test edge cases thoroughly
- Keep interfaces in sync
- Document any deviations