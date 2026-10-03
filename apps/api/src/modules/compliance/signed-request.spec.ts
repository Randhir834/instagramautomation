import { createHmac } from 'node:crypto';
import { parseSignedRequest } from './signed-request';

function sign(payload: object, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${signature}.${encoded}`;
}

describe('parseSignedRequest', () => {
  const secret = 'app-secret';

  it('returns the payload for a genuine request', () => {
    const request = sign({ user_id: '123', algorithm: 'HMAC-SHA256' }, secret);
    expect(parseSignedRequest(request, secret)?.user_id).toBe('123');
  });

  it('rejects a request signed with another secret', () => {
    expect(parseSignedRequest(sign({ user_id: '123' }, 'other'), secret)).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const [signature] = sign({ user_id: '123' }, secret).split('.');
    const forged = Buffer.from(JSON.stringify({ user_id: '999' })).toString('base64url');
    expect(parseSignedRequest(`${signature}.${forged}`, secret)).toBeNull();
  });

  it('rejects missing or malformed input', () => {
    expect(parseSignedRequest(undefined, secret)).toBeNull();
    expect(parseSignedRequest('nodot', secret)).toBeNull();
    expect(parseSignedRequest(sign({ user_id: '1' }, secret), '')).toBeNull();
  });
});
