import { parseComments, parseMessages } from './meta-payload';

describe('parseComments', () => {
  const value = {
    id: 'c1',
    text: 'PRICE?',
    from: { id: 'u1', username: 'riya' },
    media: { id: 'm1', media_product_type: 'REELS' },
  };

  it('reads comments from entry.changes', () => {
    const body = {
      object: 'instagram',
      entry: [{ id: 'ig1', changes: [{ field: 'comments', value }] }],
    };
    expect(parseComments(body)).toEqual([
      {
        igUserId: 'ig1',
        commentId: 'c1',
        text: 'PRICE?',
        fromId: 'u1',
        fromUsername: 'riya',
        mediaId: 'm1',
      },
    ]);
  });

  it('reads comments placed directly on the entry', () => {
    const body = { object: 'instagram', entry: [{ id: 'ig1', field: 'comments', value }] };
    expect(parseComments(body)).toHaveLength(1);
  });

  it('ignores other objects, other fields and malformed input', () => {
    expect(parseComments({ object: 'page', entry: [] })).toEqual([]);
    expect(
      parseComments({
        object: 'instagram',
        entry: [{ id: 'ig1', changes: [{ field: 'mentions', value }] }],
      }),
    ).toEqual([]);
    expect(parseComments(null)).toEqual([]);
    expect(parseComments('nope')).toEqual([]);
  });
});

describe('parseMessages', () => {
  const wrap = (messaging: unknown[]) => ({
    object: 'instagram',
    entry: [{ id: 'ig1', messaging }],
  });

  it('reads an incoming text message', () => {
    const body = wrap([
      { sender: { id: 'u1' }, recipient: { id: 'ig1' }, message: { mid: 'm1', text: 'hi' } },
    ]);
    expect(parseMessages(body)).toEqual([
      { igUserId: 'ig1', senderId: 'u1', messageId: 'm1', text: 'hi', isStoryReply: false },
    ]);
  });

  it('skips echoes and messages sent by the account itself', () => {
    expect(
      parseMessages(
        wrap([{ sender: { id: 'ig1' }, message: { mid: 'm1', text: 'x', is_echo: true } }]),
      ),
    ).toEqual([]);
    expect(
      parseMessages(wrap([{ sender: { id: 'ig1' }, message: { mid: 'm2', text: 'x' } }])),
    ).toEqual([]);
  });

  it('flags story replies and reads button taps', () => {
    const story = wrap([
      {
        sender: { id: 'u1' },
        message: { mid: 'm1', text: 'wow', reply_to: { story: { id: 's1' } } },
      },
    ]);
    expect(parseMessages(story)[0]?.isStoryReply).toBe(true);
    const tap = wrap([
      { sender: { id: 'u1' }, postback: { mid: 'p1', title: 'Yes', payload: 'yes' } },
    ]);
    expect(parseMessages(tap)[0]?.text).toBe('Yes');
  });
});
