import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { BillingModule } from './modules/billing/billing.module';
import { BookingModule } from './modules/booking/booking.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { EmailModule } from './modules/email/email.module';
import { InstagramModule } from './modules/instagram/instagram.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { StorageModule } from './modules/storage/storage.module';
import { StoreModule } from './modules/store/store.module';
import { UsersModule } from './modules/users/users.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';

/** Infrastructure shared by the API and the worker process. */
export const coreModules = [
  ConfigModule.forRoot({
    isGlobal: true,
    // Single .env at the repo root; a local apps/api/.env can override.
    envFilePath: ['.env', '../../.env'],
    load: [configuration],
    validate: validateEnv,
  }),
  PrismaModule,
  RedisModule,
  QueueModule,
];

@Module({
  imports: [
    ...coreModules,
    // Default for every route: 120 requests a minute per IP. Sensitive routes
    // set a tighter limit with @Throttle; webhooks opt out with @SkipThrottle.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    AuthModule,
    UsersModule,
    InstagramModule,
    WebhooksModule,
    AutomationsModule,
    ContactsModule,
    BillingModule,
    StoreModule,
    BookingModule,
    InvoicesModule,
    StorageModule,
    EmailModule,
    AnalyticsModule,
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
