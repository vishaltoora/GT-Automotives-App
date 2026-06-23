import { getEnvVar } from './env';

// In the Jest (jsdom) environment `process.env` is defined, so getEnvVar reads
// from process.env. test-setup.ts seeds VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL.
describe('env getEnvVar', () => {
  afterEach(() => {
    delete process.env.__TEST_TMP_VAR__;
  });

  it('returns the value of an existing process.env variable', () => {
    expect(getEnvVar('VITE_API_URL')).toBe('http://localhost:3000');
  });

  it('returns the seeded clerk key', () => {
    expect(getEnvVar('VITE_CLERK_PUBLISHABLE_KEY')).toBe('test-clerk-key');
  });

  it('returns empty string by default for a missing variable', () => {
    expect(getEnvVar('SOME_VAR_THAT_DOES_NOT_EXIST')).toBe('');
  });

  it('returns the provided default for a missing variable', () => {
    expect(getEnvVar('SOME_VAR_THAT_DOES_NOT_EXIST', 'fallback')).toBe(
      'fallback'
    );
  });

  it('reads a freshly set process.env variable', () => {
    process.env.__TEST_TMP_VAR__ = 'hello';
    expect(getEnvVar('__TEST_TMP_VAR__')).toBe('hello');
  });

  it('falls back to default when the variable is set to an empty string', () => {
    process.env.__TEST_TMP_VAR__ = '';
    expect(getEnvVar('__TEST_TMP_VAR__', 'def')).toBe('def');
  });
});
