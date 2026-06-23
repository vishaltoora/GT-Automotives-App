import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreatePurchaseInvoiceDto,
  PurchaseCategory,
  UpdatePurchaseInvoiceDto,
} from './purchase-invoice.dto';

async function validateCreate(payload: Partial<CreatePurchaseInvoiceDto>) {
  const dto = plainToInstance(CreatePurchaseInvoiceDto, payload);
  return validate(dto);
}

function validPurchase(): Partial<CreatePurchaseInvoiceDto> {
  return {
    vendorName: 'Tire Wholesaler',
    description: 'Bulk tire order',
    invoiceDate: '2025-11-01',
    amount: 5000,
    totalAmount: 5250,
    category: PurchaseCategory.TIRES,
    createdBy: 'admin-1',
  };
}

describe('CreatePurchaseInvoiceDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validPurchase());
    expect(errors).toHaveLength(0);
  });

  it('fails when vendorName is missing', async () => {
    const payload = validPurchase();
    delete payload.vendorName;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'vendorName')).toBe(true);
  });

  it('fails when description is missing', async () => {
    const payload = validPurchase();
    delete payload.description;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });

  it('fails when createdBy is missing', async () => {
    const payload = validPurchase();
    delete payload.createdBy;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'createdBy')).toBe(true);
  });

  it('fails when invoiceDate is not an ISO date string', async () => {
    const errors = await validateCreate({
      ...validPurchase(),
      invoiceDate: '01-11-2025',
    });
    expect(errors.some((e) => e.property === 'invoiceDate')).toBe(true);
  });

  it('fails when category is an invalid enum value', async () => {
    const errors = await validateCreate({
      ...validPurchase(),
      category: 'GADGETS' as PurchaseCategory,
    });
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('fails when vendorName exceeds MaxLength(100)', async () => {
    const errors = await validateCreate({
      ...validPurchase(),
      vendorName: 'v'.repeat(101),
    });
    expect(errors.some((e) => e.property === 'vendorName')).toBe(true);
  });
});

describe('UpdatePurchaseInvoiceDto', () => {
  it('passes with an empty payload (all optional)', async () => {
    const dto = plainToInstance(UpdatePurchaseInvoiceDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when category is invalid when provided', async () => {
    const dto = plainToInstance(UpdatePurchaseInvoiceDto, {
      category: 'BAD' as PurchaseCategory,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });
});
