import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PlanExpiryCron } from './plan-expiry.cron';
import { RazorpayService } from './razorpay.service';
import { UsageService } from './usage.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, UsageService, RazorpayService, PlanExpiryCron],
  exports: [BillingService, UsageService, RazorpayService],
})
export class BillingModule {}
