export declare function setClerkTokenGetter(getter: () => Promise<string | null>): void;
export interface User {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roleId: string;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    isActive: boolean;
    role?: {
        id: string;
        name: string;
        displayName: string;
        description?: string;
    };
}
declare class UserService {
    private baseUrl;
    private getAuthToken;
    private getHeaders;
    private makeRequest;
    getUsers(): Promise<User[]>;
    getUser(id: string): Promise<User>;
    createUser(userData: any): Promise<User>;
    updateUser(id: string, updates: any): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
export declare const userService: UserService;
export default userService;
//# sourceMappingURL=user.service.d.ts.map