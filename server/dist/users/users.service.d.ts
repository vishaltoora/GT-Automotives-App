import { ConfigService } from '@nestjs/config';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
export declare class UsersService {
    private userRepository;
    private roleRepository;
    private auditRepository;
    private configService;
    constructor(userRepository: UserRepository, roleRepository: RoleRepository, auditRepository: AuditRepository, configService: ConfigService);
    findAll(filters?: {
        roleId?: string;
        isActive?: boolean;
    }): Promise<({
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    })[]>;
    findById(id: string): Promise<{
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    findByEmail(email: string): Promise<({
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }) | null>;
    create(data: {
        email: string;
        password?: string;
        firstName: string;
        lastName: string;
        roleId: string;
        createdBy: string;
    }): Promise<{
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    createAdminOrStaff(data: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        phone?: string;
        roleName: 'ADMIN' | 'STAFF';
        createdBy: string;
        password: string;
    }): Promise<{
        clerkCreated: boolean;
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
        role: import("@prisma/client").Role;
    }>;
    update(id: string, data: {
        email?: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
        updatedBy: string;
    }): Promise<{
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    assignRole(userId: string, roleId: string, assignedBy: string): Promise<{
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    delete(id: string, deletedBy: string): Promise<{
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    changePassword(_userId: string, _oldPassword: string, _newPassword: string): Promise<void>;
    resetPassword(_userId: string, _newPassword: string, _resetBy: string): Promise<void>;
}
//# sourceMappingURL=users.service.d.ts.map