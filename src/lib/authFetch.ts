/**
 * Authenticated fetch helper.
 *
 * Force-refreshes the Firebase ID token before every request to prevent
 * "Invalid token" errors from expired tokens mid-session.
 *
 * Use this everywhere instead of raw fetch() with manual token handling.
 */
import type { User } from 'firebase/auth';

export async function authFetch(
  url: string,
  options: RequestInit,
  user: User
): Promise<Response> {
  // Force refresh = true ensures we never send an expired token
  const token = await user.getIdToken(true);

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
