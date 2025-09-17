import { QuotationRepository } from './repositories/quotation.repository';
import { CreateQuoteDto } from '@gt-automotive/shared-dto';
import { UpdateQuoteDto } from '@gt-automotive/shared-dto';
import { Quotation } from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';
export declare class QuotationsService {
    private quotationRepository;
    private prisma;
    constructor(quotationRepository: QuotationRepository, prisma: PrismaService);
    create(createQuoteDto: CreateQuoteDto, userId: string): Promise<Quotation>;
    findAll(): Promise<Quotation[]>;
    findOne(id: string): Promise<Quotation>;
    update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<Quotation>;
    remove(id: string): Promise<void>;
    search(params: {
        customerName?: string;
        quotationNumber?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Quotation[]>;
    convertToInvoice(quotationId: string, customerId: string, vehicleId?: string): Promise<any>;
}
//# sourceMappingURL=quotations.service.d.ts.map