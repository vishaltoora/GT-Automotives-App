#!/bin/bash

# Script to update all relevant documentation files with recent changes
# This script updates CLAUDE.md and other documentation files with the latest development progress

set -e  # Exit on any error

echo "🔄 Updating GT Automotive Documentation Files..."

# Get current date for timestamps
CURRENT_DATE=$(date +"%B %d, %Y")

# Function to update CLAUDE.md with recent changes
update_claude_md() {
    echo "📝 Updating CLAUDE.md with recent changes..."
    
    # Create the new recent updates section
    cat > /tmp/recent_updates.md << 'EOF'
### August 26, 2025 - TypeScript Build System & Development Environment Fixes
- ✅ **Build System Resolution**: Fixed all TypeScript compilation errors preventing CI/CD builds
- ✅ **Server-Side TypeScript Fixes**: Resolved DTOs with definite assignment assertions, auth strategy issues, repository inheritance
- ✅ **Module Compatibility**: Fixed CommonJS/ESM compatibility issues in shared libraries for Node.js server compatibility  
- ✅ **Enum Import Resolution**: Updated tire-related components to import TireType/TireCondition from @prisma/client instead of shared interfaces
- ✅ **Development Servers**: Both frontend (localhost:4200) and backend (localhost:3000) now running successfully
- ✅ **Production Build**: Vite build now completes successfully in ~29.5 seconds with proper chunking
- ✅ **Code Cleanup**: Removed unused React imports and fixed Grid component import issues
- ✅ **Error Handling**: Enhanced error handling with proper type checking and audit log fixes

### August 26, 2025 - Customer System Overhaul & UI Enhancements
- ✅ **Customer Independence**: Removed User-Customer relationship - customers are now external entities
- ✅ **Direct Properties**: firstName, lastName, email (optional), phone (optional) stored directly on Customer
- ✅ **Data Migration**: Successfully migrated existing customer data from User to Customer records
- ✅ **Authentication Fix**: Fixed role case sensitivity (ADMIN, STAFF, CUSTOMER) for proper authorization
- ✅ **Confirmation Dialog System**: Created reusable confirmation dialog to replace window.confirm/alert
- ✅ **Custom Error Dialog System**: Comprehensive error handling with branded dialogs, expandable details, and helper functions
- ✅ **UI Improvements**: Email field editable, default address "Prince George, BC", consistent "No phone"/"No email" display
- ✅ **Printable Invoice Fix**: Fixed customer name display and removed contact info from printed invoices
- ✅ **Invoice List Enhancement**: Removed vehicle column, improved customer name display, replaced browser alerts with custom dialogs

EOF

    # Replace the recent updates section in CLAUDE.md
    sed -i.bak '/### August 26, 2025 - Customer System Overhaul/,$d' /Users/vishaltoora/projects/gt-automotives-app/CLAUDE.md
    cat /tmp/recent_updates.md >> /Users/vishaltoora/projects/gt-automotives-app/CLAUDE.md
    
    # Add the rest of the updates back
    cat >> /Users/vishaltoora/projects/gt-automotives-app/CLAUDE.md << 'EOF'

### August 2025 - Customer Management & Invoice System Enhancements
- ✅ **Business Name Support**: Added optional business name field for commercial customers
- ✅ **Enhanced Customer Forms**: Updated CustomerForm and CustomerList with business name support
- ✅ **Invoice Dialog Improvements**: Enhanced invoice creation workflow with better state management
- ✅ **Duplicate Prevention**: Improved customer creation process to prevent duplicates in invoice system
- ✅ **Database Migration**: Successfully added business name field via migration `20250826145527`
- ✅ **Service Layer Updates**: Enhanced customer services and DTOs for business name handling
- ✅ **Dialog-Based Invoice Creation**: Converted Admin Dashboard quick actions from navigation to modal dialog
- ✅ **Grid Component Fixes**: Fixed Grid2 import issues and updated to use modern Material-UI Grid syntax
- ✅ **Material-UI Updates**: Verified latest versions (7.3.1) and resolved import compatibility
- ✅ **Build System Fixes**: Resolved ESM/CommonJS compatibility issues in shared libraries

### August 2025 - Home Page Component Refactoring
- ✅ **Component Modularization**: Split 1900-line Home.tsx into 9 focused components
- ✅ **Better Organization**: Created `/components/home` directory structure
- ✅ **Improved Maintainability**: Each component has single responsibility
- ✅ **TypeScript Enhancements**: Proper interfaces and type definitions
- ✅ **Performance**: Better code splitting with smaller components

### December 2024 - Invoice Printing Enhancements
- ✅ **Logo Integration**: Implemented actual GT logo from `/images-and-logos/logo.png`
- ✅ **Business Registration**: Added "16472991 Canada INC." to invoice headers
- ✅ **Print Quality**: Improved print CSS to minimize browser headers/footers
- ✅ **Error Fixes**: Resolved invoice printing runtime errors
- ✅ **Brand Consistency**: Applied GT brand colors throughout invoices

### August 2025 - Tire System Improvements & UI Enhancements
- ✅ **Tire Model Field Removal**: Eliminated tire model field from schema to simplify tire identification
- ✅ **Image Display Fixes**: Fixed tire image sizing issues in both table and grid views
- ✅ **Table View Enhancement**: Replaced tire images with emoji-based type indicators for cleaner display
- ✅ **Invoice Display Fix**: Resolved "undefined" issue when adding tires to invoices
- ✅ **Schema Migration**: Completed database migration removing model field (20250825151521)
- ✅ **Display Format Update**: Changed tire display from "Brand Model - Size" to "Brand - Size"
- ✅ **Visual Type System**: Implemented emoji-based tire type indicators (🌤️ All Season, ❄️ Winter, etc.)

---

**Last Updated:** August 26, 2025 - TypeScript build system fixes and development environment stability
**Note:** For detailed information on any topic, refer to the specific documentation file linked above.
EOF

    # Update the timestamp
    sed -i.bak "s/Last Updated:.*/Last Updated: $CURRENT_DATE - TypeScript build system fixes and development environment stability/" /Users/vishaltoora/projects/gt-automotives-app/CLAUDE.md
    
    echo "✅ CLAUDE.md updated successfully"
}

# Function to update troubleshooting documentation
update_troubleshooting_md() {
    echo "📝 Updating troubleshooting documentation..."
    
    if [ -f "/Users/vishaltoora/projects/gt-automotives-app/.claude/docs/troubleshooting.md" ]; then
        cat >> /Users/vishaltoora/projects/gt-automotives-app/.claude/docs/troubleshooting.md << 'EOF'

## Build Issues (August 2025)

### TypeScript Compilation Errors
**Problem:** Server-side TypeScript compilation failing with various errors
**Solution:** 
- Add definite assignment assertions (`!`) to DTO properties
- Fix repository inheritance with proper `override` modifiers  
- Update auth strategy parameter ordering
- Use type casting for dynamic model access in base repositories

### TireType/TireCondition Import Errors
**Problem:** Vite build failing with "TireType is not exported" errors
**Solution:** Import enums directly from `@prisma/client` instead of shared interfaces:
```typescript
// Before
import { TireType, TireCondition } from '@gt-automotive/shared-interfaces';

// After  
import { TireType, TireCondition } from '@prisma/client';
```

### CommonJS/ESM Module Issues
**Problem:** Server startup failing with "Unexpected token 'export'" errors
**Solution:** Keep shared libraries as CommonJS for Node.js compatibility:
```json
{
  "compilerOptions": {
    "module": "commonjs"
  }
}
```

EOF
        echo "✅ Troubleshooting documentation updated"
    else
        echo "⚠️  Troubleshooting.md not found, skipping..."
    fi
}

# Function to update completed work documentation
update_completed_work() {
    echo "📝 Updating completed work log..."
    
    if [ -f "/Users/vishaltoora/projects/gt-automotives-app/.claude/docs/completed-work.md" ]; then
        cat >> /Users/vishaltoora/projects/gt-automotives-app/.claude/docs/completed-work.md << 'EOF'

## August 26, 2025 - Build System & Development Environment Fixes

### TypeScript Compilation Issues Resolution
- **Fixed Server DTOs**: Added definite assignment assertions (`!`) to required properties in CreateCustomerDto and CreateInvoiceDto
- **Repository Pattern Updates**: Fixed BaseRepository with proper type casting and override modifiers
- **Auth Strategy Fixes**: Corrected parameter ordering and user creation logic in ClerkJwtStrategy
- **Audit Log Fixes**: Updated property names from `resource` to `entityType` for consistency

### Module System Compatibility
- **Shared Libraries**: Maintained CommonJS module format for Node.js server compatibility
- **Import Resolution**: Fixed TireType/TireCondition imports to use @prisma/client directly
- **Build Pipeline**: Resolved Vite production build issues with proper enum resolution

### Development Environment Stability  
- **Server Startup**: Both frontend (localhost:4200) and backend (localhost:3000) running successfully
- **Hot Reload**: Development servers properly handling file changes
- **Build Process**: Production build completing in ~29.5 seconds with proper chunking

### Code Quality Improvements
- **Import Cleanup**: Removed unused React imports across auth components
- **Type Safety**: Enhanced error handling with proper type checking
- **Component Updates**: Fixed Grid component import issues without breaking functionality

**Files Modified:** 16 files across server DTOs, repositories, auth strategies, and frontend components
**Build Status:** ✅ All builds passing (development and production)
**Testing:** Manual verification of development server functionality

EOF
        echo "✅ Completed work documentation updated"
    else
        echo "⚠️  Completed work documentation not found, skipping..."
    fi
}

# Function to update development setup documentation
update_development_setup() {
    echo "📝 Updating development setup documentation..."
    
    if [ -f "/Users/vishaltoora/projects/gt-automotives-app/.claude/docs/development-setup.md" ]; then
        # Add a note about recent build fixes
        cat >> /Users/vishaltoora/projects/gt-automotives-app/.claude/docs/development-setup.md << 'EOF'

## Recent Build Fixes (August 2025)

The development environment has been stabilized with recent TypeScript and build system fixes:

- **Clean Builds**: All TypeScript compilation errors resolved
- **Module Compatibility**: Shared libraries properly configured for both frontend (Vite/ESM) and backend (Node.js/CommonJS) 
- **Enum Imports**: Tire-related components now import types directly from @prisma/client for better reliability
- **Development Servers**: Both servers start successfully with `yarn dev`

If you encounter build issues, try:
1. `yarn nx reset` - Clear Nx cache
2. `yarn build` - Verify production build works
3. Check that shared libraries use CommonJS module format

EOF
        echo "✅ Development setup documentation updated"
    else
        echo "⚠️  Development setup documentation not found, skipping..."
    fi
}

# Main execution
main() {
    echo "🚀 Starting documentation update process..."
    
    # Update main documentation files
    update_claude_md
    update_troubleshooting_md  
    update_completed_work
    update_development_setup
    
    # Clean up temporary files
    rm -f /tmp/recent_updates.md
    rm -f /Users/vishaltoora/projects/gt-automotives-app/CLAUDE.md.bak
    
    echo ""
    echo "✅ Documentation update completed successfully!"
    echo ""
    echo "📋 Updated files:"
    echo "   - CLAUDE.md (main documentation index)"
    echo "   - .claude/docs/troubleshooting.md (if exists)"
    echo "   - .claude/docs/completed-work.md (if exists)"  
    echo "   - .claude/docs/development-setup.md (if exists)"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Review updated documentation"
    echo "   2. Commit changes: git add . && git commit -m 'docs: update documentation with recent build fixes'"
    echo "   3. Push changes: git push"
}

# Run main function
main