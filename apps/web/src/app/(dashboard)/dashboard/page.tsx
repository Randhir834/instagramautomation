'use client';

import Link from 'next/link';
import { UsageMeter } from '@/components/billing/UsageMeter';
import { PageHeader } from '@/components/layout/PageHeader';
import { PublicLinks } from '@/components/layout/PublicLinks';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/field';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useOverview } from '@/hooks/useOverview';
import { errorMessage } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-xl border-2 border-ink p-4 ${tone}`}>
      <p className="text-sm font-semibold text-ink/80">{label}</p>
      <p className="mt-1 break-words font-display text-3xl">{value}</p>
    </div>
  );
}

/** Shown until the creator has connected an account and made an automation. */
function GettingStarted({ accounts, automations }: { accounts: number; automations: number }) {
  if (accounts > 0 && automations > 0) return null;
  const steps = [
    {
      done: accounts > 0,
      text: 'Connect your Instagram account',
      href: '/accounts',
      cta: 'Connect',
    },
    {
      done: automations > 0,
      text: 'Create your first automation',
      href: '/automations/new',
      cta: 'Create',
    },
  ];
  return (
    <section className="mb-6 rounded-xl border-2 border-ink bg-butter p-5">
      <h2 className="font-display text-xl">Two steps to your first automatic DM</h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={step.text} className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-3 font-medium">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-sm font-bold">
                {step.done ? '✓' : i + 1}
              </span>
              <span className={step.done ? 'line-through' : ''}>{step.text}</span>
            </span>
            {step.done ? null : (
              <Button size="sm" asChild>
                <Link href={step.href}>{step.cta}</Link>
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, error } = useOverview();
  const show = (n: number | undefined) => (isLoading || n === undefined ? '…' : formatNumber(n));

  return (
    <>
      <PageHeader
        title={user ? `Hi, ${user.name.split(' ')[0]}` : 'Overview'}
        description="Here is how things are going."
      />

      {error ? (
        <Notice tone="error" className="mb-6">
          Could not load your numbers. {errorMessage(error)}
        </Notice>
      ) : null}

      {data ? <GettingStarted accounts={data.accounts} automations={data.automations} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Active automations" value={show(data?.automations)} tone="bg-white" />
        <Stat label="Contacts" value={show(data?.contacts)} tone="bg-white" />
        <Stat label="Emails and phones collected" value={show(data?.leads)} tone="bg-moss-tint" />
        <Stat label="Connected accounts" value={show(data?.accounts)} tone="bg-white" />
        <Stat label="Paid orders" value={show(data?.paidOrders)} tone="bg-white" />
        <Stat
          label="Store revenue"
          value={data ? formatMoney(data.revenueInPaise) : '…'}
          tone="bg-rose-tint"
        />
      </div>

      {data ? (
        <section className="mt-6 rounded-xl border-2 border-ink bg-white p-5">
          <UsageMeter label="DMs sent this month" used={data.dmsThisMonth} limit={data.dmLimit} />
          <p className="mt-3 text-sm text-ink/75">
            Resets on the 1st of each month.{' '}
            <Link href="/billing" className="font-semibold text-ink underline underline-offset-4">
              See plans
            </Link>
          </p>
        </section>
      ) : null}

      <div className="mt-6">
        <PublicLinks />
      </div>
    </>
  );
}
