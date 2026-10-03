'use client';

import type { TriggerType } from '@repo/shared';
import { cn } from '@/lib/utils';
import type { StepDraft } from './StepEditor';

interface FlowPreviewProps {
  username: string;
  triggerType: TriggerType;
  keyword: string | undefined;
  publicReply: string | undefined;
  steps: StepDraft[];
}

function Bubble({ from, children }: { from: 'them' | 'you'; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[13px] leading-snug [overflow-wrap:anywhere]',
        from === 'you'
          ? 'rounded-bl-md bg-white text-ink shadow-xs ring-1 ring-line'
          : 'ml-auto rounded-br-md bg-sky text-white',
      )}
    >
      {children}
    </div>
  );
}

const placeholder = (text: string) => <span className="italic opacity-70">{text}</span>;

/** A small phone that shows what the follower will see, updating as the form changes. */
export function FlowPreview({
  username,
  triggerType,
  keyword,
  publicReply,
  steps,
}: FlowPreviewProps) {
  const word = keyword || 'price';
  const isComment = triggerType === 'COMMENT';

  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[2.2rem] bg-ink p-2 shadow-lift">
      <div className="overflow-hidden rounded-[1.8rem] bg-paper">
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 pb-2.5 pt-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-butter text-[11px] font-bold">
            {username.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 text-[13px] font-semibold [overflow-wrap:anywhere]">
            {username}
          </span>
        </div>

        <div className="space-y-2 px-3 py-3">
          {isComment ? (
            <div className="rounded-xl bg-white p-2.5 shadow-xs ring-1 ring-line">
              <p className="text-[12px] leading-snug">
                <span className="font-semibold">a.follower</span> {word.toUpperCase()}?? please
              </p>
              {publicReply ? (
                <p className="mt-1.5 border-l-2 border-line pl-2 text-[12px] leading-snug text-ink-soft">
                  <span className="font-semibold text-ink">{username}</span> {publicReply}
                </p>
              ) : null}
            </div>
          ) : (
            <Bubble from="them">
              {triggerType === 'STORY_REPLY' ? `Replied to your story: ${word}` : word}
            </Bubble>
          )}

          {isComment ? (
            <p className="py-1 text-center text-[11px] font-medium text-ink-soft">Direct message</p>
          ) : null}

          {steps.map((step, i) => {
            const p = step.payload as Record<string, unknown>;
            const text = (p.text ?? p.promptText) as string | undefined;
            const buttons =
              (p.buttons as { title: string }[] | undefined)?.filter((b) => b.title) ?? [];
            const showButtons = !(isComment && i === 0);
            return (
              <div key={step.key} className="space-y-1.5">
                <Bubble from="you">{text ? text : placeholder('Your message appears here')}</Bubble>
                {showButtons && step.type === 'QUICK_REPLIES' && buttons.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {buttons.map((b, j) => (
                      <span
                        key={j}
                        className="rounded-full border border-sky/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-dark"
                      >
                        {b.title}
                      </span>
                    ))}
                  </div>
                ) : null}
                {showButtons && step.type === 'FOLLOW_GATE' ? (
                  <span className="inline-block rounded-full border border-sky/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-dark">
                    {(p.buttonTitle as string) || 'I followed'}
                  </span>
                ) : null}
                {i < steps.length - 1 && step.type !== 'SEND_MESSAGE' ? (
                  <Bubble from="them">
                    {step.type === 'COLLECT_EMAIL'
                      ? 'name@example.com'
                      : step.type === 'COLLECT_PHONE'
                        ? '98765 43210'
                        : step.type === 'FOLLOW_GATE'
                          ? (p.buttonTitle as string) || 'I followed'
                          : buttons[0]?.title || 'Yes'}
                  </Bubble>
                ) : null}
                {i === 0 && isComment && steps.length > 1 && step.type === 'SEND_MESSAGE' ? (
                  <Bubble from="them">Thanks!</Bubble>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
