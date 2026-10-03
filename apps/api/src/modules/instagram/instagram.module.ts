import { Module } from '@nestjs/common';
import { InstagramApiClient } from './instagram-api.client';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { TokenRefreshCron } from './token-refresh.cron';

@Module({
  controllers: [InstagramController],
  providers: [InstagramService, InstagramApiClient, TokenRefreshCron],
  exports: [InstagramService, InstagramApiClient],
})
export class InstagramModule {}
