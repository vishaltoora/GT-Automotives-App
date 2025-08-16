import { PrismaService } from '@gt-automotive/database';

export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}

  abstract findAll(filters?: any): Promise<T[]>;
  abstract findById(id: string | number): Promise<T | null>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string | number, data: any): Promise<T>;
  abstract delete(id: string | number): Promise<boolean>;
}