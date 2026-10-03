import { Download } from 'lucide-react';

function BookingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`slab rounded-2xl bg-sky p-4 text-white ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-white">Book a call</p>
      <p className="mt-1 font-display text-xl leading-tight">30 min with Meera</p>
      <div className="mt-4 grid grid-cols-2 gap-1.5 text-xs font-semibold">
        <span className="rounded-md bg-sky-dark px-2 py-1.5 text-center text-white line-through">
          Tue 4:00
        </span>
        <span className="rounded-md bg-white px-2 py-1.5 text-center text-ink">Tue 4:30</span>
        <span className="rounded-md bg-white px-2 py-1.5 text-center text-ink">Thu 11:00</span>
        <span className="rounded-md bg-sky-dark px-2 py-1.5 text-center text-white line-through">
          Sat 6:00
        </span>
      </div>
    </div>
  );
}

function InvoiceCard({ className = '' }: { className?: string }) {
  return (
    <div className={`slab rounded-2xl bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-lg">Invoice #014</span>
        <span className="rounded-full bg-moss px-2 py-0.5 text-[11px] font-bold text-white">
          PAID
        </span>
      </div>
      <div className="mt-4 space-y-1.5 border-t-2 border-dashed border-ink/30 pt-3 text-xs">
        <p className="flex justify-between gap-2 text-ink/75">
          <span>1 reel + 2 stories</span>
          <span>₹18,000</span>
        </p>
        <p className="flex justify-between gap-2 text-ink/75">
          <span>GST 18%</span>
          <span>₹3,240</span>
        </p>
        <p className="flex justify-between gap-2 pt-1 text-sm font-bold">
          <span>Total</span>
          <span>₹21,240</span>
        </p>
      </div>
    </div>
  );
}

function ProductCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border-2 border-ink bg-butter p-3 ${className}`}
      style={{ boxShadow: '0 9px 0 0 #1a1714, 0 30px 30px rgba(26,23,20,.22)' }}
    >
      <div className="flex aspect-[4/3] items-end rounded-xl bg-moss p-3">
        <p className="font-display text-lg leading-tight text-paper">
          Sourdough,
          <br />
          start to finish
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <span className="font-display text-2xl">₹499</span>
        <span className="text-xs text-ink/80">Video course</span>
      </div>
      <span className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border-2 border-ink bg-brand py-2 text-[13px] font-bold text-white shadow-[0_3px_0_0_#1a1714]">
        <Download className="h-3.5 w-3.5 shrink-0" /> Buy and download
      </span>
    </div>
  );
}

/** Visual 3: product, booking and invoice cards. A 3D fan on wide screens, a readable stack on phones. */
export function MoneyCards() {
  return (
    <>
      {/* Phones: full-size cards, slightly scattered */}
      <div className="mx-auto w-full max-w-[300px] space-y-5 sm:hidden">
        <ProductCard className="mx-auto w-[86%] -rotate-1" />
        <BookingCard className="mr-auto w-[86%] rotate-1" />
        <InvoiceCard className="ml-auto w-[86%] -rotate-1" />
      </div>

      {/* Wider screens: a fan of cards standing in space */}
      <div className="relative mx-auto hidden h-[400px] w-full max-w-[540px] sm:block">
        <div className="absolute left-0 top-14 z-10">
          <BookingCard className="fan-left w-[205px]" />
        </div>
        <div className="absolute right-0 top-16 z-10">
          <InvoiceCard className="fan-right w-[205px]" />
        </div>
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="animate-bob">
            <ProductCard className="w-[205px]" />
          </div>
        </div>
      </div>
    </>
  );
}
