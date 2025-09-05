/**
 * Environment variable utility that works in both browser and test environments
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In browser with Vite
  if (typeof window !== 'undefined' && (window as any).import?.meta?.env) {
    return (window as any).import.meta.env[key] || defaultValue;
  }
  
  // In tests or Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // Fallback
  return defaultValue;
}