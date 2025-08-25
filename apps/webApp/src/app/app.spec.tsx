import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

// Mock the auth pages that use import.meta.env
jest.mock('./pages/auth/Login', () => ({
  Login: () => null,
}));

jest.mock('./pages/auth/Register', () => ({
  Register: () => null,
}));

// Mock services that use import.meta.env
jest.mock('./services/invoice.service', () => require('../__mocks__/services'));
jest.mock('./services/customer.service', () => require('../__mocks__/services'));
jest.mock('./services/vehicle.service', () => require('../__mocks__/services'));
jest.mock('./services/tire.service', () => require('../__mocks__/services'));

// Mock the useAuth hook
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    isAdmin: false,
    isStaff: false,
    isCustomer: false,
    login: jest.fn(),
    logout: jest.fn(),
    token: null,
  }),
}));

// Mock Clerk
jest.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({
    loaded: true,
    session: null,
  }),
  useSession: () => ({
    session: null,
    isLoaded: true,
  }),
  useUser: () => ({
    user: null,
    isLoaded: true,
  }),
  SignIn: () => null,
  SignUp: () => null,
  ClerkProvider: ({ children }: any) => children,
}));

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
