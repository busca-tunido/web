import { describe, expect, it } from 'vitest';
import { env } from '@/env';

describe('Environment validation (env.ts)', () => {
  it('should export validated and strictly typed environment variables', () => {
    expect(env.NEXT_PUBLIC_API_URL).toBeDefined();
    expect(typeof env.NEXT_PUBLIC_API_URL).toBe('string');
    expect(env.NEXT_PUBLIC_API_URL.length).toBeGreaterThan(0);

    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
    expect(typeof env.NEXT_PUBLIC_APP_URL).toBe('string');
    expect(env.NEXT_PUBLIC_APP_URL).toMatch(/^https?:\/\//);

    expect(typeof env.NEXT_PUBLIC_CARTO_API_KEY).toBe('string');
  });

  it('should prevent client-side access to server-only variables', () => {
    expect(() => env.API_INTERNAL_URL).toThrow(
      'API_INTERNAL_URL is a server-only environment variable and cannot be accessed on the client.',
    );
  });
});
