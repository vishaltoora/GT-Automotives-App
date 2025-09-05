// Mock import.meta.env for Jest
(global as any).testImportMetaEnv = {
  env: {
    VITE_CLERK_PUBLISHABLE_KEY: 'test-clerk-key',
    VITE_API_URL: 'http://localhost:3000',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false,
  },
};

// Mock process.env for Jest
process.env = {
  ...process.env,
  VITE_CLERK_PUBLISHABLE_KEY: 'test-clerk-key',
  VITE_API_URL: 'http://localhost:3000',
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any;