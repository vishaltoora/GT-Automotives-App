// Global type declarations for Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(options?: { skipCache?: boolean }): Promise<string>;
      };
    };
  }
}

export {};
