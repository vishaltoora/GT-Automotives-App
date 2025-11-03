import React from 'react';
import { JobResponseDto } from '@gt-automotive/data';
interface ProcessPaymentDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (payment: any) => void;
    job: JobResponseDto | null;
    allJobs?: JobResponseDto[];
    progressInfo?: {
        current: number;
        total: number;
    };
}
export declare const ProcessPaymentDialog: React.FC<ProcessPaymentDialogProps>;
export {};
//# sourceMappingURL=ProcessPaymentDialog.d.ts.map