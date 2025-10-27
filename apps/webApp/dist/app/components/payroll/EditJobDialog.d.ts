import React from 'react';
import { JobResponseDto } from '@gt-automotive/data';
interface EditJobDialogProps {
    open: boolean;
    job: JobResponseDto | null;
    onClose: () => void;
    onSuccess: (job: JobResponseDto) => void;
    isStaffView?: boolean;
}
export declare const EditJobDialog: React.FC<EditJobDialogProps>;
export {};
//# sourceMappingURL=EditJobDialog.d.ts.map