import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { InstagramAccount } from '@prisma/client';
import { decrypt, encrypt } from '../../common/utils/crypto';
import { hmacSha256Hex, verifyHmacSha256 } from '../../common/utils/hmac';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { IgMedia, InstagramApiClient, MetaApiError } from './instagram-api.client';

const STATE_TTL_MS = 10 * 60 * 1000;
const MEDIA_CACHE_SECONDS = 60;

const PUBLIC_ACCOUNT_FIELDS = {
  id: true,
  igUserId: true,
  username: true,
  isActive: true,
  tokenExpiresAt: true,
  connectedAt: true,
} as const;

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly api: InstagramApiClient,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  listAccounts(userId: string) {
    return this.prisma.instagramAccount.findMany({
      where: { userId },
      select: PUBLIC_ACCOUNT_FIELDS,
      orderBy: { connectedAt: 'desc' },
    });
  }

  // ---------- OAuth ----------

  /** Signed, expiring state so the callback can trust which user started the flow. */
  buildAuthorizeUrl(userId: string): string {
    const meta = this.config.get('meta', { infer: true });
    if (!meta.appId || !meta.appSecret) {
      this.logger.error('Instagram app keys are missing: set META_APP_ID and META_APP_SECRET');
      throw new ServiceUnavailableException(
        'Connecting Instagram is not available right now. Please try again later.',
      );
    }
    const payload = `${userId}.${Date.now() + STATE_TTL_MS}.${randomBytes(8).toString('hex')}`;
    const state = `${payload}.${hmacSha256Hex(payload, this.stateSecret())}`;
    return this.api.buildAuthorizeUrl(state);
  }

  private verifyState(state: string | undefined): string {
    const parts = (state ?? '').split('.');
    if (parts.length !== 4) throw new BadRequestException('Invalid state');
    const [userId, expires, nonce, signature] = parts as [string, string, string, string];
    const payload = `${userId}.${expires}.${nonce}`;
    if (!verifyHmacSha256(payload, signature, this.stateSecret())) {
      throw new BadRequestException('Invalid state');
    }
    if (Number(expires) < Date.now()) throw new BadRequestException('This link expired');
    return userId;
  }

  /**
   * Finishes the connect flow. Always returns a URL on the web app to send
   * the browser to, with either `connected` or `error` in the query string.
   */
  async handleCallback(
    code: string | undefined,
    state: string | undefined,
    oauthError?: string,
  ): Promise<string> {
    const accountsUrl = `${this.config.get('webUrl', { infer: true })}/accounts`;
    const fail = (reason: string) => `${accountsUrl}?error=${encodeURIComponent(reason)}`;

    if (oauthError) return fail('You cancelled the Instagram connection.');
    let userId: string;
    try {
      userId = this.verifyState(state);
    } catch {
      return fail('That connect link expired. Please try again.');
    }
    if (!code) return fail('Instagram did not return a code. Please try again.');

    try {
      // Instagram appends "#_" to the code in some browsers.
      const short = await this.api.exchangeCodeForToken(code.replace(/#_$/, ''));
      const long = await this.api.getLongLivedToken(short.accessToken);
      const me = await this.api.getMe(long.accessToken);

      const existing = await this.prisma.instagramAccount.findUnique({
        where: { igUserId: me.userId },
      });
      if (existing && existing.userId !== userId) {
        return fail('This Instagram account is already connected to another user.');
      }

      const data = {
        username: me.username,
        encryptedAccessToken: this.encryptToken(long.accessToken),
        tokenExpiresAt: new Date(Date.now() + long.expiresIn * 1000),
        isActive: true,
      };
      await this.prisma.instagramAccount.upsert({
        where: { igUserId: me.userId },
        create: { ...data, userId, igUserId: me.userId },
        update: data,
      });

      try {
        await this.api.subscribeToWebhooks(long.accessToken);
      } catch (err) {
        // The account is connected; events just will not arrive until this succeeds.
        this.logger.error(
          `Webhook subscribe failed for @${me.username}: ${(err as Error).message}`,
        );
        return `${accountsUrl}?connected=${encodeURIComponent(me.username)}&warning=webhooks`;
      }
      return `${accountsUrl}?connected=${encodeURIComponent(me.username)}`;
    } catch (err) {
      this.logger.error(`Instagram connect failed: ${(err as Error).message}`);
      return fail('Instagram connection failed. Please try again.');
    }
  }

  async disconnect(userId: string, accountId: string): Promise<void> {
    const account = await this.getOwnedAccount(userId, accountId);
    try {
      await this.api.unsubscribeFromWebhooks(this.decryptToken(account));
    } catch (err) {
      this.logger.warn(`Unsubscribe failed for @${account.username}: ${(err as Error).message}`);
    }
    // Cascades to automations, contacts, flow state and message logs.
    await this.prisma.instagramAccount.delete({ where: { id: account.id } });
  }

  // ---------- Media (post picker) ----------

  async listMedia(userId: string, accountId: string): Promise<IgMedia[]> {
    const account = await this.getOwnedAccount(userId, accountId);
    const cacheKey = `media:${account.id}`;
    const cached = await this.redis.getJson<IgMedia[]>(cacheKey);
    if (cached) return cached;
    try {
      const media = await this.api.listMedia(account.igUserId, this.decryptToken(account));
      await this.redis.setJson(cacheKey, media, MEDIA_CACHE_SECONDS);
      return media;
    } catch (err) {
      await this.noteApiError(account.id, err);
      throw new ServiceUnavailableException('Could not load posts from Instagram');
    }
  }

  // ---------- Tokens ----------

  async getOwnedAccount(userId: string, accountId: string): Promise<InstagramAccount> {
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new NotFoundException('Instagram account not found');
    return account;
  }

  /** Decrypted access token for API calls. Never log or return it. */
  decryptToken(account: Pick<InstagramAccount, 'encryptedAccessToken'>): string {
    return decrypt(account.encryptedAccessToken, this.encryptionKey());
  }

  encryptToken(token: string): string {
    return encrypt(token, this.encryptionKey());
  }

  async refreshToken(account: InstagramAccount): Promise<void> {
    const refreshed = await this.api.refreshLongLivedToken(this.decryptToken(account));
    await this.prisma.instagramAccount.update({
      where: { id: account.id },
      data: {
        encryptedAccessToken: this.encryptToken(refreshed.accessToken),
        tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
      },
    });
  }

  /** Marks the account inactive when Meta says the token is no longer valid. */
  async noteApiError(accountId: string, err: unknown): Promise<void> {
    if (err instanceof MetaApiError && err.isAuthError) {
      await this.prisma.instagramAccount.update({
        where: { id: accountId },
        data: { isActive: false },
      });
      this.logger.warn(`Account ${accountId} deactivated: token rejected by Meta`);
    }
  }

  private encryptionKey(): string {
    return this.config.get('security.tokenEncryptionKey', { infer: true });
  }

  private stateSecret(): string {
    return this.config.get('auth.jwtSecret', { infer: true });
  }
}
