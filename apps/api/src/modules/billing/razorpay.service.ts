import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyHmacSha256 } from '../../common/utils/hmac';
import type { AppConfig } from '../../config/configuration';

export interface RazorpaySubscription {
  id: string;
  status: string;
  current_end?: number | null;
  short_url?: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * The ONLY place that talks to Razorpay (subscriptions + store orders).
 * Endpoints and signature rules checked against Razorpay docs, October 2026.
 */
@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  private get rzp() {
    return this.config.get('razorpay', { infer: true });
  }

  get isConfigured(): boolean {
    return Boolean(this.rzp.keyId && this.rzp.keySecret);
  }

  /** Public key id, safe to send to the browser for Checkout. */
  get keyId(): string {
    return this.rzp.keyId;
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    if (!this.isConfigured) {
      this.logger.error('Razorpay keys are missing: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
      throw new ServiceUnavailableException(
        'Payments are not available right now. Please try again later.',
      );
    }
    const auth = Buffer.from(`${this.rzp.keyId}:${this.rzp.keySecret}`).toString('base64');
    const res = await fetch(`${this.rzp.apiUrl}${path}`, {
      method,
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: { description?: string } };
    if (!res.ok) {
      this.logger.error(
        `Razorpay ${method} ${path} failed: ${res.status} ${json.error?.description ?? ''}`,
      );
      throw new BadGatewayException('The payment could not be started. Please try again.');
    }
    return json as T;
  }

  /** Monthly plan, billed for up to 10 years unless cancelled. */
  createSubscription(planId: string, notes: Record<string, string>): Promise<RazorpaySubscription> {
    return this.request('POST', '/subscriptions', {
      plan_id: planId,
      total_count: 120,
      customer_notify: true,
      notes,
    });
  }

  /** Cancels at the end of the paid period, so the creator keeps what they paid for. */
  cancelSubscription(subscriptionId: string): Promise<RazorpaySubscription> {
    return this.request('POST', `/subscriptions/${subscriptionId}/cancel`, {
      cancel_at_cycle_end: true,
    });
  }

  createOrder(
    amountInPaise: number,
    receipt: string,
    notes: Record<string, string>,
  ): Promise<RazorpayOrder> {
    return this.request('POST', '/orders', {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt.slice(0, 40),
      notes,
    });
  }

  /** Checks the signature Checkout hands the browser after an order payment. */
  verifyOrderPayment(orderId: string, paymentId: string, signature: string): boolean {
    return verifyHmacSha256(`${orderId}|${paymentId}`, signature, this.rzp.keySecret);
  }
}
