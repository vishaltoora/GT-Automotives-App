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
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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
        phone?: string;
        isActive?: boolean;
        updatedBy: string;
    }): Promise<{
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    assignRoleByName(userId: string, roleName: 'ADMIN' | 'STAFF', assignedBy: string): Promise<{
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
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