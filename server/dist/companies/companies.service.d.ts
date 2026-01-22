import { PrismaService } from '@gt-automotive/database';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    }[]>;
    findDefault(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    } | null>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    } | null>;
}
//# sourceMappingURL=companies.service.d.ts.map