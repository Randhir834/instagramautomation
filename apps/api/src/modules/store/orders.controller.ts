import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreService } from './store.service';

@Controller('store/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly store: StoreService) {}

  /** Paid and failed orders for the creator's products, newest first. */
  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.store.listOrders(user.userId);
  }
}
