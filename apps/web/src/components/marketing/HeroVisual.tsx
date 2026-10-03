import { Check, ChevronLeft, Heart } from 'lucide-react';

/** Visual 1: a phone tilted in space showing the DM, with the comment that started it. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto h-[690px] w-full max-w-[460px] lg:mx-0 lg:ml-auto">
      {/* Colour shapes behind the phone */}
      <div
        className="absolute left-[8%] top-[18%] h-[340px] w-[340px] rounded-full bg-butter"
        aria-hidden
      />
      <div
        className="absolute bottom-[14%] right-[2%] h-40 w-40 rotate-12 rounded-[2rem] bg-rose"
        aria-hidden
      />
      <svg
        viewBox="0 0 100 100"
        className="absolute right-[6%] top-[11%] h-20 w-20 text-sky"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M50 0l9 28 26-14-14 26 29 10-29 10 14 26-26-14-9 28-9-28-26 14 14-26L0 50l29-10-14-26 26 14z"
        />
      </svg>

      {/* The phone */}
      <div className="absolute left-1/2 top-[104px] -translate-x-[46%]">
        <div className="animate-bob">
          <div className="tilt-phone h-[500px] w-[250px] rounded-[2.6rem] bg-ink p-[9px]">
            <div className="flex h-full flex-col overflow-hidden rounded-[2.1rem] bg-paper">
              <div className="flex items-center gap-2 border-b border-ink/10 bg-white px-3 pb-2.5 pt-4">
                <ChevronLeft className="h-4 w-4 text-ink/75" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-butter text-[11px] font-bold">
                  MK
                </span>
                <span className="text-[13px] font-semibold">meera.kneads</span>
              </div>

              <div className="flex-1 space-y-2 px-3 py-3 text-[12.5px] leading-snug">
                <p className="mx-auto w-fit rounded-full bg-ink/5 px-2 py-0.5 text-[11px] text-ink/75">
                  Replied to your comment
                </p>
                <p className="w-fit max-w-[86%] rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm">
                  Hey Riya! The full course is ₹499. Where should I send lesson one?
                </p>
                <p className="ml-auto w-fit max-w-[86%] rounded-2xl rounded-br-md bg-sky px-3 py-2 text-white">
                  riya.sharma@gmail.com
                </p>
                <p className="w-fit max-w-[86%] rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm">
                  Sent! Or grab it right now:
                </p>
                <span className="block w-full rounded-xl border-2 border-ink bg-butter px-3 py-2 text-center text-[12px] font-bold shadow-[0_3px_0_0_#1a1714]">
                  Open the course
                </span>
                <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-sky px-3 py-2 text-white">
                  omg thank you
                </p>
              </div>

              <div className="mx-3 mb-3 rounded-full border border-ink/15 bg-white px-3 py-2 text-[11px] text-ink/75">
                Message…
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The comment that started it */}
      <div className="absolute left-0 top-0 w-[210px] sm:-left-4">
        <div className="animate-bob-slow">
          <div className="slab -rotate-6 rounded-2xl bg-white p-3 text-[13px]">
            <div className="flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-[11px] font-bold">
                RS
              </span>
              <p className="leading-snug">
                <span className="font-semibold">riya.s</span> PRICE?? need this before the weekend
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1 pl-9 text-[11px] text-ink/75">
              <Heart className="h-3 w-3" /> 12 · Reply
            </div>
          </div>
        </div>
      </div>

      {/* The lead it produced */}
      <div className="absolute bottom-[58px] left-0 w-[215px] sm:left-2">
        <div className="slab rotate-3 rounded-2xl bg-moss p-3 text-paper">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-butter">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> New contact saved
          </p>
          <p className="mt-1 text-[13px]">riya.sharma@gmail.com</p>
        </div>
      </div>

      {/* Margin note */}
      <p className="absolute bottom-0 right-2 w-40 rotate-2 font-hand text-2xl leading-6 text-brand-dark sm:right-0">
        nobody typed any of this
      </p>
    </div>
  );
}
