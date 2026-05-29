/**
 * Safe error handler for API routes.
 *
 * In production: never returns internal error details, stack traces, or schema info.
 * In development: returns the error message for easier debugging.
 */

export function safeError(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'Unknown error';
  }
  // Production: generic message
  return 'Something went wrong. Please try again.';
}

/**
 * Creates a standardized error response for API routes.
 */
export function errorResponse(
  error: unknown,
  statusCode: number = 500
): { body: { error: string }; status: number } {
  const message = safeError(error);
  return {
    body: { error: message },
    status: statusCode,
  };
}
