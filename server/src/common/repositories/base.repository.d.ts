import { PrismaService } from '@gt-automotive/database';
export declare abstract class BaseRepository<T, CreateInput = any, UpdateInput = any, FindManyArgs = any> {
    protected readonly prisma: PrismaService;
    protected readonly modelName: string;
    constructor(prisma: PrismaService, modelName: string);
    findAll(args?: FindManyArgs): Promise<T[]>;
    findById(id: string | number): Promise<T | null>;
    create(data: CreateInput): Promise<T>;
    update(id: string | number, data: UpdateInput): Promise<T>;
    delete(id: string | number): Promise<boolean>;
}
//# sourceMappingURL=base.repository.d.ts.map