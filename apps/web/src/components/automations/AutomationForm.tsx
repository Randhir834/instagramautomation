'use client';

import {
  createAutomationSchema,
  type MatchType,
  type TriggerType,
  updateAutomationSchema,
} from '@repo/shared';
import { AtSign, Instagram, MessageCircle, Plus, X, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, Field, Notice, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAccounts } from '@/hooks/useAccounts';
import { type Automation, type AutomationPayload, useSaveAutomation } from '@/hooks/useAutomations';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { FlowPreview } from './FlowPreview';
import { KeywordInput } from './KeywordInput';
import { PostPicker } from './PostPicker';
import { emptyStep, newKey, type StepDraft, StepEditor } from './StepEditor';

const TRIGGERS: { value: TriggerType; label: string; help: string; icon: LucideIcon }[] = [
  { value: 'COMMENT', label: 'Comment', help: 'On a post or reel', icon: MessageCircle },
  { value: 'DM_KEYWORD', label: 'DM', help: 'Sent to your inbox', icon: AtSign },
  { value: 'STORY_REPLY', label: 'Story reply', help: 'A reply to a story', icon: Instagram },
];

function Section({
  n,
  title,
  description,
  children,
}: {
  n: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper-deep text-xs font-bold text-ink">
          {n}
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-ink-soft">{description}</p> : null}
        </div>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </Card>
  );
}

/** Step-by-step builder with a live preview of what the follower receives. */
export function AutomationForm({ automation }: { automation?: Automation }) {
  const router = useRouter();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const save = useSaveAutomation(automation?.id);

  const [igAccountId, setIgAccountId] = useState(automation?.igAccountId ?? '');
  const [name, setName] = useState(automation?.name ?? '');
  const [triggerType, setTriggerType] = useState<TriggerType>(automation?.triggerType ?? 'COMMENT');
  const [postId, setPostId] = useState<string | null>(automation?.postId ?? null);
  const [keywords, setKeywords] = useState<string[]>(automation?.keywords ?? []);
  const [matchType, setMatchType] = useState<MatchType>(automation?.matchType ?? 'CONTAINS');
  const [publicReplies, setPublicReplies] = useState<string[]>(
    automation?.publicReplies ?? ['Sent it to your DMs!'],
  );
  const [steps, setSteps] = useState<StepDraft[]>(
    automation?.steps.map((s) => ({ key: newKey(), type: s.type, payload: s.payload })) ?? [
      emptyStep('SEND_MESSAGE'),
    ],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const active = accounts?.filter((a) => a.isActive) ?? [];
  const accountId = igAccountId || active[0]?.id || '';
  const account = accounts?.find((a) => a.id === (automation?.igAccountId ?? accountId));
  const isComment = triggerType === 'COMMENT';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: AutomationPayload = {
      name: name.trim() || (keywords[0] ? `“${keywords[0]}” automation` : ''),
      triggerType,
      postId: isComment ? postId : null,
      keywords,
      matchType,
      publicReplies: isComment ? publicReplies.map((r) => r.trim()).filter(Boolean) : [],
      steps: steps.map(({ type, payload: p }) => ({ type, payload: p })),
    };
    const result = automation
      ? updateAutomationSchema.safeParse(payload)
      : createAutomationSchema.safeParse({ ...payload, igAccountId: accountId });

    if (!result.success) {
      const found: Record<string, string> = {};
      for (const issue of result.error.issues) {
        // steps.2.payload.text -> "steps.2.text"; buttons.0.title -> "steps.2.buttons"
        const path = issue.path
          .filter((p) => p !== 'payload')
          .slice(0, 3)
          .join('.');
        found[path] ??= issue.message;
      }
      setErrors(found);
      return;
    }
    setErrors({});
    save.mutate(automation ? payload : { ...payload, igAccountId: accountId }, {
      onSuccess: () => router.push('/automations'),
    });
  }

  if (!automation && !loadingAccounts && active.length === 0) {
    return (
      <EmptyState
        icon={Instagram}
        title="Connect Instagram first"
        action={
          <Button asChild>
            <Link href="/accounts">Go to Instagram</Link>
          </Button>
        }
      >
        An automation runs on one of your connected Instagram accounts.
      </EmptyState>
    );
  }

  const stepErrors = Object.fromEntries(
    Object.entries(errors)
      .filter(([path]) => path.startsWith('steps.'))
      .map(([path, message]) => [path.replace('steps.', ''), message]),
  );
  const hasErrors = Object.keys(errors).length > 0;
  let n = 0;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div className="min-w-0 space-y-5">
        <Section n={++n} title="Trigger" description="What should start this automation?">
          {!automation && active.length > 1 ? (
            <Field label="Instagram account" htmlFor="account" error={errors.igAccountId}>
              <Select
                id="account"
                value={accountId}
                onChange={(e) => setIgAccountId(e.target.value)}
              >
                {active.map((a) => (
                  <option key={a.id} value={a.id}>
                    @{a.username}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink" id="trigger-label">
              When someone sends a
            </p>
            <div
              className="grid gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-labelledby="trigger-label"
            >
              {TRIGGERS.map((t) => {
                const selected = triggerType === t.value;
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTriggerType(t.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow]',
                      selected
                        ? 'border-brand bg-brand-tint/50 ring-4 ring-brand/10'
                        : 'border-line-strong bg-white hover:border-[#bfb6a6]',
                    )}
                  >
                    <Icon
                      className={cn('h-4 w-4 shrink-0', selected ? 'text-brand' : 'text-ink-soft')}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{t.label}</span>
                      <span className="block text-[13px] text-ink-soft">{t.help}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {isComment && accountId ? (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">On which post</p>
              <PostPicker igAccountId={accountId} value={postId} onChange={setPostId} />
            </div>
          ) : null}

          <Field
            label="Containing a keyword"
            htmlFor="keywords"
            hint="Press Enter after each one. Capital letters don’t matter."
            error={errors.keywords}
          >
            <KeywordInput
              id="keywords"
              value={keywords}
              onChange={setKeywords}
              placeholder="price, link, how much"
              invalid={Boolean(errors.keywords)}
            />
          </Field>

          <Field
            label="Match"
            htmlFor="match"
            hint={
              matchType === 'CONTAINS'
                ? '“What is the PRICE?” matches “price”.'
                : 'Only a message that is just “price” matches.'
            }
          >
            <Select
              id="match"
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as MatchType)}
              className="sm:max-w-xs"
            >
              <option value="CONTAINS">Contains the keyword</option>
              <option value="EXACT">Is exactly the keyword</option>
            </Select>
          </Field>
        </Section>

        {isComment ? (
          <Section
            n={++n}
            title="Public reply"
            description="Optional. We rotate between versions so your comments look natural."
          >
            <div className="space-y-2">
              {publicReplies.map((reply, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={reply}
                    maxLength={300}
                    aria-label={`Public reply ${i + 1}`}
                    placeholder="Sent it to your DMs!"
                    onChange={(e) =>
                      setPublicReplies(publicReplies.map((r, j) => (j === i ? e.target.value : r)))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-1"
                    aria-label={`Remove public reply ${i + 1}`}
                    onClick={() => setPublicReplies(publicReplies.filter((_, j) => j !== i))}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            {publicReplies.length < 10 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2"
                onClick={() => setPublicReplies([...publicReplies, ''])}
              >
                <Plus /> Add a version
              </Button>
            ) : null}
          </Section>
        ) : null}

        <Section
          n={++n}
          title="Direct messages"
          description={
            isComment
              ? 'Step 1 goes out right away. Instagram only allows the next steps after they reply.'
              : 'Sent in order. Steps that ask a question wait for the answer.'
          }
        >
          {errors.steps ? <Notice tone="error">{errors.steps}</Notice> : null}
          <StepEditor
            steps={steps}
            onChange={setSteps}
            errors={stepErrors}
            firstIsPrivateReply={isComment}
          />
        </Section>

        <Section n={++n} title="Name">
          <Field
            label="Automation name"
            htmlFor="name"
            hint="Only you see this."
            error={errors.name}
          >
            <Input
              id="name"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sourdough course reel"
            />
          </Field>
        </Section>

        {hasErrors ? (
          <Notice tone="error">A few things need fixing above before this can be saved.</Notice>
        ) : null}
        {save.isError ? <Notice tone="error">{errorMessage(save.error)}</Notice> : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Button type="submit" size="lg" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : automation ? 'Save changes' : 'Turn it on'}
          </Button>
          <Button type="button" variant="ghost" size="lg" asChild>
            <Link href="/automations">Cancel</Link>
          </Button>
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-8">
          <p className="mb-3 text-center text-[13px] font-medium text-ink-soft">Live preview</p>
          <FlowPreview
            username={account?.username ?? 'you'}
            triggerType={triggerType}
            keyword={keywords[0]}
            publicReply={isComment ? publicReplies.find((r) => r.trim()) : undefined}
            steps={steps}
          />
        </div>
      </aside>
    </form>
  );
}
