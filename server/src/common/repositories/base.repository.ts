import { PrismaService } from '@gt-automotive/database';

export abstract class BaseRepository<T, CreateInput = any, UpdateInput = any, FindManyArgs = any> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  async findAll(args?: FindManyArgs): Promise<T[]> {
    return this.prisma[this.modelName].findMany(args);
  }

  async findById(id: string | number): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where: { id },
    });
  }

  async create(data: CreateInput): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
    });
  }

  async update(id: string | number, data: UpdateInput): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data,
    });
  }

  async delete(id: string | number): Promise<boolean> {
    await this.prisma[this.modelName].delete({
      where: { id },
    });
    return true;
  }
}