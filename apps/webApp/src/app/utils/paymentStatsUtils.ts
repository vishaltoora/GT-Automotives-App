/**
 * Payment statistics calculation utilities
 */

import { PaymentEntryDto as PaymentEntry } from '@gt-automotive/data';

interface Appointment {
  id: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    businessName?: string;
  };
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
        paymentsByMethod[method] =
          (paymentsByMethod[method] || 0) + (payment.amount || 0);
      });
    } else if (apt.paymentAmount) {
      // Check if appointment has an invoice (Square payment creates invoice automatically)
      const invoice = apt.invoice || null;
      const method = invoice?.paymentMethod || 'CASH'; // Use invoice payment method or default to CASH
      paymentsByMethod[method] =
        (paymentsByMethod[method] || 0) + apt.paymentAmount;
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
  const totalDuration = scheduledAppointments.reduce(
    (sum, apt) => sum + apt.duration,
    0
  );
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
  const totalPayments = paymentsProcessed.reduce(
    (sum, apt) => sum + (apt.paymentAmount || 0),
    0
  );
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
  const mobileServicePaymentsByMethod = calculatePaymentsByMethod(
    mobileServicePayments
  );

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

// --- Day Summary line items -------------------------------------------------

/**
 * All cash variants (CASH, CASH_NO_TAX, …) are physical cash — the Day Summary
 * reports them as one bucket.
 */
export const isCashMethod = (method: string) =>
  method.toUpperCase().includes('CASH');

/** The bucket key a raw payment method is reported under. */
export const methodBucket = (method: string) =>
  isCashMethod(method) ? 'CASH' : method;

/** One payment making up a method total, shown beneath it for reconciling. */
export interface PaymentLineItem {
  key: string;
  invoiceNumber: string | null;
  customerName: string;
  amount: number;
}

/** An invoice payment as returned by GET /api/invoices/day-summary. */
export interface InvoiceDayPayment {
  id: string;
  amount: number | string;
  paymentMethod?: string;
  invoiceNumber?: string | null;
  customerName?: string;
  appointmentType?: string | null;
}

export interface PaymentLineItemsByLocation {
  atGarage: Record<string, PaymentLineItem[]>;
  mobileService: Record<string, PaymentLineItem[]>;
}

const customerNameOf = (apt: Appointment) =>
  apt.customer?.businessName ||
  [apt.customer?.firstName, apt.customer?.lastName].filter(Boolean).join(' ') ||
  '';

/**
 * Break each payment-method total down into the individual payments behind it,
 * split by location.
 *
 * Draws on the same two sources the totals do — money recorded against the
 * appointment, and invoice payments collected today — and buckets methods
 * identically, so every list sums to the method total displayed above it.
 * Appointment money raised without an invoice has no invoice number, so those
 * rows fall back to the customer name.
 */
export const buildPaymentLineItems = (
  atGarageAppointments: Appointment[],
  mobileServiceAppointments: Appointment[],
  invoicePayments: InvoiceDayPayment[] = []
): PaymentLineItemsByLocation => {
  const atGarage: Record<string, PaymentLineItem[]> = {};
  const mobileService: Record<string, PaymentLineItem[]> = {};

  const push = (
    bucket: Record<string, PaymentLineItem[]>,
    method: string,
    item: PaymentLineItem
  ) => {
    if (!item.amount) return;
    const key = methodBucket(method);
    (bucket[key] = bucket[key] || []).push(item);
  };

  const addAppointments = (
    appointments: Appointment[],
    bucket: Record<string, PaymentLineItem[]>
  ) => {
    appointments.forEach((apt) => {
      const breakdown = parsePaymentBreakdown(apt.paymentBreakdown);
      const invoiceNumber = apt.invoice?.invoiceNumber || null;
      const customerName = customerNameOf(apt);

      if (breakdown && Array.isArray(breakdown)) {
        breakdown.forEach((entry, index) => {
          push(bucket, entry.method || 'CASH', {
            key: `apt-${apt.id}-${index}`,
            invoiceNumber,
            customerName,
            amount: entry.amount || 0,
          });
        });
      } else if (apt.paymentAmount) {
        push(bucket, apt.invoice?.paymentMethod || 'CASH', {
          key: `apt-${apt.id}`,
          invoiceNumber,
          customerName,
          amount: apt.paymentAmount,
        });
      }
    });
  };

  addAppointments(atGarageAppointments, atGarage);
  addAppointments(mobileServiceAppointments, mobileService);

  // Invoice payments already carry their location from the API. Anything that
  // is not explicitly mobile counts as shop, matching how the API buckets its
  // atGarage/mobileService totals.
  invoicePayments.forEach((payment) => {
    const bucket =
      payment.appointmentType === 'MOBILE_SERVICE' ? mobileService : atGarage;
    push(bucket, payment.paymentMethod || 'CASH', {
      key: `inv-${payment.id}`,
      invoiceNumber: payment.invoiceNumber || null,
      customerName: payment.customerName || '',
      amount: Number(payment.amount) || 0,
    });
  });

  // Largest first — the entries worth checking sit at the top.
  [atGarage, mobileService].forEach((bucket) =>
    Object.values(bucket).forEach((items) =>
      items.sort((a, b) => b.amount - a.amount)
    )
  );

  return { atGarage, mobileService };
};
