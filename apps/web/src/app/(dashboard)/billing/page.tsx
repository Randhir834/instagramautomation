'use client';

import { PLAN_LIMITS, type PlanId } from '@repo/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { UsageMeter } from '@/components/billing/UsageMeter';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge, Notice } from '@/components/ui/field';
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
      <PageHeader title="Billing" description="Your plan and this month's usage." />
      {isLoading ? <p className="text-ink/75">Loading…</p> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {message ? (
        <Notice tone={message.tone} className="mb-4">
          {message.text}
        </Notice>
      ) : null}

      {data ? (
        <>
          <section className="rounded-xl border-2 border-ink bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl">
                You are on {PLAN_NAMES[data.plan]}{' '}
                {data.subscription ? <Badge tone="yellow">{data.subscription.status}</Badge> : null}
              </h2>
              {data.subscription ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancel.isPending}
                >
                  {cancel.isPending ? 'Cancelling…' : 'Cancel subscription'}
                </Button>
              ) : null}
            </div>
            {data.planExpiresAt ? (
              <p className="mt-1 text-sm text-ink/75">
                Current period ends {formatDate(data.planExpiresAt)}.
              </p>
            ) : null}
            <div className="mt-5 space-y-5">
              <UsageMeter
                label="DMs sent this month"
                used={data.usage.dmsThisMonth}
                limit={data.limits.maxDmsPerMonth}
              />
              <UsageMeter
                label="Automations"
                used={data.usage.automations}
                limit={data.limits.maxAutomations}
              />
            </div>
          </section>

          <h2 className="mb-3 mt-8 font-display text-2xl">Plans</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(['FREE', 'PREMIUM', 'PROFESSIONAL'] as const).map((plan) => {
              const current = data.plan === plan;
              const limits = PLAN_LIMITS[plan];
              const buyable = plan !== 'FREE' && data.available[plan];
              return (
                <div
                  key={plan}
                  className={cn(
                    'flex flex-col rounded-xl border-2 border-ink p-5',
                    current ? 'bg-butter' : 'bg-white',
                  )}
                >
                  <p className="flex flex-wrap items-center gap-2 font-display text-xl">
                    {PLAN_NAMES[plan]} {current ? <Badge tone="green">Your plan</Badge> : null}
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                    <li>{limitText(limits.maxAutomations)} automations</li>
                    <li>{limitText(limits.maxDmsPerMonth)} DMs a month</li>
                  </ul>
                  {plan !== 'FREE' && !current ? (
                    buyable ? (
                      <Button
                        className="mt-4"
                        disabled={subscribe.isPending || Boolean(data.subscription)}
                        onClick={() => handleUpgrade(plan)}
                      >
                        {subscribe.isPending ? 'Opening…' : `Upgrade to ${PLAN_NAMES[plan]}`}
                      </Button>
                    ) : (
                      <p className="mt-4 text-sm font-medium text-ink/75">Not on sale yet.</p>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
          {data.subscription ? (
            <p className="mt-3 text-sm text-ink/75">
              To switch plans, cancel your current subscription first.
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
}
