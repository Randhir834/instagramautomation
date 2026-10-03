'use client';

import {
  createAutomationSchema,
  type MatchType,
  type TriggerType,
  updateAutomationSchema,
} from '@repo/shared';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState, Field, Notice, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAccounts } from '@/hooks/useAccounts';
import { type Automation, type AutomationPayload, useSaveAutomation } from '@/hooks/useAutomations';
import { errorMessage } from '@/lib/api';
import { KeywordInput } from './KeywordInput';
import { PostPicker } from './PostPicker';
import { emptyStep, newKey, type StepDraft, StepEditor } from './StepEditor';

const TRIGGERS: { value: TriggerType; label: string; help: string }[] = [
  { value: 'COMMENT', label: 'A comment on a post', help: 'The classic comment-to-DM.' },
  { value: 'DM_KEYWORD', label: 'A DM to you', help: 'They message you a keyword.' },
  {
    value: 'STORY_REPLY',
    label: 'A reply to your story',
    help: 'A story reply with a keyword.',
  },
];

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border-2 border-ink bg-white p-5">
      <h2 className="mb-4 flex items-center gap-3 font-display text-xl">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-butter text-base">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Step-by-step builder: account, trigger, keywords, public reply, DM steps. */
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
        title="Connect Instagram first"
        action={
          <Button asChild>
            <Link href="/accounts">Go to Instagram accounts</Link>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Section n={1} title="When this happens">
        <div className="space-y-4">
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

          <Field label="Trigger" htmlFor="trigger">
            <Select
              id="trigger"
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as TriggerType)}
            >
              {TRIGGERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>

          {isComment && accountId ? (
            <Field label="On which post?">
              <PostPicker igAccountId={accountId} value={postId} onChange={setPostId} />
            </Field>
          ) : null}

          <Field
            label="With one of these keywords"
            htmlFor="keywords"
            hint="Type a word and press Enter. Capital letters do not matter."
            error={errors.keywords}
          >
            <KeywordInput
              id="keywords"
              value={keywords}
              onChange={setKeywords}
              placeholder="price, link, how much"
            />
          </Field>

          <Field
            label="How strict?"
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
            >
              <option value="CONTAINS">Contains the keyword</option>
              <option value="EXACT">Is exactly the keyword</option>
            </Select>
          </Field>
        </div>
      </Section>

      {isComment ? (
        <Section n={2} title="Reply publicly under the comment">
          <p className="mb-3 text-sm text-ink/75">
            Optional. Add a few versions and we pick one at random each time, so your comments do
            not all look the same.
          </p>
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
                  aria-label={`Remove public reply ${i + 1}`}
                  onClick={() => setPublicReplies(publicReplies.filter((_, j) => j !== i))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {publicReplies.length < 10 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setPublicReplies([...publicReplies, ''])}
            >
              <Plus className="h-4 w-4" /> Add a version
            </Button>
          ) : null}
        </Section>
      ) : null}

      <Section n={isComment ? 3 : 2} title="Then send these in their DMs">
        <p className="mb-4 text-sm text-ink/75">
          {isComment
            ? 'Step 1 is sent straight away. Instagram only lets us send the next steps after the person replies, so each later step goes out when they answer.'
            : 'Steps are sent in order. A step that asks something waits for their answer.'}
        </p>
        {errors.steps ? (
          <Notice tone="error" className="mb-3">
            {errors.steps}
          </Notice>
        ) : null}
        <StepEditor
          steps={steps}
          onChange={setSteps}
          errors={stepErrors}
          firstIsPrivateReply={isComment}
        />
      </Section>

      <Section n={isComment ? 4 : 3} title="Name it">
        <Field label="Name" htmlFor="name" hint="Only you see this." error={errors.name}>
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
        <Notice tone="error">Some things need fixing above before this can be saved.</Notice>
      ) : null}
      {save.isError ? <Notice tone="error">{errorMessage(save.error)}</Notice> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : automation ? 'Save changes' : 'Turn it on'}
        </Button>
        <Button type="button" variant="outline" size="lg" asChild>
          <Link href="/automations">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
