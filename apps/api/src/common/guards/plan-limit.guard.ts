import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isWithinLimit, PLAN_LIMITS } from '@repo/shared';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../decorators/current-user.decorator';

export type LimitedResource = 'automations';
export const PLAN_LIMIT_KEY = 'planLimit';

/** Marks a route as consuming a plan-limited resource, e.g. `@PlanLimit('automations')`. */
export const PlanLimit = (resource: LimitedResource) => SetMetadata(PLAN_LIMIT_KEY, resource);

/** Blocks creation when the user's plan limit is reached. Use after JwtAuthGuard. */
@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<LimitedResource | undefined>(
      PLAN_LIMIT_KEY,
      context.getHandler(),
    );
    if (!resource) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    if (!user) return false;

    const [account, used] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: user.userId }, select: { plan: true } }),
      this.prisma.automation.count({ where: { igAccount: { userId: user.userId } } }),
    ]);
    if (!account) return false;

    const limit = PLAN_LIMITS[account.plan].maxAutomations;
    if (!isWithinLimit(limit, used)) {
      throw new ForbiddenException(`Your plan allows ${limit} automations. Upgrade to add more.`);
    }
    return true;
  }
}
