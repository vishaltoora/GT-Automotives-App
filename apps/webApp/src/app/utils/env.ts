/// <reference types="vite/client" />

/**
 * Environment variable utility that works in both browser and test environments
 * 
 * NOTE: Vite replaces import.meta.env.VITE_* at build time with actual values.
 * This function provides a runtime fallback for tests and development.
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In tests or Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // In browser with Vite - use eval to avoid Jest parsing issues
  // This is safe because we're only accessing import.meta.env, not executing arbitrary code
  if (typeof window !== 'undefined') {
    try {
      // Use eval to dynamically access import.meta.env without Jest parsing it
      const envValue = eval(`
        (function() {
          try {
            if (typeof import !== 'undefined' && import.meta && import.meta.env) {
              return import.meta.env['${key}'];
            }
          } catch (e) {}
          return undefined;
        })()
      `);
      
      if (envValue !== undefined) {
        return envValue;
      }
    } catch (e) {
      // Eval failed, likely in a test environment
    }
  }
  
  // Fallback
  return defaultValue;
}