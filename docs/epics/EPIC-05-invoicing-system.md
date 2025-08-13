# [EPIC] Invoicing System

📋 **GitHub Issue:** [#5](https://github.com/vishaltoora/GT-Automotives-App/issues/5)  
🏷️ **Labels:** `epic`, `priority:high`  
📅 **Milestone:** Version 1.0 - MVP Release  

## Description
Complete invoicing system for tire sales and mechanical services with payment tracking

## Success Criteria
- [ ] Invoices can be created for tire sales and services
- [ ] Line items include tires, labor, and miscellaneous charges
- [ ] Tax calculations are automatic
- [ ] Payment tracking supports multiple methods
- [ ] Professional invoice printing with multiple formats (8.5x11, thermal receipt, PDF)
- [ ] Invoices can be emailed as PDF attachments
- [ ] Daily cash reports are available
- [ ] Inventory is automatically deducted on tire sales
- [ ] Role-based access: Customers see own invoices, Staff create/view all, Owners have full control

## Tasks
- [ ] Create invoice database tables
- [ ] Build service catalog management
- [ ] Implement invoice creation API with role-based access
- [ ] Add line item management functionality
- [ ] Create invoice calculation engine (tax, totals)
- [ ] Build invoice creation UI for staff/admin
- [ ] Implement tire inventory deduction on sale
- [ ] Add payment tracking functionality
- [ ] Design professional invoice print template with company branding
- [ ] Implement print CSS for clean 8.5x11 output
- [ ] Add thermal printer support for quick receipts
- [ ] Implement PDF generation for invoices
- [ ] Create print preview functionality
- [ ] Build invoice search and history page (role-aware)
- [ ] Implement email invoice delivery with PDF attachment
- [ ] Create daily cash report (staff/admin only)
- [ ] Add customer portal invoice viewing

## Labels
- epic
- priority:high

## Milestone
Version 1.0 - MVP Release

## Estimated Time
2 weeks

## Dependencies
- EPIC-01: Project Setup & Infrastructure
- EPIC-02: User Authentication & Management
- EPIC-03: Tire Inventory Management
- EPIC-04: Customer & Vehicle Management