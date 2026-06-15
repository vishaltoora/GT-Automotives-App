import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateExpenseInvoiceDto,
  ExpenseCategory,
  ExpenseInvoiceStatus,
  UpdateExpenseInvoiceDto,
} from './expense-invoice.dto';

async function validateCreate(payload: Partial<CreateExpenseInvoiceDto>) {
  const dto = plainToInstance(CreateExpenseInvoiceDto, payload);
  return validate(dto);
}

function validExpense(): Partial<CreateExpenseInvoiceDto> {
  return {
    vendorName: 'BC Hydro',
    description: 'Monthly electricity',
    invoiceDate: '2025-11-01',
    amount: 200,
    totalAmount: 210,
    category: ExpenseCategory.UTILITIES,
    createdBy: 'admin-1',
  };
}

describe('CreateExpenseInvoiceDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validExpense());
    expect(errors).toHaveLength(0);
  });

  it('fails when vendorName is missing', async () => {
    const payload = validExpense();
    delete payload.vendorName;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'vendorName')).toBe(true);
  });

  it('fails when description is missing', async () => {
    const payload = validExpense();
    delete payload.description;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });

  it('fails when createdBy is missing', async () => {
    const payload = validExpense();
    delete payload.createdBy;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'createdBy')).toBe(true);
  });

  it('fails when invoiceDate is not an ISO date string', async () => {
    const errors = await validateCreate({
      ...validExpense(),
      invoiceDate: 'Nov 1 2025',
    });
    expect(errors.some((e) => e.property === 'invoiceDate')).toBe(true);
  });

  it('fails when category is an invalid enum value', async () => {
    const errors = await validateCreate({
      ...validExpense(),
      category: 'SNACKS' as ExpenseCategory,
    });
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('fails when totalAmount is not a number', async () => {
    const errors = await validateCreate({
      ...validExpense(),
      totalAmount: 'lots' as unknown as number,
    });
    expect(errors.some((e) => e.property === 'totalAmount')).toBe(true);
  });
});

describe('UpdateExpenseInvoiceDto', () => {
  it('passes with an empty payload (all optional)', async () => {
    const dto = plainToInstance(UpdateExpenseInvoiceDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when status is an invalid enum value', async () => {
    const dto = plainToInstance(UpdateExpenseInvoiceDto, {
      status: 'WHATEVER' as ExpenseInvoiceStatus,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });
});
