import { Check, ChevronLeft, Heart } from 'lucide-react';

/** Visual 1: a phone held in space showing the DM, with the comment that started it. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto h-[640px] w-full max-w-[460px] lg:mx-0 lg:ml-auto">
      {/* Soft colour shapes behind the phone */}
      <div
        className="absolute left-[6%] top-[20%] h-[340px] w-[340px] rounded-full bg-butter/80 blur-[2px]"
        aria-hidden
      />
      <div
        className="absolute bottom-[16%] right-[4%] h-36 w-36 rotate-12 rounded-[2rem] bg-rose/80"
        aria-hidden
      />
      <svg
        viewBox="0 0 100 100"
        className="absolute right-[8%] top-[12%] h-16 w-16 text-sky"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M50 0l9 28 26-14-14 26 29 10-29 10 14 26-26-14-9 28-9-28-26 14 14-26L0 50l29-10-14-26 26 14z"
        />
      </svg>

      {/* The phone */}
      <div className="absolute left-1/2 top-[96px] -translate-x-[46%]">
        <div className="animate-bob">
          <div className="tilt-phone h-[480px] w-[240px] rounded-[2.5rem] bg-ink p-[8px]">
            <div className="flex h-full flex-col overflow-hidden rounded-[2.05rem] bg-paper">
              <div className="flex items-center gap-2 border-b border-line bg-white px-3 pb-2.5 pt-5">
                <ChevronLeft className="h-4 w-4 text-ink-soft" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-butter text-[11px] font-bold">
                  MK
                </span>
                <span className="text-[13px] font-semibold">meera.kneads</span>
              </div>

              <div className="flex-1 space-y-2 px-3 py-3 text-[12.5px] leading-snug">
                <p className="mx-auto w-fit rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] text-ink-soft">
                  Replied to your comment
                </p>
                <p className="w-fit max-w-[86%] rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-xs ring-1 ring-line">
                  Hey Riya! The full course is ₹499. Where should I send lesson one?
                </p>
                <p className="ml-auto w-fit max-w-[86%] rounded-2xl rounded-br-md bg-sky px-3 py-2 text-white">
                  riya.sharma@gmail.com
                </p>
                <p className="w-fit max-w-[86%] rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-xs ring-1 ring-line">
                  Sent! Or grab it right now:
                </p>
                <span className="block w-full rounded-xl bg-ink px-3 py-2 text-center text-[12px] font-semibold text-white">
                  Open the course
                </span>
                <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-sky px-3 py-2 text-white">
                  omg thank you
                </p>
              </div>

              <div className="mx-3 mb-4 rounded-full border border-line bg-white px-3 py-2 text-[11px] text-ink-soft">
                Message…
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The comment that started it */}
      <div className="absolute left-0 top-2 w-[220px] sm:-left-4">
        <div className="animate-bob-slow">
          <div className="-rotate-3 rounded-2xl border border-line bg-white p-3.5 text-[13px] shadow-lift">
            <div className="flex items-start gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-tint text-[11px] font-bold text-rose-dark">
                RS
              </span>
              <p className="leading-snug">
                <span className="font-semibold">riya.s</span> PRICE?? need this before the weekend
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1 pl-[38px] text-[11px] text-ink-soft">
              <Heart className="h-3 w-3" /> 12 · Reply
            </div>
          </div>
        </div>
      </div>

      {/* The lead it produced */}
      <div className="absolute bottom-[60px] left-0 w-[220px] sm:left-2">
        <div className="rotate-2 rounded-2xl bg-moss p-3.5 text-white shadow-lift">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-butter">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> New contact saved
          </p>
          <p className="mt-1 text-[13px]">riya.sharma@gmail.com</p>
        </div>
      </div>

      <p className="absolute bottom-0 right-2 w-56 rotate-2 text-right font-hand text-[22px] leading-6 text-brand-dark">
        nobody typed any of this
      </p>
    </div>
  );
}
