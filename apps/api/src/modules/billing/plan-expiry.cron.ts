import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingService } from './billing.service';

/** Runs in the worker process only (ScheduleModule is not loaded by the API). */
@Injectable()
export class PlanExpiryCron {
  private readonly logger = new Logger(PlanExpiryCron.name);

  constructor(private readonly billing: BillingService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    const downgraded = await this.billing.expireEndedPlans();
    if (downgraded > 0) this.logger.log(`Moved ${downgraded} expired plan(s) back to Free`);
  }
}
