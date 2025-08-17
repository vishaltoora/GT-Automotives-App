import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock Clerk context
const MockClerkContext = createContext<any>({});

// Create a simple session storage key for mock auth
const MOCK_AUTH_KEY = 'gt_automotive_mock_auth';

// Helper to get auth state from sessionStorage
const getAuthState = () => {
  try {
    const stored = sessionStorage.getItem(MOCK_AUTH_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
};

// Helper to set auth state in sessionStorage
const setAuthState = (isSignedIn: boolean) => {
  try {
    if (isSignedIn) {
      sessionStorage.setItem(MOCK_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(MOCK_AUTH_KEY);
    }
  } catch {}
};

// Mock useUser hook
export const useUser = () => {
  const context = useContext(MockClerkContext);
  const isSignedIn = context?.isSignedIn ?? false;
  
  return {
    isLoaded: true,
    isSignedIn,
    user: isSignedIn ? {
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
    } : null
  };
};

// Mock useAuth hook
export const useAuth = () => {
  const context = useContext(MockClerkContext);
  const isSignedIn = context?.isSignedIn ?? false;
  
  return {
    isLoaded: true,
    isSignedIn,
    userId: isSignedIn ? 'dev-user-1' : null,
    sessionId: isSignedIn ? 'dev-session-1' : null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: () => false,
    getToken: async () => isSignedIn ? 'mock-jwt-token' : null,
    signOut: async () => {
      setAuthState(false);
      window.location.href = '/';
    }
  };
};

// Mock useClerk hook
export const useClerk = () => {
  const context = useContext(MockClerkContext);
  const isSignedIn = context?.isSignedIn ?? false;
  
  return {
    signOut: async () => {
      setAuthState(false);
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
    user: isSignedIn ? {
      id: 'dev-user-1',
      primaryEmailAddress: {
        emailAddress: 'customer@example.com'
      },
      firstName: 'Test',
      lastName: 'Customer'
    } : null,
    session: isSignedIn ? {
      id: 'dev-session-1',
      status: 'active'
    } : null
  };
};

// Mock SignIn component
export const SignIn = ({ signUpUrl }: any) => {
  const handleSignIn = () => {
    setAuthState(true);
    // Force a page reload to trigger auth state update
    window.location.href = '/customer/dashboard';
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Development Mode - Sign In</h2>
      <p>Click below to sign in as a test customer.</p>
      <p>Email: customer@example.com</p>
      <p>Role: Customer</p>
      <button 
        onClick={handleSignIn}
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
        Sign In
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
  const [isSignedIn, setIsSignedIn] = useState(getAuthState());
  
  useEffect(() => {
    // Check auth state on mount and window focus
    const checkAuth = () => {
      setIsSignedIn(getAuthState());
    };
    
    window.addEventListener('focus', checkAuth);
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  const mockValue = {
    isLoaded: true,
    isSignedIn,
    setIsSignedIn
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
export const SignedIn = ({ children }: any) => {
  const context = useContext(MockClerkContext);
  return context?.isSignedIn ? <>{children}</> : null;
};
export const SignedOut = ({ children }: any) => {
  const context = useContext(MockClerkContext);
  return !context?.isSignedIn ? <>{children}</> : null;
};
export const UserButton = () => {
  const handleSignOut = () => {
    setAuthState(false);
    window.location.href = '/';
  };
  
  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
};