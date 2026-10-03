import { Body, Controller, Get, HttpCode, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AppConfig } from '../../config/configuration';
import { AuthService, GOOGLE_STATE_COOKIE } from './auth.service';
import { LoginDto, loginSchema } from './dto/login.dto';
import { SignupDto, signupSchema } from './dto/signup.dto';

/** Tight limit on credential endpoints: 10 attempts a minute per IP. */
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Post('signup')
  @Throttle(AUTH_THROTTLE)
  signup(
    @Body(new ZodValidationPipe(signupSchema)) dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.signup(dto, res);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle(AUTH_THROTTLE)
  login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.login(dto, res);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    this.auth.clearAuthCookie(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user.userId);
  }

  /** Redirects the browser to Google's consent screen. */
  @Get('google')
  google(@Res() res: Response): void {
    res.redirect(this.auth.startGoogle(res));
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const webUrl = this.config.get('webUrl', { infer: true });
    const cookies = req.cookies as Record<string, string> | undefined;
    try {
      await this.auth.finishGoogle(code, state, cookies?.[GOOGLE_STATE_COOKIE], res);
      res.redirect(`${webUrl}/dashboard`);
    } catch {
      res.redirect(`${webUrl}/login?error=google`);
    }
  }
}
