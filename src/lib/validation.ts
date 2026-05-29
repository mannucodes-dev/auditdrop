/**
 * Input validation schemas using Zod.
 *
 * Every API route validates incoming data against these schemas.
 * On failure, returns a clean error message — never the raw Zod error object.
 */
import { z } from 'zod';

// ── SSRF Protection ──────────────────────────────────────────────
// Block URLs pointing to internal networks or dangerous schemes.
const BLOCKED_HOSTS_REGEX =
  /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|\[::1\])$/i;

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    // Block internal network hosts
    if (BLOCKED_HOSTS_REGEX.test(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ── Schemas ──────────────────────────────────────────────────────

export const auditSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .max(500, 'URL is too long (max 500 characters)')
    .refine(
      (val) => {
        // Normalize before checking
        const normalized = val.trim().startsWith('http') ? val.trim() : `https://${val.trim()}`;
        try {
          new URL(normalized);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please provide a valid URL (e.g. https://example.com)' }
    )
    .refine(
      (val) => {
        const normalized = val.trim().startsWith('http') ? val.trim() : `https://${val.trim()}`;
        return isSafeUrl(normalized);
      },
      { message: 'This URL is not allowed. Please provide a public website URL.' }
    ),
  competitors: z
    .array(z.string().max(500))
    .max(2)
    .optional()
    .default([]),
  businessName: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

export const settingsSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long (max 100 characters)'),
  ctaUrl: z
    .string()
    .url('Please provide a valid URL')
    .max(500, 'URL is too long')
    .optional()
    .or(z.literal('')),
  ctaLabel: z
    .string()
    .max(50, 'CTA label is too long (max 50 characters)')
    .optional()
    .default('Book a Free Call'),
  whatsappNumber: z.string().max(20).optional().default(''),
  useWhatsApp: z.boolean().optional().default(true),
});

export const publicAuditSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .max(500, 'URL is too long')
    .refine(
      (val) => {
        const normalized = val.trim().startsWith('http') ? val.trim() : `https://${val.trim()}`;
        try {
          new URL(normalized);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please provide a valid URL' }
    )
    .refine(
      (val) => {
        const normalized = val.trim().startsWith('http') ? val.trim() : `https://${val.trim()}`;
        return isSafeUrl(normalized);
      },
      { message: 'This URL is not allowed.' }
    ),
  userId: z.string().min(1, 'User ID is required'),
});

// ── Error Sanitizer ─────────────────────────────────────────────

/**
 * Extract a clean, user-facing message from a Zod validation error.
 * Never returns the raw Zod error object or schema details.
 */
export function sanitizeZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  if (firstIssue) {
    return firstIssue.message;
  }
  return 'Invalid input. Please check your data and try again.';
}
