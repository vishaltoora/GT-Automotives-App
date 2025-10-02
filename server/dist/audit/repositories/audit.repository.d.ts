import { PrismaService } from '@gt-automotive/database';
import { AuditLog } from '@prisma/client';
export declare class AuditRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: string;
        action: string;
        entityType?: string;
        entityId?: string;
        resource?: string;
        resourceId?: string;
        oldValue?: any;
        newValue?: any;
        details?: any;
        ipAddress?: string;
    }): Promise<AuditLog>;
    findByUser(userId: string, limit?: number): Promise<AuditLog[]>;
    findByAction(action: string, limit?: number): Promise<AuditLog[]>;
    findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
    findAll(filters?: {
        userId?: string;
        action?: string;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<AuditLog[]>;
    log(data: {
        userId: string;
        action: string;
        entityType?: string;
        entityId?: string;
        resource?: string;
        resourceId?: string;
        oldValue?: any;
        newValue?: any;
        details?: any;
        ipAddress?: string;
    }): Promise<AuditLog>;
}
//# sourceMappingURL=audit.repository.d.ts.map