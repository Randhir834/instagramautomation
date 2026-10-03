import { Module } from '@nestjs/common';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';
import { MatcherService } from './matcher.service';

@Module({
  controllers: [AutomationsController],
  providers: [AutomationsService, MatcherService],
  exports: [AutomationsService, MatcherService],
})
export class AutomationsModule {}
