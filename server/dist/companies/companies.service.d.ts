import { PrismaService } from '@gt-automotive/database';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        email: string | null;
        phone: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    }[]>;
    findDefault(): Promise<{
        email: string | null;
        phone: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    } | null>;
    findById(id: string): Promise<{
        email: string | null;
        phone: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    } | null>;
}
//# sourceMappingURL=companies.service.d.ts.map