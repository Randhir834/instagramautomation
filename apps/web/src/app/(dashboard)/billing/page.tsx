'use client';

import { PLAN_LIMITS, type PlanId } from '@repo/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { UsageMeter } from '@/components/billing/UsageMeter';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge, ListSkeleton, Notice } from '@/components/ui/field';
import { type PaidPlan, useBilling, useCancelSubscription, useSubscribe } from '@/hooks/useBilling';
import { errorMessage } from '@/lib/api';
import { openCheckout } from '@/lib/razorpay';
import { cn, formatDate, formatNumber } from '@/lib/utils';

const PLAN_NAMES: Record<PlanId, string> = {
  FREE: 'Free',
  TRIAL: 'Trial',
  PREMIUM: 'Premium',
  PROFESSIONAL: 'Professional',
};
const PLAN_NOTES: Record<'FREE' | PaidPlan, string> = {
  FREE: 'For your first launches.',
  PREMIUM: 'For when reels start taking off.',
  PROFESSIONAL: 'For full-time creators and teams.',
};
const limitText = (n: number | null) => (n === null ? 'Unlimited' : formatNumber(n));

export default function BillingPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useBilling();
  const subscribe = useSubscribe();
  const cancel = useCancelSubscription();
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  async function handleUpgrade(plan: PaidPlan) {
    setMessage(null);
    try {
      const { subscriptionId, keyId } = await subscribe.mutateAsync(plan);
      const paid = await openCheckout({
        key: keyId,
        subscription_id: subscriptionId,
        description: `${PLAN_NAMES[plan]} plan`,
      });
      if (!paid) return;
      // The plan changes when Razorpay confirms the payment to our server.
      setMessage({
        tone: 'success',
        text: 'Payment received. Your plan updates in a few seconds; refresh if it has not changed.',
      });
      setTimeout(() => void queryClient.invalidateQueries(), 4000);
    } catch (err) {
      setMessage({ tone: 'error', text: errorMessage(err) });
    }
  }

  function handleCancel() {
    if (
      !window.confirm(
        'Cancel your subscription? You keep your plan until the end of the period you paid for.',
      )
    ) {
      return;
    }
    cancel.mutate(undefined, {
      onSuccess: (result) =>
        setMessage({
          tone: 'success',
          text: result.accessUntil
            ? `Cancelled. You keep your plan until ${formatDate(result.accessUntil)}.`
            : 'Cancelled.',
        }),
      onError: (err) => setMessage({ tone: 'error', text: errorMessage(err) }),
    });
  }

  return (
    <>
      <PageHeader title="Plan & billing" description="Your plan and this month’s usage." />
      {isLoading ? <ListSkeleton rows={2} /> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {message ? (
        <Notice tone={message.tone} className="mb-5">
          {message.text}
        </Notice>
      ) : null}

      {data ? (
        <>
          <Card>
            <CardHeader
              title={
                <span className="flex flex-wrap items-center gap-2">
                  You are on {PLAN_NAMES[data.plan]}
                  {data.subscription ? (
                    <Badge dot tone="yellow">
                      {data.subscription.status.toLowerCase()}
                    </Badge>
                  ) : null}
                </span>
              }
              description={
                data.planExpiresAt
                  ? `Current period ends ${formatDate(data.planExpiresAt)}.`
                  : 'Free forever. Upgrade whenever you need more.'
              }
              action={
                data.subscription ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancel.isPending}
                  >
                    {cancel.isPending ? 'Cancelling…' : 'Cancel subscription'}
                  </Button>
                ) : null
              }
            />
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <UsageMeter
                label="DMs this month"
                used={data.usage.dmsThisMonth}
                limit={data.limits.maxDmsPerMonth}
              />
              <UsageMeter
                label="Automations"
                used={data.usage.automations}
                limit={data.limits.maxAutomations}
              />
            </CardContent>
          </Card>

          <h2 className="mb-4 mt-10 font-display text-2xl font-medium tracking-tight text-ink">
            Plans
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(['FREE', 'PREMIUM', 'PROFESSIONAL'] as const).map((plan) => {
              const current = data.plan === plan;
              const limits = PLAN_LIMITS[plan];
              const buyable = plan !== 'FREE' && data.available[plan];
              return (
                <Card
                  key={plan}
                  className={cn('flex flex-col p-5', current && 'border-moss ring-4 ring-moss/10')}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-ink">{PLAN_NAMES[plan]}</p>
                    {current ? <Badge tone="green">Current</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{PLAN_NOTES[plan]}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    {[
                      `${limitText(limits.maxAutomations)} automations`,
                      `${limitText(limits.maxDmsPerMonth)} DMs a month`,
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-ink">
                        <Check className="h-4 w-4 shrink-0 text-moss" strokeWidth={2.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {plan !== 'FREE' && !current ? (
                    buyable ? (
                      <Button
                        className="mt-5"
                        variant={plan === 'PREMIUM' ? 'brand' : 'default'}
                        disabled={subscribe.isPending || Boolean(data.subscription)}
                        onClick={() => handleUpgrade(plan)}
                      >
                        {subscribe.isPending ? 'Opening…' : `Upgrade to ${PLAN_NAMES[plan]}`}
                      </Button>
                    ) : (
                      <p className="mt-5 rounded-lg bg-paper px-3 py-2 text-center text-sm text-ink-soft">
                        Coming soon
                      </p>
                    )
                  ) : null}
                </Card>
              );
            })}
          </div>
          {data.subscription ? (
            <p className="mt-4 text-sm text-ink-soft">
              To switch plans, cancel your current subscription first.
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
}
