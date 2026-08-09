import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  BulkInvoiceEmailDialog,
  BulkEmailableInvoice,
} from './BulkInvoiceEmailDialog';

const mockSendInvoiceStatement = jest.fn();

jest.mock('../../requests/invoice.requests', () => ({
  invoiceService: {
    sendInvoiceStatement: (...args: unknown[]) =>
      mockSendInvoiceStatement(...args),
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
  fireEvent.click(
    screen.getByRole('button', {
      name: /^Send (statement \(\d+ invoices\)|1 invoice)$/,
    })
  );

describe('BulkInvoiceEmailDialog', () => {
  beforeEach(() => {
    mockSendInvoiceStatement.mockReset();
    mockSendInvoiceStatement.mockResolvedValue({
      success: true,
      message: 'Statement email sent successfully',
      emailUsed: 'fleet@northern.ca',
      invoiceCount: 3,
      totalOwing: 375,
    });
  });

  // The whole point of the rework: a customer with seven outstanding invoices
  // gets one message, not seven.
  it('sends a single statement covering every selected invoice', async () => {
    setup({});

    clickSend();

    await waitFor(() =>
      expect(mockSendInvoiceStatement).toHaveBeenCalledTimes(1)
    );
    const [customerId, invoiceIds, emails, saveToCustomer] =
      mockSendInvoiceStatement.mock.calls[0];
    expect(customerId).toBe('cust-1');
    expect(invoiceIds).toEqual(['inv-1', 'inv-2', 'inv-3']);
    expect(emails).toEqual(['fleet@northern.ca']);
    expect(saveToCustomer).toBe(true);
  });

  it('totals the balance due, not the invoice totals', () => {
    setup({});

    // 100 + (250 - 50) + 75
    expect(screen.getByText('$375.00')).toBeTruthy();
  });

  it('leaves out invoices the user unticks', async () => {
    setup({});

    fireEvent.click(screen.getByText('#1002'));
    clickSend();

    await waitFor(() =>
      expect(mockSendInvoiceStatement).toHaveBeenCalledTimes(1)
    );
    expect(mockSendInvoiceStatement.mock.calls[0][1]).toEqual([
      'inv-1',
      'inv-3',
    ]);
  });

  it('confirms what was sent, and the total owing', async () => {
    setup({});

    clickSend();

    await waitFor(() =>
      expect(
        screen.getByText(
          /A statement for 3 invoices was emailed to fleet@northern.ca/
        )
      ).toBeTruthy()
    );
    expect(screen.getByText('Total owing')).toBeTruthy();
  });

  it('reports a failure without claiming anything was sent', async () => {
    mockSendInvoiceStatement.mockRejectedValue({
      response: { data: { message: 'Mailbox unavailable' } },
    });

    setup({});
    clickSend();

    await waitFor(() =>
      expect(
        screen.getByText(/The statement was not sent: Mailbox unavailable/)
      ).toBeTruthy()
    );
    // Send stays available, because one email either went or it did not —
    // pressing it again is a safe retry rather than a duplicate.
    expect(
      screen.getByRole('button', {
        name: /^Send statement \(3 invoices\)$/,
      })
    ).toBeTruthy();
  });

  it('cannot send with no recipient selected', () => {
    setup({ availableEmails: [] });

    expect(
      screen.getByText('This customer has no email on file. Add one below.')
    ).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: /^Send statement \(3 invoices\)$/,
      }).disabled
    ).toBe(true);
  });

  /**
   * The real parent re-renders when the send finishes.
   *
   * CustomerDetailsDialog passes `invoices` and `availableEmails` as fresh
   * array literals and reloads the customer from `onSent`, so a reset effect
   * keyed on either prop fires the moment a send completes — wiping the
   * confirmation and re-arming Send. A bare jest.fn() for `onSent` cannot catch
   * that, because nothing re-renders.
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

    it('keeps the confirmation on screen', async () => {
      render(<ParentLikeCustomerDialog />);
      clickSend();

      await waitFor(() =>
        expect(
          screen.getByText(/was emailed to fleet@northern.ca/)
        ).toBeTruthy()
      );

      // Give the parent's re-render a chance to clobber it.
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(screen.getByText(/was emailed to fleet@northern.ca/)).toBeTruthy();
    });

    it('does not re-arm Send, which would send the statement twice', async () => {
      render(<ParentLikeCustomerDialog />);
      clickSend();

      await waitFor(() =>
        expect(
          screen.getByText(/was emailed to fleet@northern.ca/)
        ).toBeTruthy()
      );
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(
        screen.queryByRole('button', { name: /^Send statement/ })
      ).toBeNull();
      expect(mockSendInvoiceStatement).toHaveBeenCalledTimes(1);
    });
  });
});
