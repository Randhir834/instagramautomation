'use client';

import { checkoutSchema } from '@repo/shared';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <Card className="p-6 md:sticky md:top-8">
      <form onSubmit={handleBuy} className="space-y-4" noValidate>
        <p className="font-display text-[40px] font-medium leading-none tracking-tight">
          {formatMoney(priceInPaise)}
        </p>
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
            aria-invalid={Boolean(fieldError) || undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Your name" htmlFor="buyerName" aside="Optional">
          <Input
            id="buyerName"
            autoComplete="name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        {problem ? <Notice tone="error">{problem}</Notice> : null}
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Please wait…' : `Buy for ${formatMoney(priceInPaise)}`}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[13px] text-ink-soft">
          <Lock className="h-3.5 w-3.5" /> UPI, cards and netbanking · secured by Razorpay
        </p>
      </form>
    </Card>
  );
}
