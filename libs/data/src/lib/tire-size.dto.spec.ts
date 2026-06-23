import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTireSizeDto, UpdateTireSizeDto } from './tire-size.dto';

async function validateCreate(payload: Partial<CreateTireSizeDto>) {
  const dto = plainToInstance(CreateTireSizeDto, payload);
  return validate(dto);
}

describe('CreateTireSizeDto', () => {
  it('passes with a valid size', async () => {
    const errors = await validateCreate({ size: '225/65R17' });
    expect(errors).toHaveLength(0);
  });

  it('fails when size is missing', async () => {
    const errors = await validateCreate({});
    expect(errors.some((e) => e.property === 'size')).toBe(true);
  });

  it('fails when size is not a string', async () => {
    const errors = await validateCreate({ size: 17 as unknown as string });
    expect(errors.some((e) => e.property === 'size')).toBe(true);
  });
});

describe('UpdateTireSizeDto', () => {
  it('passes with an empty payload (size is optional)', async () => {
    const dto = plainToInstance(UpdateTireSizeDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when size is not a string when provided', async () => {
    const dto = plainToInstance(UpdateTireSizeDto, {
      size: 99 as unknown as string,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'size')).toBe(true);
  });
});
