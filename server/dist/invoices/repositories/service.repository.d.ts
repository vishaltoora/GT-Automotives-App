import { PrismaService } from '@gt-automotive/database';
import { Service, Prisma } from '@prisma/client';
export declare class ServiceRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.ServiceCreateInput): Promise<Service>;
    findAll(): Promise<Service[]>;
    findById(id: string): Promise<Service | null>;
    findByName(name: string): Promise<Service | null>;
    update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service>;
    delete(id: string): Promise<Service>;
}
//# sourceMappingURL=service.repository.d.ts.map