import 'reflect-metadata';
import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { coreModules } from './app.module';
import { initSentry } from './common/utils/sentry';
import { BillingModule } from './modules/billing/billing.module';
import { EmailModule } from './modules/email/email.module';
import { EventsModule } from './modules/events/events.module';
import { InstagramModule } from './modules/instagram/instagram.module';
import { MessagingModule } from './modules/messaging/messaging.module';

/**
 * Worker process: runs BullMQ processors and cron jobs.
 * Kept separate from the HTTP API so webhooks always answer fast and
 * crons never run twice when the API is scaled horizontally.
 */
@Module({
  imports: [
    ...coreModules,
    ScheduleModule.forRoot(),
    EmailModule,
    InstagramModule,
    BillingModule,
    EventsModule,
    MessagingModule,
  ],
})
class WorkerModule {}

async function bootstrap(): Promise<void> {
  initSentry();
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  Logger.log('Worker started', 'Worker');
}

void bootstrap();
