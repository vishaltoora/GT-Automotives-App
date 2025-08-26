# Development Guidelines

## API Endpoint Patterns
```javascript
// Public endpoints
POST   /api/auth/register      // Customer registration
POST   /api/auth/login         // All users

// Protected endpoints (with role checks)
GET    /api/invoices          // Role-based filtering
POST   /api/invoices          // Staff, Admin only
GET    /api/reports/financial // Admin only
```

## Code Style
- Use async/await over callbacks
- Implement proper error handling with custom error dialogs
- Add role checks at controller level
- Log all admin actions
- Use transactions for critical operations
- Use Grid2 size property syntax: `<Grid size={{ xs: 12, md: 6 }}>` instead of `<Grid xs={12} md={6}>`
- Never use browser dialogs (`window.alert`, `window.confirm`) - use custom dialog system

## Using the Theme System
```javascript
// Import theme colors in components
import { colors } from '../../theme/colors';

// Use in Material-UI sx prop
<Box sx={{ 
  backgroundColor: colors.primary.main,
  color: colors.text.primary,
  background: colors.gradients.hero
}} />

// Access theme in components
import { useTheme } from '@mui/material';
const theme = useTheme();
```

## Grid Layout Best Practices
```javascript
// Modern Grid2 size property syntax
import { Grid } from '@mui/material';

<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
    <Card>Content</Card>
  </Grid>
  <Grid size={{ xs: 12, md: 6, lg: 8 }}>
    <Card>Content</Card>
  </Grid>
</Grid>
```

## MUI Grid2 Migration (August 19, 2025)
All components have been updated to use MUI Grid2 syntax:
```javascript
// Updated import (NEW)
import { Grid } from '@mui/material';  // This now imports Grid2

// Usage remains the same
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    Content here
  </Grid>
</Grid>
```

## Component Development

### Best Practices
- Always use theme colors instead of hardcoded values
- Create reusable components in appropriate directories
- Follow the established pattern for service cards and CTAs
- Use animated hero sections with GT logo and floating icons
- Ensure all components are fully responsive
- Test on mobile devices using browser dev tools
- Use the confirmation dialog system for all user confirmations (never use window.confirm or alert)

### Component Structure (Updated August 26, 2025)
```
apps/webApp/src/app/components/
├── common/          # Common reusable components
│   ├── ConfirmationDialog.tsx
│   └── ErrorDialog.tsx
├── public/          # Shared public components
│   ├── Hero.tsx
│   ├── ServiceCard.tsx
│   ├── CTASection.tsx
│   ├── FeatureHighlight.tsx
│   ├── TestimonialCard.tsx
│   └── index.ts
├── home/            # Home page specific components
│   ├── HeroSection.tsx
│   ├── QuickActionsBar.tsx
│   ├── EmergencyServiceBanner.tsx
│   ├── FeaturedServices.tsx
│   ├── ServiceCategoriesGrid.tsx
│   ├── TireBrandsSection.tsx
│   ├── TrustSection.tsx
│   ├── ContactSection.tsx
│   ├── ServiceAreasSection.tsx
│   └── index.ts     # Barrel export file
├── pricing/         # Pricing page components
│   ├── PricingHero.tsx
│   ├── MobileTireServiceCard.tsx
│   ├── ServiceAreasMap.tsx
│   ├── PromotionsSection.tsx
│   ├── EmergencyServiceBanner.tsx
│   ├── MobileTireServiceSection.tsx
│   └── index.ts
├── products/        # Products page components
│   ├── ProductsHero.tsx
│   ├── ProductCard.tsx
│   ├── ProductsGrid.tsx
│   ├── ProductsFeaturesBar.tsx
│   └── index.ts
├── services/        # Services page components
│   ├── ServicesHero.tsx
│   ├── ServicesGrid.tsx
│   ├── StatsSection.tsx
│   └── index.ts
├── contact/         # Contact page components
│   ├── ContactHero.tsx
│   ├── QuickContactBar.tsx
│   ├── ContactForm.tsx
│   ├── ContactTeam.tsx
│   └── index.ts
├── customers/       # Customer management components
│   └── CustomerDialog.tsx
├── invoices/        # Invoice-related components
│   ├── InvoiceDialog.tsx
│   └── InvoiceFormContent.tsx
├── admin/           # Admin-specific components
├── staff/           # Staff-specific components
└── customer/        # Customer-specific components
```

### Confirmation Dialog Usage (Added August 26, 2025)

Use the standard confirmation dialog system for all user confirmations:

```typescript
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';

export function MyComponent() {
  const { confirmDelete, confirmCancel, confirmSave, confirmAction } = useConfirmationHelpers();

  const handleDelete = async (item) => {
    const confirmed = await confirmDelete(`item "${item.name}"`);
    if (confirmed) {
      // Perform delete operation
      await deleteItem(item.id);
    }
  };

  const handleCustomAction = async () => {
    const confirmed = await confirmAction(
      'Export Data', 
      'This will export all customer data to CSV. Continue?'
    );
    if (confirmed) {
      // Perform export
    }
  };
}
```

**Never use:**
- `window.confirm()`
- `window.alert()`
- `alert()`
- `confirm()`

**Always use the confirmation dialog for:**
- Delete operations
- Cancel operations
- Destructive actions
- Important state changes
- Data exports
- Any user confirmation needs

### Error Handling Patterns (Added August 26, 2025)

Use the custom error dialog system for all error messages and user notifications:

```typescript
import { useError, useErrorHelpers } from '../../contexts/ErrorContext';

export function MyComponent() {
  const { showError, showWarning, showInfo } = useError();
  const { showApiError, showValidationError, showSuccess, showNetworkError } = useErrorHelpers();

  // API Error handling (most common)
  const handleApiCall = async () => {
    try {
      const result = await apiService.saveData(data);
      showSuccess('Data saved successfully!');
    } catch (error) {
      showApiError(error, 'Failed to save data');
    }
  };

  // Form validation error
  const handleValidation = () => {
    if (!formData.name) {
      showValidationError('Name is required');
      return;
    }
  };

  // Custom error with details
  const handleCustomError = () => {
    showError({
      title: 'Import Failed',
      message: 'The CSV file format is not supported.',
      details: 'Expected columns: name, email, phone. Found: firstName, lastName, contact.',
      confirmText: 'Choose Different File'
    });
  };
}
```

**Error Dialog Best Practices:**
- Use `showApiError()` for all API/network errors - it handles error parsing automatically
- Use `showValidationError()` for form validation issues
- Use `showSuccess()` for positive feedback after successful operations
- Include helpful error messages that guide users toward solutions
- Add technical details for developers while keeping main message user-friendly
- Use appropriate severity levels (error, warning, info)

**Migration from Console Logging:**
```typescript
// OLD - Don't do this
console.error('Error loading data:', error);
alert('Failed to load data');

// NEW - Do this instead
showApiError(error, 'Failed to load data');
```

**Error Context Benefits:**
- Consistent styling across the application
- Automatic error logging to console
- User-friendly error messages with expandable technical details
- Centralized error handling reduces code duplication
- Improved user experience with branded dialogs

### Component Guidelines
- **Single Responsibility:** Each component should have one clear purpose
- **File Size:** Keep components under 300 lines when possible
- **Modularization:** Break large components into smaller sub-components
- **TypeScript:** Define proper interfaces for props and data structures
- **Exports:** Use barrel exports (index.ts) for cleaner imports
- **Naming:** Use descriptive names that indicate the component's purpose

### Example Component Pattern
```typescript
// Define interfaces
interface ComponentProps {
  title: string;
  data: DataType[];
}

// Export named component
export function ComponentName({ title, data }: ComponentProps) {
  // Component logic
  return (
    <Box>
      {/* Component JSX */}
    </Box>
  );
}

// Helper sub-components (if needed)
function SubComponent({ item }: { item: DataType }) {
  return <div>{item.name}</div>;
}
```

## Git Workflow
```bash
# Feature branches
git checkout -b feature/epic-XX-description

# Commit format
git commit -m "Epic-XX: Add specific feature

- Implementation detail 1
- Implementation detail 2"
```

## Testing Approach

### Role-Based Testing
Always test features with all three roles:
1. **Customer:** Can only see own data
2. **Staff:** Can see all customer data but no financial totals
3. **Admin:** Has complete access

### Critical Test Scenarios
- Invoice printing in all formats
- Customer data isolation
- Inventory deduction on sale
- Appointment scheduling conflicts
- Role permission boundaries

## Security Considerations

### Authentication
- JWT tokens expire in 24 hours
- Refresh tokens for extended sessions
- Role claim must be validated on every request

### Data Protection
- Customer data isolation is critical
- Use parameterized queries (no SQL injection)
- Validate all input
- Sanitize output
- HTTPS required in production

### Audit Logging
- Log all admin actions
- Track inventory adjustments
- Record price changes
- Monitor failed login attempts

## Performance Optimization

### Database
- Index frequently searched fields
- Use pagination for large lists
- Optimize invoice queries with joins
- Cache frequently accessed data

### Frontend
- Lazy load role-specific components
- Implement virtual scrolling for long lists
- Optimize images (especially tire photos)
- Use print CSS to reduce invoice render time