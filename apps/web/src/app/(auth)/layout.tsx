import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { Brand } from '@/components/layout/Brand';

const POINTS = [
  'Reply to every comment and DM the link, automatically',
  'Collect emails and phone numbers in the chat',
  'Sell downloads, take bookings and send invoices',
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-paper text-ink lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Brand />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>

      {/* Product panel, wide screens only */}
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="grid-lines absolute inset-0 opacity-[0.07] invert" aria-hidden />
        <div className="relative">
          <p className="max-w-md font-display text-[40px] font-medium leading-[1.1] tracking-tight">
            They comment <span className="italic text-butter">price</span>. The link is already in
            their DMs.
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-white/85">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3 w-3 text-butter" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* A slice of a DM conversation */}
        <div className="relative mt-12 max-w-sm space-y-2.5 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
          <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-sm text-ink">
            Hey Riya! The full course is ₹499. Where should I send lesson one?
          </p>
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-sky px-3.5 py-2 text-sm text-white">
            riya.sharma@gmail.com
          </p>
          <p className="flex items-center gap-2 pt-1 text-[13px] font-medium text-butter">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> New contact saved
          </p>
        </div>
      </aside>
    </div>
  );
}
