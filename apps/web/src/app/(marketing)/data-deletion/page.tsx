import type { Metadata } from 'next';
import { DeletionStatus } from '@/components/marketing/DeletionStatus';
import { LegalPage } from '@/components/marketing/LegalPage';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = { title: 'Data Deletion' };

// Required by Meta App Review.
export default function DataDeletionPage() {
  return (
    <LegalPage
      title="Delete your data"
      intro={`You can ask ${APP_NAME} to delete your data at any time. Here is how.`}
    >
      <DeletionStatus />

      <h2>If you are a creator using {APP_NAME}</h2>
      <ol>
        <li>Log in and open “Instagram” in the dashboard.</li>
        <li>
          Press “Disconnect” next to the account. Its access token, automations, contacts and
          message history are deleted straight away.
        </li>
      </ol>

      <h2>From Instagram itself</h2>
      <p>
        In the Instagram app, open Settings, then “Website permissions”, then “Apps and websites”,
        and remove {APP_NAME}. Instagram tells us, and we delete everything linked to that account
        automatically. You get a confirmation code you can check on this page.
      </p>

      <h2>If you messaged a creator who uses {APP_NAME}</h2>
      <p>
        The creator holds your details: your Instagram username and any email or phone number you
        shared with them. Ask them to delete you from their contacts; they can do it in one click.
      </p>
    </LegalPage>
  );
}
