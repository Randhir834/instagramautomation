import { randomBytes } from 'node:crypto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { deliveryEmail } from '../email/templates/messages';
import { StorageService } from '../storage/storage.service';

const DOWNLOAD_URL_TTL_SECONDS = 10 * 60;

/** Delivers purchased files through short-lived signed links. */
@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Unguessable token stored on the Order and emailed to the buyer. */
  generateDownloadToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /** Public details for the download page. Does not expose where the file lives. */
  async getDownload(token: string) {
    const order = await this.prisma.order.findUnique({
      where: { downloadToken: token },
      select: {
        status: true,
        product: { select: { title: true, user: { select: { name: true } } } },
      },
    });
    if (!order) throw new NotFoundException('Download not found');
    return {
      title: order.product.title,
      sellerName: order.product.user.name,
      isPaid: order.status === 'PAID',
    };
  }

  /** A signed link to the file itself, valid for a few minutes. */
  async getDownloadUrl(token: string): Promise<{ url: string }> {
    const order = await this.prisma.order.findUnique({
      where: { downloadToken: token },
      select: { status: true, product: { select: { fileKey: true } } },
    });
    if (!order) throw new NotFoundException('Download not found');
    if (order.status !== 'PAID') throw new ForbiddenException('This order has not been paid');

    const filename = order.product.fileKey.split('/').pop();
    const url = await this.storage.getSignedDownloadUrl(
      order.product.fileKey,
      DOWNLOAD_URL_TTL_SECONDS,
      filename,
    );
    return { url };
  }

  async sendDeliveryEmail(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerEmail: true,
        downloadToken: true,
        product: { select: { title: true, user: { select: { name: true } } } },
      },
    });
    if (!order) return;
    const { subject, html } = deliveryEmail({
      appName: this.config.get('appName', { infer: true }),
      productTitle: order.product.title,
      sellerName: order.product.user.name,
      downloadUrl: `${this.config.get('webUrl', { infer: true })}/download/${order.downloadToken}`,
    });
    await this.email.send({ to: order.buyerEmail, subject, html });
  }
}
