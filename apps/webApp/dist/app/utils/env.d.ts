/**
 * Environment variable utility that works in both browser and test environments
 *
 * CRITICAL: Always use import.meta.env.VITE_* in Vite projects, NEVER process.env.VITE_*
 * - import.meta.env.VITE_* is replaced at build time by Vite
 * - process.env does not exist in browser environments
 *
 * This function provides a runtime fallback for tests and development.
 */
export declare function getEnvVar(key: string, defaultValue?: string): string;
//# sourceMappingURL=env.d.ts.map