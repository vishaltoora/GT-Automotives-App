import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../users/repositories/user.repository';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptions] | [opt: import("passport-jwt").StrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepository;
    constructor(configService: ConfigService, userRepository: UserRepository);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        role: {
            name: string;
        };
        firstName: string;
        lastName: string;
        customerId: string;
    } | {
        id: string;
        email: string;
        role: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: import("@prisma/client").$Enums.RoleName;
            description: string | null;
            displayName: string;
        };
        firstName: string | null;
        lastName: string | null;
        customerId?: undefined;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map