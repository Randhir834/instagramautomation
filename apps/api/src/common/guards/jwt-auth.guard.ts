import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Requires a valid JWT in the httpOnly `access_token` cookie. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
