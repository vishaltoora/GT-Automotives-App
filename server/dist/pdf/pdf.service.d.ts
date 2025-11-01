export declare class PdfService {
    private readonly logger;
    /**
     * Generate PDF from HTML content
     */
    generatePdfFromHtml(html: string, options?: {
        format?: 'A4' | 'Letter';
        printBackground?: boolean;
    }): Promise<Buffer>;
    /**
     * Generate invoice HTML from invoice data
     */
    generateInvoiceHtml(invoice: any): string;
    /**
     * Generate invoice PDF and return as base64
     */
    generateInvoicePdf(invoice: any): Promise<string>;
    /**
     * Generate quotation HTML from quotation data
     */
    generateQuotationHtml(quotation: any): string;
    /**
     * Generate quotation PDF and return as base64
     */
    generateQuotationPdf(quotation: any): Promise<string>;
}
//# sourceMappingURL=pdf.service.d.ts.map