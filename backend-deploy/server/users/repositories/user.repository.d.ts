import { PrismaService } from '@gt-automotive/database';
import { User, Prisma, Role } from '@prisma/client';
type UserWithRole = User & {
    role: Role;
};
export declare class UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        roleId?: string;
        isActive?: boolean;
    }): Promise<UserWithRole[]>;
    findById(id: string): Promise<UserWithRole | null>;
    findByEmail(email: string): Promise<UserWithRole | null>;
    findByClerkId(clerkId: string): Promise<UserWithRole | null>;
    create(data: {
        clerkId: string;
        email: string;
        firstName: string;
        lastName: string;
        roleId: string;
    }): Promise<UserWithRole>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithRole>;
    delete(id: string): Promise<boolean>;
    assignRole(userId: string, roleId: string): Promise<UserWithRole>;
    findAllWithRoles(filters?: {
        roleId?: string;
        isActive?: boolean;
    }): Promise<UserWithRole[]>;
}
export {};
//# sourceMappingURL=user.repository.d.ts.map