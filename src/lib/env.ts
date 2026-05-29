/**
 * Environment variable validation.
 *
 * Called at Firebase Admin initialization to fail fast
 * if required env vars are missing or still set to placeholder values.
 */

const REQUIRED_SERVER_VARS = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
] as const;

const REQUIRED_CLIENT_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
] as const;

const PLACEHOLDER_VALUES = ['REPLACE_ME', '', undefined];

export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    const value = process.env[key];
    if (!value || PLACEHOLDER_VALUES.includes(value)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Ensure these are set in .env.local with real values (not REPLACE_ME).'
    );
  }
}

/**
 * Validates client-side env vars. Call this in client components if needed.
 * Logs warnings instead of throwing since client code can't recover from missing env.
 */
export function validateClientEnv(): boolean {
  let valid = true;

  for (const key of REQUIRED_CLIENT_VARS) {
    const value = process.env[key];
    if (!value || PLACEHOLDER_VALUES.includes(value)) {
      console.warn(`[env] Missing client environment variable: ${key}`);
      valid = false;
    }
  }

  return valid;
}
