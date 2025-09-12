import { QuotationStatus } from '@prisma/client';
import { CreateQuoteItemDto } from './create-quotation.dto';
export declare class UpdateQuoteDto {
    customerName?: string;
    businessName?: string;
    phone?: string;
    email?: string;
    address?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    items?: CreateQuoteItemDto[];
    gstRate?: number;
    pstRate?: number;
    notes?: string;
    status?: QuotationStatus;
    validUntil?: string;
}
//# sourceMappingURL=update-quotation.dto.d.ts.map