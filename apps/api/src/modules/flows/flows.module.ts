import { Module } from '@nestjs/common';
import { InstagramModule } from '../instagram/instagram.module';
import { FlowEngineService } from './flow-engine.service';
import { FlowStateService } from './flow-state.service';
import { CollectInputStep } from './steps/collect-input.step';
import { FollowGateStep } from './steps/follow-gate.step';
import { QuickRepliesStep } from './steps/quick-replies.step';
import { SendMessageStep } from './steps/send-message.step';

@Module({
  imports: [InstagramModule],
  providers: [
    FlowEngineService,
    FlowStateService,
    SendMessageStep,
    QuickRepliesStep,
    FollowGateStep,
    CollectInputStep,
  ],
  exports: [FlowEngineService, FlowStateService],
})
export class FlowsModule {}
