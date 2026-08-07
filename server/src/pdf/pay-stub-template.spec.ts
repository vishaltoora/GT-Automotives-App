import { PdfService } from './pdf.service';

/**
 * Tests for the pay stub template.
 *
 * The stub is rendered on demand rather than stored, so this template *is* the
 * document — there is no saved PDF to fall back on if it drifts. Two things are
 * pinned here: the figures from the sample stub the business supplied, and the
 * items BC's Employment Standards Act s.27 requires a wage statement to carry.
 * A redesign may move any of it around; it may not drop it.
 */
describe('PdfService pay stub template', () => {
  const service = new PdfService();

  const januaryStub: any = {
    id: 'stub-1',
    employeeId: 'emp-1',
    periodStart: '2026-01-05',
    periodEnd: '2026-01-31',
    payDate: '2026-01-31',
    companyName: 'GT Automotive',
    companyAddress: '2983 Nicole Ave, Prince George, BC',
    companyBusinessType: 'Professional Tire & Auto Services',
    companyRegistrationNumber: '16472991',
    companyPhone: '2505702333',
    companyEmail: 'gt-automotives@outlook.com',
    employeeName: 'Rohit Toora',
    position: 'Business Manager',
    payRate: 24,
    payType: 'HOURLY',
    regularHours: 128,
    regularAmount: 3072,
    grossPay: 3072,
    eiAmount: 50.08,
    cppAmount: 166.96,
    incomeTaxAmount: 0,
    otherDeductions: 0,
    totalWithholding: 217.04,
    netPay: 2854.96,
    ytdHours: 128,
    ytdRegularAmount: 3072,
    ytdGrossPay: 3072,
    ytdEiAmount: 50.08,
    ytdCppAmount: 166.96,
    ytdIncomeTaxAmount: 0,
    ytdOtherDeductions: 0,
    ytdWithholding: 217.04,
    ytdNetPay: 2854.96,
    generatedBy: 'acc-1',
    createdAt: '2026-01-31T00:00:00.000Z',
  };

  it('identifies the employer by trading name, incorporated name and address', () => {
    const html = service.generatePayStubHtml(januaryStub);

    // s.27(a) — the employer's name and address. A wage statement identifies
    // who is paying, so the incorporated name prints; the contact details and
    // line of business the invoice carries are sales context and are not shown.
    expect(html).toContain('GT Automotive');
    expect(html).toContain('16472991 Canada INC.');
    expect(html).toContain('2983 Nicole Ave');
    expect(html).toContain('Prince George');
    expect(html).toContain('Pay Statement');

    expect(html).not.toContain('Professional Tire');
    expect(html).not.toContain('Phone:');
    expect(html).not.toContain('Email:');
  });

  it('omits the incorporated name on a stub issued without one', () => {
    // Stubs raised before that column existed have no value to print, and
    // borrowing today's would misrepresent the document as issued.
    const html = service.generatePayStubHtml({
      ...januaryStub,
      companyRegistrationNumber: undefined,
    });

    expect(html).toContain('GT Automotive');
    expect(html).toContain('2983 Nicole Ave');
    expect(html).not.toContain('Canada INC.');
  });

  it('renders the pay period, employee, position and rate', () => {
    const html = service.generatePayStubHtml(januaryStub);

    // Pay date and pay period are both labelled, and both spelled out — a
    // numeric date is ambiguous between day/month and month/day orders.
    expect(html).toContain('Pay date');
    expect(html).toContain('Pay period');
    expect(html).toContain('January 5, 2026');
    expect(html).toContain('January 31, 2026');
    expect(html).not.toContain('05/01/2026');
    expect(html).toContain('Rohit Toora');
    expect(html).toContain('Business Manager');
    // s.27(c) — the wage rate.
    expect(html).toContain('$24.00 / hour');
    expect(html).toContain('January 31, 2026');
  });

  it('leads with net pay, gross and total deductions', () => {
    const html = service.generatePayStubHtml(januaryStub);

    expect(html).toContain('Net Pay');
    expect(html).toContain('Gross Pay');
    expect(html).toContain('Deductions');
    // s.27(i) — gross and net wages.
    expect(html).toContain('3,072.00');
    expect(html).toContain('2,854.96');
  });

  it('renders the earnings and deductions columns with current and YTD figures', () => {
    const html = service.generatePayStubHtml(januaryStub);

    expect(html).toContain('Earnings');
    expect(html).toContain('Year to Date');
    expect(html).toContain('Regular Pay');
    // s.27(b) — hours worked, and s.27(g) — each deduction with its purpose.
    expect(html).toContain('128.00');
    expect(html).toContain('Employment Insurance (EI)');
    expect(html).toContain('Canada Pension Plan (CPP)');
    expect(html).toContain('Total Deductions');
    expect(html).toContain('50.08');
    expect(html).toContain('166.96');
    expect(html).toContain('217.04');
  });

  it('shows how the gross was split, as proportional segments', () => {
    const html = service.generatePayStubHtml(januaryStub);

    // Take-home is 2854.96 / 3072 = 92.9% of gross.
    expect(html).toContain('92.9%');
    expect(html).toMatch(/class="bar-part" style="width:92\.9\d+%/);
    expect(html).toContain('Take-home');
  });

  it('omits income tax and other deductions when they are zero', () => {
    const html = service.generatePayStubHtml(januaryStub);

    // The business's stubs withhold EI and CPP only; padding the document with
    // $0.00 tax lines would misrepresent it.
    expect(html).not.toContain('Income Tax');
    expect(html).not.toContain('Other Deductions');
  });

  it('renders income tax and a labelled other deduction when present', () => {
    const html = service.generatePayStubHtml({
      ...januaryStub,
      incomeTaxAmount: 300,
      ytdIncomeTaxAmount: 300,
      otherDeductions: 25,
      ytdOtherDeductions: 25,
      otherDeductionsLabel: 'Uniform',
      totalWithholding: 542.04,
      netPay: 2529.96,
    });

    expect(html).toContain('Income Tax');
    expect(html).toContain('Uniform');
  });

  it('stays a complete document when there is no gross to split', () => {
    const html = service.generatePayStubHtml({
      ...januaryStub,
      regularHours: 0,
      regularAmount: 0,
      grossPay: 0,
      eiAmount: 0,
      cppAmount: 0,
      totalWithholding: 0,
      netPay: 0,
    });

    // No bar rather than a divide-by-zero one, and the rest still prints.
    expect(html).not.toContain('class="bar-part"');
    expect(html).toContain('Pay Statement');
    expect(html).toContain('Net Pay');
  });

  it('shows a year rate suffix for salaried employees', () => {
    const html = service.generatePayStubHtml({
      ...januaryStub,
      payType: 'SALARIED',
      payRate: 73000,
    });

    expect(html).toContain('/ year');
  });

  it('pins its colour scheme so a dark-mode renderer cannot invert it', () => {
    const html = service.generatePayStubHtml(januaryStub);

    expect(html).toContain('color-scheme: only light');
    // The net-pay panel and the distribution bar carry meaning in their fills,
    // so backgrounds must survive the print pipeline.
    expect(html).toContain('print-color-adjust: exact');
  });

  it('escapes employee-supplied text rather than injecting it as markup', () => {
    const html = service.generatePayStubHtml({
      ...januaryStub,
      employeeName: '<script>alert(1)</script>',
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('formats calendar dates in UTC so the printed day matches the stored business day', () => {
    // A pay date stored as 2026-01-31 must print as January 31 regardless of
    // the server's timezone — this is the class of bug that shifted invoice
    // dates by a day for anything created after 5 PM PST.
    const html = service.generatePayStubHtml({
      ...januaryStub,
      payDate: '2026-01-01',
    });

    expect(html).toContain('January 1, 2026');
  });

  /**
   * Vacation pay prints twice — earned in the earnings column, held back in the
   * deductions column — so the employee can see what they banked without the
   * cheque changing.
   */
  describe('vacation pay', () => {
    const withVacation: any = {
      ...januaryStub,
      grossPay: 3194.88,
      vacationPayRate: 4,
      vacationPayAmount: 122.88,
      vacationPayHeld: 122.88,
      totalWithholding: 339.92,
      ytdGrossPay: 3194.88,
      ytdVacationPayAmount: 122.88,
      ytdVacationPayHeld: 122.88,
      ytdWithholding: 339.92,
    };

    it('shows what was earned, at the rate it was earned at', () => {
      const html = service.generatePayStubHtml(withVacation);

      expect(html).toContain('Vacation Pay (4%)');
      expect(html).toContain('122.88');
    });

    it('shows the matching amount held back, named so it does not read as lost', () => {
      const html = service.generatePayStubHtml(withVacation);

      // s.27(g) requires the purpose of every deduction. This one is the
      // employee's own money, banked until they take their vacation.
      expect(html).toContain('Vacation Pay Held');
    });

    it('carries the year-to-date vacation figure', () => {
      const html = service.generatePayStubHtml({
        ...withVacation,
        ytdVacationPayAmount: 491.52,
        ytdVacationPayHeld: 491.52,
      });

      expect(html).toContain('491.52');
    });

    it('prints a fractional rate without trailing zeros', () => {
      const html = service.generatePayStubHtml({
        ...withVacation,
        vacationPayRate: 4.5,
      });

      expect(html).toContain('Vacation Pay (4.5%)');
    });

    it('omits both lines on a stub that accrued nothing', () => {
      // Stubs raised before vacation was tracked carry zeros, and must print
      // exactly as they always did rather than gaining two empty rows.
      const html = service.generatePayStubHtml(januaryStub);

      expect(html).not.toContain('Vacation Pay');
      expect(html).not.toContain('Vacation Pay Held');
    });

    it('leaves net pay out of the accrual, since it nets to zero', () => {
      const html = service.generatePayStubHtml(withVacation);

      // Gross rose and deductions rose by the same amount; take-home did not
      // move.
      expect(html).toContain('3,194.88');
      expect(html).toContain('2,854.96');
    });
  });
});
