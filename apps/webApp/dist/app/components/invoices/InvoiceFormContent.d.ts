import React from 'react';
import { InvoiceItem } from '../../services/invoice.service';
import { Company } from '../../services/company.service';
import { ServiceDto } from '@gt-automotive/data';
interface InvoiceFormContentProps {
    customers: any[];
    vehicles: any[];
    tires: any[];
    services: ServiceDto[];
    companies: Company[];
    isNewCustomer: boolean;
    customerForm: {
        firstName: string;
        lastName: string;
        businessName: string;
        address: string;
        phone: string;
        email: string;
    };
    setCustomerForm: (form: any) => void;
    formData: {
        customerId: string;
        vehicleId: string;
        companyId: string;
        gstRate: number;
        pstRate: number;
        paymentMethod: string;
        notes: string;
        status: string;
        invoiceDate: string;
    };
    setFormData: (data: any) => void;
    items: InvoiceItem[];
    setItems: (items: InvoiceItem[]) => void;
    newItem: InvoiceItem;
    setNewItem: (item: InvoiceItem) => void;
    onCustomerSelect: (customer: any) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onTireSelect: (tireId: string) => void;
    onServicesChange: () => void;
    isEditMode?: boolean;
}
declare const InvoiceFormContent: React.FC<InvoiceFormContentProps>;
export default InvoiceFormContent;
//# sourceMappingURL=InvoiceFormContent.d.ts.map