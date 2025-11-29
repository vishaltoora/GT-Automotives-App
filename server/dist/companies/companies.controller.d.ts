import { CompaniesService } from './companies.service';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findAll(): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    }[]>;
    findDefault(): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        registrationNumber: string;
        businessType: string | null;
        isDefault: boolean;
    } | null>;
}
//# sourceMappingURL=companies.controller.d.ts.map