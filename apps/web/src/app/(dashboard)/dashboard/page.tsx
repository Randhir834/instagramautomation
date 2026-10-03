'use client';

import {
  ArrowRight,
  Check,
  IndianRupee,
  Mail,
  Plus,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { UsageMeter } from '@/components/billing/UsageMeter';
import { PageHeader } from '@/components/layout/PageHeader';
import { PublicLinks } from '@/components/layout/PublicLinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Notice, Skeleton } from '@/components/ui/field';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useOverview } from '@/hooks/useOverview';
import { errorMessage } from '@/lib/api';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  note: string;
  tint: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', tint)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {value === null ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 font-display text-[32px] font-medium leading-none tracking-tight text-ink [overflow-wrap:anywhere]">
          {value}
        </p>
      )}
      <p className="mt-2 text-[13px] text-ink-soft">{note}</p>
    </Card>
  );
}

/** Shown until the creator has connected an account and made an automation. */
function GettingStarted({ accounts, automations }: { accounts: number; automations: number }) {
  if (accounts > 0 && automations > 0) return null;
  const steps = [
    {
      done: accounts > 0,
      title: 'Connect your Instagram account',
      text: 'A Business or Creator account. Takes about a minute.',
      href: '/accounts',
      cta: 'Connect',
    },
    {
      done: automations > 0,
      title: 'Create your first automation',
      text: 'Pick a post, a keyword and the message to send.',
      href: '/automations/new',
      cta: 'Create',
    },
  ];
  const done = steps.filter((s) => s.done).length;
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-butter-tint/70 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">
            Two steps to your first automatic DM
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft">{done} of 2 done</p>
        </div>
        <div className="h-2 w-28 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-moss" style={{ width: `${(done / 2) * 100}%` }} />
        </div>
      </div>
      <ol className="divide-y divide-line">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  step.done ? 'bg-moss text-white' : 'border border-line-strong bg-white text-ink',
                )}
              >
                {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    step.done ? 'text-ink-soft line-through' : 'text-ink',
                  )}
                >
                  {step.title}
                </p>
                <p className="text-[13px] text-ink-soft">{step.text}</p>
              </div>
            </div>
            {step.done ? null : (
              <Button size="sm" asChild>
                <Link href={step.href}>
                  {step.cta} <ArrowRight />
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data, error } = useOverview();
  const n = (value: number | undefined) => (value === undefined ? null : formatNumber(value));

  return (
    <>
      <PageHeader
        title={user ? `${greeting()}, ${user.name.split(' ')[0]}` : 'Overview'}
        description="Here is how your automations and store are doing."
        actions={
          <Button asChild>
            <Link href="/automations/new">
              <Plus /> New automation
            </Link>
          </Button>
        }
      />

      {error ? (
        <Notice tone="error" className="mb-6">
          Could not load your numbers. {errorMessage(error)}
        </Notice>
      ) : null}

      {data ? <GettingStarted accounts={data.accounts} automations={data.automations} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Zap}
          label="Active automations"
          value={n(data?.automations)}
          note={data ? `on ${data.accounts} account${data.accounts === 1 ? '' : 's'}` : ' '}
          tint="bg-butter-tint text-butter-dark"
        />
        <Stat
          icon={Users}
          label="Contacts"
          value={n(data?.contacts)}
          note="people who interacted"
          tint="bg-sky-tint text-sky-dark"
        />
        <Stat
          icon={Mail}
          label="Leads collected"
          value={n(data?.leads)}
          note="shared an email or phone"
          tint="bg-moss-tint text-moss-dark"
        />
        <Stat
          icon={IndianRupee}
          label="Store revenue"
          value={data ? formatMoney(data.revenueInPaise) : null}
          note={data ? `${data.paidOrders} paid order${data.paidOrders === 1 ? '' : 's'}` : ' '}
          tint="bg-brand-tint text-brand-dark"
        />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.25fr]">
        <Card>
          <CardHeader
            title="This month"
            description="Resets on the 1st."
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/billing">
                  Plans <ArrowRight />
                </Link>
              </Button>
            }
          />
          <CardContent>
            {data ? (
              <UsageMeter label="DMs sent" used={data.dmsThisMonth} limit={data.dmLimit} />
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
          </CardContent>
        </Card>
        <PublicLinks />
      </div>
    </>
  );
}
