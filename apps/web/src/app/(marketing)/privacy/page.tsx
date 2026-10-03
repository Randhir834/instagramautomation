import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/LegalPage';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = { title: 'Privacy Policy' };

// Required by Meta App Review. Replace with the final, legally reviewed policy before launch.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="Draft — not yet legally reviewed"
      intro={`What ${APP_NAME} collects, why, and how you stay in control of it.`}
    >
      <h2>What we collect</h2>
      <p>
        When you connect an Instagram account, {APP_NAME} receives your Instagram user ID, username
        and an access token. When followers interact with your automations we store their
        Instagram-scoped ID, username, and any email or phone number they choose to share.
      </p>
      <p>
        For your own account we store your name, email address and, if you sell or book through
        {` ${APP_NAME}`}, the details of those orders and bookings.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To run the automations you set up.</li>
        <li>To deliver products you sell and confirm bookings.</li>
        <li>To show you your contacts and activity.</li>
      </ul>
      <p>We do not sell personal data, and we do not use it for advertising.</p>

      <h2>How we protect it</h2>
      <p>
        Instagram access tokens are encrypted before they are stored. Payments are processed by
        Razorpay; we never see or store card details.
      </p>

      <h2>Deleting your data</h2>
      <p>
        See the{' '}
        <Link href="/data-deletion" className="font-medium underline underline-offset-4">
          data deletion page
        </Link>{' '}
        for the ways to remove your data.
      </p>
    </LegalPage>
  );
}
