import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';

async function validateCreate(payload: Partial<CreateServiceDto>) {
  const dto = plainToInstance(CreateServiceDto, payload);
  return validate(dto);
}

function validService(): Partial<CreateServiceDto> {
  return {
    name: 'Oil Change',
    unitPrice: 49.99,
  };
}

describe('CreateServiceDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validService());
    expect(errors).toHaveLength(0);
  });

  it('fails when name is missing', async () => {
    const payload = validService();
    delete payload.name;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when name is an empty string (IsNotEmpty)', async () => {
    const errors = await validateCreate({ ...validService(), name: '' });
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when unitPrice is missing', async () => {
    const payload = validService();
    delete payload.unitPrice;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'unitPrice')).toBe(true);
  });

  it('fails when unitPrice is not positive', async () => {
    const errors = await validateCreate({ ...validService(), unitPrice: 0 });
    expect(errors.some((e) => e.property === 'unitPrice')).toBe(true);
  });

  it('fails when unitPrice has more than 2 decimal places', async () => {
    const errors = await validateCreate({
      ...validService(),
      unitPrice: 10.123,
    });
    expect(errors.some((e) => e.property === 'unitPrice')).toBe(true);
  });
});

describe('UpdateServiceDto', () => {
  it('passes with an empty payload (all optional)', async () => {
    const dto = plainToInstance(UpdateServiceDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when name is an empty string when provided', async () => {
    const dto = plainToInstance(UpdateServiceDto, { name: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when unitPrice is not positive when provided', async () => {
    const dto = plainToInstance(UpdateServiceDto, { unitPrice: -5 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'unitPrice')).toBe(true);
  });
});
