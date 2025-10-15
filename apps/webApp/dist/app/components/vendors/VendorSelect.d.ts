import React from 'react';
import { Vendor } from '../../services/vendor.service';
interface VendorSelectProps {
    vendors: Vendor[];
    value?: string;
    onChange: (vendorId: string, vendorName: string) => void;
    onVendorsChange: () => void;
    disabled?: boolean;
    allowFreeSolo?: boolean;
    onFreeTextChange?: (vendorName: string) => void;
    size?: 'small' | 'medium';
}
export declare const VendorSelect: React.FC<VendorSelectProps>;
export default VendorSelect;
//# sourceMappingURL=VendorSelect.d.ts.map