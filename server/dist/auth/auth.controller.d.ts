import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: {
        email: string;
        password: string;
    }): Promise<void>;
    register(registerDto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }): Promise<void>;
    getCurrentUser(user: any): Promise<any>;
    logout(user: any): Promise<{
        message: string;
    }>;
    refreshToken(body: {
        refresh_token: string;
    }): Promise<{
        message: string;
    }>;
    syncUser(syncDto: {
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
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayName: string;
        };
        isActive: boolean;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map