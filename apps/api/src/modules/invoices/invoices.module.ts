import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PdfService } from './pdf.service';

@Module({
  imports: [StorageModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PdfService],
})
export class InvoicesModule {}
