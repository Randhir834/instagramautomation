'use client';

import { use } from 'react';
import { AutomationForm } from '@/components/automations/AutomationForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { ListSkeleton, Notice } from '@/components/ui/field';
import { useAutomation } from '@/hooks/useAutomations';
import { errorMessage } from '@/lib/api';

export default function EditAutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useAutomation(id);
  return (
    <>
      <PageHeader
        title={data?.name ?? 'Edit automation'}
        description={data ? `Runs on @${data.igAccount.username}` : undefined}
        back={{ href: '/automations', label: 'Automations' }}
      />
      {isLoading ? <ListSkeleton rows={2} /> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {/* key: rebuild the form if the automation is reloaded */}
      {data ? <AutomationForm key={data.id} automation={data} /> : null}
    </>
  );
}
