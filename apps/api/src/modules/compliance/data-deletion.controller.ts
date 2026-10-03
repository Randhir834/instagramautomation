import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { parseSignedRequest } from './signed-request';

const STATUS_TTL_SECONDS = 90 * 24 * 60 * 60;

interface DeletionStatus {
  status: 'completed';
  requestedAt: string;
  accountsDeleted: number;
}

/**
 * Callbacks Meta requires before App Review.
 * Both receive a `signed_request` form field signed with the app secret.
 */
@Controller('compliance')
export class DataDeletionController {
  private readonly logger = new Logger(DataDeletionController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private verify(signedRequest: string | undefined): string {
    const payload = parseSignedRequest(
      signedRequest,
      this.config.get('meta.appSecret', { infer: true }),
    );
    if (!payload?.user_id) throw new BadRequestException('Invalid signed_request');
    return String(payload.user_id);
  }

  /**
   * Data Deletion Request Callback: delete everything stored for the
   * Instagram account and answer with a status URL and a confirmation code.
   */
  @Post('data-deletion')
  @HttpCode(200)
  @SkipThrottle()
  async dataDeletion(@Body('signed_request') signedRequest: string | undefined) {
    const igUserId = this.verify(signedRequest);
    // Cascades to automations, contacts, flow state and message logs.
    const deleted = await this.prisma.instagramAccount.deleteMany({ where: { igUserId } });

    const code = randomBytes(9).toString('base64url');
    const status: DeletionStatus = {
      status: 'completed',
      requestedAt: new Date().toISOString(),
      accountsDeleted: deleted.count,
    };
    await this.redis.setJson(`deletion:${code}`, status, STATUS_TTL_SECONDS);
    this.logger.log(`Data deletion for Instagram user ${igUserId}: ${deleted.count} account(s)`);

    return {
      url: `${this.config.get('webUrl', { infer: true })}/data-deletion?code=${code}`,
      confirmation_code: code,
    };
  }

  /** Deauthorize Callback: the user removed the app, so stop using their token. */
  @Post('deauthorize')
  @HttpCode(200)
  @SkipThrottle()
  async deauthorize(@Body('signed_request') signedRequest: string | undefined) {
    const igUserId = this.verify(signedRequest);
    await this.prisma.instagramAccount.updateMany({
      where: { igUserId },
      data: { isActive: false },
    });
    return { success: true };
  }

  /** Lets a person check their deletion request with the confirmation code. */
  @Get('data-deletion/:code')
  async status(@Param('code') code: string): Promise<DeletionStatus> {
    const status = await this.redis.getJson<DeletionStatus>(`deletion:${code}`);
    if (!status) throw new NotFoundException('No deletion request found for this code');
    return status;
  }
}
