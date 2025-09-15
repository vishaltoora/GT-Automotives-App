/// <reference types="vite/client" />

/**
 * Environment variable utility that works in both browser and test environments
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In tests or Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // In browser with Vite - direct access to import.meta.env
  // @ts-ignore - Vite's import.meta.env
  if (import.meta && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || defaultValue;
  }
  
  // Fallback
  return defaultValue;
}