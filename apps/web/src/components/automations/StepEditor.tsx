'use client';

import type { StepType } from '@repo/shared';
import {
  ArrowDown,
  ArrowUp,
  AtSign,
  Phone,
  Plus,
  MessageSquare,
  MousePointerClick,
  Trash2,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface StepDraft {
  /** Stable key for React; not sent to the server. */
  key: string;
  type: StepType;
  payload: Record<string, unknown>;
}

export const STEP_INFO: Record<
  StepType,
  { label: string; help: string; icon: LucideIcon; tint: string }
> = {
  SEND_MESSAGE: {
    label: 'Send a message',
    help: 'Text, with a link if you like',
    icon: MessageSquare,
    tint: 'bg-sky-tint text-sky-dark',
  },
  QUICK_REPLIES: {
    label: 'Message with buttons',
    help: 'They tap a button to continue',
    icon: MousePointerClick,
    tint: 'bg-butter-tint text-butter-dark',
  },
  FOLLOW_GATE: {
    label: 'Ask to follow first',
    help: 'Continues once they follow you',
    icon: UserPlus,
    tint: 'bg-rose-tint text-rose-dark',
  },
  COLLECT_EMAIL: {
    label: 'Ask for their email',
    help: 'Saved to your contacts',
    icon: AtSign,
    tint: 'bg-moss-tint text-moss-dark',
  },
  COLLECT_PHONE: {
    label: 'Ask for their phone',
    help: 'Saved to your contacts',
    icon: Phone,
    tint: 'bg-moss-tint text-moss-dark',
  },
};

let keySeq = 0;
export const newKey = () => `step-${Date.now()}-${keySeq++}`;

export function emptyStep(type: StepType): StepDraft {
  const payloads: Record<StepType, Record<string, unknown>> = {
    SEND_MESSAGE: { text: '' },
    QUICK_REPLIES: { text: '', buttons: [{ title: '' }] },
    FOLLOW_GATE: { promptText: 'Follow me first, then tap the button and I will send it.' },
    COLLECT_EMAIL: { promptText: 'What email should I send it to?' },
    COLLECT_PHONE: { promptText: 'What number can I reach you on?' },
  };
  return { key: newKey(), type, payload: payloads[type] };
}

interface StepEditorProps {
  steps: StepDraft[];
  onChange: (steps: StepDraft[]) => void;
  /** Error messages keyed by "<stepIndex>.<field>", from validation. */
  errors: Record<string, string>;
  /** True when the first step goes out as the reply to a comment. */
  firstIsPrivateReply: boolean;
}

/** Ordered list of DM steps with add, remove and reorder. */
export function StepEditor({ steps, onChange, errors, firstIsPrivateReply }: StepEditorProps) {
  const update = (index: number, payload: Record<string, unknown>) =>
    onChange(
      steps.map((s, i) => (i === index ? { ...s, payload: { ...s.payload, ...payload } } : s)),
    );
  const move = (index: number, by: -1 | 1) => {
    const next = [...steps];
    const [step] = next.splice(index, 1);
    if (step) next.splice(index + by, 0, step);
    onChange(next);
  };

  return (
    <div>
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const info = STEP_INFO[step.type];
          const Icon = info.icon;
          const text = (field: string) => (step.payload[field] as string | undefined) ?? '';
          const err = (field: string) => errors[`${index}.${field}`];
          const buttons = (step.payload.buttons as { title: string }[] | undefined) ?? [];
          const id = (field: string) => `${step.key}-${field}`;

          return (
            <li key={step.key} className="relative rounded-xl border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
                <p className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-white">
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                      info.tint,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {info.label}
                </p>
                <div className="flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Move step up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="disabled:bg-transparent disabled:opacity-40"
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Move step down"
                    disabled={index === steps.length - 1}
                    onClick={() => move(index, 1)}
                    className="disabled:bg-transparent disabled:opacity-40"
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove step"
                    disabled={steps.length === 1}
                    onClick={() => onChange(steps.filter((_, i) => i !== index))}
                    className="hover:text-brand-dark disabled:bg-transparent disabled:opacity-40"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {index === 0 && firstIsPrivateReply && step.type !== 'SEND_MESSAGE' ? (
                  <p className="rounded-lg bg-butter-tint px-3 py-2 text-[13px] text-ink">
                    Instagram only allows plain text in the first DM after a comment, so this
                    step&apos;s buttons appear once they reply.
                  </p>
                ) : null}

                {step.type === 'SEND_MESSAGE' || step.type === 'QUICK_REPLIES' ? (
                  <Field
                    label="Message"
                    htmlFor={id('text')}
                    error={err('text')}
                    aside={`${text('text').length}/900`}
                  >
                    <Textarea
                      id={id('text')}
                      value={text('text')}
                      maxLength={900}
                      aria-invalid={Boolean(err('text')) || undefined}
                      onChange={(e) => update(index, { text: e.target.value })}
                      placeholder="Here you go! The link is…"
                    />
                  </Field>
                ) : (
                  <Field
                    label="What to ask"
                    htmlFor={id('promptText')}
                    error={err('promptText')}
                    hint={
                      step.type === 'FOLLOW_GATE'
                        ? 'They get an “I followed” button. We check before continuing.'
                        : 'If the answer is not valid, we politely ask again.'
                    }
                  >
                    <Textarea
                      id={id('promptText')}
                      value={text('promptText')}
                      maxLength={900}
                      aria-invalid={Boolean(err('promptText')) || undefined}
                      onChange={(e) => update(index, { promptText: e.target.value })}
                    />
                  </Field>
                )}

                {step.type === 'QUICK_REPLIES' ? (
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-ink">
                      Buttons{' '}
                      <span className="font-normal text-ink-soft">· up to 20 characters</span>
                    </p>
                    <div className="space-y-2">
                      {buttons.map((button, b) => (
                        <div key={b} className="flex gap-2">
                          <Input
                            value={button.title}
                            maxLength={20}
                            aria-label={`Button ${b + 1}`}
                            placeholder={b === 0 ? 'Yes please' : 'Maybe later'}
                            onChange={(e) =>
                              update(index, {
                                buttons: buttons.map((x, i) =>
                                  i === b ? { title: e.target.value } : x,
                                ),
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-1 disabled:bg-transparent disabled:opacity-40"
                            aria-label={`Remove button ${b + 1}`}
                            disabled={buttons.length === 1}
                            onClick={() =>
                              update(index, { buttons: buttons.filter((_, i) => i !== b) })
                            }
                          >
                            <X />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {err('buttons') ? (
                      <p role="alert" className="mt-1.5 text-[13px] font-medium text-brand-dark">
                        {err('buttons')}
                      </p>
                    ) : null}
                    {buttons.length < 10 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 -ml-2"
                        onClick={() => update(index, { buttons: [...buttons, { title: '' }] })}
                      >
                        <Plus /> Add button
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {steps.length < 10 ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-ink">Add a step</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(STEP_INFO) as StepType[]).map((type) => {
              const info = STEP_INFO[type];
              const Icon = info.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange([...steps, emptyStep(type)])}
                  className="group flex items-center gap-3 rounded-[10px] border border-dashed border-line-strong bg-white/60 px-3 py-2.5 text-left transition-colors hover:border-ink/40 hover:bg-white"
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                      info.tint,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{info.label}</span>
                    <span className="block text-[13px] text-ink-soft">{info.help}</span>
                  </span>
                  <Plus className="ml-auto h-4 w-4 shrink-0 text-ink-soft group-hover:text-ink" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
