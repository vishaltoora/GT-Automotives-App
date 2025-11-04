import React from 'react';
import { Vendor } from '../../services/vendor.service';
interface VendorDialogProps {
    open: boolean;
    vendor: Vendor | null;
    onClose: () => void;
    onSave: (data: any) => void;
}
declare const VendorDialog: React.FC<VendorDialogProps>;
export default VendorDialog;
//# sourceMappingURL=VendorDialog.d.ts.map