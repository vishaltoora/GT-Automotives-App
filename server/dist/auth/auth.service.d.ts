import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../users/repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
export declare class AuthService {
    private userRepository;
    private roleRepository;
    private auditRepository;
    private jwtService;
    private configService;
    constructor(userRepository: UserRepository, roleRepository: RoleRepository, auditRepository: AuditRepository, jwtService: JwtService, configService: ConfigService);
    validateClerkUser(clerkUserId: string): Promise<({
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }) | null>;
    login(email: string, password: string): Promise<void>;
    register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }): Promise<void>;
    validateToken(token: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        roleId: string;
        lastLogin: Date | null;
        isActive: boolean;
    } & {
        role: import("@prisma/client").Role;
    }>;
    generateJWT(user: any): Promise<string>;
    syncUserFromClerk(data: {
        clerkId: string;
        email: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: {
            name: import("@prisma/client").$Enums.RoleName;
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            displayName: string;
        };
        isActive: boolean;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map