import type { Metadata } from 'next';
import { AutomationForm } from '@/components/automations/AutomationForm';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = { title: 'New automation' };

export default function NewAutomationPage() {
  return (
    <>
      <PageHeader
        title="New automation"
        description="Pick a post, set keywords and write your replies."
      />
      <AutomationForm />
    </>
  );
}
