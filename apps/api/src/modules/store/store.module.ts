import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { StorageModule } from '../storage/storage.module';
import { DeliveryService } from './delivery.service';
import { OrdersController } from './orders.controller';
import { ProductsController } from './products.controller';
import { PublicStoreController } from './public-store.controller';
import { StoreService } from './store.service';

@Module({
  imports: [StorageModule, BillingModule],
  controllers: [ProductsController, OrdersController, PublicStoreController],
  providers: [StoreService, DeliveryService],
  exports: [StoreService, DeliveryService],
})
export class StoreModule {}
