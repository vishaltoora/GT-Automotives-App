import React from 'react';
export declare const useUser: () => {
    isLoaded: boolean;
    isSignedIn: any;
    user: {
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
    } | null;
};
export declare const useAuth: () => {
    isLoaded: boolean;
    isSignedIn: any;
    userId: string | null;
    sessionId: string | null;
    actor: null;
    orgId: null;
    orgRole: null;
    orgSlug: null;
    has: () => boolean;
    getToken: () => Promise<"mock-jwt-token" | null>;
    signOut: () => Promise<void>;
};
export declare const useClerk: () => {
    signOut: () => Promise<void>;
    signIn: {
        create: () => Promise<void>;
        prepareFirstFactor: () => Promise<void>;
        attemptFirstFactor: () => Promise<void>;
    };
    signUp: {
        create: () => Promise<void>;
        prepareEmailAddressVerification: () => Promise<void>;
        attemptEmailAddressVerification: () => Promise<void>;
    };
    user: {
        id: string;
        primaryEmailAddress: {
            emailAddress: string;
        };
        firstName: string;
        lastName: string;
    } | null;
    session: {
        id: string;
        status: string;
    } | null;
};
export declare const SignIn: ({ signUpUrl }: any) => import("react/jsx-runtime").JSX.Element;
export declare const SignUp: () => import("react/jsx-runtime").JSX.Element;
interface MockClerkProviderProps {
    children: React.ReactNode;
}
export declare function MockClerkProvider({ children }: MockClerkProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const ClerkProvider: typeof MockClerkProvider;
export declare const RedirectToSignIn: () => import("react/jsx-runtime").JSX.Element;
export declare const RedirectToSignUp: () => import("react/jsx-runtime").JSX.Element;
export declare const SignedIn: ({ children }: any) => import("react/jsx-runtime").JSX.Element | null;
export declare const SignedOut: ({ children }: any) => import("react/jsx-runtime").JSX.Element | null;
export declare const UserButton: () => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MockClerkProvider.d.ts.map