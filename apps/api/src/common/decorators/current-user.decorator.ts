import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** What JwtStrategy.validate() attaches to req.user. */
export interface RequestUser {
  userId: string;
  email: string;
}

/** Usage: `me(@CurrentUser() user: RequestUser)` on a JwtAuthGuard-protected route. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const req = ctx.switchToHttp().getRequest<Request & { user: RequestUser }>();
    return req.user;
  },
);
