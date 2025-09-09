/// <reference types="vite/client" />

/**
 * Environment variable utility that works in both browser and test environments
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In browser with Vite
  try {
    // @ts-ignore - Vite's import.meta.env
    if (import.meta && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || defaultValue;
    }
  } catch (e) {
    // import.meta not available
  }
  
  // In tests or Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // Fallback
  return defaultValue;
}