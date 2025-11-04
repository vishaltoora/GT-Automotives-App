import React from 'react';
interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: {
        id: string;
        name: string;
    };
    isActive: boolean;
}
interface EditUserDialogProps {
    open: boolean;
    user: User;
    onClose: () => void;
    onUserUpdated: () => void;
}
declare const EditUserDialog: React.FC<EditUserDialogProps>;
export default EditUserDialog;
//# sourceMappingURL=EditUserDialog.d.ts.map