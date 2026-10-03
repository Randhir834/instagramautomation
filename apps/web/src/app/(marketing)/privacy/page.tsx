import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = { title: 'Privacy Policy' };

// Required by Meta App Review. TODO(Phase 8): replace this draft with the final,
// legally reviewed policy before submitting the app.
export default function PrivacyPage() {
  return (
    <article className="container max-w-3xl space-y-4 py-16 text-sm leading-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground">Draft. Not yet legally reviewed.</p>

      <h2 className="pt-4 text-lg font-semibold">What we collect</h2>
      <p>
        When you connect an Instagram account, {APP_NAME} receives your Instagram user ID, username
        and an access token. When followers interact with your automations we store their
        Instagram-scoped ID, username and any email or phone number they choose to share.
      </p>

      <h2 className="pt-4 text-lg font-semibold">How we use it</h2>
      <p>
        Only to run the automations you set up, deliver products you sell, and show you your
        contacts and activity. We do not sell personal data.
      </p>

      <h2 className="pt-4 text-lg font-semibold">How we protect it</h2>
      <p>Instagram access tokens are encrypted at rest. Payments are processed by Razorpay.</p>

      <h2 className="pt-4 text-lg font-semibold">Deleting your data</h2>
      <p>
        See the{' '}
        <a className="underline" href="/data-deletion">
          data deletion page
        </a>
        .
      </p>
    </article>
  );
}
