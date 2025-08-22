# Business Rules & Requirements

## Invoice Printing
- **Must support:** 8.5x11 paper, thermal receipt (80mm), PDF
- **Include:** Company logo, full address, tax number
- **Customer copy:** Shows all details
- **Design:** Professional with clear line items

## Inventory Management
- Automatic deduction on invoice creation
- Low stock alerts at 5 units
- Used tires require condition rating
- Photos required for used tires

## Data Access Rules
- Customers see ONLY their own data
- Staff cannot modify prices
- Financial reports are admin-only
- All admin actions are logged

## Mobile Tire Service Pricing
Complete pricing structure with 6 service categories:
- Installation & Balancing
- Seasonal Tire Change
- Flat Repair
- Tire Rotation
- Mobile Emergency Service
- Winter Tire Packages

## Service Area
- 20km free service zone around Prince George
- Detailed area listings including:
  - Prince George (Central Hub)
  - Surrounding communities
  - Industrial areas

## Contact Information
- **Phone:** 250-570-2333
- **Email:** gt-automotives@outlook.com
- **Business Hours:** Monday-Saturday (varies by day)

## Key Features (8 Epics)

1. **[EPIC-01: Project Setup](https://github.com/vishaltoora/GT-Automotives-App/issues/1)** - Infrastructure and environment ✅ **COMPLETE**
2. **[EPIC-02: Authentication](https://github.com/vishaltoora/GT-Automotives-App/issues/2)** - Three-role system with Clerk ✅ **COMPLETE**
3. **[EPIC-03: Tire Inventory](https://github.com/vishaltoora/GT-Automotives-App/issues/3)** - New/used tire management ✅ **COMPLETE**
4. **[EPIC-04: Customer Management](https://github.com/vishaltoora/GT-Automotives-App/issues/4)** - Customers and vehicles ✅ **COMPLETE**
5. **[EPIC-05: Invoicing](https://github.com/vishaltoora/GT-Automotives-App/issues/5)** - Creation and printing ✅ **COMPLETE**
6. **[EPIC-06: Appointments](https://github.com/vishaltoora/GT-Automotives-App/issues/6)** - Scheduling with reminders
7. **[EPIC-07: Reporting](https://github.com/vishaltoora/GT-Automotives-App/issues/7)** - Business analytics (admin-only)
8. **[EPIC-08: Customer Portal](https://github.com/vishaltoora/GT-Automotives-App/issues/8)** - Self-service interface