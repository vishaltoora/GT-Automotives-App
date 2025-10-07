import React from 'react';
import { ServiceDto } from '@gt-automotive/data';
interface ServiceDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (service: {
        name: string;
        description?: string;
        unitPrice: number;
    }) => void;
    service?: ServiceDto | null;
}
export declare const ServiceDialog: React.FC<ServiceDialogProps>;
export default ServiceDialog;
//# sourceMappingURL=ServiceDialog.d.ts.map