import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateVendorDto, UpdateVendorDto } from './vendor.dto';

async function validateCreate(payload: Partial<CreateVendorDto>) {
  const dto = plainToInstance(CreateVendorDto, payload);
  return validate(dto);
}

describe('CreateVendorDto', () => {
  it('passes with only the required name', async () => {
    const errors = await validateCreate({ name: 'Acme Tires' });
    expect(errors).toHaveLength(0);
  });

  it('fails when name is missing', async () => {
    const errors = await validateCreate({});
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when name exceeds MaxLength(100)', async () => {
    const errors = await validateCreate({ name: 'a'.repeat(101) });
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when email is malformed', async () => {
    const errors = await validateCreate({
      name: 'Acme',
      email: 'not-an-email',
    });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('accepts a valid email', async () => {
    const errors = await validateCreate({
      name: 'Acme',
      email: 'sales@acme.com',
    });
    expect(errors).toHaveLength(0);
  });

  it('fails when phone exceeds MaxLength(20)', async () => {
    const errors = await validateCreate({
      name: 'Acme',
      phone: '1'.repeat(21),
    });
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('fails when isActive is not a boolean', async () => {
    const errors = await validateCreate({
      name: 'Acme',
      isActive: 'yes' as unknown as boolean,
    });
    expect(errors.some((e) => e.property === 'isActive')).toBe(true);
  });
});

describe('UpdateVendorDto', () => {
  it('passes with an empty payload (all optional via PartialType)', async () => {
    const dto = plainToInstance(UpdateVendorDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('still validates email format when provided', async () => {
    const dto = plainToInstance(UpdateVendorDto, { email: 'bad' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
