export declare class AuthCreateUserDto {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleId: number;
}
export declare class AuthUpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
}
export declare class AuthUserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: {
        id: number;
        name: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
