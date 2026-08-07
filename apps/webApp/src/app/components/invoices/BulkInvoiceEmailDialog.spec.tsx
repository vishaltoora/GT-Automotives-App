import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  BulkInvoiceEmailDialog,
  BulkEmailableInvoice,
} from './BulkInvoiceEmailDialog';

const mockSendInvoiceEmail = jest.fn();

jest.mock('../../requests/invoice.requests', () => ({
  invoiceService: {
    sendInvoiceEmail: (...args: unknown[]) => mockSendInvoiceEmail(...args),
  },
}));

const INVOICES: BulkEmailableInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: '1001',
    total: 100,
    status: 'PENDING',
    invoiceDate: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: '1002',
    total: 250,
    amountPaid: 50,
    status: 'PARTIALLY_PAID',
    invoiceDate: '2026-08-02T00:00:00.000Z',
  },
  {
    id: 'inv-3',
    invoiceNumber: '1003',
    total: 75,
    status: 'PENDING',
    invoiceDate: '2026-08-03T00:00:00.000Z',
  },
];

const setup = (props: Partial<Parameters<typeof BulkInvoiceEmailDialog>[0]>) =>
  render(
    <BulkInvoiceEmailDialog
      open
      onClose={jest.fn()}
      customerName="Northern Fleet Ltd"
      customerId="cust-1"
      invoices={INVOICES}
      availableEmails={['fleet@northern.ca']}
      {...props}
    />
  );

const clickSend = () =>
  fireEvent.click(screen.getByRole('button', { name: /^Send \d+ invoices?$/ }));

describe('BulkInvoiceEmailDialog', () => {
  beforeEach(() => {
    mockSendInvoiceEmail.mockReset();
    mockSendInvoiceEmail.mockResolvedValue({ success: true });
  });

  it('sends every invoice by default, each to the selected recipients', async () => {
    const onSent = jest.fn();
    setup({ onSent });

    clickSend();

    await waitFor(() => expect(mockSendInvoiceEmail).toHaveBeenCalledTimes(3));
    expect(mockSendInvoiceEmail.mock.calls.map((c) => c[0])).toEqual([
      'inv-1',
      'inv-2',
      'inv-3',
    ]);
    mockSendInvoiceEmail.mock.calls.forEach((call) => {
      expect(call[1]).toEqual(['fleet@northern.ca']);
    });
    await waitFor(() => expect(onSent).toHaveBeenCalled());
  });

  it('totals the balance due, not the invoice totals', () => {
    setup({});

    // 100 + (250 - 50) + 75
    expect(screen.getByText('$375.00')).toBeTruthy();
  });

  it('skips invoices the user unticks', async () => {
    setup({});

    fireEvent.click(screen.getByText('#1002'));
    clickSend();

    await waitFor(() => expect(mockSendInvoiceEmail).toHaveBeenCalledTimes(2));
    expect(mockSendInvoiceEmail.mock.calls.map((c) => c[0])).toEqual([
      'inv-1',
      'inv-3',
    ]);
  });

  // Saving the address list on every send would rewrite the same list N times.
  it('asks to save new addresses only once', async () => {
    setup({});

    clickSend();

    await waitFor(() => expect(mockSendInvoiceEmail).toHaveBeenCalledTimes(3));
    expect(mockSendInvoiceEmail.mock.calls.map((c) => c[2])).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('names the invoice that failed and leaves the others sent', async () => {
    mockSendInvoiceEmail
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce({
        response: { data: { message: 'Mailbox unavailable' } },
      })
      .mockResolvedValueOnce({ success: true });

    setup({});
    clickSend();

    await waitFor(() =>
      expect(screen.getByText(/2 of 3 invoices were emailed/)).toBeTruthy()
    );
    expect(screen.getByText('Mailbox unavailable')).toBeTruthy();
    expect(screen.getAllByText('Sent')).toHaveLength(2);
  });

  it('retries only the failed invoice', async () => {
    mockSendInvoiceEmail
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error('SMTP timeout'))
      .mockResolvedValueOnce({ success: true });

    setup({});
    clickSend();

    const retry = await screen.findByRole('button', { name: /Retry 1 failed/ });
    mockSendInvoiceEmail.mockClear();
    mockSendInvoiceEmail.mockResolvedValue({ success: true });

    fireEvent.click(retry);

    await waitFor(() => expect(mockSendInvoiceEmail).toHaveBeenCalledTimes(1));
    expect(mockSendInvoiceEmail.mock.calls[0][0]).toBe('inv-2');
    // The retry reports the whole run, not just what it re-sent.
    await waitFor(() => expect(screen.getAllByText('Sent')).toHaveLength(3));
  });

  it('cannot send with no recipient selected', () => {
    setup({ availableEmails: [] });

    expect(
      screen.getByText('This customer has no email on file. Add one below.')
    ).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: /^Send \d+ invoices?$/,
      }).disabled
    ).toBe(true);
  });

  /**
   * The real parent re-renders when the send finishes.
   *
   * CustomerDetailsDialog passes `invoices` and `availableEmails` as fresh
   * array literals and reloads the customer from `onSent`, so a reset effect
   * keyed on either prop fires the moment a send completes — wiping the result
   * summary and re-ticking every invoice. A bare jest.fn() for `onSent` cannot
   * catch that, because nothing re-renders.
   */
  describe('when the parent re-renders after sending', () => {
    function ParentLikeCustomerDialog() {
      const [reloads, setReloads] = useState(0);
      return (
        <BulkInvoiceEmailDialog
          open
          onClose={jest.fn()}
          customerName="Northern Fleet Ltd"
          customerId="cust-1"
          // Fresh identities on every render, exactly as the real parent does.
          invoices={INVOICES.map((invoice) => ({ ...invoice }))}
          availableEmails={['fleet@northern.ca']}
          onSent={() => setReloads((count) => count + 1)}
          data-reloads={reloads}
        />
      );
    }

    it('keeps the result summary on screen', async () => {
      mockSendInvoiceEmail
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce({
          response: { data: { message: 'Mailbox unavailable' } },
        })
        .mockResolvedValueOnce({ success: true });

      render(<ParentLikeCustomerDialog />);
      clickSend();

      await waitFor(() =>
        expect(screen.getByText(/2 of 3 invoices were emailed/)).toBeTruthy()
      );

      // Give the parent's re-render a chance to clobber it.
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(screen.getByText(/2 of 3 invoices were emailed/)).toBeTruthy();
      expect(screen.getByText('Mailbox unavailable')).toBeTruthy();
      expect(
        screen.getByRole('button', { name: /Retry 1 failed/ })
      ).toBeTruthy();
    });

    it('does not re-arm Send with every invoice re-ticked', async () => {
      render(<ParentLikeCustomerDialog />);
      clickSend();

      await waitFor(() =>
        expect(screen.getByText(/emailed to fleet@northern.ca/)).toBeTruthy()
      );
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Re-pressing a re-armed Send is how the customer gets the same three
      // invoices twice.
      expect(
        screen.queryByRole('button', { name: /^Send \d+ invoices?$/ })
      ).toBeNull();
      expect(mockSendInvoiceEmail).toHaveBeenCalledTimes(3);
    });
  });
});
