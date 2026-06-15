import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateQuoteDto,
  QuotationItemDto,
  QuotationItemType,
  QuotationStatus,
} from './quotation.dto';

async function validateQuote(payload: Partial<CreateQuoteDto>) {
  const dto = plainToInstance(CreateQuoteDto, payload);
  return validate(dto);
}

function validItem(): QuotationItemDto {
  return {
    itemType: QuotationItemType.SERVICE,
    description: 'Wheel alignment',
    quantity: 1,
    unitPrice: 80,
  } as QuotationItemDto;
}

function validQuote(): Partial<CreateQuoteDto> {
  return {
    customerName: 'Jane Doe',
    items: [validItem()],
  };
}

describe('CreateQuoteDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateQuote(validQuote());
    expect(errors).toHaveLength(0);
  });

  it('fails when customerName is missing', async () => {
    const payload = validQuote();
    delete payload.customerName;
    const errors = await validateQuote(payload);
    expect(errors.some((e) => e.property === 'customerName')).toBe(true);
  });

  it('fails when items is missing (not an array)', async () => {
    const payload = validQuote();
    delete payload.items;
    const errors = await validateQuote(payload);
    expect(errors.some((e) => e.property === 'items')).toBe(true);
  });

  it('fails when a nested item has an invalid itemType', async () => {
    const errors = await validateQuote({
      ...validQuote(),
      items: [{ ...validItem(), itemType: 'BOGUS' as QuotationItemType }],
    });
    expect(errors.some((e) => e.property === 'items')).toBe(true);
  });

  it('fails when status is an invalid enum value', async () => {
    const errors = await validateQuote({
      ...validQuote(),
      status: 'NOPE' as QuotationStatus,
    });
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('accepts a valid optional status', async () => {
    const errors = await validateQuote({
      ...validQuote(),
      status: QuotationStatus.DRAFT,
    });
    expect(errors).toHaveLength(0);
  });
});

describe('QuotationItemDto', () => {
  it('passes with valid required fields', async () => {
    const dto = plainToInstance(QuotationItemDto, validItem());
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when description is missing', async () => {
    const item = validItem();
    delete (item as Partial<QuotationItemDto>).description;
    const dto = plainToInstance(QuotationItemDto, item);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });
});
