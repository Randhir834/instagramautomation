import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';

/** Scopes requested at connect time (Instagram API with Instagram Login). */
export const INSTAGRAM_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_comments',
  'instagram_business_manage_messages',
];

/** Webhook fields each connected account is subscribed to. */
export const WEBHOOK_FIELDS = ['comments', 'messages'];

export class MetaApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: number | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'MetaApiError';
  }

  /** Token expired/revoked: the creator must reconnect. */
  get isAuthError(): boolean {
    return this.status === 401 || this.code === 190;
  }

  /** Worth retrying later (rate limit or Meta-side failure). */
  get isRetryable(): boolean {
    return this.status === 429 || this.status >= 500 || this.code === 4 || this.code === 613;
  }
}

export interface QuickReply {
  title: string;
  payload: string;
}

export interface OutgoingMessage {
  text: string;
  quickReplies?: QuickReply[];
  /** Adds Instagram's one-tap "share my email / phone" chip. */
  askFor?: 'email' | 'phone';
}

export interface IgMedia {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  permalink?: string;
  thumbnail_url?: string;
  media_url?: string;
  timestamp?: string;
}

interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * The ONLY place that talks to Meta.
 * Endpoints follow "Instagram API with Instagram Login" (graph.instagram.com),
 * checked against Meta's documentation in October 2026.
 */
@Injectable()
export class InstagramApiClient {
  private readonly logger = new Logger(InstagramApiClient.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  private get meta() {
    return this.config.get('meta', { infer: true });
  }

  /** Versionless host, used by the token endpoints. */
  private get graphRoot(): string {
    return new URL(this.meta.graphUrl).origin;
  }

  private async request<T>(url: string, init: RequestInit = {}, token?: string): Promise<T> {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init.body && typeof init.body === 'string'
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { error: { message: text.slice(0, 200) } };
    }
    if (!res.ok) {
      const err = (body as { error?: { message?: string; code?: number }; error_message?: string })
        .error;
      const message =
        err?.message ?? (body as { error_message?: string }).error_message ?? res.statusText;
      throw new MetaApiError(res.status, err?.code, message);
    }
    return body as T;
  }

  // ---------- OAuth ----------

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.meta.appId,
      redirect_uri: this.meta.redirectUri,
      response_type: 'code',
      scope: INSTAGRAM_SCOPES.join(','),
      state,
    });
    return `${this.meta.authorizeUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; userId: string }> {
    type Short = { access_token: string; user_id: string | number };
    const body = await this.request<Short | { data: Short[] }>(
      `${this.meta.oauthUrl}/oauth/access_token`,
      {
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.meta.appId,
          client_secret: this.meta.appSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.meta.redirectUri,
          code,
        }),
      },
    );
    const short = 'data' in body ? body.data[0] : body;
    if (!short?.access_token) throw new MetaApiError(502, undefined, 'No access token returned');
    return { accessToken: short.access_token, userId: String(short.user_id) };
  }

  async getLongLivedToken(shortLivedToken: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.meta.appSecret,
      access_token: shortLivedToken,
    });
    const body = await this.request<{ access_token: string; expires_in: number }>(
      `${this.graphRoot}/access_token?${params.toString()}`,
    );
    return { accessToken: body.access_token, expiresIn: body.expires_in };
  }

  /** Works only on tokens that are at least 24 hours old and not yet expired. */
  async refreshLongLivedToken(token: string): Promise<TokenResponse> {
    const params = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: token });
    const body = await this.request<{ access_token: string; expires_in: number }>(
      `${this.graphRoot}/refresh_access_token?${params.toString()}`,
    );
    return { accessToken: body.access_token, expiresIn: body.expires_in };
  }

  // ---------- Account ----------

  async getMe(token: string): Promise<{ userId: string; username: string; accountType?: string }> {
    type Me = { user_id: string | number; username: string; account_type?: string };
    const body = await this.request<Me | { data: Me[] }>(
      `${this.meta.graphUrl}/me?fields=user_id,username,account_type`,
      {},
      token,
    );
    const me = 'data' in body ? body.data[0] : body;
    if (!me) throw new MetaApiError(502, undefined, 'No profile returned');
    return { userId: String(me.user_id), username: me.username, accountType: me.account_type };
  }

  async subscribeToWebhooks(token: string): Promise<void> {
    await this.request(
      `${this.meta.graphUrl}/me/subscribed_apps?subscribed_fields=${WEBHOOK_FIELDS.join(',')}`,
      { method: 'POST' },
      token,
    );
  }

  async unsubscribeFromWebhooks(token: string): Promise<void> {
    await this.request(`${this.meta.graphUrl}/me/subscribed_apps`, { method: 'DELETE' }, token);
  }

  async listMedia(igUserId: string, token: string, limit = 24): Promise<IgMedia[]> {
    const fields =
      'id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp';
    const body = await this.request<{ data: IgMedia[] }>(
      `${this.meta.graphUrl}/${igUserId}/media?fields=${fields}&limit=${limit}`,
      {},
      token,
    );
    return body.data ?? [];
  }

  // ---------- Comments ----------

  /** Public reply under a comment. */
  async replyToComment(commentId: string, message: string, token: string): Promise<string> {
    const body = await this.request<{ id: string }>(
      `${this.meta.graphUrl}/${commentId}/replies`,
      { method: 'POST', body: JSON.stringify({ message }) },
      token,
    );
    return body.id;
  }

  /**
   * DM in response to a comment ("private reply").
   * Meta allows one per comment, within 7 days of the comment.
   */
  async sendPrivateReply(
    igUserId: string,
    commentId: string,
    text: string,
    token: string,
  ): Promise<void> {
    await this.request(
      `${this.meta.graphUrl}/${igUserId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text } }),
      },
      token,
    );
  }

  // ---------- Messaging ----------

  /** Free-form DM. Only allowed within 24 hours of the follower's last message. */
  async sendMessage(
    igUserId: string,
    recipientId: string,
    message: OutgoingMessage,
    token: string,
  ): Promise<void> {
    const quickReplies: Record<string, string>[] = (message.quickReplies ?? [])
      .slice(0, 13)
      .map((q) => ({ content_type: 'text', title: q.title.slice(0, 20), payload: q.payload }));
    if (message.askFor) {
      quickReplies.unshift({
        content_type: message.askFor === 'email' ? 'user_email' : 'user_phone_number',
      });
    }
    await this.request(
      `${this.meta.graphUrl}/${igUserId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            text: message.text,
            ...(quickReplies.length ? { quick_replies: quickReplies } : {}),
          },
        }),
      },
      token,
    );
  }

  /**
   * Whether the follower follows the creator. Meta only answers this for
   * people who have already messaged the account.
   */
  async isFollower(igScopedUserId: string, token: string): Promise<boolean> {
    const body = await this.request<{ is_user_follow_business?: boolean }>(
      `${this.meta.graphUrl}/${igScopedUserId}?fields=is_user_follow_business`,
      {},
      token,
    );
    return body.is_user_follow_business === true;
  }
}
