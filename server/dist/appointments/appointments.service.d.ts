import { PrismaService } from '@gt-automotive/database';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto, CalendarQueryDto } from '../common/dto/appointment.dto';
import { AvailabilityService } from './availability.service';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';
import { JobsService } from '../jobs/jobs.service';
import { PayoutRulesService } from '../payout-rules/payout-rules.service';
export declare class AppointmentsService {
    private prisma;
    private availabilityService;
    private smsService;
    private emailService;
    private jobsService;
    private payoutRulesService;
    private readonly appointmentInclude;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService, smsService: SmsService, emailService: EmailService, jobsService: JobsService, payoutRulesService: PayoutRulesService);
    /**
     * Create a new appointment
     */
    create(dto: CreateAppointmentDto, bookedBy: string): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Find all appointments with optional filters
     * All users (STAFF and ADMIN) can see all appointments
     * Uses DATE-only comparison to avoid timezone issues
     */
    findAll(query: AppointmentQueryDto, user?: any): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get calendar view data
     * All users (STAFF and ADMIN) can see all appointments
     * Uses DATE-only comparison to avoid timezone issues
     */
    getCalendar(query: CalendarQueryDto, user?: any): Promise<Record<string, any[]>>;
    /**
     * Find one appointment by ID
     */
    findOne(id: string): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Update an appointment
     */
    update(id: string, dto: UpdateAppointmentDto, userId?: string): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Persist product-sale info on an appointment and (if employees were provided)
     * auto-create payroll jobs. Used by completion endpoints (e-transfer, square-device)
     * after they've already marked the appointment COMPLETED.
     */
    applyCompletionExtras(appointmentId: string, opts: {
        completionEmployeeIds?: string[];
        productSaleAmount?: number;
        productSaleItems?: string[];
        serviceAmount?: number;
        tipAmount?: number;
        userId: string;
        wasAlreadyCompleted: boolean;
    }): Promise<void>;
    /**
     * Create payroll jobs for the employees who completed an appointment.
     * `serviceAmountOverride` lets non-cash flows pass the pre-tax service amount
     * directly (so taxes don't inflate the payout). `tipAmount` is added 100%
     * on top of the rule-based payout.
     */
    createCompletionJobs(appointment: any, employeeIds: string[], userId: string, serviceAmountOverride?: number, tipAmount?: number): Promise<void>;
    /**
     * Cancel an appointment
     */
    cancel(id: string): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Delete an appointment (hard delete - admin only)
     */
    remove(id: string): Promise<{
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Get appointments by payment date (for daily cash reports)
     * Returns appointments where payment was processed on the specified date
     *
     * TIMEZONE HANDLING:
     * - Accepts paymentDate as YYYY-MM-DD string (e.g., "2025-11-13")
     * - All date comparisons use Pacific Time (PST/PDT) via AT TIME ZONE
     * - This ensures payments show on the correct business day regardless of server timezone
     *
     * BACKWARDS COMPATIBILITY:
     * - If paymentDate exists: Use paymentDate (new behavior - accurate processing date)
     * - If paymentDate is NULL: Fall back to scheduledDate + COMPLETED status (old appointments)
     */
    getByPaymentDate(paymentDate: string): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get appointments with payments processed within a date range
     * This is optimized for calendar highlighting - returns all payments in one query
     * instead of making individual requests for each day
     */
    getPaymentsByDateRange(startDate: string, endDate: string): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get today's appointments for printing/display
     * All users (STAFF and ADMIN) can see all appointments
     * Uses DATE-only comparison to avoid timezone issues
     */
    getTodayAppointments(user?: any): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get upcoming appointments for a customer
     * Uses Pacific Time DATE comparison to ensure correct business day
     */
    getCustomerUpcoming(customerId: string): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Helper: Find an available employee for a time slot
     */
    private findAvailableEmployee;
    /**
     * Helper: Calculate end time from start time and duration
     */
    private calculateEndTime;
}
//# sourceMappingURL=appointments.service.d.ts.map