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
- Implement proper error handling
- Add role checks at controller level
- Log all admin actions
- Use transactions for critical operations

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
- Always use theme colors instead of hardcoded values
- Create reusable components in `/components/public/`
- Follow the established pattern for service cards and CTAs
- Use animated hero sections with GT logo and floating icons
- Ensure all components are fully responsive
- Test on mobile devices using browser dev tools

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