# Tire Schema Changes & Model Field Removal

## Overview
This document outlines the recent schema changes to the tire system, specifically the removal of the `model` field from the tire entity. This change was implemented to simplify the tire management system and eliminate confusion between brand and model distinctions.

## Database Schema Changes

### Migration Details
- **Migration:** `20250825151521_remove_tire_model_field`
- **Date:** August 25, 2025
- **Database:** PostgreSQL via Prisma

### Schema Before (with model field)
```prisma
model Tire {
  id          String   @id @default(cuid())
  brand       String
  model       String   // ← REMOVED
  size        String
  type        TireType
  condition   TireCondition
  // ... other fields
}
```

### Schema After (without model field)
```prisma
model Tire {
  id          String   @id @default(cuid())
  brand       String   // Only brand identifier needed
  size        String
  type        TireType
  condition   TireCondition
  // ... other fields
}
```

## Interface Changes

### Updated ITire Interface
The `model` field has been removed from all tire interfaces:

```typescript
export interface ITire {
  id: string;
  brand: string;        // e.g., "Firestone", "Michelin", "BFGoodrich"
  size: string;         // e.g., "225/65R17", "205/55R16"
  type: TireType;       // ALL_SEASON, WINTER, SUMMER, etc.
  condition: TireCondition; // NEW, USED_EXCELLENT, etc.
  // ... other fields (no model field)
}
```

## Display Format Changes

### Before (with model field)
Tires were displayed as: `${brand} ${model} - ${size}`
- Example: "Firestone Destination LE3 - 225/65R17"
- Problem: Many users didn't distinguish between brand and model

### After (without model field) 
Tires are now displayed as: `${brand} - ${size}`
- Example: "Firestone - 225/65R17"
- Benefit: Cleaner, simpler identification

## Code Changes Summary

### Files Modified
1. **Database Schema**
   - `libs/database/src/lib/prisma/schema.prisma`

2. **TypeScript Interfaces**
   - `libs/shared/interfaces/src/lib/tire.interface.ts`
   - `libs/shared/dto/src/lib/tire/tire.dto.ts`

3. **Frontend Components**
   - `apps/webApp/src/app/components/invoices/InvoiceDialog.tsx`
   - `apps/webApp/src/app/components/invoices/InvoiceFormContent.tsx`
   - `apps/webApp/src/app/components/inventory/StockAdjustmentDialog.tsx`
   - `apps/webApp/src/app/pages/inventory/TireDetails.tsx`
   - `apps/webApp/src/app/pages/inventory/TireForm.tsx`
   - `apps/webApp/src/app/pages/inventory/TireFormSimple.tsx`
   - `apps/webApp/src/app/pages/inventory/TireList.tsx`
   - `apps/webApp/src/app/pages/inventory/InventoryDashboard.tsx`
   - `apps/webApp/src/app/pages/invoices/InvoiceForm.tsx`

4. **Backend Services**
   - `server/src/tires/tires.controller.ts`
   - `server/src/tires/tires.service.ts`
   - `server/src/tires/repositories/tire.repository.ts`

### Specific Changes Made

1. **Invoice Display**
   - Changed from `${tire.brand} ${tire.model} ${tire.size}` 
   - To: `${tire.brand} - ${tire.size}`

2. **Form Initialization**
   - Removed `model: tire.model || ''` from form data initialization
   - Eliminated model field from all form validation schemas

3. **Display Components**
   - Updated all tire card displays to exclude model
   - Modified table views to show only brand and size
   - Updated image alt tags and titles

4. **Search and Filter**
   - Removed model-based filtering options
   - Updated search to focus on brand and size combinations

## User Interface Changes

### Table View
- **Before:** Showed images + brand + model + size
- **After:** Shows emoji icons based on tire type + brand + size
- **Benefit:** Cleaner, more consistent display with visual tire type indicators

### Grid View (Tire Cards)
- **Before:** Cards showed brand and model separately
- **After:** Cards show only brand prominently with size below
- **Benefit:** Less cluttered, easier to scan

### Invoice Items
- **Before:** "Firestone undefined - 225/65R17" (when model was null)
- **After:** "Firestone - 225/65R17" (clean, consistent format)

## Benefits of This Change

1. **Eliminates Confusion**
   - No more undefined/null model values
   - Clearer distinction between tire identification

2. **Simplifies Data Entry**
   - Staff only need to enter brand and size
   - Reduces potential for data inconsistency

3. **Improves User Experience**
   - Cleaner displays across all interfaces
   - Consistent formatting in invoices and reports

4. **Reduces Maintenance**
   - Fewer fields to validate and maintain
   - Simplified search and filter logic

## Migration Considerations

### Data Loss
- Existing tire model data was preserved during migration
- Model information can be incorporated into notes field if needed

### Backward Compatibility
- All API endpoints remain the same
- Frontend gracefully handles missing model field
- No breaking changes for existing integrations

## Visual Tire Type System

Since removing the model field, tire types are now prominently displayed using emojis:
- 🌤️ All Season
- ☀️ Summer
- ❄️ Winter
- 🏁 Performance
- 🏔️ Off-road
- 🛡️ Run-flat
- 🛞 Default/Other

This visual system provides instant tire type recognition in table views and forms.

## Future Considerations

1. **Brand Standardization**
   - Consider implementing a standardized brand list
   - Prevent typos and variations in brand names

2. **Size Validation**
   - Implement tire size format validation
   - Ensure consistent size formatting (e.g., 225/65R17)

3. **Search Enhancement**
   - Enhance search to work well with brand-size combinations
   - Consider fuzzy search for tire sizes

## Related Documentation

- [Business Rules](./business-rules.md) - Updated tire management rules
- [Completed Work](./completed-work.md) - Implementation timeline
- [Tech Stack](./tech-stack.md) - Database and frontend technologies used

---

**Last Updated:** August 25, 2025
**Migration Status:** ✅ Complete
**Impact:** Low - All functionality preserved with improved UX