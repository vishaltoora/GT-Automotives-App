export declare class AuthUserContextDto {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    permissions: Array<{
        resource: string;
        action: string;
    }>;
}
export declare class AssignRoleDto {
    userId: string;
    role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}
