/**
 * Environment variable utility that works in both browser and test environments
 *
 * NOTE: Vite replaces import.meta.env.VITE_* at build time with actual values.
 * This function provides a runtime fallback for tests and development.
 */
export declare function getEnvVar(key: string, defaultValue?: string): string;
//# sourceMappingURL=env.d.ts.map