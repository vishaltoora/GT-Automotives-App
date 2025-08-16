# Frontend Agent Work Package - Tire Inventory UI

## Overview
Build the complete frontend for tire inventory management with role-based UI components using React, TypeScript, and Material UI.

## API Contract
Use the endpoints defined in `libs/shared/interfaces/src/lib/tire.interface.ts`.

## Files to Create

### 1. Service Layer
**File:** `apps/webApp/src/app/services/tire.service.ts`
```typescript
// API calls:
- getTires(params: ITireSearchParams): Promise<ITireSearchResult>
- getTireById(id: string): Promise<ITire>
- createTire(data: ITireCreateInput): Promise<ITire>
- updateTire(id: string, data: ITireUpdateInput): Promise<ITire>
- deleteTire(id: string): Promise<void>
- adjustStock(id: string, adjustment: StockAdjustment): Promise<ITire>
- getLowStockTires(): Promise<ITire[]>
- getInventoryReport(): Promise<InventoryReport>
- uploadImage(tireId: string, file: File): Promise<ITireImage>
```

### 2. Custom Hooks
**File:** `apps/webApp/src/app/hooks/useTires.ts`
```typescript
// React Query hooks:
- useTires(params): Paginated tire list
- useTire(id): Single tire details
- useCreateTire(): Mutation for creating
- useUpdateTire(): Mutation for updating
- useDeleteTire(): Mutation for deleting
- useStockAdjustment(): Mutation for stock changes
- useLowStockTires(): Low stock items
- useInventoryReport(): Admin reports
```

### 3. Page Components

#### 3.1 Tire List Page
**File:** `apps/webApp/src/app/pages/inventory/TireList.tsx`
```typescript
Features:
- Data table with pagination
- Search bar
- Filters (brand, type, condition, price range)
- Sort options
- Grid/List view toggle
- Role-based actions (Add/Edit/Delete buttons)
- Low stock indicators
- Export to CSV (admin only)
```

#### 3.2 Tire Form Page
**File:** `apps/webApp/src/app/pages/inventory/TireForm.tsx`
```typescript
Features:
- Create/Edit modes
- All tire fields with validation
- Image upload (drag & drop)
- Cost field (admin only)
- Save as draft option
- Cancel with confirmation
```

#### 3.3 Tire Details Page
**File:** `apps/webApp/src/app/pages/inventory/TireDetails.tsx`
```typescript
Features:
- Full tire information
- Image gallery
- Stock adjustment dialog
- Edit/Delete buttons (role-based)
- Print label option
- Activity history (admin)
```

#### 3.4 Inventory Dashboard
**File:** `apps/webApp/src/app/pages/inventory/InventoryDashboard.tsx`
```typescript
Features:
- Statistics cards (total items, value, low stock)
- Charts (by brand, by type)
- Recent activity
- Quick actions
- Low stock alerts
```

### 4. Component Library

#### 4.1 Tire Card Component
**File:** `apps/webApp/src/app/components/inventory/TireCard.tsx`
```typescript
Props:
- tire: ITire
- onEdit?: () => void
- onDelete?: () => void
- showCost?: boolean (admin only)
- variant: 'compact' | 'detailed'
```

#### 4.2 Tire Filter Component
**File:** `apps/webApp/src/app/components/inventory/TireFilter.tsx`
```typescript
Features:
- Brand dropdown
- Type selector
- Condition radio
- Price range slider
- Size input
- Clear all button
```

#### 4.3 Stock Adjustment Dialog
**File:** `apps/webApp/src/app/components/inventory/StockAdjustmentDialog.tsx`
```typescript
Features:
- Current stock display
- Adjustment type (add/remove/set)
- Quantity input with validation
- Reason textarea
- Confirmation step
```

#### 4.4 Image Upload Component
**File:** `apps/webApp/src/app/components/inventory/TireImageUpload.tsx`
```typescript
Features:
- Drag & drop zone
- Multiple file selection (max 5)
- Image preview
- Delete option
- Primary image selector
- Size validation (max 5MB)
```

### 5. Route Configuration
**Update:** `apps/webApp/src/app/app.tsx`
```typescript
// Add routes:
/inventory                    # List view (all roles)
/inventory/new               # Create form (staff/admin)
/inventory/:id               # Details view (all roles)
/inventory/:id/edit          # Edit form (staff/admin)
/inventory/dashboard         # Dashboard (staff/admin)
/inventory/reports           # Reports (admin only)
```

## UI/UX Requirements

### 1. Responsive Design
- Mobile: Single column cards
- Tablet: 2-column grid
- Desktop: Table view with actions

### 2. Material UI Components
```typescript
// Use these MUI components:
- DataGrid for tire list
- Card for tire display
- Dialog for stock adjustment
- Autocomplete for brand selection
- Slider for price filter
- Chip for tags
- SpeedDial for quick actions
- Skeleton for loading states
```

### 3. Role-Based UI

#### Customer View:
- Can browse tire catalog
- See prices but not cost
- Cannot see stock numbers
- No edit/delete buttons
- Can request quote

#### Staff View:
- Full CRUD except delete
- Can adjust stock
- See all fields except cost
- Can upload images
- View low stock alerts

#### Admin View:
- Complete access
- See cost and profit margin
- Delete capability
- Inventory reports
- Export functionality

### 4. Form Validation
```typescript
// Client-side validation:
- Required fields: brand, model, size, type, condition, price
- Price/Cost: positive numbers only
- Size: format validation (e.g., "225/45R17")
- Images: max 5MB each, max 5 total
- Show inline errors
- Disable submit until valid
```

### 5. Loading & Error States
```typescript
// Implement:
- Skeleton loaders for lists
- Circular progress for actions
- Error boundaries for crashes
- Toast notifications for success/error
- Retry buttons for failed requests
```

## Performance Optimization

1. **Data Fetching:**
   - Use React Query for caching
   - Implement infinite scroll for large lists
   - Prefetch next page
   - Optimistic updates for stock adjustments

2. **Image Handling:**
   - Lazy load images
   - Use thumbnails in list view
   - Compress before upload
   - Progressive image loading

3. **Search & Filter:**
   - Debounce search input (300ms)
   - Store filters in URL params
   - Cache filter results

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in dialogs
- Screen reader announcements
- Color contrast compliance
- Alt text for all images

## Testing Requirements

1. **Component Tests:**
   - Test role-based rendering
   - Test form validation
   - Test filter functionality
   - Test stock adjustment logic

2. **Integration Tests:**
   - Test full CRUD flow
   - Test image upload
   - Test error handling
   - Test pagination

## Styling Guidelines

```scss
// Follow existing theme:
- Primary color: #1976d2
- Secondary color: #dc004e
- Success: #4caf50
- Warning: #ff9800
- Error: #f44336
- Use Material UI spacing (theme.spacing())
- Maintain consistent padding/margins
```

## Example Components

```tsx
// TireCard example:
<TireCard
  tire={tire}
  onEdit={() => navigate(`/inventory/${tire.id}/edit`)}
  onDelete={() => handleDelete(tire.id)}
  showCost={isAdmin}
  variant="compact"
/>

// Filter example:
<TireFilter
  filters={filters}
  onChange={(newFilters) => setFilters(newFilters)}
  onClear={() => setFilters({})}
/>

// Stock adjustment:
<StockAdjustmentDialog
  open={dialogOpen}
  tire={selectedTire}
  onConfirm={(adjustment) => adjustStock(adjustment)}
  onClose={() => setDialogOpen(false)}
/>
```

## Acceptance Criteria

- [ ] All pages rendering correctly
- [ ] Role-based UI working
- [ ] Search and filters functional
- [ ] Forms validating properly
- [ ] Images uploading successfully
- [ ] Stock adjustments working
- [ ] Reports displaying (admin)
- [ ] Responsive on all devices
- [ ] Accessible to screen readers
- [ ] Performance targets met

## Notes

- Follow existing component patterns from auth module
- Use Material UI consistently
- Implement proper TypeScript types
- Handle all error scenarios
- Test with all three user roles