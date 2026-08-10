import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

/**
 * Unit tests for the statement email — one message covering everything a
 * customer owes, rather than one email per invoice.
 *
 * The service is built directly with mocked collaborators (no Nest DI). What is
 * worth pinning here is the money and the scoping: the total the customer is
 * asked for, and the guarantee that a statement never carries another
 * customer's invoice.
 */
describe('InvoicesService — statement email', () => {
  let service: InvoicesService;
  let findWithDetails: jest.Mock;
  let findCustomerById: jest.Mock;
  let updateCustomer: jest.Mock;
  let generateInvoicePdfs: jest.Mock;
  let sendInvoiceStatementEmail: jest.Mock;
  let auditCreate: jest.Mock;

  const customer = {
    id: 'cust-1',
    firstName: 'Dale',
    lastName: 'Cooper',
    businessName: 'Northern Fleet Ltd',
    email: 'fleet@northern.ca',
    additionalEmails: [],
  };

  const invoice = (overrides: any = {}) => ({
    id: 'inv-1',
    invoiceNumber: '1001',
    customerId: 'cust-1',
    total: 100,
    amountPaid: 0,
    invoiceDate: new Date('2026-08-01T00:00:00.000Z'),
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    signatureBlobName: null,
    signatureContainerName: null,
    ...overrides,
  });

  const invoicesById: Record<string, any> = {
    'inv-1': invoice(),
    'inv-2': invoice({
      id: 'inv-2',
      invoiceNumber: '1002',
      total: 250,
      amountPaid: 50,
    }),
    'inv-3': invoice({ id: 'inv-3', invoiceNumber: '1003', total: 75 }),
    // Belongs to someone else entirely.
    'inv-other': invoice({
      id: 'inv-other',
      invoiceNumber: '9999',
      customerId: 'cust-2',
    }),
    'inv-draft': invoice({
      id: 'inv-draft',
      invoiceNumber: '1004',
      status: 'DRAFT',
    }),
  };

  beforeEach(() => {
    findWithDetails = jest.fn(async (id: string) => invoicesById[id] ?? null);
    findCustomerById = jest.fn().mockResolvedValue(customer);
    updateCustomer = jest.fn().mockResolvedValue(customer);
    // One call rendering every invoice in a shared browser, rather than one
    // Chromium launch per invoice — which is what timed out in production.
    generateInvoicePdfs = jest
      .fn()
      .mockImplementation(async (invoices: any[]) =>
        invoices.map(() => 'cGRm')
      );
    sendInvoiceStatementEmail = jest
      .fn()
      .mockResolvedValue({ success: true, messageId: 'msg-1' });
    auditCreate = jest.fn();

    service = new InvoicesService(
      { findWithDetails } as any,
      { create: auditCreate } as any,
      { findById: findCustomerById, update: updateCustomer } as any,
      {} as any,
      { generateInvoicePdfs } as any,
      { sendInvoiceStatementEmail } as any,
      {} as any,
      {} as any
    );
  });

  const send = (ids = ['inv-1', 'inv-2', 'inv-3'], opts: any = {}) =>
    service.sendInvoiceStatementEmail(
      'cust-1',
      ids,
      'user-1',
      opts.emails,
      opts.saveToCustomer
    );

  it('sends one email rather than one per invoice', async () => {
    await send();

    expect(sendInvoiceStatementEmail).toHaveBeenCalledTimes(1);
  });

  it('owes the sum of the balances, not the sum of the totals', async () => {
    const result = await send();

    // 100 + (250 - 50) + 75
    expect(result.totalOwing).toBe(375);
    const [, statement] = sendInvoiceStatementEmail.mock.calls[0];
    expect(statement.totalOwing).toBe(375);
  });

  it('lists every invoice with what is still owing on it', async () => {
    await send();

    const [, statement] = sendInvoiceStatementEmail.mock.calls[0];
    expect(statement.invoices).toEqual([
      expect.objectContaining({
        invoiceNumber: '1001',
        total: 100,
        amountPaid: 0,
        balanceDue: 100,
      }),
      expect.objectContaining({
        invoiceNumber: '1002',
        total: 250,
        amountPaid: 50,
        balanceDue: 200,
      }),
      expect.objectContaining({
        invoiceNumber: '1003',
        balanceDue: 75,
      }),
    ]);
  });

  it('attaches every invoice as its own PDF', async () => {
    await send();

    const [, statement] = sendInvoiceStatementEmail.mock.calls[0];
    expect(statement.attachments.map((a: any) => a.name)).toEqual([
      'Invoice-1001.pdf',
      'Invoice-1002.pdf',
      'Invoice-1003.pdf',
    ]);
  });

  // Three invoices used to mean three Chromium cold starts, which pushed the
  // request past the reverse proxy's 30s ceiling and surfaced as a 502.
  it('renders every PDF in one batch, not one browser per invoice', async () => {
    await send();

    expect(generateInvoicePdfs).toHaveBeenCalledTimes(1);
    expect(generateInvoicePdfs.mock.calls[0][0]).toHaveLength(3);
  });

  it('refuses a statement too large to render inside the request', async () => {
    // Better a message the user can act on than an unexplained gateway error.
    const tooMany = Array.from({ length: 13 }, (_, i) => `inv-${i}`);

    await expect(send(tooMany)).rejects.toBeInstanceOf(BadRequestException);
    expect(generateInvoicePdfs).not.toHaveBeenCalled();
  });

  it('addresses the statement to the business name when there is one', async () => {
    await send();

    const [, statement] = sendInvoiceStatementEmail.mock.calls[0];
    expect(statement.customerName).toBe('Northern Fleet Ltd');
  });

  // A statement goes to one customer. Carrying someone else's invoice would
  // disclose their business to the wrong person.
  it('refuses an invoice belonging to another customer', async () => {
    await expect(send(['inv-1', 'inv-other'])).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(sendInvoiceStatementEmail).not.toHaveBeenCalled();
  });

  // A statement asks for money. A draft is not a finalised invoice, so it would
  // be asking against figures the shop has not committed to.
  it('refuses a draft invoice', async () => {
    await expect(send(['inv-1', 'inv-draft'])).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(sendInvoiceStatementEmail).not.toHaveBeenCalled();
  });

  it('refuses an invoice that does not exist', async () => {
    await expect(send(['inv-1', 'nope'])).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(sendInvoiceStatementEmail).not.toHaveBeenCalled();
  });

  it('refuses to send nothing', async () => {
    await expect(send([])).rejects.toBeInstanceOf(BadRequestException);
  });

  it('falls back to the customer email when no recipient is chosen', async () => {
    await send();

    expect(sendInvoiceStatementEmail.mock.calls[0][0]).toEqual([
      'fleet@northern.ca',
    ]);
  });

  it('refuses when there is no address to send to at all', async () => {
    findCustomerById.mockResolvedValue({ ...customer, email: null });

    await expect(send()).rejects.toBeInstanceOf(BadRequestException);
  });

  it('saves a newly typed address to the customer when asked', async () => {
    await send(['inv-1'], {
      emails: ['fleet@northern.ca', 'accounts@northern.ca'],
      saveToCustomer: true,
    });

    expect(updateCustomer).toHaveBeenCalledWith('cust-1', {
      email: 'fleet@northern.ca',
      additionalEmails: ['accounts@northern.ca'],
    });
  });

  it('leaves the customer alone when not asked to save', async () => {
    await send(['inv-1'], { emails: ['someone@else.ca'] });

    expect(updateCustomer).not.toHaveBeenCalled();
  });

  it('reports a send failure rather than claiming success', async () => {
    sendInvoiceStatementEmail.mockResolvedValue({ success: false });

    await expect(send()).rejects.toBeInstanceOf(BadRequestException);
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('audits what was sent, to whom, and for how much', async () => {
    await send();

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SEND_INVOICE_STATEMENT_EMAIL',
        entityId: 'cust-1',
        details: expect.objectContaining({
          invoiceNumbers: ['1001', '1002', '1003'],
          totalOwing: 375,
        }),
      })
    );
  });
});
