import React from 'react';
type QuotationItem = {
    id?: string;
    itemType: 'TIRE' | 'SERVICE' | 'PART' | 'OTHER' | 'LEVY';
    description: string;
    quantity: number;
    unitPrice: number;
    tireId?: string;
    serviceId?: string;
    total?: number;
};
import { ServiceDto } from '@gt-automotive/data';
interface QuotationFormContentProps {
    tires: any[];
    services: ServiceDto[];
    quotationForm: {
        customerName: string;
        businessName: string;
        address: string;
        phone: string;
        email: string;
    };
    setQuotationForm: (form: any) => void;
    formData: {
        gstRate: number;
        pstRate: number;
        notes: string;
        status: string;
        validUntil: string;
    };
    setFormData: (data: any) => void;
    items: QuotationItem[];
    setItems: (items: QuotationItem[]) => void;
    newItem: QuotationItem;
    setNewItem: (item: QuotationItem) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onTireSelect: (tireId: string) => void;
    onServicesChange: () => void;
}
declare const QuotationFormContent: React.FC<QuotationFormContentProps>;
export default QuotationFormContent;
//# sourceMappingURL=QuotationFormContent.d.ts.map