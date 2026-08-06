import { PdfService } from './pdf.service';

/**
 * Tests for the pay stub template.
 *
 * The stub is rendered on demand rather than stored, so this template is the
 * document — there is no saved PDF to fall back on if it drifts from the
 * business's existing layout. These tests pin the figures and the rows that
 * must appear, using the numbers from the sample stub the business supplied.
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

  it('renders the company header and PAY STUB title', () => {
    const html = service.generatePayStubHtml(januaryStub);

    expect(html).toContain('GT Automotive');
    expect(html).toContain('2983 Nicole Ave');
    expect(html).toContain('PAY STUB');
  });

  it('renders the pay cycle, employee, position and rate block', () => {
    const html = service.generatePayStubHtml(januaryStub);

    expect(html).toContain('05/01/2026 - 31/01/2026');
    expect(html).toContain('Rohit Toora');
    expect(html).toContain('Business Manager');
    expect(html).toContain('$24.00/Hr');
    expect(html).toContain('January 31, 2026');
  });

  it('renders the five-column earnings and withholdings table', () => {
    const html = service.generatePayStubHtml(januaryStub);

    expect(html).toContain('Current Hours');
    expect(html).toContain('Year-to-Date Amounts');
    expect(html).toContain('Regular Pay');
    expect(html).toContain('Earnings Totals');
    expect(html).toContain('Federal Employee EI');
    expect(html).toContain('Federal Employee CPP/QPP');
    expect(html).toContain('Withholding Totals');
    expect(html).toContain('NET PAY');
    expect(html).toContain('3,072.00');
    expect(html).toContain('2,854.96');
  });

  it('omits income tax and other deductions when they are zero', () => {
    const html = service.generatePayStubHtml(januaryStub);

    // The business's stubs withhold EI and CPP only; padding the document with
    // $0.00 tax lines would misrepresent it.
    expect(html).not.toContain('Federal Income Tax');
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

    expect(html).toContain('Federal Income Tax');
    expect(html).toContain('Uniform');
  });

  it('renders both signature lines', () => {
    const html = service.generatePayStubHtml(januaryStub);

    expect(html).toContain('Employer Signature');
    expect(html).toContain('Employee Signature');
  });

  it('shows a year rate suffix for salaried employees', () => {
    const html = service.generatePayStubHtml({
      ...januaryStub,
      payType: 'SALARIED',
      payRate: 73000,
    });

    expect(html).toContain('/Yr');
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
});
