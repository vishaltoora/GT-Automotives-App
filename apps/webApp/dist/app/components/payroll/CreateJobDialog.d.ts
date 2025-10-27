import React from 'react';
interface CreateJobDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (job: any) => void;
    preselectedEmployeeId?: string;
    hideEmployeeSelect?: boolean;
}
export declare const CreateJobDialog: React.FC<CreateJobDialogProps>;
export {};
//# sourceMappingURL=CreateJobDialog.d.ts.map