'use client';

import type { StepType } from '@repo/shared';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export interface StepDraft {
  /** Stable key for React; not sent to the server. */
  key: string;
  type: StepType;
  payload: Record<string, unknown>;
}

export const STEP_INFO: Record<StepType, { label: string; help: string }> = {
  SEND_MESSAGE: { label: 'Send a message', help: 'A text message, with a link if you like.' },
  QUICK_REPLIES: { label: 'Message with buttons', help: 'They tap a button to continue.' },
  FOLLOW_GATE: { label: 'Ask to follow first', help: 'Continues only once they follow you.' },
  COLLECT_EMAIL: { label: 'Ask for their email', help: 'Saved to your contacts.' },
  COLLECT_PHONE: { label: 'Ask for their phone', help: 'Saved to your contacts.' },
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
    <div className="space-y-4">
      {steps.map((step, index) => {
        const text = (field: string) => (step.payload[field] as string | undefined) ?? '';
        const err = (field: string) => errors[`${index}.${field}`];
        const buttons = (step.payload.buttons as { title: string }[] | undefined) ?? [];
        const id = (field: string) => `${step.key}-${field}`;

        return (
          <div key={step.key} className="rounded-xl border-2 border-ink bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-semibold">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-white">
                  {index + 1}
                </span>
                {STEP_INFO[step.type].label}
              </p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move step up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move step down"
                  disabled={index === steps.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove step"
                  disabled={steps.length === 1}
                  onClick={() => onChange(steps.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {index === 0 && firstIsPrivateReply && step.type !== 'SEND_MESSAGE' ? (
              <p className="mb-3 rounded-lg bg-butter-tint px-3 py-2 text-sm">
                Instagram only allows plain text in the first DM after a comment, so buttons on this
                step appear from the second message on.
              </p>
            ) : null}

            {step.type === 'SEND_MESSAGE' || step.type === 'QUICK_REPLIES' ? (
              <Field label="Message" htmlFor={id('text')} error={err('text')}>
                <Textarea
                  id={id('text')}
                  value={text('text')}
                  maxLength={900}
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
                    : 'If the answer is not valid, we ask once more.'
                }
              >
                <Textarea
                  id={id('promptText')}
                  value={text('promptText')}
                  maxLength={900}
                  onChange={(e) => update(index, { promptText: e.target.value })}
                />
              </Field>
            )}

            {step.type === 'QUICK_REPLIES' ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">Buttons (up to 20 characters each)</p>
                {buttons.map((button, b) => (
                  <div key={b} className="flex gap-2">
                    <Input
                      value={button.title}
                      maxLength={20}
                      aria-label={`Button ${b + 1}`}
                      placeholder="Yes please"
                      onChange={(e) =>
                        update(index, {
                          buttons: buttons.map((x, i) => (i === b ? { title: e.target.value } : x)),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove button ${b + 1}`}
                      disabled={buttons.length === 1}
                      onClick={() => update(index, { buttons: buttons.filter((_, i) => i !== b) })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {err('buttons') ? (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {err('buttons')}
                  </p>
                ) : null}
                {buttons.length < 10 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => update(index, { buttons: [...buttons, { title: '' }] })}
                  >
                    <Plus className="h-4 w-4" /> Add button
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}

      {steps.length < 10 ? (
        <div className="rounded-xl border-2 border-dashed border-ink/30 p-4">
          <p className="mb-3 text-sm font-semibold">Add another step</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STEP_INFO) as StepType[]).map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                title={STEP_INFO[type].help}
                onClick={() => onChange([...steps, emptyStep(type)])}
              >
                <Plus className="h-4 w-4" /> {STEP_INFO[type].label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
