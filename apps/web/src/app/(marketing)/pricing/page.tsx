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
    note: 'For your first launches.',
    extras: ['Public replies, buttons, email capture', 'Store, bookings and invoices'],
    featured: false,
    cta: 'Start free',
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 'Price coming soon',
    note: 'For when reels start taking off.',
    extras: ['Everything in Free'],
    featured: true,
    cta: 'Start free, upgrade later',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 'Price coming soon',
    note: 'For full-time creators and teams.',
    extras: ['Everything in Premium'],
    featured: false,
    cta: 'Start free, upgrade later',
  },
] as const;

export default function PricingPage() {
  return (
    <section className="container py-16 lg:py-24">
      <h1 className="text-center font-display text-5xl leading-tight sm:text-6xl">
        Start free. <span className="italic text-brand">Pay when it pays.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-center text-lg text-ink/75">
        Upgrade only when a reel outgrows the free limit.
      </p>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
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
                'slab flex flex-col rounded-3xl p-6',
                plan.featured ? 'bg-butter' : 'bg-white',
              )}
            >
              <h2 className="font-display text-2xl">{plan.name}</h2>
              <p className="mt-1 text-sm text-ink/80">{plan.note}</p>
              <p className="mt-5 font-display text-3xl leading-tight">{plan.price}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                      <Check className="h-3 w-3" strokeWidth={4} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <PushButton
                href="/signup"
                variant={plan.featured ? 'brand' : 'white'}
                className="mt-6 w-full"
              >
                {plan.cta}
              </PushButton>
            </div>
          );
        })}
      </div>
    </section>
  );
}
