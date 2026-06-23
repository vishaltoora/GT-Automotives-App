import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateInvoiceDto,
  InvoiceItemDto,
  InvoiceItemType,
  InvoiceStatus,
} from './invoice.dto';

async function validateInvoice(payload: Partial<CreateInvoiceDto>) {
  const dto = plainToInstance(CreateInvoiceDto, payload);
  return validate(dto);
}

async function validateItem(payload: Partial<InvoiceItemDto>) {
  const dto = plainToInstance(InvoiceItemDto, payload);
  return validate(dto);
}

function validItem(): InvoiceItemDto {
  return {
    itemType: InvoiceItemType.SERVICE,
    description: 'Oil change',
    quantity: 1,
    unitPrice: 50,
  } as InvoiceItemDto;
}

function validInvoice(): Partial<CreateInvoiceDto> {
  return {
    companyId: 'company-1',
    items: [validItem()],
    subtotal: 50,
    taxRate: 0.05,
    taxAmount: 2.5,
    total: 52.5,
    status: InvoiceStatus.DRAFT,
  };
}

describe('CreateInvoiceDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateInvoice(validInvoice());
    expect(errors).toHaveLength(0);
  });

  it('fails when companyId is missing', async () => {
    const payload = validInvoice();
    delete payload.companyId;
    const errors = await validateInvoice(payload);
    expect(errors.some((e) => e.property === 'companyId')).toBe(true);
  });

  it('fails when items is missing (not an array)', async () => {
    const payload = validInvoice();
    delete payload.items;
    const errors = await validateInvoice(payload);
    expect(errors.some((e) => e.property === 'items')).toBe(true);
  });

  it('fails when subtotal is not a number', async () => {
    const errors = await validateInvoice({
      ...validInvoice(),
      subtotal: 'fifty' as unknown as number,
    });
    expect(errors.some((e) => e.property === 'subtotal')).toBe(true);
  });

  it('fails when status is not a valid enum value', async () => {
    const errors = await validateInvoice({
      ...validInvoice(),
      status: 'NOT_A_STATUS' as InvoiceStatus,
    });
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('accepts a valid optional paymentMethod is omitted', async () => {
    const errors = await validateInvoice(validInvoice());
    expect(errors).toHaveLength(0);
  });
});

describe('InvoiceItemDto', () => {
  it('passes with a valid non-discount item', async () => {
    const errors = await validateItem(validItem());
    expect(errors).toHaveLength(0);
  });

  it('fails when itemType is invalid', async () => {
    const errors = await validateItem({
      ...validItem(),
      itemType: 'BOGUS' as InvoiceItemType,
    });
    expect(errors.some((e) => e.property === 'itemType')).toBe(true);
  });

  it('fails when description is missing', async () => {
    const item = validItem();
    delete (item as Partial<InvoiceItemDto>).description;
    const errors = await validateItem(item);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });

  it('requires a positive unitPrice for non-discount items', async () => {
    const errors = await validateItem({ ...validItem(), unitPrice: -10 });
    expect(errors.some((e) => e.property === 'unitPrice')).toBe(true);
  });

  it('allows a negative unitPrice for DISCOUNT items (ValidateIf skips check)', async () => {
    const errors = await validateItem({
      itemType: InvoiceItemType.DISCOUNT,
      description: 'Loyalty discount',
      quantity: 1,
      unitPrice: -10,
    });
    expect(errors.some((e) => e.property === 'unitPrice')).toBe(false);
  });
});
