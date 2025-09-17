import { PrismaService } from '@gt-automotive/database';
import { Role, RoleName } from '@prisma/client';
export declare class RoleRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Role[]>;
    findById(id: string): Promise<Role | null>;
    findByName(name: RoleName | string): Promise<Role | null>;
    getPermissions(roleId: string): Promise<any[]>;
    hasPermission(roleId: string, permissionName: string): Promise<boolean>;
}
//# sourceMappingURL=role.repository.d.ts.map