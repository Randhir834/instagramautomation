import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import {
  CheckoutInput,
  COVER_CONTENT_TYPES,
  CreateProductInput,
  MAX_COVER_BYTES,
  MAX_PRODUCT_FILE_BYTES,
  UpdateProductInput,
  UploadRequest,
  VerifyPaymentInput,
} from '@repo/shared';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import { RazorpayService } from '../billing/razorpay.service';
import { StorageService } from '../storage/storage.service';
import { DeliveryService } from './delivery.service';

/** Fields safe to show on public pages (never fileKey). */
const PUBLIC_PRODUCT_FIELDS = {
  id: true,
  title: true,
  description: true,
  priceInPaise: true,
  coverImageUrl: true,
  slug: true,
} as const;

const fileKeyPrefix = (userId: string) => `products/${userId}/`;
const coverKeyPrefix = (userId: string) => `covers/${userId}/`;

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly razorpay: RazorpayService,
    private readonly delivery: DeliveryService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // ---------- Creator: uploads ----------

  /** Returns a one-time URL the browser PUTs the file to, plus the key to save on the product. */
  async createUpload(userId: string, dto: UploadRequest) {
    if (dto.kind === 'cover') {
      if (!(COVER_CONTENT_TYPES as readonly string[]).includes(dto.contentType)) {
        throw new BadRequestException('Cover must be a JPG, PNG or WebP image');
      }
      if (dto.size > MAX_COVER_BYTES) throw new BadRequestException('Cover must be under 5 MB');
    } else if (dto.size > MAX_PRODUCT_FILE_BYTES) {
      throw new BadRequestException('File must be under 500 MB');
    }
    const safeName = dto.filename.replace(/[^\w.-]+/g, '_').slice(-80);
    const prefix = dto.kind === 'cover' ? coverKeyPrefix(userId) : fileKeyPrefix(userId);
    const key = `${prefix}${randomUUID()}/${safeName}`;
    const uploadUrl = await this.storage.getSignedUploadUrl(key, dto.contentType);
    return { key, uploadUrl };
  }

  /** A cover is stored privately; this URL redirects to a fresh signed link each time. */
  private coverUrl(coverKey: string | null | undefined): string | null {
    if (!coverKey) return null;
    const encoded = Buffer.from(coverKey).toString('base64url');
    return `${this.config.get('apiUrl', { infer: true })}/public/covers/${encoded}`;
  }

  async resolveCover(encodedKey: string): Promise<string> {
    const key = Buffer.from(encodedKey, 'base64url').toString('utf8');
    if (!key.startsWith('covers/') || key.includes('..')) {
      throw new NotFoundException('Cover not found');
    }
    return this.storage.getSignedDownloadUrl(key, 3600);
  }

  private assertOwnsKeys(userId: string, dto: { fileKey?: string; coverKey?: string | null }) {
    if (dto.fileKey && !dto.fileKey.startsWith(fileKeyPrefix(userId))) {
      throw new BadRequestException('Unknown product file');
    }
    if (dto.coverKey && !dto.coverKey.startsWith(coverKeyPrefix(userId))) {
      throw new BadRequestException('Unknown cover image');
    }
  }

  // ---------- Creator: products ----------

  listProducts(userId: string) {
    return this.prisma.product.findMany({
      where: { userId },
      select: { ...PUBLIC_PRODUCT_FIELDS, isPublished: true, _count: { select: { orders: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async createProduct(userId: string, dto: CreateProductInput) {
    this.assertOwnsKeys(userId, dto);
    const { coverKey, ...fields } = dto;
    try {
      return await this.prisma.product.create({
        data: { ...fields, userId, coverImageUrl: this.coverUrl(coverKey) },
        select: { ...PUBLIC_PRODUCT_FIELDS, isPublished: true },
      });
    } catch (err) {
      throw this.slugConflict(err);
    }
  }

  async updateProduct(userId: string, id: string, dto: UpdateProductInput) {
    await this.getOwnedProduct(userId, id);
    this.assertOwnsKeys(userId, dto);
    const { coverKey, ...fields } = dto;
    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          ...fields,
          ...(coverKey !== undefined ? { coverImageUrl: this.coverUrl(coverKey) } : {}),
        },
        select: { ...PUBLIC_PRODUCT_FIELDS, isPublished: true },
      });
    } catch (err) {
      throw this.slugConflict(err);
    }
  }

  async deleteProduct(userId: string, id: string): Promise<void> {
    await this.getOwnedProduct(userId, id);
    const orders = await this.prisma.order.count({ where: { productId: id } });
    if (orders > 0) {
      // Buyers keep their download links, so a sold product is hidden, not deleted.
      throw new ConflictException(
        'This product has orders, so it cannot be deleted. Unpublish it instead.',
      );
    }
    await this.prisma.product.delete({ where: { id } });
  }

  listOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { product: { userId }, status: { not: 'CREATED' } },
      select: {
        id: true,
        buyerEmail: true,
        buyerName: true,
        amountInPaise: true,
        status: true,
        createdAt: true,
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  // ---------- Public: storefront ----------

  async getStorefront(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        name: true,
        username: true,
        products: {
          where: { isPublished: true },
          select: PUBLIC_PRODUCT_FIELDS,
          orderBy: { title: 'asc' },
        },
      },
    });
    if (!user) throw new NotFoundException('Store not found');
    return user;
  }

  async getPublicProduct(username: string, slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isPublished: true, user: { username: username.toLowerCase() } },
      select: { ...PUBLIC_PRODUCT_FIELDS, user: { select: { name: true, username: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ---------- Public: checkout ----------

  /** Creates a Razorpay order and our Order row; returns what Checkout needs to open. */
  async createCheckout(dto: CheckoutInput) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isPublished: true },
      select: { id: true, title: true, priceInPaise: true, user: { select: { name: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');

    // The amount always comes from our database, never from the browser.
    const rzpOrder = await this.razorpay.createOrder(product.priceInPaise, `p_${randomUUID()}`, {
      productId: product.id,
    });
    await this.prisma.order.create({
      data: {
        productId: product.id,
        buyerEmail: dto.buyerEmail,
        buyerName: dto.buyerName,
        amountInPaise: product.priceInPaise,
        razorpayOrderId: rzpOrder.id,
        downloadToken: this.delivery.generateDownloadToken(),
      },
    });
    return {
      keyId: this.razorpay.keyId,
      razorpayOrderId: rzpOrder.id,
      amountInPaise: product.priceInPaise,
      currency: 'INR',
      productTitle: product.title,
      sellerName: product.user.name,
    };
  }

  /**
   * Called by the browser right after Checkout succeeds, so the buyer gets
   * their download at once. The webhook does the same job if this never arrives.
   */
  async verifyPayment(dto: VerifyPaymentInput): Promise<{ downloadToken: string }> {
    const valid = this.razorpay.verifyOrderPayment(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
    if (!valid) throw new BadRequestException('Payment could not be verified');
    const token = await this.markOrderPaid(dto.razorpay_order_id, dto.razorpay_payment_id);
    if (!token) throw new NotFoundException('Order not found');
    return { downloadToken: token };
  }

  /**
   * Marks an order paid and emails the download link, exactly once even if
   * both the browser callback and the webhook arrive. Returns the download token.
   */
  async markOrderPaid(razorpayOrderId: string, paymentId?: string): Promise<string | null> {
    const order = await this.prisma.order.findUnique({
      where: { razorpayOrderId },
      select: { id: true, downloadToken: true },
    });
    if (!order) return null; // not one of our store orders

    // Only the caller that flips the status sends the email.
    const flipped = await this.prisma.order.updateMany({
      where: { id: order.id, status: { not: 'PAID' } },
      data: { status: 'PAID', razorpayPaymentId: paymentId },
    });
    if (flipped.count === 1) {
      await this.delivery
        .sendDeliveryEmail(order.id)
        .catch((err: Error) => this.logger.error(`Delivery email failed: ${err.message}`));
    }
    return order.downloadToken;
  }

  async markOrderFailed(razorpayOrderId: string): Promise<void> {
    await this.prisma.order.updateMany({
      where: { razorpayOrderId, status: 'CREATED' },
      data: { status: 'FAILED' },
    });
  }

  // ---------- helpers ----------

  private async getOwnedProduct(userId: string, id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, userId } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private slugConflict(err: unknown): unknown {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return new ConflictException('You already have a product with this link. Change the link.');
    }
    return err;
  }
}
