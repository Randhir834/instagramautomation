import { Module } from '@nestjs/common';
import { DataDeletionController } from './data-deletion.controller';

/** Endpoints Meta requires before App Review. */
@Module({
  controllers: [DataDeletionController],
})
export class ComplianceModule {}
