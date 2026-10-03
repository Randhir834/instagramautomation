import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = { title: 'Terms of Service' };

// Replace with the final, legally reviewed terms before launch.
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="Draft — not yet legally reviewed"
      intro={`The rules for using ${APP_NAME}, in plain language.`}
    >
      <h2>Using {APP_NAME}</h2>
      <p>
        You must own, or be allowed to manage, the Instagram accounts you connect. You must also
        follow Instagram’s and Meta’s platform policies, including their messaging rules.
      </p>

      <h2>Plans and payments</h2>
      <p>
        Paid plans renew automatically until you cancel. When you cancel, you keep your plan until
        the end of the period you paid for. Plan limits (automations and monthly DMs) are shown on
        the pricing page.
      </p>

      <h2>Your store</h2>
      <p>
        You are responsible for the products you sell and for delivering what you promise. Payments
        go to your own Razorpay account.
      </p>

      <h2>Fair use</h2>
      <p>
        Don’t use {APP_NAME} to send spam, to mislead people, or to collect data people didn’t agree
        to share. We may suspend accounts that do.
      </p>
    </LegalPage>
  );
}
