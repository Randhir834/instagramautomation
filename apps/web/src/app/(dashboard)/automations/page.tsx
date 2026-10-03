'use client';

import Link from 'next/link';
import { STEP_INFO } from '@/components/automations/StepEditor';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Notice } from '@/components/ui/field';
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

  return (
    <li className="rounded-xl border-2 border-ink bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <Link
              href={`/automations/${automation.id}`}
              className="break-words font-display text-xl underline-offset-4 hover:underline"
            >
              {automation.name}
            </Link>
            <Badge tone={automation.isActive ? 'green' : 'neutral'}>
              {automation.isActive ? 'On' : 'Paused'}
            </Badge>
          </p>
          <p className="mt-1 text-sm text-ink/75">
            {TRIGGER_LABEL[automation.triggerType]} on @{automation.igAccount.username}
            {automation.triggerType === 'COMMENT'
              ? automation.postId
                ? ', one post'
                : ', all posts'
              : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={toggle.isPending}
            onClick={() => toggle.mutate({ id: automation.id, isActive: !automation.isActive })}
          >
            {automation.isActive ? 'Pause' : 'Turn on'}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/automations/${automation.id}`}>Edit</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(`Delete "${automation.name}"? This cannot be undone.`)) {
                remove.mutate(automation.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {automation.keywords.map((keyword) => (
          <span
            key={keyword}
            className="break-all rounded-md border-2 border-ink bg-butter px-2 py-0.5 text-sm font-semibold"
          >
            {keyword}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink/75">
        {automation.steps.map((s) => STEP_INFO[s.type].label).join(' → ')}
      </p>
      {error ? (
        <Notice tone="error" className="mt-3">
          {errorMessage(error)}
        </Notice>
      ) : null}
    </li>
  );
}

export default function AutomationsPage() {
  const { data, isLoading, error } = useAutomations();
  return (
    <>
      <PageHeader
        title="Automations"
        description="Reply to comments and send DMs automatically."
        actions={
          <Button asChild>
            <Link href="/automations/new">New automation</Link>
          </Button>
        }
      />
      {isLoading ? <p className="text-ink/75">Loading…</p> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="No automations yet"
          action={
            <Button asChild>
              <Link href="/automations/new">Create your first one</Link>
            </Button>
          }
        >
          Pick a post and a keyword, write the reply and the DM. It takes a couple of minutes.
        </EmptyState>
      ) : null}
      <ul className="space-y-3">
        {data?.map((automation) => (
          <AutomationRow key={automation.id} automation={automation} />
        ))}
      </ul>
    </>
  );
}
