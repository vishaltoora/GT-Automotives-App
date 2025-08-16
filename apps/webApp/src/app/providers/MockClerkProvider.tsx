import React, { createContext, useContext } from 'react';

// Mock Clerk context
const MockClerkContext = createContext<any>({});

// Mock useUser hook
export const useUser = () => {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'dev-user-1',
      primaryEmailAddress: {
        emailAddress: 'customer@example.com'
      },
      firstName: 'Test',
      lastName: 'Customer',
      fullName: 'Test Customer',
      username: 'testcustomer',
      publicMetadata: {},
      privateMetadata: {},
      unsafeMetadata: {}
    }
  };
};

// Mock useAuth hook
export const useAuth = () => {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: 'dev-user-1',
    sessionId: 'dev-session-1',
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: () => false,
    getToken: async () => 'mock-jwt-token',
    signOut: async () => {
      window.location.href = '/';
    }
  };
};

// Mock useClerk hook
export const useClerk = () => {
  return {
    signOut: async () => {
      window.location.href = '/';
    },
    signIn: {
      create: async () => {},
      prepareFirstFactor: async () => {},
      attemptFirstFactor: async () => {}
    },
    signUp: {
      create: async () => {},
      prepareEmailAddressVerification: async () => {},
      attemptEmailAddressVerification: async () => {}
    },
    user: {
      id: 'dev-user-1',
      primaryEmailAddress: {
        emailAddress: 'customer@example.com'
      },
      firstName: 'Test',
      lastName: 'Customer'
    },
    session: {
      id: 'dev-session-1',
      status: 'active'
    }
  };
};

// Mock SignIn component
export const SignIn = ({ signUpUrl }: any) => {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Development Mode - Auto Sign In</h2>
      <p>You are automatically signed in as a test customer.</p>
      <p>Email: customer@example.com</p>
      <p>Role: Customer</p>
      <button 
        onClick={() => window.location.href = '/customer/dashboard'}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

// Mock SignUp component
export const SignUp = () => {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Development Mode - Registration</h2>
      <p>Registration is disabled in development mode.</p>
      <p>You are automatically signed in as a test customer.</p>
    </div>
  );
};

// Mock ClerkProvider for development
interface MockClerkProviderProps {
  children: React.ReactNode;
}

export function MockClerkProvider({ children }: MockClerkProviderProps) {
  const mockValue = {
    user: useUser().user,
    isLoaded: true,
    isSignedIn: true
  };

  return (
    <MockClerkContext.Provider value={mockValue}>
      {children}
    </MockClerkContext.Provider>
  );
}

// Export everything that @clerk/clerk-react would export
export const ClerkProvider = MockClerkProvider;
export const RedirectToSignIn = () => <div>Redirecting to sign in...</div>;
export const RedirectToSignUp = () => <div>Redirecting to sign up...</div>;
export const SignedIn = ({ children }: any) => <>{children}</>;
export const SignedOut = ({ children }: any) => null;
export const UserButton = () => (
  <button onClick={() => window.location.href = '/'}>Sign Out</button>
);