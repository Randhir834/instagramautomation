import { parseContactInput } from './collect-input.step';

describe('parseContactInput', () => {
  it('accepts a plain email and lowercases it', () => {
    expect(parseContactInput('email', 'Riya.Sharma@Gmail.com')).toBe('riya.sharma@gmail.com');
  });

  it('finds the email inside a sentence', () => {
    expect(parseContactInput('email', "sure, it's riya@mail.com.")).toBe('riya@mail.com');
  });

  it('rejects text with no email', () => {
    expect(parseContactInput('email', 'send it please')).toBeNull();
    expect(parseContactInput('email', 'riya@')).toBeNull();
  });

  it('accepts phone numbers with spaces, dashes and a country code', () => {
    expect(parseContactInput('phone', '+91 98765 43210')).toBe('+919876543210');
    expect(parseContactInput('phone', 'my no is 98765-43210')).toBe('9876543210');
  });

  it('rejects text that is not a phone number', () => {
    expect(parseContactInput('phone', 'call me')).toBeNull();
    expect(parseContactInput('phone', '12345')).toBeNull();
  });
});
