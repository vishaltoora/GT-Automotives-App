import { CompaniesService } from './companies.service';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
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
}
//# sourceMappingURL=companies.controller.d.ts.map