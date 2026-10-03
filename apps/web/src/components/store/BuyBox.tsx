'use client';

import { checkoutSchema } from '@repo/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Notice } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { apiPost, errorMessage } from '@/lib/api';
import { openCheckout } from '@/lib/razorpay';
import { formatMoney } from '@/lib/utils';

interface CheckoutSession {
  keyId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  productTitle: string;
}

/** Email + pay button on a product page. */
export function BuyBox({ productId, priceInPaise }: { productId: string; priceInPaise: number }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    const parsed = checkoutSchema.safeParse({
      productId,
      buyerEmail: email,
      buyerName: name.trim() || undefined,
    });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setBusy(true);
    try {
      const session = await apiPost<CheckoutSession>('/public/checkout', parsed.data);
      const payment = await openCheckout({
        key: session.keyId,
        order_id: session.razorpayOrderId,
        amount: session.amountInPaise,
        currency: session.currency,
        description: session.productTitle,
        prefill: { email: parsed.data.buyerEmail, name: parsed.data.buyerName },
      });
      if (!payment) return; // they closed the payment window
      // The server checks the payment signature before handing over the download.
      const { downloadToken } = await apiPost<{ downloadToken: string }>(
        '/public/checkout/verify',
        {
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
        },
      );
      router.push(`/download/${downloadToken}`);
    } catch (err) {
      setProblem(
        `${errorMessage(err)} If money left your account, you will still get your download link by email.`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleBuy} className="slab space-y-4 rounded-2xl bg-butter p-5" noValidate>
      <p className="font-display text-4xl">{formatMoney(priceInPaise)}</p>
      <Field
        label="Your email"
        htmlFor="buyerEmail"
        hint="Your download link is sent here."
        error={fieldError}
      >
        <Input
          id="buyerEmail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Your name (optional)" htmlFor="buyerName">
        <Input
          id="buyerName"
          autoComplete="name"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      {problem ? <Notice tone="error">{problem}</Notice> : null}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? 'Please wait…' : `Buy for ${formatMoney(priceInPaise)}`}
      </Button>
      <p className="text-sm text-ink/80">Pay by UPI, card or netbanking. Secured by Razorpay.</p>
    </form>
  );
}
