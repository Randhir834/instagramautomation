import { PLAN_LIMITS } from '@repo/shared';
import { Check } from 'lucide-react';
import type { Metadata } from 'next';
import { PushButton } from '@/components/marketing/PushButton';
import { cn, formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Pricing' };

const limit = (n: number | null) => (n === null ? 'Unlimited' : formatNumber(n));

// Prices for the paid plans are not final, so none are shown yet.
const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: '₹0',
    per: '/ month',
    note: 'For your first launches.',
    extras: ['Public replies, buttons, email capture', 'Store, bookings and invoices'],
    featured: false,
    cta: 'Start free',
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 'Coming soon',
    per: '',
    note: 'For when reels start taking off.',
    extras: ['Everything in Free', 'Priority support'],
    featured: true,
    cta: 'Start free, upgrade later',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 'Coming soon',
    per: '',
    note: 'For full-time creators and teams.',
    extras: ['Everything in Premium'],
    featured: false,
    cta: 'Start free, upgrade later',
  },
] as const;

const QUESTIONS = [
  {
    q: 'Do I need a card to start?',
    a: 'No. The free plan is free with no card and no time limit.',
  },
  {
    q: 'What counts as a DM?',
    a: 'Every message we send for you in a DM, including the first reply to a comment. Public replies under comments are free and unlimited.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. You keep your plan until the end of the period you paid for, then move back to Free.',
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-dark">
            Pricing
          </p>
          <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.06] tracking-tight text-balance sm:text-display-lg">
            Start free. <span className="italic text-brand">Pay when it pays.</span>
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Upgrade only when a reel outgrows the free plan.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const limits = PLAN_LIMITS[plan.id];
            const features = [
              `${limit(limits.maxAutomations)} automations`,
              `${limit(limits.maxDmsPerMonth)} DMs every month`,
              ...plan.extras,
            ];
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl p-7',
                  plan.featured
                    ? 'bg-ink text-white shadow-pop'
                    : 'border border-line bg-white text-ink shadow-soft',
                )}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-butter px-3 py-1 text-xs font-semibold text-ink">
                    Most popular
                  </span>
                ) : null}
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p
                  className={cn('mt-1 text-sm', plan.featured ? 'text-white/80' : 'text-ink-soft')}
                >
                  {plan.note}
                </p>
                <p className="mt-6 font-display text-[40px] font-medium leading-none tracking-tight">
                  {plan.price}
                  {plan.per ? (
                    <span
                      className={cn(
                        'ml-1 font-sans text-base font-normal',
                        plan.featured ? 'text-white/80' : 'text-ink-soft',
                      )}
                    >
                      {plan.per}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-7 flex-1 space-y-3 text-[15px]">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          plan.featured ? 'text-butter' : 'text-moss',
                        )}
                        strokeWidth={2.5}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <PushButton
                  href="/signup"
                  variant={plan.featured ? 'paper' : plan.id === 'FREE' ? 'brand' : 'white'}
                  className="mt-8 w-full"
                >
                  {plan.cta}
                </PushButton>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="container max-w-3xl py-16 lg:py-20">
          <h2 className="font-display text-[28px] font-medium tracking-tight">Billing questions</h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {QUESTIONS.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="font-semibold text-ink">{item.q}</dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
