import { matchesKeywords, pickBest } from './matcher.service';

describe('matchesKeywords', () => {
  it('CONTAINS matches anywhere, case-insensitively', () => {
    expect(matchesKeywords('What is the PRICE please?', ['price'], 'CONTAINS')).toBe(true);
    expect(matchesKeywords('nice reel', ['price'], 'CONTAINS')).toBe(false);
  });

  it('EXACT requires the whole comment to equal the keyword', () => {
    expect(matchesKeywords('  Price ', ['price'], 'EXACT')).toBe(true);
    expect(matchesKeywords('price please', ['price'], 'EXACT')).toBe(false);
  });

  it('matches if any keyword matches and ignores empty keywords', () => {
    expect(matchesKeywords('send link', ['price', 'link'], 'CONTAINS')).toBe(true);
    expect(matchesKeywords('anything', ['', '  '], 'CONTAINS')).toBe(false);
  });
});

describe('pickBest', () => {
  const at = (iso: string) => new Date(iso);

  it('prefers a rule for the exact post over an all-posts rule', () => {
    const all = { id: 'all', postId: null, createdAt: at('2026-01-01') };
    const specific = { id: 'post', postId: 'm1', createdAt: at('2026-02-01') };
    expect(pickBest([all, specific])?.id).toBe('post');
  });

  it('breaks ties by oldest first', () => {
    const older = { id: 'old', postId: null, createdAt: at('2026-01-01') };
    const newer = { id: 'new', postId: null, createdAt: at('2026-03-01') };
    expect(pickBest([newer, older])?.id).toBe('old');
  });

  it('returns undefined when nothing matched', () => {
    expect(pickBest([])).toBeUndefined();
  });
});
