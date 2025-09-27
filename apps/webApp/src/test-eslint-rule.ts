// This file is used to test ESLint rule for environment variables
// It should trigger an error when linted

// ❌ This should fail ESLint
const wrongApiUrl = process.env.VITE_API_URL;

// ✅ This should pass ESLint
const correctApiUrl = import.meta.env.VITE_API_URL;

export { correctApiUrl };