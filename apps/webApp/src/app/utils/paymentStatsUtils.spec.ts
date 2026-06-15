import {
  parsePaymentBreakdown,
  calculatePaymentsByMethod,
  calculatePaymentStats,
} from './paymentStatsUtils';

// Minimal appointment factory matching the internal Appointment shape used by the util.
const makeApt = (overrides: any = {}) => ({
  id: overrides.id ?? 'apt-1',
  duration: overrides.duration ?? 60,
  status: overrides.status ?? 'SCHEDULED',
  serviceType: overrides.serviceType ?? 'TIRE',
  scheduledTime: overrides.scheduledTime ?? '09:00',
  ...overrides,
});

describe('paymentStatsUtils', () => {
  describe('parsePaymentBreakdown', () => {
    it('returns undefined for undefined input', () => {
      expect(parsePaymentBreakdown(undefined)).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(parsePaymentBreakdown('')).toBeUndefined();
    });

    it('parses a JSON string into an array', () => {
      const json = JSON.stringify([{ id: '1', method: 'CASH', amount: 50 }]);
      expect(parsePaymentBreakdown(json)).toEqual([
        { id: '1', method: 'CASH', amount: 50 },
      ]);
    });

    it('returns undefined for invalid JSON', () => {
      expect(parsePaymentBreakdown('{not json')).toBeUndefined();
    });

    it('returns the array as-is when given an array', () => {
      const arr = [{ id: '1', method: 'CARD', amount: 25 }];
      expect(parsePaymentBreakdown(arr)).toBe(arr);
    });
  });

  describe('calculatePaymentsByMethod', () => {
    it('returns empty object for no appointments', () => {
      expect(calculatePaymentsByMethod([])).toEqual({});
    });

    it('sums amounts from a payment breakdown array', () => {
      const apts = [
        makeApt({
          paymentBreakdown: [
            { id: '1', method: 'CASH', amount: 40 },
            { id: '2', method: 'CARD', amount: 60 },
          ],
        }),
      ];
      expect(calculatePaymentsByMethod(apts)).toEqual({ CASH: 40, CARD: 60 });
    });

    it('aggregates the same method across appointments', () => {
      const apts = [
        makeApt({
          id: 'a',
          paymentBreakdown: [{ id: '1', method: 'CASH', amount: 40 }],
        }),
        makeApt({
          id: 'b',
          paymentBreakdown: [{ id: '2', method: 'CASH', amount: 10 }],
        }),
      ];
      expect(calculatePaymentsByMethod(apts)).toEqual({ CASH: 50 });
    });

    it('defaults missing method to CASH in a breakdown entry', () => {
      const apts = [
        makeApt({ paymentBreakdown: [{ id: '1', amount: 30 } as any] }),
      ];
      expect(calculatePaymentsByMethod(apts)).toEqual({ CASH: 30 });
    });

    it('uses invoice payment method when no breakdown but paymentAmount present', () => {
      const apts = [
        makeApt({
          paymentAmount: 100,
          invoice: {
            id: 'i1',
            invoiceNumber: 'INV-1',
            paymentMethod: 'CARD',
            status: 'PAID',
          },
        }),
      ];
      expect(calculatePaymentsByMethod(apts)).toEqual({ CARD: 100 });
    });

    it('defaults to CASH when paymentAmount present and no invoice method', () => {
      const apts = [makeApt({ paymentAmount: 75 })];
      expect(calculatePaymentsByMethod(apts)).toEqual({ CASH: 75 });
    });

    it('ignores appointments with neither breakdown nor paymentAmount', () => {
      const apts = [makeApt({})];
      expect(calculatePaymentsByMethod(apts)).toEqual({});
    });
  });

  describe('calculatePaymentStats', () => {
    it('returns zeroed/empty stats for empty inputs', () => {
      const stats = calculatePaymentStats([], []);
      expect(stats.total).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.totalHours).toBe('0.0');
      expect(stats.statusCounts).toEqual({});
      expect(stats.atGarage).toBe(0);
      expect(stats.mobileService).toBe(0);
      expect(stats.paymentsProcessedCount).toBe(0);
      expect(stats.totalPayments).toBe(0);
      expect(stats.totalExpected).toBe(0);
      expect(stats.totalOwed).toBe(0);
      expect(stats.paymentsByMethod).toEqual({});
    });

    it('aggregates scheduled appointment stats', () => {
      const scheduled = [
        makeApt({
          id: 's1',
          duration: 60,
          status: 'SCHEDULED',
          appointmentType: 'AT_GARAGE',
        }),
        makeApt({
          id: 's2',
          duration: 30,
          status: 'CONFIRMED',
          appointmentType: 'MOBILE_SERVICE',
        }),
        makeApt({ id: 's3', duration: 90, status: 'SCHEDULED' }), // no type -> AT_GARAGE
      ];
      const stats = calculatePaymentStats(scheduled, []);
      expect(stats.total).toBe(3);
      expect(stats.totalDuration).toBe(180);
      expect(stats.totalHours).toBe('3.0');
      expect(stats.statusCounts).toEqual({ SCHEDULED: 2, CONFIRMED: 1 });
      expect(stats.atGarage).toBe(2);
      expect(stats.mobileService).toBe(1);
    });

    it('aggregates processed payment stats including totalOwed', () => {
      const processed = [
        makeApt({
          id: 'p1',
          appointmentType: 'AT_GARAGE',
          paymentAmount: 80,
          expectedAmount: 100,
          invoice: {
            id: 'i1',
            invoiceNumber: 'INV-1',
            paymentMethod: 'CARD',
            status: 'PAID',
          },
        }),
        makeApt({
          id: 'p2',
          appointmentType: 'MOBILE_SERVICE',
          paymentAmount: 50,
          expectedAmount: 50,
        }),
      ];
      const stats = calculatePaymentStats([], processed);
      expect(stats.paymentsProcessedCount).toBe(2);
      expect(stats.totalPayments).toBe(130);
      expect(stats.totalExpected).toBe(150);
      expect(stats.totalOwed).toBe(20); // 100-80 owed on p1, 0 on p2
      expect(stats.paymentsByMethod).toEqual({ CARD: 80, CASH: 50 });
      expect(stats.atGaragePayments).toBe(80);
      expect(stats.completedAtGarage).toBe(1);
      expect(stats.atGaragePaymentsByMethod).toEqual({ CARD: 80 });
      expect(stats.mobileServicePayments).toBe(50);
      expect(stats.completedMobileService).toBe(1);
      expect(stats.mobileServicePaymentsByMethod).toEqual({ CASH: 50 });
    });

    it('falls back to paymentAmount for totalExpected when expectedAmount absent', () => {
      const processed = [makeApt({ id: 'p1', paymentAmount: 40 })];
      const stats = calculatePaymentStats([], processed);
      expect(stats.totalExpected).toBe(40);
      expect(stats.totalOwed).toBe(0); // no expectedAmount -> expected treated as 0
    });
  });
});
