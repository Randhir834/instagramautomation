import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BillingService } from './billing.service';

const subscribeSchema = z.object({ plan: z.enum(['PREMIUM', 'PROFESSIONAL']) });
type SubscribeDto = z.infer<typeof subscribeSchema>;

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  /** Current plan, limits and this month's usage. */
  @Get()
  summary(@CurrentUser() user: RequestUser) {
    return this.billing.getSummary(user.userId);
  }

  @Post('subscribe')
  subscribe(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(subscribeSchema)) dto: SubscribeDto,
  ) {
    return this.billing.subscribe(user.userId, dto.plan);
  }

  @Post('cancel')
  @HttpCode(200)
  cancel(@CurrentUser() user: RequestUser) {
    return this.billing.cancel(user.userId);
  }
}
