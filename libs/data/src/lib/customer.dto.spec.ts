import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCustomerDto } from './customer.dto';

async function validateDto(payload: Partial<CreateCustomerDto>) {
  const dto = plainToInstance(CreateCustomerDto, payload);
  return validate(dto);
}

describe('CreateCustomerDto', () => {
  it('passes with only the required first and last name', async () => {
    const errors = await validateDto({ firstName: 'John', lastName: 'Doe' });
    expect(errors).toHaveLength(0);
  });

  it('fails when firstName is missing', async () => {
    const errors = await validateDto({
      lastName: 'Doe',
    } as Partial<CreateCustomerDto>);
    expect(errors.some((e) => e.property === 'firstName')).toBe(true);
  });

  it('fails when firstName is an empty string', async () => {
    const errors = await validateDto({ firstName: '', lastName: 'Doe' });
    expect(errors.some((e) => e.property === 'firstName')).toBe(true);
  });

  it('accepts an empty email (optional via ValidateIf)', async () => {
    const errors = await validateDto({
      firstName: 'John',
      lastName: 'Doe',
      email: '',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a malformed email', async () => {
    const errors = await validateDto({
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email',
    });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('accepts a valid email', async () => {
    const errors = await validateDto({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a phone number without 10 digits', async () => {
    const errors = await validateDto({
      firstName: 'John',
      lastName: 'Doe',
      phone: '250-555',
    });
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('accepts a phone number with 10 consecutive digits (dashes stripped by the frontend)', async () => {
    const errors = await validateDto({
      firstName: 'John',
      lastName: 'Doe',
      phone: '2505551234',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a formatted phone number with separators (must be digits only)', async () => {
    const errors = await validateDto({
      firstName: 'John',
      lastName: 'Doe',
      phone: '(250) 555-1234',
    });
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });
});
