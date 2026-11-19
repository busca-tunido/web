import { describe, expect, it } from 'vitest';
import { shouldBypassImageOptimization } from '@/lib/image-utils';

describe('shouldBypassImageOptimization', () => {
  it('allows optimization for local paths and configured remote hosts', () => {
    expect(shouldBypassImageOptimization('/logo.svg')).toBe(false);
    expect(
      shouldBypassImageOptimization(
        'https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads/v1/production/pensions/abc-thumb.webp',
      ),
    ).toBe(false);
    expect(shouldBypassImageOptimization('https://buscatunido.vercel.app/og.png')).toBe(false);
    expect(shouldBypassImageOptimization('https://preview.vercel.app/img.webp')).toBe(false);
    expect(shouldBypassImageOptimization('https://buscatunido-api.onrender.com/img.webp')).toBe(false);
  });

  it('bypasses optimization for empty values, blob/data URLs, non-http protocols, and unknown hosts', () => {
    expect(shouldBypassImageOptimization(undefined)).toBe(true);
    expect(shouldBypassImageOptimization(null)).toBe(true);
    expect(shouldBypassImageOptimization('')).toBe(true);
    expect(shouldBypassImageOptimization('blob:http://localhost:3000/123')).toBe(true);
    expect(shouldBypassImageOptimization('data:image/png;base64,AAAA')).toBe(true);
    expect(shouldBypassImageOptimization('ftp://example.com/file.webp')).toBe(true);
    expect(shouldBypassImageOptimization('https://example.com/photo.webp')).toBe(true);
    expect(shouldBypassImageOptimization('not-a-valid-url')).toBe(true);
  });
});
