/// <reference types="vite/client" />

/**
 * Environment variable utility that works in both browser and test environments
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In tests or Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // In browser with Vite - use eval to avoid Jest parsing import.meta
  try {
    // @ts-ignore - Vite's import.meta.env
    const viteEnv = eval('typeof import !== "undefined" && import.meta && import.meta.env');
    if (viteEnv) {
      // @ts-ignore
      return viteEnv[key] || defaultValue;
    }
  } catch (e) {
    // import.meta not available in test environment
  }
  
  // Fallback
  return defaultValue;
}