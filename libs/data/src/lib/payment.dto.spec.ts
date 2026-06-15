import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreatePaymentDto,
  PaymentStatus,
  ProcessPaymentDto,
  UpdatePaymentDto,
} from './payment.dto';
import { PaymentMethod } from './invoice.dto';

async function validateCreate(payload: Partial<CreatePaymentDto>) {
  const dto = plainToInstance(CreatePaymentDto, payload);
  return validate(dto);
}

function validPayment(): Partial<CreatePaymentDto> {
  return {
    jobId: 'job-1',
    employeeId: 'emp-1',
    amount: 100,
    paymentMethod: PaymentMethod.CASH,
    paidBy: 'admin-1',
  };
}

describe('CreatePaymentDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validPayment());
    expect(errors).toHaveLength(0);
  });

  it('fails when jobId is missing', async () => {
    const payload = validPayment();
    delete payload.jobId;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'jobId')).toBe(true);
  });

  it('fails when employeeId is missing', async () => {
    const payload = validPayment();
    delete payload.employeeId;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'employeeId')).toBe(true);
  });

  it('fails when paidBy is missing', async () => {
    const payload = validPayment();
    delete payload.paidBy;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'paidBy')).toBe(true);
  });

  it('fails when paymentMethod is invalid', async () => {
    const errors = await validateCreate({
      ...validPayment(),
      paymentMethod: 'BITCOIN' as PaymentMethod,
    });
    expect(errors.some((e) => e.property === 'paymentMethod')).toBe(true);
  });

  it('coerces a numeric string amount via @Type(Number)', async () => {
    const errors = await validateCreate({
      ...validPayment(),
      amount: '100' as unknown as number,
    });
    expect(errors.some((e) => e.property === 'amount')).toBe(false);
  });
});

describe('UpdatePaymentDto', () => {
  it('passes with an empty payload (all optional)', async () => {
    const dto = plainToInstance(UpdatePaymentDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when status is an invalid enum value', async () => {
    const dto = plainToInstance(UpdatePaymentDto, {
      status: 'WEIRD' as PaymentStatus,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('fails when paidAt is not an ISO date string', async () => {
    const dto = plainToInstance(UpdatePaymentDto, { paidAt: 'yesterday' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'paidAt')).toBe(true);
  });
});

describe('ProcessPaymentDto', () => {
  it('passes with required jobId, paymentMethod and paidBy', async () => {
    const dto = plainToInstance(ProcessPaymentDto, {
      jobId: 'job-1',
      paymentMethod: PaymentMethod.CASH,
      paidBy: 'admin-1',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when jobId is missing', async () => {
    const dto = plainToInstance(ProcessPaymentDto, {
      paymentMethod: PaymentMethod.CASH,
      paidBy: 'admin-1',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'jobId')).toBe(true);
  });
});
