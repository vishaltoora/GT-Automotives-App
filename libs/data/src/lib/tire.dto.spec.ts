import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  AdjustmentType,
  CreateTireDto,
  StockAdjustmentDto,
  TireCondition,
  TireType,
  UpdateTireDto,
} from './tire.dto';

async function validateCreate(payload: Partial<CreateTireDto>) {
  const dto = plainToInstance(CreateTireDto, payload);
  return validate(dto);
}

function validTire(): Partial<CreateTireDto> {
  return {
    brand: 'Michelin',
    size: '225/65R17',
    type: TireType.ALL_SEASON,
    condition: TireCondition.NEW,
    price: 199.99,
    quantity: 10,
  };
}

describe('CreateTireDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validTire());
    expect(errors).toHaveLength(0);
  });

  it('fails when brand is missing', async () => {
    const payload = validTire();
    delete payload.brand;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'brand')).toBe(true);
  });

  it('fails when size is missing', async () => {
    const payload = validTire();
    delete payload.size;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'size')).toBe(true);
  });

  it('fails when type is not a valid enum', async () => {
    const errors = await validateCreate({
      ...validTire(),
      type: 'FLYING' as TireType,
    });
    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });

  it('fails when condition is not a valid enum', async () => {
    const errors = await validateCreate({
      ...validTire(),
      condition: 'MINT' as TireCondition,
    });
    expect(errors.some((e) => e.property === 'condition')).toBe(true);
  });

  it('fails when price is negative (Min 0)', async () => {
    const errors = await validateCreate({ ...validTire(), price: -5 });
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });

  it('accepts price of 0', async () => {
    const errors = await validateCreate({ ...validTire(), price: 0 });
    expect(errors).toHaveLength(0);
  });

  it('fails when quantity is negative (Min 0)', async () => {
    const errors = await validateCreate({ ...validTire(), quantity: -1 });
    expect(errors.some((e) => e.property === 'quantity')).toBe(true);
  });
});

describe('UpdateTireDto', () => {
  it('passes with an empty payload (all optional via PartialType)', async () => {
    const dto = plainToInstance(UpdateTireDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('still validates provided fields (negative price rejected)', async () => {
    const dto = plainToInstance(UpdateTireDto, { price: -1 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });
});

describe('StockAdjustmentDto', () => {
  it('passes with valid quantity and type', async () => {
    const dto = plainToInstance(StockAdjustmentDto, {
      quantity: 5,
      type: AdjustmentType.ADD,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when type is not a valid AdjustmentType', async () => {
    const dto = plainToInstance(StockAdjustmentDto, {
      quantity: 5,
      type: 'multiply' as AdjustmentType,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });
});
