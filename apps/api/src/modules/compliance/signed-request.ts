import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SignedRequestPayload {
  user_id?: string;
  algorithm?: string;
  issued_at?: number;
}

/**
 * Verifies and decodes Meta's `signed_request` (used by the data deletion and
 * deauthorize callbacks). Format: `<base64url signature>.<base64url JSON payload>`,
 * signed with HMAC-SHA256 using the app secret. Returns null if it is not genuine.
 */
export function parseSignedRequest(
  signedRequest: string | undefined,
  appSecret: string,
): SignedRequestPayload | null {
  if (!signedRequest || !appSecret) return null;
  const [encodedSignature, encodedPayload] = signedRequest.split('.');
  if (!encodedSignature || !encodedPayload) return null;

  const expected = createHmac('sha256', appSecret).update(encodedPayload).digest();
  const provided = Buffer.from(encodedSignature, 'base64url');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as SignedRequestPayload;
    if (payload.algorithm && payload.algorithm.toUpperCase() !== 'HMAC-SHA256') return null;
    return payload;
  } catch {
    return null;
  }
}
