import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto, PaymentSummaryDto, ProcessPaymentDto, PaymentStatus, PaymentMethod } from '@gt-automotive/data';
export declare function setClerkTokenGetter(getter: () => Promise<string | null>): void;
declare class PaymentService {
    private baseUrl;
    private makeRequest;
    createPayment(paymentData: CreatePaymentDto): Promise<PaymentResponseDto>;
    processPayment(paymentData: ProcessPaymentDto): Promise<PaymentResponseDto>;
    getPayments(filters?: {
        employeeId?: string;
        status?: PaymentStatus;
        paymentMethod?: PaymentMethod;
        startDate?: string;
        endDate?: string;
    }): Promise<PaymentResponseDto[]>;
    getPayment(id: string): Promise<PaymentResponseDto>;
    updatePayment(id: string, updates: UpdatePaymentDto): Promise<PaymentResponseDto>;
    deletePayment(id: string): Promise<void>;
    revertPaymentStatus(id: string): Promise<PaymentResponseDto>;
    getPaymentsByEmployee(employeeId: string): Promise<PaymentResponseDto[]>;
    getPaymentsByJob(jobId: string): Promise<PaymentResponseDto[]>;
    getPendingPayments(): Promise<PaymentResponseDto[]>;
    getPaymentSummary(employeeId?: string): Promise<PaymentSummaryDto>;
    getMyPaymentSummary(): Promise<PaymentSummaryDto>;
    getMyPayments(): Promise<PaymentResponseDto[]>;
    getPayrollReport(startDate: string, endDate: string, employeeId?: string): Promise<any>;
}
export declare const paymentService: PaymentService;
export default paymentService;
//# sourceMappingURL=payment.service.d.ts.map