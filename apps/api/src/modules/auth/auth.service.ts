import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser, JwtPayload } from '@repo/shared';
import { compare, hash } from 'bcryptjs';
import type { CookieOptions, Response } from 'express';
import type { AppConfig } from '../../config/configuration';
import { UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';

export const AUTH_COOKIE = 'access_token';
export const GOOGLE_STATE_COOKIE = 'google_oauth_state';
const BCRYPT_ROUNDS = 12;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

interface GoogleProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async signup(dto: SignupDto, res: Response): Promise<AuthUser> {
    const passwordHash = await hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({ email: dto.email, name: dto.name, passwordHash });
    this.setAuthCookie(res, user);
    return user;
  }

  async login(dto: LoginDto, res: Response): Promise<AuthUser> {
    const record = await this.users.findByEmail(dto.email);
    // Same error for "no such user" and "wrong password" so emails cannot be probed.
    const ok = record?.passwordHash ? await compare(dto.password, record.passwordHash) : false;
    if (!record || !ok) throw new UnauthorizedException('Wrong email or password');
    const user = await this.users.getAuthUser(record.id);
    this.setAuthCookie(res, user);
    return user;
  }

  me(userId: string): Promise<AuthUser> {
    return this.users.getAuthUser(userId);
  }

  clearAuthCookie(res: Response): void {
    res.clearCookie(AUTH_COOKIE, { path: '/' });
  }

  // ----- Google login (OAuth 2 authorization code flow) -----

  /** Returns Google's consent URL and stores a random `state` in a short-lived cookie. */
  startGoogle(res: Response): string {
    const { googleClientId } = this.config.get('auth', { infer: true });
    if (!googleClientId)
      throw new ServiceUnavailableException('Google sign-in is not available right now.');
    const state = randomBytes(24).toString('base64url');
    res.cookie(GOOGLE_STATE_COOKIE, state, { ...this.cookieOptions(), maxAge: 10 * 60 * 1000 });
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: this.googleRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    return `${GOOGLE_AUTHORIZE_URL}?${params.toString()}`;
  }

  /** Exchanges the code, finds or creates the user, sets the auth cookie. */
  async finishGoogle(
    code: string | undefined,
    state: string | undefined,
    cookieState: string | undefined,
    res: Response,
  ): Promise<void> {
    res.clearCookie(GOOGLE_STATE_COOKIE, { path: '/' });
    if (!code || !state || !cookieState || state !== cookieState) {
      throw new BadRequestException('Google login could not be verified, please try again');
    }
    const { googleClientId, googleClientSecret } = this.config.get('auth', { infer: true });
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: this.googleRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new UnauthorizedException('Google login failed');
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) throw new UnauthorizedException('Google login failed');
    const profile = (await profileRes.json()) as GoogleProfile;
    if (!profile.email || !profile.email_verified) {
      throw new UnauthorizedException('Your Google email is not verified');
    }

    const email = profile.email.toLowerCase();
    let user: AuthUser;
    const byGoogle = await this.users.findByGoogleId(profile.sub);
    if (byGoogle) {
      user = await this.users.getAuthUser(byGoogle.id);
    } else {
      const byEmail = await this.users.findByEmail(email);
      user = byEmail
        ? await this.users.linkGoogle(byEmail.id, profile.sub)
        : await this.users.create({
            email,
            name: profile.name ?? email.split('@')[0] ?? 'Creator',
            googleId: profile.sub,
          });
    }
    this.setAuthCookie(res, user);
  }

  // ----- helpers -----

  private googleRedirectUri(): string {
    return `${this.config.get('apiUrl', { infer: true })}/auth/google/callback`;
  }

  private setAuthCookie(res: Response, user: AuthUser): void {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    res.cookie(AUTH_COOKIE, this.jwt.sign(payload), { ...this.cookieOptions(), maxAge: WEEK_MS });
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get('isProd', { infer: true }),
      sameSite: 'lax',
      path: '/',
    };
  }
}
