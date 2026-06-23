import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTireBrandDto, UpdateTireBrandDto } from './tire-brand.dto';

async function validateCreate(payload: Partial<CreateTireBrandDto>) {
  const dto = plainToInstance(CreateTireBrandDto, payload);
  return validate(dto);
}

describe('CreateTireBrandDto', () => {
  it('passes with only the required name', async () => {
    const errors = await validateCreate({ name: 'Michelin' });
    expect(errors).toHaveLength(0);
  });

  it('fails when name is missing', async () => {
    const errors = await validateCreate({});
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('accepts a valid imageUrl', async () => {
    const errors = await validateCreate({
      name: 'Michelin',
      imageUrl: 'https://example.com/michelin.png',
    });
    expect(errors).toHaveLength(0);
  });

  it('fails when imageUrl is not a valid URL', async () => {
    const errors = await validateCreate({
      name: 'Michelin',
      imageUrl: 'not a url',
    });
    expect(errors.some((e) => e.property === 'imageUrl')).toBe(true);
  });
});

describe('UpdateTireBrandDto', () => {
  it('passes with an empty payload (all optional)', async () => {
    const dto = plainToInstance(UpdateTireBrandDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when imageUrl is invalid when provided', async () => {
    const dto = plainToInstance(UpdateTireBrandDto, { imageUrl: 'bogus' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'imageUrl')).toBe(true);
  });
});
