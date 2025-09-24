import { PrismaService } from '@gt-automotive/database';
import { Quotation, Prisma } from '@prisma/client';
export declare class QuotationRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.QuotationCreateInput): Promise<Quotation>;
    findAll(): Promise<Quotation[]>;
    findOne(id: string): Promise<Quotation | null>;
    findByNumber(quotationNumber: string): Promise<Quotation | null>;
    update(id: string, data: Prisma.QuotationUpdateInput): Promise<Quotation>;
    delete(id: string): Promise<Quotation>;
    deleteItems(quotationId: string): Promise<void>;
    createItems(items: Prisma.QuotationItemCreateManyInput[]): Promise<void>;
    search(params: {
        customerName?: string;
        quotationNumber?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Quotation[]>;
    convertToInvoice(quotationId: string, invoiceId: string): Promise<Quotation>;
}
//# sourceMappingURL=quotation.repository.d.ts.map