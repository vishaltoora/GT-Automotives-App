import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicle.dto';

async function validateCreate(payload: Partial<CreateVehicleDto>) {
  const dto = plainToInstance(CreateVehicleDto, payload);
  return validate(dto);
}

function validVehicle(): Partial<CreateVehicleDto> {
  return {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    customerId: 'customer-1',
  };
}

describe('CreateVehicleDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validVehicle());
    expect(errors).toHaveLength(0);
  });

  it('fails when make is missing', async () => {
    const payload = validVehicle();
    delete payload.make;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'make')).toBe(true);
  });

  it('fails when model is missing', async () => {
    const payload = validVehicle();
    delete payload.model;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'model')).toBe(true);
  });

  it('fails when customerId is missing', async () => {
    const payload = validVehicle();
    delete payload.customerId;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'customerId')).toBe(true);
  });

  it('coerces a numeric string year via @Type(Number) and passes', async () => {
    const errors = await validateCreate({
      ...validVehicle(),
      year: '2021' as unknown as number,
    });
    expect(errors.some((e) => e.property === 'year')).toBe(false);
  });

  it('fails when year is a non-numeric string', async () => {
    const errors = await validateCreate({
      ...validVehicle(),
      year: 'not-a-year' as unknown as number,
    });
    expect(errors.some((e) => e.property === 'year')).toBe(true);
  });
});

describe('UpdateVehicleDto', () => {
  it('passes with an empty payload (all optional)', async () => {
    const dto = plainToInstance(UpdateVehicleDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
