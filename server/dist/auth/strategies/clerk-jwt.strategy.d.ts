import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../users/repositories/user.repository';
import { PrismaService } from '@gt-automotive/database';
declare const ClerkJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptions] | [opt: import("passport-jwt").StrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class ClerkJwtStrategy extends ClerkJwtStrategy_base {
    private userRepository;
    private prismaService;
    private configService;
    constructor(userRepository: UserRepository, prismaService: PrismaService, configService: ConfigService);
    validate(payload: any): Promise<{
        id: string;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: import("@prisma/client").$Enums.RoleName;
            description: string | null;
            displayName: string;
        };
        isActive: true;
    }>;
}
export {};
//# sourceMappingURL=clerk-jwt.strategy.d.ts.map