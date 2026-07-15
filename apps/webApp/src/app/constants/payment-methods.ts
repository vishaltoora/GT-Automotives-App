import { PaymentMethod } from '../../enums';
import { PAYMENT_METHOD_LABELS } from './enum-mappings';

// Square Terminal options aren't real PaymentMethod values — they trigger an
// in-person card-reader checkout in the payment dialog, then record as
// CREDIT_CARD / DEBIT_CARD. Elsewhere (e.g. tagging an RO invoice) they simply
// resolve to that underlying real method.
export type TerminalMethod = 'TERMINAL_CREDIT' | 'TERMINAL_DEBIT';
export type PaymentMethodValue = PaymentMethod | TerminalMethod;

export const isTerminalMethod = (m: PaymentMethodValue): m is TerminalMethod =>
  m === 'TERMINAL_CREDIT' || m === 'TERMINAL_DEBIT';

export const terminalToPaymentMethod = (m: TerminalMethod): PaymentMethod =>
  m === 'TERMINAL_CREDIT'
    ? PaymentMethod.CREDIT_CARD
    : PaymentMethod.DEBIT_CARD;

// Resolve any selector value to a real PaymentMethod enum value for persistence.
export const resolvePaymentMethod = (m: PaymentMethodValue): PaymentMethod =>
  isTerminalMethod(m) ? terminalToPaymentMethod(m) : m;

const label = (m: PaymentMethod): string =>
  PAYMENT_METHOD_LABELS[m as unknown as keyof typeof PAYMENT_METHOD_LABELS];

export interface PaymentMethodOption {
  value: PaymentMethodValue;
  label: string;
  // Whether this method can participate in a split payment (multiple entries).
  splitOk: boolean;
}

// Single source of truth for the payment-method picker used by both the invoice
// process-payment dialog and the repair-order close/pay-summary selector.
export const PAYMENT_METHOD_SELECT_OPTIONS: PaymentMethodOption[] = [
  {
    value: PaymentMethod.CASH,
    label: label(PaymentMethod.CASH),
    splitOk: true,
  },
  {
    value: PaymentMethod.CASH_NO_TAX,
    label: label(PaymentMethod.CASH_NO_TAX),
    splitOk: false,
  },
  {
    value: PaymentMethod.CREDIT_CARD,
    label: label(PaymentMethod.CREDIT_CARD),
    splitOk: true,
  },
  {
    value: PaymentMethod.DEBIT_CARD,
    label: label(PaymentMethod.DEBIT_CARD),
    splitOk: true,
  },
  {
    value: 'TERMINAL_CREDIT',
    label: 'Square Terminal – Credit Card',
    splitOk: false,
  },
  {
    value: 'TERMINAL_DEBIT',
    label: 'Square Terminal – Debit Card',
    splitOk: false,
  },
  {
    value: PaymentMethod.CHECK,
    label: label(PaymentMethod.CHECK),
    splitOk: true,
  },
  {
    value: PaymentMethod.E_TRANSFER,
    label: label(PaymentMethod.E_TRANSFER),
    splitOk: true,
  },
  {
    value: PaymentMethod.FINANCING,
    label: label(PaymentMethod.FINANCING),
    splitOk: true,
  },
  {
    value: PaymentMethod.BANK_DEPOSIT,
    label: label(PaymentMethod.BANK_DEPOSIT),
    splitOk: true,
  },
];
