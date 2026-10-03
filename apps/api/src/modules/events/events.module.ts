import { Module } from '@nestjs/common';
import { AutomationsModule } from '../automations/automations.module';
import { BillingModule } from '../billing/billing.module';
import { ContactsModule } from '../contacts/contacts.module';
import { FlowsModule } from '../flows/flows.module';
import { StoreModule } from '../store/store.module';
import { CommentHandler } from './comment.handler';
import { MessageHandler } from './message.handler';
import { MetaEventsProcessor } from './meta-events.processor';
import { RazorpayEventsProcessor } from './razorpay-events.processor';

/** Processors that consume webhook events. Worker only (see worker.ts). */
@Module({
  imports: [AutomationsModule, ContactsModule, BillingModule, FlowsModule, StoreModule],
  providers: [CommentHandler, MessageHandler, MetaEventsProcessor, RazorpayEventsProcessor],
})
export class EventsModule {}
