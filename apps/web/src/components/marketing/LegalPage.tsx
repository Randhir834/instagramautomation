import type { ReactNode } from 'react';

/** Shared layout for privacy, terms and data deletion: a readable column with a title block. */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** Shown under the title, e.g. "Draft — not yet legally reviewed". */
  updated?: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="container max-w-3xl py-14 lg:py-20">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-[40px] font-medium leading-tight tracking-tight sm:text-display-md">
          {title}
        </h1>
        {updated ? <p className="mt-3 text-sm text-ink-soft">{updated}</p> : null}
        {intro ? <div className="mt-5 text-lg leading-relaxed text-ink-soft">{intro}</div> : null}
      </header>
      <div className="space-y-4 pt-8 text-[16px] leading-relaxed text-ink [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
