import {
  parsePaymentBreakdown,
  calculatePaymentsByMethod,
  calculatePaymentStats,
  buildPaymentLineItems,
  isCashMethod,
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

describe('buildPaymentLineItems', () => {
  const combineCashMethods = (map: Record<string, number>) => {
    const result: Record<string, number> = {};
    let cash = 0;
    for (const [method, amount] of Object.entries(map)) {
      if (isCashMethod(method)) cash += amount;
      else result[method] = amount;
    }
    if (cash > 0) result['CASH'] = cash;
    return result;
  };

  const shopApts = [
    makeApt({
      id: 'a1',
      appointmentType: 'AT_GARAGE',
      paymentAmount: 150,
      paymentBreakdown: [
        { method: 'CASH', amount: 100 },
        { method: 'E_TRANSFER', amount: 50 },
      ],
      customer: { firstName: 'Ann', lastName: 'Lee' },
      invoice: { id: 'i1', invoiceNumber: 'INV-001', status: 'PAID' },
    }),
    // No breakdown, no invoice — falls back to CASH and the customer name.
    makeApt({
      id: 'a2',
      appointmentType: 'AT_GARAGE',
      paymentAmount: 40,
      customer: { businessName: 'Ray Haulage' },
    }),
  ];
  const mobileApts = [
    makeApt({
      id: 'a3',
      appointmentType: 'MOBILE_SERVICE',
      paymentAmount: 200,
      paymentBreakdown: [{ method: 'CASH_NO_TAX', amount: 200 }],
      customer: { firstName: 'Cid', lastName: 'Vos' },
    }),
  ];
  const invoicePayments = [
    {
      id: 'p1',
      amount: 75,
      paymentMethod: 'CREDIT_CARD',
      invoiceNumber: 'INV-010',
      customerName: 'Dee Fox',
      appointmentType: 'AT_GARAGE',
    },
    {
      id: 'p2',
      amount: 25,
      paymentMethod: 'CASH',
      invoiceNumber: 'INV-011',
      customerName: 'Eli Gray',
      appointmentType: 'MOBILE_SERVICE',
    },
    // No linked appointment — the API counts these as shop.
    {
      id: 'p3',
      amount: 10,
      paymentMethod: 'CASH',
      invoiceNumber: 'INV-012',
      customerName: 'Fay Hill',
      appointmentType: null,
    },
  ];

  it('groups shop payments by method with invoice number and amount', () => {
    const { atGarage } = buildPaymentLineItems(
      shopApts,
      mobileApts,
      invoicePayments
    );

    expect(Object.keys(atGarage).sort()).toEqual([
      'CASH',
      'CREDIT_CARD',
      'E_TRANSFER',
    ]);
    expect(atGarage['CREDIT_CARD']).toEqual([
      {
        key: 'inv-p1',
        invoiceNumber: 'INV-010',
        customerName: 'Dee Fox',
        amount: 75,
      },
    ]);
    // Sorted largest first.
    expect(atGarage['CASH'].map((i) => i.amount)).toEqual([100, 40, 10]);
  });

  it('falls back to the customer name when there is no invoice', () => {
    const { atGarage } = buildPaymentLineItems(shopApts, [], []);
    const noInvoice = atGarage['CASH'].find((i) => i.key === 'apt-a2');
    expect(noInvoice).toEqual({
      key: 'apt-a2',
      invoiceNumber: null,
      customerName: 'Ray Haulage',
      amount: 40,
    });
  });

  it('buckets cash variants together, matching the displayed totals', () => {
    const { mobileService } = buildPaymentLineItems(
      [],
      mobileApts,
      invoicePayments
    );
    // CASH_NO_TAX (200) and CASH (25) report under one CASH heading.
    expect(mobileService['CASH'].map((i) => i.amount)).toEqual([200, 25]);
  });

  it('line items reconcile to the method totals shown above them', () => {
    const { atGarage, mobileService } = buildPaymentLineItems(
      shopApts,
      mobileApts,
      invoicePayments
    );

    // Rebuild the totals exactly as DaySummary does: appointment money by
    // method, plus the API's per-location invoice totals, then cash-combined.
    const shopTotals = calculatePaymentsByMethod(shopApts);
    shopTotals['CREDIT_CARD'] = (shopTotals['CREDIT_CARD'] || 0) + 75;
    shopTotals['CASH'] = (shopTotals['CASH'] || 0) + 10;

    const mobileTotals = calculatePaymentsByMethod(mobileApts);
    mobileTotals['CASH'] = (mobileTotals['CASH'] || 0) + 25;

    const sumOf = (items: { amount: number }[]) =>
      items.reduce((s, i) => s + i.amount, 0);

    Object.entries(combineCashMethods(shopTotals)).forEach(([m, total]) => {
      expect(sumOf(atGarage[m] || [])).toBeCloseTo(total, 2);
    });
    Object.entries(combineCashMethods(mobileTotals)).forEach(([m, total]) => {
      expect(sumOf(mobileService[m] || [])).toBeCloseTo(total, 2);
    });
  });

  it('ignores zero-amount entries', () => {
    const { atGarage } = buildPaymentLineItems(
      [
        makeApt({
          id: 'z1',
          paymentAmount: 0,
          paymentBreakdown: [{ method: 'CASH', amount: 0 }],
        }),
      ],
      [],
      []
    );
    expect(atGarage).toEqual({});
  });
});
