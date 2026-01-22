import { QuotationRepository } from './repositories/quotation.repository';
import { CreateQuoteDto } from '../common/dto/quotation.dto';
import { UpdateQuoteDto } from '../common/dto/quotation.dto';
import { Quotation } from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
export declare class QuotationsService {
    private quotationRepository;
    private prisma;
    private pdfService;
    private emailService;
    constructor(quotationRepository: QuotationRepository, prisma: PrismaService, pdfService: PdfService, emailService: EmailService);
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
    sendQuotationEmail(quotationId: string, userId: string, overrideEmail?: string, saveToQuote?: boolean): Promise<{
        success: boolean;
        message: string;
        emailUsed: string;
    }>;
}
//# sourceMappingURL=quotations.service.d.ts.map