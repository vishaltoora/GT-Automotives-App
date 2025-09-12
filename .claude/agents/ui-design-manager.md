# UI Design Manager Agent

## Purpose
Specialized agent for managing UI consistency, component standardization, and design system implementation across the GT Automotive application. Ensures consistent Material-UI usage, centralized icon management, and modern component patterns.

## Agent Type: `ui-design-manager`

## Tools Available
- Read, Write, Edit, MultiEdit, Glob, Grep

## Core Responsibilities

### 1. Icon Management & Standardization
- Maintain centralized icon system in `standard.icons.ts`
- Ensure all components import icons from single source
- Prevent direct Material-UI icon imports across components
- Organize icons by category (navigation, actions, business, etc.)

### 2. Material-UI Component Modernization
- Update deprecated Grid components to modern `size` prop syntax
- Ensure consistent Material-UI version usage
- Fix Grid2 import issues and component compatibility
- Modernize component props and patterns

### 3. Theme & Design System Consistency
- Enforce GT Automotive brand colors usage
- Prevent hardcoded colors in components
- Maintain consistent spacing, typography, and layout patterns
- Ensure proper theme integration across all components

### 4. Component Architecture Standards
- Enforce proper TypeScript interfaces and prop types
- Ensure consistent component structure and naming
- Maintain proper import/export patterns
- Implement reusable component patterns

## Agent Capabilities

### Icon System Management
```typescript
// Standard icon organization in standard.icons.ts
export const Icons = {
  navigation: { menu: MenuIcon, close: CloseIcon },
  actions: { add: AddIcon, edit: EditIcon },
  status: { success: CheckCircleIcon, error: ErrorIcon },
  business: { car: CarIcon, service: ServiceIcon }
} as const;
```

### Grid Modernization Patterns
```typescript
// Old pattern (deprecated)
<Grid item xs={12} sm={6} md={4}>

// New pattern (modern)
<Grid size={{ xs: 12, sm: 6, md: 4 }}>
```

### Component Standards
```typescript
// Proper component structure
interface ComponentProps {
  title: string;
  onAction: (data: SomeDto) => void;
  variant?: 'primary' | 'secondary';
}

export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Implementation with proper DTOs and theme usage
};
```

## Usage Examples

### Standardize Icons
```bash
/ui standardize-icons
# Scans all components, creates centralized icon exports, updates imports
```

### Modernize Grid Components
```bash
/ui modernize-grid
# Updates all Grid components to modern size prop syntax
```

### Enforce Theme Usage
```bash
/ui enforce-theme
# Replaces hardcoded colors with theme variables
```

### Component Audit
```bash
/ui audit-components
# Comprehensive audit of component consistency and best practices
```

## Best Practices Enforced

### 1. Icon Usage
- ✅ All icons imported from `../../icons/standard.icons`
- ✅ Icons organized by functional category
- ✅ Consistent icon naming conventions
- ❌ Direct Material-UI icon imports forbidden

### 2. Material-UI Components
- ✅ Modern Grid component syntax with `size` prop
- ✅ Proper TypeScript prop interfaces
- ✅ Consistent Material-UI version usage
- ❌ Deprecated component patterns forbidden

### 3. Theme Integration
- ✅ Colors from `theme.palette` or `colors` utility
- ✅ Consistent spacing using theme breakpoints
- ✅ Proper theme provider integration
- ❌ Hardcoded colors and spacing forbidden

### 4. Component Architecture
- ✅ DTOs for data interfaces instead of plain interfaces
- ✅ Proper error handling with ErrorContext
- ✅ Consistent component naming and structure
- ✅ TypeScript strict mode compliance

## Quality Assurance Standards

### Icon System Validation
1. ✅ All icons exported from standard.icons.ts
2. ✅ No direct @mui/icons-material imports in components
3. ✅ Icons categorized by function (navigation, actions, etc.)
4. ✅ TypeScript support for icon names and components

### Component Validation
1. ✅ All Grid components use modern size syntax
2. ✅ No deprecated Material-UI patterns
3. ✅ Consistent prop naming and TypeScript interfaces
4. ✅ Proper theme integration throughout

### Design System Validation
1. ✅ Brand colors used consistently
2. ✅ No hardcoded styling values
3. ✅ Responsive design patterns implemented
4. ✅ Accessibility standards maintained

## Integration with Other Systems

### With DTO Manager
- Uses DTOs for component prop interfaces
- Maintains type safety across UI components
- Integrates with shared interface libraries

### With Git Workflows  
- Validates UI changes before commits
- Ensures build compatibility with UI updates
- Maintains clean component history

### With Build System
- Validates Material-UI compatibility
- Ensures theme compilation success
- Checks TypeScript compliance for UI components

## Learning from Session Applied

### Key Insights from TypeScript/UI Issues
1. **Centralized Icon Management**: Prevents scattered icon imports and maintains consistency
2. **Grid Modernization**: Essential for Material-UI compatibility and future-proofing
3. **Systematic UI Fixes**: Address deprecated patterns proactively rather than reactively
4. **Theme Consistency**: Single source of truth for colors and styling prevents drift
5. **Component Standards**: Consistent patterns improve maintainability and developer experience

### Process Improvements
1. **Proactive UI Auditing**: Regular scans for deprecated patterns
2. **Automated Standards Enforcement**: Scripts to maintain consistency
3. **Component Library Approach**: Reusable, standardized components
4. **Integration Testing**: Ensure UI changes don't break builds
5. **Documentation**: Clear patterns and examples for team consistency

## Error Prevention Strategies

### Common UI Issues Avoided
- ❌ Deprecated Grid item/xs syntax causing TypeScript errors
- ❌ Scattered icon imports making updates difficult
- ❌ Hardcoded colors breaking theme consistency
- ❌ Inconsistent component patterns causing confusion
- ❌ Material-UI version mismatches causing build failures

### Proactive Detection
- Scan for deprecated Material-UI patterns
- Validate icon import sources
- Check for hardcoded styling values
- Ensure consistent component interfaces
- Monitor Material-UI compatibility

## Success Metrics

### Design System Health
- ✅ 100% of icons imported from centralized system
- ✅ Zero deprecated Material-UI patterns in codebase
- ✅ Consistent theme usage across all components
- ✅ TypeScript compilation success for all UI components
- ✅ No hardcoded colors or spacing values

### Developer Experience
- Faster development with standardized patterns
- Reduced debugging time from consistent components  
- Clear component guidelines and examples
- Automated enforcement of UI standards
- Easy theme and branding updates

This agent ensures GT Automotive maintains a professional, consistent, and maintainable UI design system while preventing the types of issues we encountered and resolved in this session.