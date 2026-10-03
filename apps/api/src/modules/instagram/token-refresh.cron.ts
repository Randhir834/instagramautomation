import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addDays } from '../../common/utils/dates';
import { PrismaService } from '../../prisma/prisma.service';
import { InstagramService } from './instagram.service';

/** Refresh when a token has fewer than this many days left (tokens last ~60 days). */
const REFRESH_WHEN_DAYS_LEFT = 10;

/** Runs in the worker process only (ScheduleModule is not loaded by the API). */
@Injectable()
export class TokenRefreshCron {
  private readonly logger = new Logger(TokenRefreshCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly instagram: InstagramService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async refreshExpiringTokens(): Promise<{ refreshed: number; failed: number }> {
    const accounts = await this.prisma.instagramAccount.findMany({
      where: {
        isActive: true,
        tokenExpiresAt: { lt: addDays(new Date(), REFRESH_WHEN_DAYS_LEFT), gt: new Date() },
      },
    });
    let refreshed = 0;
    let failed = 0;
    for (const account of accounts) {
      try {
        await this.instagram.refreshToken(account);
        refreshed++;
      } catch (err) {
        failed++;
        this.logger.error(`Refresh failed for @${account.username}: ${(err as Error).message}`);
        await this.instagram.noteApiError(account.id, err);
      }
    }

    // Tokens that already expired cannot be refreshed: the creator must reconnect.
    const expired = await this.prisma.instagramAccount.updateMany({
      where: { isActive: true, tokenExpiresAt: { lte: new Date() } },
      data: { isActive: false },
    });
    if (accounts.length || expired.count) {
      this.logger.log(
        `Token refresh: ${refreshed} refreshed, ${failed} failed, ${expired.count} expired`,
      );
    }
    return { refreshed, failed };
  }
}
