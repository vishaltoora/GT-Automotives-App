# UI Components Documentation

## Common Components

### ConfirmationDialog
**Location:** `/apps/webApp/src/app/components/common/ConfirmationDialog.tsx`

A reusable Material-UI dialog for user confirmations, replacing native browser dialogs.

**Features:**
- Multiple severity levels (warning, error, info, success)
- Customizable button text and colors
- Async operation support with loading states
- Icons based on severity type
- Consistent styling with app theme

**Props:**
```typescript
interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;  // Default: "Confirm"
  cancelText?: string;   // Default: "Cancel"
  severity?: 'warning' | 'error' | 'info' | 'success';  // Default: "warning"
  confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  showCancelButton?: boolean;  // Default: true
}
```

### ConfirmationContext
**Location:** `/apps/webApp/src/app/contexts/ConfirmationContext.tsx`

Global context provider for confirmation dialogs.

**Usage:**
```typescript
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';

const { confirmDelete, confirmCancel, confirmSave, confirmAction } = useConfirmationHelpers();

// Delete confirmation
const confirmed = await confirmDelete('customer "John Doe"');

// Custom action
const confirmed = await confirmAction('Export Data', 'Export all records to CSV?');
```

### ErrorDialog
**Location:** `/apps/webApp/src/app/components/common/ErrorDialog.tsx`

A reusable Material-UI dialog for displaying error messages, warnings, and info messages to users.

**Features:**
- Multiple severity levels (error, warning, info)
- Expandable technical details section
- Custom icons and colors based on severity
- Consistent styling with GT Automotive theme
- Optional "Show Details" functionality

**Props:**
```typescript
interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;           // Auto-generated based on severity if not provided
  message: string;
  severity?: 'error' | 'warning' | 'info';  // Default: "error"
  details?: string;         // Technical details (expandable)
  showDetails?: boolean;    // Show details expanded by default
  confirmText?: string;     // Default: "OK"
}
```

### ErrorContext
**Location:** `/apps/webApp/src/app/contexts/ErrorContext.tsx`

Global context provider for error handling throughout the application.

**Basic Usage:**
```typescript
import { useError, useErrorHelpers } from '../../contexts/ErrorContext';

const MyComponent = () => {
  const { showError, showWarning, showInfo } = useError();
  const { showApiError, showValidationError, showSuccess } = useErrorHelpers();

  // Simple error message
  const handleError = () => {
    showError('Something went wrong!');
  };

  // API error with details
  const handleApiCall = async () => {
    try {
      await someApiCall();
    } catch (error) {
      showApiError(error, 'Failed to save data');
    }
  };

  // Success message
  const handleSuccess = () => {
    showSuccess('Data saved successfully!');
  };
};
```

**Available Helper Functions:**
- `showApiError(error, customMessage?)` - For API/network errors
- `showValidationError(message, details?)` - For form validation issues
- `showNetworkError(error?)` - For connection problems  
- `showPermissionError(action?)` - For access denied scenarios
- `showSuccess(message)` - For success notifications
- `showCustomError(title, message, details?)` - For custom error scenarios

## Customer Components

### CustomerDialog
**Location:** `/apps/webApp/src/app/components/customers/CustomerDialog.tsx`

Modal dialog for creating and editing customers.

**Features:**
- Create new customers
- Edit existing customers
- Form validation
- Business name support
- Optional email/phone fields
- Default address value ("Prince George, BC")

**Props:**
```typescript
interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId?: string;
  customer?: Customer;
}
```

## Invoice Components

### InvoiceDialog
**Location:** `/apps/webApp/src/app/components/invoices/InvoiceDialog.tsx`

Modal dialog for creating invoices directly from dashboards.

**Features:**
- Customer selection or creation
- Vehicle selection or creation
- Dynamic item addition
- Tax calculation (GST/PST)
- Real-time total calculation
- Tire inventory integration

### InvoiceFormContent
**Location:** `/apps/webApp/src/app/components/invoices/InvoiceFormContent.tsx`

Reusable invoice form content component used within InvoiceDialog.

**Features:**
- Customer autocomplete with search
- Searchable by name, phone, or email
- Shows only customer names in dropdown
- Add new customer inline
- Vehicle management
- Invoice items management
- Tax configuration

## Usage Guidelines

### Modal Dialogs
All modal dialogs should follow this pattern:
- Use Material-UI Dialog component
- Include proper header with close button
- Add loading states for async operations
- Handle errors gracefully
- Use theme colors and gradients
- Ensure proper z-index layering

### Form Components
- Use controlled components with React state
- Implement proper validation
- Show loading states during submission
- Display error messages clearly
- Use Material-UI TextField components
- Add proper labels and placeholders

### Data Display
- Use Material-UI Table for lists
- Implement proper pagination when needed
- Add search/filter capabilities
- Show empty states with helpful messages
- Use Chip components for status indicators
- Format dates and currency consistently

## Best Practices

1. **Consistency:** Use the same patterns across similar components
2. **Accessibility:** Ensure keyboard navigation and screen reader support
3. **Responsiveness:** Test on mobile and desktop viewports
4. **Error Handling:** Always provide user feedback for errors
5. **Loading States:** Show skeletons or spinners during data fetching
6. **Confirmation:** Use ConfirmationDialog for all destructive actions
7. **Validation:** Validate on blur and before submission
8. **Theme:** Always use theme colors, never hardcode values

## Component Hierarchy

```
App
├── ErrorProvider (Global)
│   └── ErrorDialog (Singleton)
├── ConfirmationProvider (Global)
│   └── ConfirmationDialog (Singleton)
├── Pages
│   ├── CustomerList
│   │   └── CustomerDialog
│   ├── InvoiceList
│   │   └── InvoiceDialog
│   │       └── InvoiceFormContent
│   └── VehicleList
└── Layouts
    ├── PublicLayout
    ├── CustomerLayout
    ├── StaffLayout
    └── AdminLayout
```

## Recent Changes (August 26, 2025)

- **Added ErrorDialog System**: Custom error/warning/info dialogs with expandable details
- **Added ConfirmationDialog System**: Replaced browser alerts with custom dialogs
- **Enhanced Error Handling**: Centralized error context with helper functions for common scenarios
- Updated CustomerDialog to allow email editing
- Set default address to "Prince George, BC"
- Improved customer list display consistency
- Fixed printable invoice customer name display
- Removed phone/email from printable invoices
- **Migration**: All `window.alert()` and `console.error()` calls replaced with custom dialogs