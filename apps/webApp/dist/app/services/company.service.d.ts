export declare function setClerkTokenGetter(getter: () => Promise<string | null>): void;
export interface Company {
    id: string;
    name: string;
    registrationNumber: string;
    businessType?: string;
    address?: string;
    phone?: string;
    email?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}
declare class CompanyService {
    private getAuthToken;
    private getHeaders;
    getCompanies(): Promise<Company[]>;
    getDefaultCompany(): Promise<Company>;
}
export declare const companyService: CompanyService;
export default companyService;
//# sourceMappingURL=company.service.d.ts.map