import { z } from 'zod';

const serverSchema = z.object({
  API_INTERNAL_URL: z.string().url('API_INTERNAL_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1, 'NEXT_PUBLIC_API_URL is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_CARTO_API_KEY: z.string({
    error: 'NEXT_PUBLIC_CARTO_API_KEY is required',
  }),
});

const isServer = typeof window === 'undefined';

if (isServer) {
  const serverResult = serverSchema.safeParse({
    API_INTERNAL_URL: process.env.API_INTERNAL_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CARTO_API_KEY: process.env.NEXT_PUBLIC_CARTO_API_KEY,
  });

  const errors: string[] = [];
  if (!serverResult.success) {
    for (const issue of serverResult.error.issues) {
      errors.push(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
  }
  if (!clientResult.success) {
    for (const issue of clientResult.error.issues) {
      errors.push(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (errors.length > 0) {
    const message = `Invalid environment variables:\n${errors.join('\n')}`;
    console.error(`[BuscaTuNido env error] ${message}`);
    throw new Error(message);
  }
} else {
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CARTO_API_KEY: process.env.NEXT_PUBLIC_CARTO_API_KEY,
  });

  if (!clientResult.success) {
    const errorMessages = clientResult.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    const message = `Invalid client environment variables:\n${errorMessages}`;
    console.error(`[BuscaTuNido env error] ${message}`);
    throw new Error(message);
  }
}

export type Env = {
  readonly API_INTERNAL_URL: string;
  readonly NEXT_PUBLIC_API_URL: string;
  readonly NEXT_PUBLIC_APP_URL: string;
  readonly NEXT_PUBLIC_CARTO_API_KEY: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
};

export const env: Env = {
  get API_INTERNAL_URL(): string {
    if (typeof window !== 'undefined') {
      throw new Error(
        'API_INTERNAL_URL is a server-only environment variable and cannot be accessed on the client.',
      );
    }
    return process.env.API_INTERNAL_URL as string;
  },
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL as string,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL as string,
  NEXT_PUBLIC_CARTO_API_KEY: process.env.NEXT_PUBLIC_CARTO_API_KEY as string,
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') ?? 'development',
};
