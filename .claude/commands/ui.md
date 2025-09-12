# UI Design Management Commands

## Overview
Commands for maintaining UI consistency, component standardization, and design system implementation across the GT Automotive application.

## Available Commands

### `/ui standardize-icons`
Creates centralized icon system and updates all component imports to use single source.

**Usage:**
```bash
/ui standardize-icons
/ui standardize-icons --check-only
/ui standardize-icons --force-update
```

**What it does:**
- Scans all components for Material-UI icon imports
- Creates/updates `standard.icons.ts` with all used icons
- Replaces direct icon imports with centralized imports
- Organizes icons by category (navigation, actions, business, etc.)
- Updates TypeScript types for icon usage
- Validates no direct @mui/icons-material imports remain

**Options:**
- `--check-only` - Report issues without making changes
- `--force-update` - Update all icons even if already centralized

### `/ui modernize-grid`
Updates all Grid components to modern Material-UI syntax and patterns.

**Usage:**
```bash
/ui modernize-grid
/ui modernize-grid --component TireDialog
/ui modernize-grid --dry-run
```

**What it does:**
- Finds all Grid components using deprecated `item` and `xs/sm/md` props
- Updates to modern `size={{ xs: 12, sm: 6, md: 4 }}` syntax
- Fixes Grid2 import issues and compatibility
- Ensures consistent Grid container/item patterns
- Updates TypeScript types for Grid props

**Options:**
- `--component <name>` - Update specific component only
- `--dry-run` - Show changes without applying them

### `/ui enforce-theme`
Replaces hardcoded colors and styling with theme variables.

**Usage:**
```bash
/ui enforce-theme
/ui enforce-theme --colors-only
/ui enforce-theme --spacing-only
```

**What it does:**
- Scans components for hardcoded color values
- Replaces with `theme.palette` or `colors` utility usage
- Updates hardcoded spacing with theme breakpoints
- Ensures consistent brand color usage
- Validates theme provider integration

**Options:**
- `--colors-only` - Focus only on color standardization
- `--spacing-only` - Focus only on spacing standardization

### `/ui audit-components`
Comprehensive audit of component consistency and design system compliance.

**Usage:**
```bash
/ui audit-components
/ui audit-components --detailed
/ui audit-components --fix-issues
```

**Audit checks:**
- ✅ Icon imports from centralized system
- ✅ Modern Material-UI component usage
- ✅ Theme integration and color consistency
- ✅ Proper TypeScript interfaces and props
- ✅ Component naming and structure standards
- ✅ Responsive design implementation
- ✅ Accessibility compliance

**Options:**
- `--detailed` - Include detailed analysis and recommendations
- `--fix-issues` - Automatically fix detected issues where possible

### `/ui create-component <name>`
Creates new component following GT Automotive design system standards.

**Usage:**
```bash
/ui create-component ProductCard
/ui create-component ServiceDialog --type dialog
/ui create-component CustomerForm --with-validation
```

**Component template includes:**
- Proper TypeScript interface definitions
- Centralized icon imports
- Theme integration
- Modern Material-UI patterns
- DTO usage for data interfaces
- Error handling integration
- Responsive design patterns

**Options:**
- `--type <type>` - Component type (card, dialog, form, list, etc.)
- `--with-validation` - Include form validation patterns
- `--with-theme` - Include advanced theme customization

### `/ui validate-imports`
Validates all imports follow established patterns and standards.

**Usage:**
```bash
/ui validate-imports
/ui validate-imports --strict
/ui validate-imports --fix
```

**Validation checks:**
- ❌ Direct Material-UI icon imports
- ❌ Outdated component import patterns
- ❌ Missing theme imports where needed
- ❌ Inconsistent import organization
- ❌ Unused imports causing build issues

**Options:**
- `--strict` - Apply stricter validation rules
- `--fix` - Automatically fix detected import issues

### `/ui update-theme`
Updates theme configuration and ensures consistent application.

**Usage:**
```bash
/ui update-theme
/ui update-theme --colors-only
/ui update-theme --validate-usage
```

**What it does:**
- Updates theme configuration files
- Validates theme structure and completeness
- Ensures all components use theme correctly
- Updates brand colors and design tokens
- Checks responsive breakpoint usage

**Options:**
- `--colors-only` - Update only color palette
- `--validate-usage` - Check theme usage across components

### `/ui generate-style-guide`
Generates documentation for the design system and component patterns.

**Usage:**
```bash
/ui generate-style-guide
/ui generate-style-guide --components-only
/ui generate-style-guide --interactive
```

**Generated documentation:**
- Component usage examples
- Icon reference guide
- Theme color palette
- Typography scales
- Spacing guidelines
- Grid system documentation
- Best practices guide

**Options:**
- `--components-only` - Focus on component documentation
- `--interactive` - Generate interactive examples

## Command Workflows

### Complete UI Standardization
```bash
# Full UI system standardization
/ui audit-components --detailed
/ui standardize-icons
/ui modernize-grid
/ui enforce-theme
/ui validate-imports --fix
/ui audit-components --fix-issues
```

### New Component Development
```bash
# Create new component with standards
/ui create-component OrderSummary --type card --with-theme
/ui validate-imports --strict
/ui audit-components --component OrderSummary
```

### Theme Update Workflow
```bash
# Update and validate theme changes
/ui update-theme
/ui enforce-theme
/ui validate-imports
/ui audit-components --colors-only
```

### Icon System Maintenance
```bash
# Maintain centralized icon system
/ui standardize-icons --check-only
/ui standardize-icons --force-update
/ui validate-imports --fix
```

## Integration with Other Commands

### With Git Workflows
```bash
# UI changes with proper validation
/ui audit-components --fix-issues
/.claude/scripts/git-workflows-enhanced.sh validate-build quick
/.claude/scripts/git-workflows-enhanced.sh quick-commit "refactor(ui): standardize icons and modernize Grid components"
```

### With DTO System
```bash
# Ensure DTOs are used in UI components
/dto validate
/ui audit-components --detailed
/ui create-component UserProfile --with-validation
```

### With Build System
```bash
# UI validation before deployment
/ui audit-components --fix-issues
/ui validate-imports --strict
yarn typecheck
yarn build:web
```

## Advanced Usage

### Custom Component Templates
```bash
# Create component with specific patterns
/ui create-component TireInventoryCard --type card --with-theme --template automotive
/ui create-component QuoteDialog --type dialog --with-validation --template business
```

### Batch Operations
```bash
# Update multiple components
/ui modernize-grid --components TireDialog,CustomerForm,ProductCard
/ui enforce-theme --components inventory/* --colors-only
```

### Design System Evolution
```bash
# Evolve design system systematically
/ui audit-components --detailed > ui-audit-report.md
/ui generate-style-guide --interactive
/ui update-theme --validate-usage
```

## Error Prevention

### Pre-commit Validation
```bash
# Validate UI changes before commit
/ui validate-imports --strict
/ui audit-components --check-only
yarn typecheck
```

### Integration Testing
```bash
# Ensure UI changes don't break builds
/ui audit-components --fix-issues
yarn build:web
yarn test --passWithNoTests
```

## Success Metrics Tracking

### Design System Health
- Track percentage of components using centralized icons
- Monitor Material-UI pattern modernization progress
- Measure theme consistency across application
- Count hardcoded styling violations

### Developer Experience
- Time to create new components
- Build success rate after UI changes
- TypeScript error reduction in UI components
- Team adoption of design system patterns

This command system provides comprehensive UI design management based on the patterns and issues we identified and resolved in this session, ensuring GT Automotive maintains a professional and consistent user interface.