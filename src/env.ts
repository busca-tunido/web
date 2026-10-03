import { z } from 'zod';

const serverSchema = z.object({
  API_INTERNAL_URL: z.string().url('API_INTERNAL_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1, 'NEXT_PUBLIC_API_URL is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_CARTO_API_KEY: z.string().min(0),
});

const isServer = typeof window === 'undefined';

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CARTO_API_KEY: process.env.NEXT_PUBLIC_CARTO_API_KEY ?? '',
});

if (!clientParsed.success) {
  const errorMessages = clientParsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  const message = `Invalid client environment variables:\n${errorMessages}`;
  console.error(`[BuscaTuNido env error] ${message}`);
  throw new Error(message);
}

let serverParsedData: z.infer<typeof serverSchema> | undefined;

if (isServer) {
  const serverParsed = serverSchema.safeParse({
    API_INTERNAL_URL: process.env.API_INTERNAL_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!serverParsed.success) {
    const errorMessages = serverParsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    const message = `Invalid server environment variables:\n${errorMessages}`;
    console.error(`[BuscaTuNido env error] ${message}`);
    throw new Error(message);
  }

  serverParsedData = serverParsed.data;
}

export type Env = {
  readonly API_INTERNAL_URL: string;
  readonly NEXT_PUBLIC_API_URL: string;
  readonly NEXT_PUBLIC_APP_URL: string;
  readonly NEXT_PUBLIC_CARTO_API_KEY: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
};

export const env: Env = Object.freeze({
  get API_INTERNAL_URL(): string {
    if (typeof window !== 'undefined' || !serverParsedData) {
      throw new Error(
        'API_INTERNAL_URL is a server-only environment variable and cannot be accessed on the client.',
      );
    }
    return serverParsedData.API_INTERNAL_URL;
  },
  NEXT_PUBLIC_API_URL: clientParsed.data.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: clientParsed.data.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CARTO_API_KEY: clientParsed.data.NEXT_PUBLIC_CARTO_API_KEY,
  get NODE_ENV(): 'development' | 'production' | 'test' {
    return serverParsedData?.NODE_ENV ?? 'development';
  },
});
