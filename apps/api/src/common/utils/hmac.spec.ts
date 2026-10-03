import { hmacSha256Hex, verifyHmacSha256 } from './hmac';

describe('verifyHmacSha256', () => {
  const secret = 'test-secret';
  const body = Buffer.from('{"object":"instagram"}');
  const sig = hmacSha256Hex(body, secret);

  it('accepts a valid signature, with or without sha256= prefix', () => {
    expect(verifyHmacSha256(body, sig, secret)).toBe(true);
    expect(verifyHmacSha256(body, `sha256=${sig}`, secret)).toBe(true);
  });

  it('rejects a wrong signature or missing input', () => {
    expect(verifyHmacSha256(body, 'deadbeef', secret)).toBe(false);
    expect(verifyHmacSha256(body, undefined, secret)).toBe(false);
    expect(verifyHmacSha256(undefined, sig, secret)).toBe(false);
    expect(verifyHmacSha256(body, sig, '')).toBe(false);
  });
});
