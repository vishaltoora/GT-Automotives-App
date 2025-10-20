import React from 'react';
import { TextFieldProps } from '@mui/material';
interface PhoneInputProps extends Omit<TextFieldProps, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
}
export declare const PhoneInput: React.FC<PhoneInputProps>;
export {};
//# sourceMappingURL=PhoneInput.d.ts.map