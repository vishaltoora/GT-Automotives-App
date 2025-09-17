import React from 'react';
type QuotationItem = {
    id?: string;
    itemType: 'TIRE' | 'SERVICE' | 'PART' | 'OTHER';
    description: string;
    quantity: number;
    unitPrice: number;
    tireId?: string;
    total?: number;
};
interface QuotationFormContentProps {
    tires: any[];
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
}
declare const QuotationFormContent: React.FC<QuotationFormContentProps>;
export default QuotationFormContent;
//# sourceMappingURL=QuotationFormContent.d.ts.map