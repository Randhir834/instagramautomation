import type { Metadata } from 'next';
import { AutomationForm } from '@/components/automations/AutomationForm';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = { title: 'New automation' };

export default function NewAutomationPage() {
  return (
    <>
      <PageHeader
        title="New automation"
        description="Pick a trigger, write your replies, and switch it on."
        back={{ href: '/automations', label: 'Automations' }}
      />
      <AutomationForm />
    </>
  );
}
