import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  AppointmentType,
  CreateAppointmentDto,
  CreateETransferInvoiceDto,
} from './appointment.dto';

async function validateCreate(payload: Partial<CreateAppointmentDto>) {
  const dto = plainToInstance(CreateAppointmentDto, payload);
  return validate(dto);
}

function validAppointment(): Partial<CreateAppointmentDto> {
  return {
    customerId: 'customer-1',
    scheduledDate: '2025-11-18',
    scheduledTime: '09:00',
    duration: 60,
    serviceType: 'Tire Mount Balance',
    appointmentType: AppointmentType.AT_GARAGE,
  };
}

describe('CreateAppointmentDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validAppointment());
    expect(errors).toHaveLength(0);
  });

  it('fails when customerId is missing', async () => {
    const payload = validAppointment();
    delete payload.customerId;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'customerId')).toBe(true);
  });

  it('fails when scheduledDate is not in YYYY-MM-DD format', async () => {
    const errors = await validateCreate({
      ...validAppointment(),
      scheduledDate: '11/18/2025',
    });
    expect(errors.some((e) => e.property === 'scheduledDate')).toBe(true);
  });

  it('accepts a properly formatted scheduledDate', async () => {
    const errors = await validateCreate({
      ...validAppointment(),
      scheduledDate: '2026-01-01',
    });
    expect(errors).toHaveLength(0);
  });

  it('fails when duration is below the minimum of 15', async () => {
    const errors = await validateCreate({ ...validAppointment(), duration: 5 });
    expect(errors.some((e) => e.property === 'duration')).toBe(true);
  });

  it('fails when duration exceeds the maximum of 480', async () => {
    const errors = await validateCreate({
      ...validAppointment(),
      duration: 600,
    });
    expect(errors.some((e) => e.property === 'duration')).toBe(true);
  });

  it('fails when appointmentType is invalid', async () => {
    const errors = await validateCreate({
      ...validAppointment(),
      appointmentType: 'TELEPORT' as AppointmentType,
    });
    expect(errors.some((e) => e.property === 'appointmentType')).toBe(true);
  });

  it('fails when serviceType is missing', async () => {
    const payload = validAppointment();
    delete payload.serviceType;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'serviceType')).toBe(true);
  });
});

describe('CreateETransferInvoiceDto', () => {
  it('passes with a positive serviceAmount', async () => {
    const dto = plainToInstance(CreateETransferInvoiceDto, {
      serviceAmount: 150,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when serviceAmount is not positive', async () => {
    const dto = plainToInstance(CreateETransferInvoiceDto, {
      serviceAmount: 0,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'serviceAmount')).toBe(true);
  });

  it('fails when tipAmount is negative (Min 0)', async () => {
    const dto = plainToInstance(CreateETransferInvoiceDto, {
      serviceAmount: 150,
      tipAmount: -5,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'tipAmount')).toBe(true);
  });
});
