import { PrismaService } from '@gt-automotive/database';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    }[]>;
    findDefault(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    } | null>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    } | null>;
}
//# sourceMappingURL=companies.service.d.ts.map