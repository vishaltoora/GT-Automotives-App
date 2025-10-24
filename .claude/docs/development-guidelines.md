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

## Environment Variable Access (Critical)
⚠️ **Always use direct `import.meta.env` access for Vite environment variables**

```typescript
// ✅ CORRECT - Direct access (works reliably)
// @ts-ignore
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// ❌ AVOID - Utility function may fail
const publishableKey = getEnvVar('VITE_CLERK_PUBLISHABLE_KEY');
```

**Why this matters:**
- The `getEnvVar()` utility uses complex eval-based logic that can fail
- Inconsistent environment variable access causes authentication failures
- Direct `import.meta.env` access is guaranteed to work with Vite

**Common Issues:**
- Authentication appears to work but session doesn't persist
- `useAuth` hook falls back to mock providers unintentionally
- Console shows `publishableKey: 'NONE'` despite key being set

## Database Schema Management (Critical - September 28, 2025)

### **GOLDEN RULE: NEVER modify schema.prisma without creating migrations**

**Schema Change Workflow (MANDATORY):**
```bash
# 1. BEFORE any schema changes - check current state
yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma

# 2. Make your schema changes in schema.prisma
# Edit libs/database/src/lib/prisma/schema.prisma

# 3. IMMEDIATELY create migration (required)
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" npx prisma migrate dev --name "descriptive_name" --schema=libs/database/src/lib/prisma/schema.prisma

# 4. Test locally first
yarn dev  # Verify everything works

# 5. Deploy to production ONLY after local testing
DATABASE_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma
```

**Critical Rules:**
- ❌ **NEVER commit schema changes without migrations**
- ❌ **NEVER modify production database directly**
- ❌ **NEVER skip migration testing locally**
- ✅ **ALWAYS create migrations for ANY schema change**
- ✅ **ALWAYS test migrations locally before production**
- ✅ **ALWAYS use production-safe migration patterns for breaking changes**

**Schema Drift Prevention:**
```bash
# Before deploying - always verify consistency
DATABASE_URL="production_url" yarn prisma migrate status
# Should show: "Database schema is up to date!"
```

**Production-Safe Migration Pattern:**
```sql
-- For adding required fields to tables with existing data
ALTER TABLE "TableName" ADD COLUMN "newField" TEXT; -- nullable first
UPDATE "TableName" SET "newField" = 'default_value'; -- populate
ALTER TABLE "TableName" ALTER COLUMN "newField" SET NOT NULL; -- make required
```

## DTO Best Practices (Updated September 2025)
- **Use DTOs for all data transfer** - No interfaces for API contracts
- **Import enums from @prisma/client** - Never create custom enums that duplicate Prisma
- **Use `undefined` for optional fields** - Not `null` (convert in repository layer)
- **Apply class-validator decorators** - Comprehensive validation on all fields
- **🔥 CRITICAL: Use mapped types for Update DTOs** - `implements Partial<CreateDto>` for consistency

### Mapped Types for Update DTOs (Best Practice)
```typescript
// ✅ CORRECT: Use mapped types
export class UpdateTireDto implements Partial<CreateTireDto> {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsEnum(TireType)
  type?: TireType;
}

// ❌ WRONG: Manual field duplication - prone to inconsistencies
export class UpdateTireDto {
  @IsOptional()
  @IsString()
  brand?: string;
  // Easy to miss fields or get out of sync
}
```

**Benefits:**
- **Type Safety**: Changes to CreateDto automatically reflect in UpdateDto
- **DRY Principle**: Single source of truth for field definitions
- **Maintainability**: No field duplication or sync issues
- **IDE Support**: Better IntelliSense and autocompletion

**Advanced Patterns:**
- `Partial<CreateDto>`: All fields optional (most common)
- `Partial<Omit<CreateDto, 'id'>>`: Exclude immutable fields
- `Pick<CreateDto, 'field1' | 'field2'>`: Only specific fields updatable
- **Organize by domain** - Group related DTOs in `libs/shared/dto/src/lib/domain/`
- **Create separate CRUD DTOs** - `CreateEntityDto`, `UpdateEntityDto`, `EntityResponseDto`
- **Use definite assignment assertions** - Required fields: `field!: type`
- **Enable experimental decorators** - In tsconfig.json for class-validator support
- **Test DTO validation** - Unit tests for all validation rules
- **Convert systematically** - When migrating from interfaces to DTOs

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

## SMS/Text Messaging Best Practices (Added October 23, 2025)

### Phone Number Format
**Always use E.164 format**: `+1XXXXXXXXXX` (Canada/US)

```typescript
// ✅ CORRECT: E.164 validation
const phoneRegex = /^\+1\d{10}$/;
if (!phoneRegex.test(phoneNumber)) {
  throw new Error('Invalid phone format');
}

// ✅ CORRECT: Storage with +1 prefix
customer.phone = '+12506499699';

// ❌ INCORRECT: Missing +1 prefix
customer.phone = '2506499699';
```

### Opt-In Compliance (TCPA)
**Never send SMS without explicit opt-in**:

```typescript
// ✅ CORRECT: Always check opt-in before sending
const prefs = await prisma.smsPreference.findUnique({
  where: { customerId: customer.id },
});

if (!prefs?.optedIn) {
  return { success: false, error: 'Customer has not opted in' };
}

// ✅ CORRECT: Check specific preference categories
if (type === 'PROMOTIONAL' && !prefs.promotional) {
  return { success: false, error: 'Customer opted out of promotional messages' };
}
```

### Non-Blocking SMS
**SMS failures should NEVER block critical operations**:

```typescript
// ✅ CORRECT: Non-blocking SMS with error handling
const appointment = await this.prisma.appointment.create({ ... });

// Send SMS but don't fail if SMS service is down
await this.smsService.sendAppointmentConfirmation(appointment.id).catch(err => {
  console.error('Failed to send SMS:', err);
  // Don't throw - appointment was created successfully
});

return appointment;

// ❌ INCORRECT: Blocks appointment creation if SMS fails
await this.smsService.sendAppointmentConfirmation(appointment.id);
```

### Message Templates
**Keep messages clear, branded, and concise**:

```typescript
// ✅ CORRECT: Clear, branded message under 160 chars
const message =
  `Hi ${customer.firstName}, your appointment at GT Automotive is confirmed!\n\n` +
  `Service: ${serviceType}\n` +
  `Date: ${formattedDate} at ${time}\n\n` +
  `Call (250) 986-9191 to reschedule.\n\n` +
  `GT Automotive\nPrince George, BC`;

// ✅ CORRECT: Personalization with first name
`Hi ${customer.firstName}, ...`

// ❌ INCORRECT: Generic, no branding
`Your appointment is confirmed for ${date}.`
```

### Cost Optimization
**Keep messages under 160 characters when possible**:

```typescript
// ✅ CORRECT: Single segment (160 chars max) = $0.004
const message = `Hi ${name}, apt confirmed for ${date} at ${time}. Call us at (250) 986-9191. - GT Automotive`;

// ⚠️ WARNING: Multiple segments = $0.004 per segment
// Unicode emojis force 70-char segments
const message = `Hi ${name} 👋, your appointment is confirmed! 🚗...`; // 2-3 segments = $0.008-$0.012
```

### Error Handling & Logging
**Track all SMS attempts in database**:

```typescript
// ✅ CORRECT: Create database record before sending
const smsRecord = await this.prisma.smsMessage.create({
  data: {
    to: phoneNumber,
    from: this.fromNumber,
    body: message,
    type: SmsType.APPOINTMENT_CONFIRMATION,
    status: SmsStatus.PENDING,
    customerId: customer.id,
  },
});

try {
  // Send via Telnyx
  const response = await this.telnyx.messages.create({ ... });

  // Update with success
  await this.prisma.smsMessage.update({
    where: { id: smsRecord.id },
    data: {
      status: SmsStatus.QUEUED,
      telnyxMessageId: response.data.id,
      sentAt: new Date(),
    },
  });
} catch (error) {
  // Update with failure
  await this.prisma.smsMessage.update({
    where: { id: smsRecord.id },
    data: {
      status: SmsStatus.FAILED,
      errorMessage: error.message,
    },
  });
}
```

### Module Integration
**Import SmsModule for SMS functionality**:

```typescript
// feature.module.ts
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [SmsModule], // ✅ Add to imports
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}

// feature.service.ts
import { SmsService } from '../sms/sms.service';

export class FeatureService {
  constructor(
    private smsService: SmsService, // ✅ Inject service
  ) {}

  async createFeature() {
    // Create feature
    const result = await this.prisma.feature.create({ ... });

    // Send SMS notification
    await this.smsService.sendFeatureNotification(result.id).catch(console.error);

    return result;
  }
}
```

### Testing SMS Locally
**Use your own cell phone for testing**:

```bash
# 1. Set environment variables
cat server/.env | grep SMS
SMS_ENABLED=true
TELNYX_API_KEY=KEY...
TELNYX_PHONE_NUMBER=+12366015757

# 2. Create test customer with your phone
customer.phone = '+1YOUR_CELL_NUMBER'

# 3. Manually set opt-in for testing
psql $DATABASE_URL
INSERT INTO sms_preferences (id, customer_id, opted_in, opted_in_at)
VALUES (gen_random_uuid(), 'CUSTOMER_ID', true, NOW());

# 4. Trigger SMS action (e.g., create appointment)
# Should receive SMS on your phone

# 5. Check database for SMS record
SELECT * FROM sms_messages ORDER BY created_at DESC LIMIT 5;
```

### Common SMS Errors

**Error: "Invalid phone number format"**
```typescript
// Fix: Ensure +1 prefix
phoneNumber = '+1' + phoneNumber.replace(/\D/g, '');
```

**Error: "Customer has not opted in"**
```typescript
// Fix: Create opt-in preference
await prisma.smsPreference.create({
  data: {
    customerId: customer.id,
    optedIn: true,
    optedInAt: new Date(),
    appointmentReminders: true,
  },
});
```

**Error: "SMS service is disabled"**
```bash
# Fix: Enable in environment
SMS_ENABLED=true
```

**Error: "Phone number not linked to messaging profile"**
```bash
# Fix: Link phone to profile via Telnyx API
curl -X PATCH https://api.telnyx.com/v2/phone_numbers/{id}/messaging \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -d '{"messaging_profile_id": "YOUR_PROFILE_ID"}'
```

### Related Documentation
- [SMS Feature Manager Agent](.claude/agents/sms-feature-manager.md) - Complete SMS management guide
- [SMS Integration Plan](.claude/docs/sms-integration-plan.md) - Implementation timeline
- [Telnyx Setup Guide](.claude/docs/telnyx-setup-guide.md) - Provider configuration

## TypeScript Best Practices (Updated September 29, 2025)

### Material-UI Component Props
```typescript
// ✅ CORRECT: Use sx prop for font styling
<TableCell sx={{ fontWeight: 'bold' }}>Header</TableCell>

// ❌ INCORRECT: Direct props deprecated
<TableCell fontWeight="bold">Header</TableCell>
```

### Enum Compatibility and Type Safety
```typescript
// ✅ CORRECT: Proper enum typing with conditional checks
const filterParams = {
  status: filters.status ? (filters.status as JobStatus) : undefined,
  jobType: filters.jobType ? (filters.jobType as JobType) : undefined,
};

// ✅ CORRECT: Safe optional chaining for undefined values
if ((formData.amount || 0) <= 0) {
  setError('Amount must be greater than 0');
}

// ✅ CORRECT: String literal with type assertion for enum compatibility
const payment = {
  paymentMethod: 'CASH' as PaymentMethod,
  amount: formData.amount || 0
};
```

### Enum Mapping Records Pattern (From MyPersn)
```typescript
// ✅ BEST PRACTICE: Create user-friendly label mappings
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: 'Pending',
  READY: 'Ready for Payment',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  PARTIALLY_PAID: 'Partially Paid'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  CHECK: 'Check',
  E_TRANSFER: 'E-Transfer',
  FINANCING: 'Financing'
};

// Usage in components
<MenuItem value={status}>
  {JOB_STATUS_LABELS[status]}
</MenuItem>
```

### Prisma Relation Handling
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

// ❌ INCORRECT: Direct ID assignment may fail
const jobData = {
  employeeId: createJobDto.employeeId, // May cause relation issues
};
```

### Import Organization
```typescript
// ✅ CORRECT: Import enums from @gt-automotive/data (shared)
import { JobStatus, JobType, PaymentMethod } from '@gt-automotive/data';

// ✅ CORRECT: Import from @prisma/client when using Prisma directly
import { TireType, TireCondition } from '@prisma/client';

// Clean up unused imports regularly
// Remove console.log statements before committing
```

## Vite Configuration Best Practices (Critical - September 29, 2025)

### Path Resolution for CI/CD Compatibility
```typescript
// ✅ CORRECT: Use relative paths for alias configuration
resolve: {
  alias: {
    '@gt-automotive/data': '../../libs/data/src/index.ts',
  },
},

// ❌ INCORRECT: Absolute paths fail in CI/CD environments
resolve: {
  alias: {
    '@gt-automotive/data': '/Users/username/projects/app/libs/data/src/index.ts',
  },
},
```

**Why Relative Paths are Critical:**
- Absolute paths only work on specific machines
- GitHub Actions runners have different file system paths
- Relative paths work consistently across all environments
- Prevents `ENOENT: no such file or directory` build failures

**Common Vite Build Issues:**
- Module resolution failures in production builds
- Path not found errors during CI/CD
- Works locally but fails in GitHub Actions
- Build step fails with "could not load" errors

## Icon Management Best Practices (October 1, 2025)

### Centralized Icon System
Always use the centralized `standard.icons.ts` file for consistent icon management:

```typescript
// ✅ CORRECT: Use centralized icon imports
import { AddIcon, EditIcon, DeleteIcon } from '../../icons/standard.icons';

// ❌ INCORRECT: Individual Material-UI icon imports
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
```

**Benefits of Centralized Icon Management:**
- **Bundle Optimization**: Reduces duplicate icon imports across components
- **Consistency**: Single source of truth for all icons used in the application
- **Maintainability**: Easy to change icon mappings globally
- **Code Quality**: Cleaner imports and better organization
- **Performance**: Better tree-shaking and smaller bundle size

### Standard Icons Structure
The `standard.icons.ts` file organizes icons by category:

```typescript
// Navigation & UI Icons
export { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';

// Action Icons
export { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Business Icons
export { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';

// Status & Feedback Icons
export { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
```

### Icon Refactoring Process
When migrating components to use centralized icons:

1. **Identify Icon Usage**: Search for `@mui/icons-material` imports
2. **Check Standard Icons**: Verify required icons exist in `standard.icons.ts`
3. **Add Missing Icons**: Add any missing icons to appropriate categories
4. **Update Imports**: Replace individual imports with centralized imports
5. **Maintain Other Imports**: Keep non-icon MUI imports (IconButton, etc.)

### Example Migration
```typescript
// BEFORE: Individual imports
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

// AFTER: Centralized imports
import { AddIcon, EditIcon, DeleteIcon } from '../../icons/standard.icons';
import { IconButton, Tooltip } from '@mui/material';
```

### Architecture Benefits
- **Type Safety**: Maintains TypeScript support
- **IDE Support**: Better IntelliSense and autocompletion
- **Scalability**: Easy to add new icons or change existing ones
- **Code Reviews**: Easier to spot inconsistent icon usage
- **Performance Monitoring**: Can track icon bundle impact centrally

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
- **Use centralized icon imports** for better bundle optimization