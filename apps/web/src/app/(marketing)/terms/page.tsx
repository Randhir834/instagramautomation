import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = { title: 'Terms of Service' };

// TODO(Phase 8): replace this draft with the final, legally reviewed terms.
export default function TermsPage() {
  return (
    <article className="container max-w-3xl space-y-4 py-16 text-sm leading-6">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground">Draft. Not yet legally reviewed.</p>

      <h2 className="pt-4 text-lg font-semibold">Using {APP_NAME}</h2>
      <p>
        You must own or be authorised to manage the Instagram accounts you connect, and you must
        follow Instagram&apos;s and Meta&apos;s platform policies, including their messaging rules.
      </p>

      <h2 className="pt-4 text-lg font-semibold">Plans and payments</h2>
      <p>
        Paid plans renew automatically until cancelled. Plan limits (automations and monthly DMs)
        are shown on the pricing page.
      </p>

      <h2 className="pt-4 text-lg font-semibold">Your store</h2>
      <p>You are responsible for the products you sell and for delivering what you promise.</p>
    </article>
  );
}
