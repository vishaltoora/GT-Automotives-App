import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateJobDto, JobStatus, JobType, UpdateJobDto } from './job.dto';

async function validateCreate(payload: Partial<CreateJobDto>) {
  const dto = plainToInstance(CreateJobDto, payload);
  return validate(dto);
}

function validJob(): Partial<CreateJobDto> {
  return {
    employeeId: 'emp-1',
    title: 'Brake replacement',
    payAmount: 120,
    jobType: JobType.REGULAR,
  };
}

describe('CreateJobDto', () => {
  it('passes with a valid payload', async () => {
    const errors = await validateCreate(validJob());
    expect(errors).toHaveLength(0);
  });

  it('fails when employeeId is missing', async () => {
    const payload = validJob();
    delete payload.employeeId;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'employeeId')).toBe(true);
  });

  it('fails when title is missing', async () => {
    const payload = validJob();
    delete payload.title;
    const errors = await validateCreate(payload);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('fails when payAmount is not a number', async () => {
    const errors = await validateCreate({
      ...validJob(),
      payAmount: 'lots' as unknown as number,
    });
    expect(errors.some((e) => e.property === 'payAmount')).toBe(true);
  });

  it('fails when jobType is an invalid enum value', async () => {
    const errors = await validateCreate({
      ...validJob(),
      jobType: 'PART_TIME' as JobType,
    });
    expect(errors.some((e) => e.property === 'jobType')).toBe(true);
  });

  it('fails when dueDate is not an ISO date string', async () => {
    const errors = await validateCreate({
      ...validJob(),
      dueDate: 'tomorrow',
    });
    expect(errors.some((e) => e.property === 'dueDate')).toBe(true);
  });

  it('accepts a valid optional status', async () => {
    const errors = await validateCreate({
      ...validJob(),
      status: JobStatus.PENDING,
    });
    expect(errors).toHaveLength(0);
  });
});

describe('UpdateJobDto', () => {
  it('passes with an empty payload (all optional)', async () => {
    const dto = plainToInstance(UpdateJobDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when status is an invalid enum value', async () => {
    const dto = plainToInstance(UpdateJobDto, {
      status: 'DONE' as JobStatus,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });
});
