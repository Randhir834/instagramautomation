/**
 * Shapes of the Instagram webhook payloads we care about, and helpers to pull
 * events out of them. Everything is optional because webhooks are external
 * input: never assume a field is there.
 */

export interface IgCommentValue {
  id?: string;
  text?: string;
  from?: { id?: string; username?: string };
  media?: { id?: string; media_product_type?: string };
  parent_id?: string;
}

export interface IgMessagingEvent {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    quick_reply?: { payload?: string };
    reply_to?: { story?: { id?: string; url?: string } };
  };
  postback?: { mid?: string; title?: string; payload?: string };
}

interface IgEntry {
  id?: string;
  time?: number;
  changes?: { field?: string; value?: IgCommentValue }[];
  // Some deliveries put the change directly on the entry.
  field?: string;
  value?: IgCommentValue;
  messaging?: IgMessagingEvent[];
}

export interface ParsedComment {
  igUserId: string;
  commentId: string;
  text: string;
  fromId: string;
  fromUsername?: string;
  mediaId?: string;
}

export interface ParsedMessage {
  igUserId: string;
  senderId: string;
  messageId?: string;
  text: string;
  isStoryReply: boolean;
}

function entries(body: unknown): IgEntry[] {
  const payload = body as { object?: string; entry?: IgEntry[] } | null;
  if (!payload || payload.object !== 'instagram' || !Array.isArray(payload.entry)) return [];
  return payload.entry;
}

export function parseComments(body: unknown): ParsedComment[] {
  const out: ParsedComment[] = [];
  for (const entry of entries(body)) {
    const changes = [...(entry.changes ?? []), ...(entry.field ? [entry] : [])];
    for (const change of changes) {
      const value = change.value;
      if (change.field !== 'comments' || !entry.id || !value?.id || !value.from?.id) continue;
      out.push({
        igUserId: String(entry.id),
        commentId: String(value.id),
        text: value.text ?? '',
        fromId: String(value.from.id),
        fromUsername: value.from.username,
        mediaId: value.media?.id ? String(value.media.id) : undefined,
      });
    }
  }
  return out;
}

export function parseMessages(body: unknown): ParsedMessage[] {
  const out: ParsedMessage[] = [];
  for (const entry of entries(body)) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      // Echoes are our own outgoing messages coming back: ignoring them prevents loops.
      if (!entry.id || !senderId || event.message?.is_echo || senderId === String(entry.id)) {
        continue;
      }
      const text = event.message?.text ?? event.postback?.title ?? '';
      if (!event.message && !event.postback) continue;
      out.push({
        igUserId: String(entry.id),
        senderId: String(senderId),
        messageId: event.message?.mid ?? event.postback?.mid,
        text,
        isStoryReply: Boolean(event.message?.reply_to?.story),
      });
    }
  }
  return out;
}
