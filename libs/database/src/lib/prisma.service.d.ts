import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    private isConnected;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    $connect(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        connected: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=prisma.service.d.ts.map