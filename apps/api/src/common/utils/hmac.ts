import { createHmac, timingSafeEqual } from 'node:crypto';

/** Constant-time comparison of two hex strings. */
function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && bufA.length > 0 && timingSafeEqual(bufA, bufB);
}

export function hmacSha256Hex(payload: Buffer | string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verifies a hex HMAC-SHA256 signature over the raw request body.
 * `signature` may carry a `sha256=` prefix (Meta's X-Hub-Signature-256 format).
 * Confirm exact header names against current provider docs in Phase 2/5.
 */
export function verifyHmacSha256(
  rawBody: Buffer | string | undefined,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!rawBody || !signature || !secret) return false;
  const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  return safeEqualHex(hmacSha256Hex(rawBody, secret), provided);
}
