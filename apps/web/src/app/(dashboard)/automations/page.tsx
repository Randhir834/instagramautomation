'use client';

import { Pencil, Plus, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import { STEP_INFO } from '@/components/automations/StepEditor';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge, EmptyState, ListSkeleton, Notice, Toggle } from '@/components/ui/field';
import {
  type Automation,
  useAutomations,
  useDeleteAutomation,
  useToggleAutomation,
} from '@/hooks/useAutomations';
import { errorMessage } from '@/lib/api';

const TRIGGER_LABEL = {
  COMMENT: 'Comment',
  DM_KEYWORD: 'DM keyword',
  STORY_REPLY: 'Story reply',
} as const;

function AutomationRow({ automation }: { automation: Automation }) {
  const toggle = useToggleAutomation();
  const remove = useDeleteAutomation();
  const error = toggle.error ?? remove.error;
  const where =
    automation.triggerType === 'COMMENT' ? (automation.postId ? 'one post' : 'all posts') : null;

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-start gap-3.5">
          <Toggle
            checked={automation.isActive}
            disabled={toggle.isPending}
            onChange={(isActive) => toggle.mutate({ id: automation.id, isActive })}
            label={`${automation.isActive ? 'Pause' : 'Turn on'} ${automation.name}`}
          />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2">
              <Link
                href={`/automations/${automation.id}`}
                className="font-semibold text-ink underline-offset-4 [overflow-wrap:anywhere] hover:underline"
              >
                {automation.name}
              </Link>
              <Badge tone={automation.isActive ? 'green' : 'neutral'} dot>
                {automation.isActive ? 'On' : 'Paused'}
              </Badge>
            </p>
            <p className="mt-0.5 text-[13px] text-ink-soft">
              {TRIGGER_LABEL[automation.triggerType]}
              {where ? ` on ${where}` : ''} · @{automation.igAccount.username}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/automations/${automation.id}`}>
              <Pencil /> Edit
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${automation.name}`}
            disabled={remove.isPending}
            className="hover:text-brand-dark"
            onClick={() => {
              if (window.confirm(`Delete "${automation.name}"? This cannot be undone.`)) {
                remove.mutate(automation.id);
              }
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-[58px]">
        {automation.keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-md bg-butter-tint px-2 py-0.5 text-[13px] font-semibold text-ink ring-1 ring-inset ring-[#ecd48a] [overflow-wrap:anywhere]"
          >
            {keyword}
          </span>
        ))}
        <span className="mx-1 text-ink-faint" aria-hidden>
          →
        </span>
        <span className="text-[13px] text-ink-soft">
          {automation.steps.map((s) => STEP_INFO[s.type].label).join(', then ')}
        </span>
      </div>
      {error ? (
        <Notice tone="error" className="mt-3">
          {errorMessage(error)}
        </Notice>
      ) : null}
    </div>
  );
}

export default function AutomationsPage() {
  const { data, isLoading, error } = useAutomations();
  const newButton = (
    <Button asChild>
      <Link href="/automations/new">
        <Plus /> New automation
      </Link>
    </Button>
  );
  return (
    <>
      <PageHeader
        title="Automations"
        description="Reply to comments and send DMs automatically."
        actions={data && data.length > 0 ? newButton : undefined}
      />
      {isLoading ? <ListSkeleton /> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState icon={Zap} title="No automations yet" action={newButton}>
          Pick a post and a keyword, write the reply and the DM. It takes a couple of minutes.
        </EmptyState>
      ) : null}
      {data && data.length > 0 ? (
        <Card className="divide-y divide-line">
          {data.map((automation) => (
            <AutomationRow key={automation.id} automation={automation} />
          ))}
        </Card>
      ) : null}
    </>
  );
}
