import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(roleId?: string, isActive?: string): Promise<({
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    })[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    create(createUserDto: {
        email: string;
        firstName: string;
        lastName: string;
        roleId: string;
    }, currentUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    createAdminOrStaff(createUserDto: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        phone?: string;
        roleName: 'ADMIN' | 'SUPERVISOR' | 'STAFF';
        password: string;
    }, currentUser: any): Promise<{
        clerkCreated: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
        role: import("@prisma/client").Role;
    }>;
    update(id: string, updateUserDto: {
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        isActive?: boolean;
    }, currentUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    assignRole(id: string, roleId: string, currentUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    assignRoleByName(id: string, roleName: 'ADMIN' | 'SUPERVISOR' | 'STAFF', currentUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    delete(id: string, currentUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    changePassword(id: string, body: {
        oldPassword: string;
        newPassword: string;
    }, currentUser: any): Promise<void>;
    resetPassword(id: string, newPassword: string, currentUser: any): Promise<void>;
    getMyProfile(currentUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    updateMyProfile(updateProfileDto: {
        firstName?: string;
        lastName?: string;
    }, currentUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map