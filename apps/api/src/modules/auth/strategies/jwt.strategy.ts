import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { JwtPayload } from '@repo/shared';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RequestUser } from '../../../common/decorators/current-user.decorator';
import type { AppConfig } from '../../../config/configuration';
import { AUTH_COOKIE } from '../auth.service';

function fromCookie(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[AUTH_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      ignoreExpiration: false,
      secretOrKey: config.get('auth.jwtSecret', { infer: true }),
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return { userId: payload.sub, email: payload.email };
  }
}
