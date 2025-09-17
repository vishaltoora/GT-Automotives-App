export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    PAID = "PAID",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    CHECK = "CHECK",
    E_TRANSFER = "E_TRANSFER"
}
export declare class UpdateInvoiceDto {
    status?: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    paidAt?: string;
}
//# sourceMappingURL=update-invoice.dto.d.ts.map