interface UserRole {
    id: number;
    name: string;
}
interface AppUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
}
export declare function useAuth(): {
    user: AppUser | null;
    clerkUser: {
        id: string;
        primaryEmailAddress: {
            emailAddress: string;
        };
        firstName: string;
        lastName: string;
        fullName: string;
        username: string;
        publicMetadata: {};
        privateMetadata: {};
        unsafeMetadata: {};
    } | import("@clerk/types").UserResource | null | undefined;
    isAuthenticated: any;
    isLoading: any;
    role: string | null;
    isAdmin: boolean;
    isSupervisor: boolean;
    isStaff: boolean;
    isCustomer: boolean;
    logout: () => Promise<void>;
    clearAuthState: () => void;
};
export {};
//# sourceMappingURL=useAuth.d.ts.map