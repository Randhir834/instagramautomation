import { Body, Controller, Get, HttpCode, Param, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  CheckoutInput,
  checkoutSchema,
  VerifyPaymentInput,
  verifyPaymentSchema,
} from '@repo/shared';
import type { Response } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { DeliveryService } from './delivery.service';
import { StoreService } from './store.service';

/** Unauthenticated endpoints behind the public store pages (/s/:username). */
@Controller('public')
export class PublicStoreController {
  constructor(
    private readonly store: StoreService,
    private readonly delivery: DeliveryService,
  ) {}

  @Get('store/:username')
  storefront(@Param('username') username: string) {
    return this.store.getStorefront(username);
  }

  @Get('store/:username/:slug')
  product(@Param('username') username: string, @Param('slug') slug: string) {
    return this.store.getPublicProduct(username, slug);
  }

  /** Cover images live in private storage; this redirects to a fresh signed link. */
  @Get('covers/:key')
  async cover(@Param('key') key: string, @Res() res: Response): Promise<void> {
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.redirect(await this.store.resolveCover(key));
  }

  @Post('checkout')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  checkout(@Body(new ZodValidationPipe(checkoutSchema)) dto: CheckoutInput) {
    return this.store.createCheckout(dto);
  }

  @Post('checkout/verify')
  @HttpCode(200)
  verify(@Body(new ZodValidationPipe(verifyPaymentSchema)) dto: VerifyPaymentInput) {
    return this.store.verifyPayment(dto);
  }

  @Get('download/:token')
  download(@Param('token') token: string) {
    return this.delivery.getDownload(token);
  }

  /** Issues a short-lived link to the purchased file. */
  @Post('download/:token/link')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  downloadLink(@Param('token') token: string) {
    return this.delivery.getDownloadUrl(token);
  }
}
