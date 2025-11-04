import React from 'react';
interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}
export declare function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RoleGuard.d.ts.map