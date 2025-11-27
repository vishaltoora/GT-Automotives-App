/**
 * Payment statistics calculation utilities
 */

import { PaymentEntryDto as PaymentEntry } from '@gt-automotive/data';

interface Appointment {
  id: string;
  duration: number;
  status: string;
  serviceType: string;
  appointmentType?: string;
  scheduledTime: string;
  paymentAmount?: number;
  paymentBreakdown?: PaymentEntry[] | string;
  expectedAmount?: number;
  invoice?: {
    id: string;
    invoiceNumber: string;
    paymentMethod?: string;
    status: string;
  };
}

/**
 * Parse payment breakdown from string or array
 */
export const parsePaymentBreakdown = (
  breakdown: PaymentEntry[] | string | undefined
): PaymentEntry[] | undefined => {
  if (!breakdown) return undefined;

  if (typeof breakdown === 'string') {
    try {
      return JSON.parse(breakdown);
    } catch (e) {
      return undefined;
    }
  }

  return Array.isArray(breakdown) ? breakdown : undefined;
};

/**
 * Calculate payment methods breakdown from appointments
 */
export const calculatePaymentsByMethod = (
  appointments: Appointment[]
): Record<string, number> => {
  const paymentsByMethod: Record<string, number> = {};

  appointments.forEach((apt) => {
    const breakdown = parsePaymentBreakdown(apt.paymentBreakdown);

    if (breakdown && Array.isArray(breakdown)) {
      // Manual payment with breakdown (multiple payment methods)
      breakdown.forEach((payment: PaymentEntry) => {
        const method = payment.method || 'CASH';
        paymentsByMethod[method] = (paymentsByMethod[method] || 0) + (payment.amount || 0);
      });
    } else if (apt.paymentAmount) {
      // Check if appointment has an invoice (Square payment creates invoice automatically)
      const invoice = apt.invoice || null;
      const method = invoice?.paymentMethod || 'CASH'; // Use invoice payment method or default to CASH
      paymentsByMethod[method] = (paymentsByMethod[method] || 0) + apt.paymentAmount;
    }
  });

  return paymentsByMethod;
};

/**
 * Calculate comprehensive payment statistics
 */
export const calculatePaymentStats = (
  scheduledAppointments: Appointment[],
  paymentsProcessed: Appointment[]
) => {
  // Scheduled appointments stats
  const totalDuration = scheduledAppointments.reduce((sum, apt) => sum + apt.duration, 0);
  const statusCounts = scheduledAppointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter by appointment type
  const atGarageAppointments = scheduledAppointments.filter(
    (apt) => !apt.appointmentType || apt.appointmentType === 'AT_GARAGE'
  );
  const mobileServiceAppointments = scheduledAppointments.filter(
    (apt) => apt.appointmentType === 'MOBILE_SERVICE'
  );

  // Payment statistics - based on payments PROCESSED today
  const totalPayments = paymentsProcessed.reduce((sum, apt) => sum + (apt.paymentAmount || 0), 0);
  const totalExpected = paymentsProcessed.reduce(
    (sum, apt) => sum + (apt.expectedAmount || apt.paymentAmount || 0),
    0
  );
  const totalOwed = paymentsProcessed.reduce((sum, apt) => {
    const expected = apt.expectedAmount || 0;
    const paid = apt.paymentAmount || 0;
    return sum + Math.max(0, expected - paid);
  }, 0);

  // Calculate payments by method from breakdown
  const paymentsByMethod = calculatePaymentsByMethod(paymentsProcessed);

  // Filter payments by location type
  const atGaragePayments = paymentsProcessed.filter(
    (apt) => !apt.appointmentType || apt.appointmentType === 'AT_GARAGE'
  );
  const mobileServicePayments = paymentsProcessed.filter(
    (apt) => apt.appointmentType === 'MOBILE_SERVICE'
  );

  // Calculate location-specific payment stats
  const atGarageTotalPayments = atGaragePayments.reduce(
    (sum, apt) => sum + (apt.paymentAmount || 0),
    0
  );
  const atGaragePaymentsByMethod = calculatePaymentsByMethod(atGaragePayments);

  const mobileServiceTotalPayments = mobileServicePayments.reduce(
    (sum, apt) => sum + (apt.paymentAmount || 0),
    0
  );
  const mobileServicePaymentsByMethod = calculatePaymentsByMethod(mobileServicePayments);

  return {
    // Scheduled appointments info
    total: scheduledAppointments.length,
    totalDuration,
    totalHours: (totalDuration / 60).toFixed(1),
    statusCounts,

    // Tab counts for scheduled appointments
    atGarage: atGarageAppointments.length,
    mobileService: mobileServiceAppointments.length,

    // Payments processed today info
    paymentsProcessedCount: paymentsProcessed.length,
    totalPayments,
    totalExpected,
    totalOwed,
    paymentsByMethod,
    atGaragePayments: atGarageTotalPayments,
    completedAtGarage: atGaragePayments.length,
    atGaragePaymentsByMethod,
    mobileServicePayments: mobileServiceTotalPayments,
    completedMobileService: mobileServicePayments.length,
    mobileServicePaymentsByMethod,
  };
};
