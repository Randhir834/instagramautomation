import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  CreateInvoiceInput,
  createInvoiceSchema,
  InvoiceStatus,
  updateInvoiceStatusSchema,
} from '@repo/shared';
import type { Response } from 'express';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { InvoicesService } from './invoices.service';

function sendPdf(res: Response, file: { filename: string; pdf: Buffer }): void {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
  res.send(file.pdf);
}

@Controller()
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: RequestUser) {
    return this.invoices.list(user.userId);
  }

  @Post('invoices')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(createInvoiceSchema)) dto: CreateInvoiceInput,
  ) {
    return this.invoices.create(user.userId, dto);
  }

  @Get('invoices/:id')
  @UseGuards(JwtAuthGuard)
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.invoices.getForOwner(user.userId, id);
  }

  @Patch('invoices/:id/status')
  @UseGuards(JwtAuthGuard)
  setStatus(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateInvoiceStatusSchema)) dto: { status: InvoiceStatus },
  ) {
    return this.invoices.setStatus(user.userId, id, dto.status);
  }

  @Delete('invoices/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.invoices.remove(user.userId, id);
  }

  @Get('invoices/:id/pdf')
  @UseGuards(JwtAuthGuard)
  async pdf(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    sendPdf(res, await this.invoices.renderPdf(id, user.userId));
  }

  /** Public invoice view: the cuid id acts as the unguessable share link. */
  @Get('public/invoice/:id')
  publicView(@Param('id') id: string) {
    return this.invoices.getPublic(id);
  }

  /** Starting a browser is expensive, so the public PDF is rate limited harder. */
  @Get('public/invoice/:id/pdf')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async publicPdf(@Param('id') id: string, @Res() res: Response): Promise<void> {
    sendPdf(res, await this.invoices.renderPdf(id));
  }
}
