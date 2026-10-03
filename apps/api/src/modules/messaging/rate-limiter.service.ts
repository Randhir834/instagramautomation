import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

/**
 * Per-account send throttle (fixed one-hour window in Redis) so one viral reel
 * cannot push an account past Meta's rate limits. Meta does not publish one
 * fixed number for every account, so this is a conservative ceiling of our own.
 */
@Injectable()
export class RateLimiterService {
  static readonly MAX_SENDS_PER_HOUR = 600;

  constructor(private readonly redis: RedisService) {}

  /** Returns true if a send is allowed now (and counts it). */
  async tryConsume(igAccountId: string): Promise<boolean> {
    const hour = new Date().toISOString().slice(0, 13);
    const key = `ratelimit:send:${igAccountId}:${hour}`;
    const count = await this.redis.client.incr(key);
    if (count === 1) await this.redis.client.expire(key, 3600);
    return count <= RateLimiterService.MAX_SENDS_PER_HOUR;
  }
}
