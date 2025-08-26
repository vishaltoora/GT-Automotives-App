# Error Dialog System Usage

This system provides custom error dialogs that replace browser `window.alert` and `console.error` calls.

## Basic Usage

```typescript
import { useError, useErrorHelpers } from '../contexts/ErrorContext';

const MyComponent = () => {
  const { showError, showWarning, showInfo } = useError();
  const { showApiError, showValidationError, showSuccess } = useErrorHelpers();

  // Simple error message
  const handleSimpleError = () => {
    showError('Something went wrong!');
  };

  // Error with details
  const handleDetailedError = () => {
    showError({
      title: 'Custom Title',
      message: 'Main error message',
      details: 'Technical details that can be expanded',
      confirmText: 'Got it!',
    });
  };

  // API Error (most common)
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

  // Validation error
  const handleValidation = () => {
    showValidationError('Please fill in all required fields');
  };
};
```

## Available Helper Functions

- `showApiError(error, customMessage?)` - For API errors
- `showValidationError(message, details?)` - For form validation
- `showNetworkError(error?)` - For network connection issues
- `showPermissionError(action?)` - For permission denied
- `showSuccess(message)` - For success messages
- `showCustomError(title, message, details?)` - Custom error

## Error Dialog Features

- **Severity levels**: error (red), warning (orange), info (blue)
- **Expandable details**: Technical details that users can show/hide
- **Custom buttons**: Configurable button text
- **Consistent styling**: Matches GT Automotive theme
- **Responsive**: Works on all screen sizes

## Migration from window.alert

Replace:
```typescript
// OLD
alert('Error occurred!');
console.error('Error:', error);
```

With:
```typescript
// NEW
showApiError(error, 'Error occurred!');
```

The error dialog automatically logs to console and shows user-friendly messages.