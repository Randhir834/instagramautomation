import { APP_NAME } from './utils';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** What Razorpay Checkout passes to `handler` after a successful payment. */
export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

interface CheckoutOptions {
  key: string;
  order_id?: string;
  subscription_id?: string;
  amount?: number;
  currency?: string;
  description?: string;
  prefill?: { email?: string; name?: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

let loading: Promise<boolean> | null = null;

/** Loads Razorpay's checkout script once. Resolves false if it could not load. */
export function loadRazorpay(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  loading ??= new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loading = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return loading;
}

/**
 * Opens the Razorpay payment window.
 * Resolves with the payment details on success, or null if the person closed it.
 * The result must still be verified by the server; never trust it on its own.
 */
export async function openCheckout(options: CheckoutOptions): Promise<RazorpaySuccess | null> {
  const ok = await loadRazorpay();
  if (!ok || !window.Razorpay) {
    throw new Error('Could not load the payment window. Check your connection and try again.');
  }
  const Razorpay = window.Razorpay;
  return new Promise((resolve) => {
    const checkout = new Razorpay({
      name: APP_NAME,
      theme: { color: '#c93a1e' },
      ...options,
      handler: (response: RazorpaySuccess) => resolve(response),
      modal: { ondismiss: () => resolve(null) },
    });
    checkout.open();
  });
}
