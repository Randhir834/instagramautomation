'use client';

import { use } from 'react';
import { AutomationForm } from '@/components/automations/AutomationForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Notice } from '@/components/ui/field';
import { useAutomation } from '@/hooks/useAutomations';
import { errorMessage } from '@/lib/api';

export default function EditAutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useAutomation(id);
  return (
    <>
      <PageHeader
        title="Edit automation"
        description={data ? `@${data.igAccount.username}` : undefined}
      />
      {isLoading ? <p className="text-ink/75">Loading…</p> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {/* key: rebuild the form if the automation is reloaded */}
      {data ? <AutomationForm key={data.id} automation={data} /> : null}
    </>
  );
}
