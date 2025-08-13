# Task: Implement Professional Invoice Printing

## Parent Epic
[EPIC-05: Invoicing System](../epics/EPIC-05-invoicing-system.md)

## Description
Implement comprehensive invoice printing capabilities supporting multiple formats: standard 8.5x11 paper, thermal receipt printers, and PDF generation for digital distribution.

## Acceptance Criteria
- [ ] Invoice print preview shows exact output
- [ ] 8.5x11 format includes company branding/logo
- [ ] Thermal receipt format fits 80mm paper width
- [ ] PDF generation works for email attachments
- [ ] Print CSS hides navigation and non-invoice elements
- [ ] Page breaks work correctly for multi-page invoices
- [ ] Customer copy and merchant copy can be printed
- [ ] Barcode/QR code for invoice number (optional)
- [ ] All three user roles can print appropriate invoices

## Technical Implementation

### 1. Print Stylesheet (print.css)
```css
@media print {
  /* Hide non-printable elements */
  .no-print, nav, header, footer { display: none; }
  
  /* Page setup for 8.5x11 */
  @page { 
    size: letter;
    margin: 0.5in;
  }
  
  /* Invoice styling */
  .invoice-header { 
    border-bottom: 2px solid #000;
    margin-bottom: 20px;
  }
  
  /* Force page breaks */
  .page-break { page-break-after: always; }
}
```

### 2. Invoice Template Structure
```html
<!-- Invoice Header -->
- Company Logo
- Company Name & Address
- Phone, Email, Website
- Invoice Number
- Invoice Date

<!-- Customer Information -->
- Customer Name
- Vehicle Information
- Contact Details

<!-- Invoice Items Table -->
- Item Description
- Quantity
- Unit Price
- Total

<!-- Summary Section -->
- Subtotal
- Tax
- Total Due
- Payment Method

<!-- Footer -->
- Terms & Conditions
- Thank You Message
- Return Policy
```

### 3. PDF Generation Options
- **Frontend**: jsPDF or pdfmake
- **Backend**: Puppeteer or wkhtmltopdf
- Generate identical output to print version

### 4. Thermal Printer Format
- Condensed layout for 80mm width
- Simplified formatting
- Essential information only
- Receipt-style output

## Role-Based Printing Access
- **Customers**: Can print/download their own invoices
- **Staff**: Can print any invoice, generate receipts
- **Admin**: Full access plus batch printing capabilities

## File Dependencies
- `frontend/src/components/Invoice/InvoicePrint.jsx`
- `frontend/src/styles/print.css`
- `backend/src/services/pdfGenerator.js`
- `backend/src/templates/invoice.html`

## Testing Requirements
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Verify print preview matches actual print
- [ ] Test with different paper sizes
- [ ] Verify thermal printer output
- [ ] Test PDF generation and email attachment
- [ ] Ensure customer data is correctly populated
- [ ] Test multi-page invoices

## Estimated Time
8 hours

## Dependencies
- TASK-05-03: Implement invoice creation API
- TASK-05-06: Build invoice creation UI

## Labels
- task
- frontend
- backend
- priority:high
- printing

## Notes
- Consider implementing a template system for different invoice layouts
- Ensure compliance with local tax reporting requirements
- Add ability to customize invoice template per business needs
- Consider adding digital signature capability for electronic invoices