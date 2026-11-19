type NodeEnvironment = 'development' | 'production' | 'test';

const VALID_NODE_ENVS = new Set<NodeEnvironment>(['development', 'production', 'test']);

function isValidUrl(value: string | undefined): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const isServer = typeof window === 'undefined';

const clientErrors: string[] = [];
const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const nextPublicCartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? '';

if (typeof nextPublicApiUrl !== 'string' || nextPublicApiUrl.length === 0) {
  clientErrors.push('  - NEXT_PUBLIC_API_URL: NEXT_PUBLIC_API_URL is required');
}
if (!isValidUrl(nextPublicAppUrl)) {
  clientErrors.push('  - NEXT_PUBLIC_APP_URL: NEXT_PUBLIC_APP_URL must be a valid URL');
}

if (clientErrors.length > 0) {
  const message = `Invalid client environment variables:\n${clientErrors.join('\n')}`;
  console.error(`[BuscaTuNido env error] ${message}`);
  throw new Error(message);
}

let serverParsedData:
  | {
      API_INTERNAL_URL: string;
      NODE_ENV: NodeEnvironment;
    }
  | undefined;

if (isServer) {
  const serverErrors: string[] = [];
  const apiInternalUrl = process.env.API_INTERNAL_URL;
  const rawNodeEnv = process.env.NODE_ENV ?? 'development';

  if (!isValidUrl(apiInternalUrl)) {
    serverErrors.push('  - API_INTERNAL_URL: API_INTERNAL_URL must be a valid URL');
  }
  if (!VALID_NODE_ENVS.has(rawNodeEnv as NodeEnvironment)) {
    serverErrors.push('  - NODE_ENV: Invalid NODE_ENV');
  }

  if (serverErrors.length > 0) {
    const message = `Invalid server environment variables:\n${serverErrors.join('\n')}`;
    console.error(`[BuscaTuNido env error] ${message}`);
    throw new Error(message);
  }

  serverParsedData = {
    API_INTERNAL_URL: apiInternalUrl as string,
    NODE_ENV: rawNodeEnv as NodeEnvironment,
  };
}

export type Env = {
  readonly API_INTERNAL_URL: string;
  readonly NEXT_PUBLIC_API_URL: string;
  readonly NEXT_PUBLIC_APP_URL: string;
  readonly NEXT_PUBLIC_CARTO_API_KEY: string;
  readonly NODE_ENV: NodeEnvironment;
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
  NEXT_PUBLIC_API_URL: nextPublicApiUrl as string,
  NEXT_PUBLIC_APP_URL: nextPublicAppUrl as string,
  NEXT_PUBLIC_CARTO_API_KEY: nextPublicCartoApiKey,
  get NODE_ENV(): NodeEnvironment {
    return serverParsedData?.NODE_ENV ?? 'development';
  },
});
