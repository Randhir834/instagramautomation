import { randomBytes } from 'node:crypto';
import { decrypt, encrypt } from './crypto';

describe('crypto (AES-256-GCM)', () => {
  const key = randomBytes(32).toString('base64');

  it('round-trips a token', () => {
    const token = 'IGQVJ-example-token';
    const encrypted = encrypt(token, key);
    expect(encrypted).not.toContain(token);
    expect(decrypt(encrypted, key)).toBe(token);
  });

  it('uses a fresh IV each time', () => {
    expect(encrypt('same', key)).not.toBe(encrypt('same', key));
  });

  it('rejects tampered ciphertext', () => {
    const parts = encrypt('secret', key).split(':');
    parts[3] = Buffer.from('tampered').toString('base64');
    expect(() => decrypt(parts.join(':'), key)).toThrow();
  });

  it('rejects the wrong key', () => {
    const other = randomBytes(32).toString('base64');
    expect(() => decrypt(encrypt('secret', key), other)).toThrow();
  });
});
