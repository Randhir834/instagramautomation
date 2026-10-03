import { Controller, Delete, Get, HttpCode, Param, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InstagramService } from './instagram.service';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagram: InstagramService) {}

  /** Lists the user's connected accounts (never includes tokens). */
  @Get('accounts')
  @UseGuards(JwtAuthGuard)
  accounts(@CurrentUser() user: RequestUser) {
    return this.instagram.listAccounts(user.userId);
  }

  /** Recent posts and reels, for the post picker in the automation builder. */
  @Get('accounts/:id/media')
  @UseGuards(JwtAuthGuard)
  media(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.instagram.listMedia(user.userId, id);
  }

  /** Disconnects an account and deletes everything stored for it. */
  @Delete('accounts/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  disconnect(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.instagram.disconnect(user.userId, id);
  }

  /** Starts OAuth: redirects to Instagram's consent screen. */
  @Get('connect')
  @UseGuards(JwtAuthGuard)
  connect(@CurrentUser() user: RequestUser, @Res() res: Response): void {
    res.redirect(this.instagram.buildAuthorizeUrl(user.userId));
  }

  /** OAuth redirect target (META_REDIRECT_URI). */
  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    res.redirect(await this.instagram.handleCallback(code, state, error));
  }
}
