import { PLAN_LIMITS } from '@repo/shared';
import { Check, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  ConnectMock,
  ContactsMock,
  FollowGateMock,
  KeywordMock,
  MessageMock,
  RepliesMock,
} from '@/components/marketing/FeatureMocks';
import { FlowStack } from '@/components/marketing/FlowStack';
import { HeroVisual } from '@/components/marketing/HeroVisual';
import { KeywordDemo } from '@/components/marketing/KeywordDemo';
import { MoneyCards } from '@/components/marketing/MoneyCards';
import { PushButton } from '@/components/marketing/PushButton';
import { APP_NAME, cn } from '@/lib/utils';

const FREE = PLAN_LIMITS.FREE;
const num = (n: number | null) => (n === null ? 'Unlimited' : n.toLocaleString('en-IN'));

const ONE_COMMENT = [
  {
    swatch: 'bg-butter',
    title: 'A follower comments your keyword',
    body: 'On the reel you picked, or on any post. Capital letters and extra question marks don’t matter.',
  },
  {
    swatch: 'bg-rose',
    title: 'They get a public reply',
    body: '“Sent it to your DMs!” shows up under their comment, so everyone watching knows it works.',
  },
  {
    swatch: 'bg-paper',
    title: 'And a DM with what they asked for',
    body: 'The link, a button, a question. If they share an email, it’s saved to your contacts.',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Connect Instagram',
    body: 'Log in on Instagram’s own screen and approve access. We never see your password. Works with Business and Creator accounts.',
    visual: <ConnectMock />,
    tint: 'bg-butter-tint',
  },
  {
    n: '2',
    title: 'Pick a post and a word',
    body: 'This reel, the word PRICE. Or every post you publish, with any of five words. Your call.',
    visual: <KeywordMock />,
    tint: 'bg-rose-tint',
  },
  {
    n: '3',
    title: 'Write what happens next',
    body: 'A public reply, then a DM. Add a button, ask for an email, or hold the link until they follow.',
    visual: <MessageMock />,
    tint: 'bg-sky-tint',
  },
];

const FEATURES = [
  {
    title: 'Replies that don’t all look the same',
    body: 'Write a few versions of your public reply and we rotate through them, so your comments never read like a stuck record.',
    visual: <RepliesMock />,
    tint: 'bg-paper',
  },
  {
    title: 'Follow first, then the link',
    body: 'Hold the good stuff until they follow you. We check, and only then send it.',
    visual: <FollowGateMock />,
    tint: 'bg-butter-tint',
  },
  {
    title: 'Emails and numbers, saved for you',
    body: 'Ask for an email or phone right in the chat. Everyone lands in one contact list, so your audience is yours.',
    visual: <ContactsMock />,
    tint: 'bg-moss-tint',
  },
];

const MONEY = [
  {
    title: 'A small store behind your bio link',
    body: 'Sell PDFs, presets, courses or templates. Buyers pay by UPI or card and get the download by email straight away.',
  },
  {
    title: '1:1 calls people book themselves',
    body: 'Open a few slots and share the page. No more back-and-forth about timings in the DMs.',
  },
  {
    title: 'Invoices for brand deals',
    body: 'Line items, GST, a clean PDF and a link to send. Nicer than a screenshot of a spreadsheet.',
  },
];

const FAQ = [
  {
    q: 'Is it safe for my Instagram account?',
    a: `Yes. ${APP_NAME} is built to stay within Instagram’s rules: no password sharing, no bots and no scraping. It also follows Instagram’s messaging rules, which is why a few things below are deliberately not possible.`,
  },
  {
    q: 'What kind of Instagram account do I need?',
    a: 'A Business or Creator account. Personal accounts can’t use automated messaging; that’s Instagram’s rule, not ours. Switching takes about a minute in Instagram settings and costs nothing.',
  },
  {
    q: 'Can I message everyone who ever commented?',
    a: 'No. Instagram allows one DM in response to each comment, and after that you can keep chatting only while the person has replied to you in the last 24 hours. So no cold blasts. People hear from you because they asked.',
  },
  {
    q: 'What happens when I hit the free limit?',
    a: `The free plan covers ${num(FREE.maxAutomations)} automations and ${num(FREE.maxDmsPerMonth)} DMs a month. If a reel takes off and you run out, new DMs pause until next month or until you upgrade. Nothing is deleted, and your contacts stay yours.`,
  },
  {
    q: 'How do payments for my products work?',
    a: 'Buyers pay by UPI, card or netbanking through a secure checkout. Once the payment is confirmed, they get a private download link by email. To get paid, you connect your own payment account once (KYC is needed in India).',
  },
  {
    q: 'Can I take my contacts with me?',
    a: 'Yes. Export them as a CSV at any time. And if you disconnect your Instagram account, we delete the data tied to it.',
  },
];

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-dark',
        className,
      )}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        'mt-3 max-w-2xl font-display text-[34px] font-medium leading-[1.1] tracking-tight text-balance sm:text-display-md',
        className,
      )}
    >
      {children}
    </h2>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div
          className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
          aria-hidden
        />
        <div className="container relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20 [&>*]:min-w-0">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[13px] font-medium text-ink-soft shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden />
              Made for Instagram creators
            </p>
            <h1 className="mt-6 font-display text-[44px] font-medium leading-[1.04] tracking-tight text-balance sm:text-display-lg lg:text-display-xl">
              They comment{' '}
              <span className="relative whitespace-nowrap italic text-brand">
                “price”
                <svg
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-butter"
                  aria-hidden
                >
                  <path
                    d="M2 8c30-6 62-6 96-3s66 4 100-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              . The link is already in their DMs.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft text-pretty">
              {APP_NAME} replies to the comment, sends the message and saves their email.
              Automatically, every time, while you get on with your day.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <PushButton href="/signup" size="lg" arrow>
                Start free
              </PushButton>
              <PushButton href="#how" size="lg" variant="white">
                See how it works
              </PushButton>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {[
                `${num(FREE.maxDmsPerMonth)} free DMs a month`,
                'No card needed',
                'Set up in minutes',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-moss" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ---------- One comment, three things ---------- */}
      <section className="bg-sky text-white">
        <div className="container grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:py-28 [&>*]:min-w-0">
          <FlowStack />
          <div>
            <Eyebrow className="text-white/90">What actually happens</Eyebrow>
            <SectionTitle>
              One comment. <span className="italic text-butter">Three things happen.</span>
            </SectionTitle>
            <ol className="mt-10 space-y-7">
              {ONE_COMMENT.map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold text-ink shadow-xs',
                      item.swatch,
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 max-w-md leading-relaxed text-white/90">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="container scroll-mt-32 py-20 md:scroll-mt-20 lg:py-28">
        <Eyebrow>Setting it up</Eyebrow>
        <SectionTitle>Three steps. Done before your coffee gets cold.</SectionTitle>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
            >
              <div className={cn('p-5', step.tint)}>{step.visual}</div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-[13px] font-semibold text-brand-dark">Step {step.n}</span>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Try it ---------- */}
      <section className="bg-moss text-white">
        <div className="container grid gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-24 [&>*]:min-w-0">
          <div>
            <Eyebrow className="text-white/90">Try it right here</Eyebrow>
            <SectionTitle>
              Go on, <span className="italic text-butter">be the follower.</span>
            </SectionTitle>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/90">
              Type a comment and watch what the automation does with it. A comment without the
              keyword is left alone, so nobody gets spammed.
            </p>
            <p className="mt-6 font-hand text-[28px] text-butter">try “this looks amazing” too →</p>
          </div>
          <KeywordDemo />
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="container scroll-mt-32 py-20 md:scroll-mt-20 lg:py-28">
        <Eyebrow>The details</Eyebrow>
        <SectionTitle>Small touches that make it feel like you wrote it.</SectionTitle>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
            >
              <div className={cn('flex min-h-[176px] items-center p-5', feature.tint)}>
                <div className="w-full">{feature.visual}</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{feature.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Selling ---------- */}
      <section className="border-y border-line bg-rose-tint">
        <div className="container grid items-center gap-14 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28 [&>*]:min-w-0">
          <div>
            <Eyebrow>When they want to pay you</Eyebrow>
            <SectionTitle>
              The DM is the start.{' '}
              <span className="italic text-brand">This is the money part.</span>
            </SectionTitle>
            <ul className="mt-10 space-y-6">
              {MONEY.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-xs">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 max-w-md leading-relaxed text-ink-soft">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <MoneyCards />
        </div>
      </section>

      {/* ---------- Pricing teaser ---------- */}
      <section className="container py-20 lg:py-28">
        <div className="grid gap-10 overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-pop md:grid-cols-[1.2fr_1fr] md:items-center md:p-14 [&>*]:min-w-0">
          <div>
            <Eyebrow className="text-butter">Pricing</Eyebrow>
            <SectionTitle className="text-white">Free until it’s clearly working.</SectionTitle>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/80">
              Most creators run their first few launches without paying anything. Upgrade when a
              reel outgrows the free plan, not before.
            </p>
            <PushButton href="/pricing" variant="paper" className="mt-8" arrow>
              Compare plans
            </PushButton>
          </div>
          <div className="rounded-2xl bg-white p-7 text-ink">
            <p className="font-display text-[56px] font-medium leading-none tracking-tight">
              ₹0 <span className="font-sans text-base font-normal text-ink-soft">/ month</span>
            </p>
            <ul className="mt-6 space-y-3 text-[15px]">
              {[
                `${num(FREE.maxAutomations)} automations`,
                `${num(FREE.maxDmsPerMonth)} DMs every month`,
                'Public replies, buttons and email capture',
                'Store, bookings and invoices',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss-tint text-moss">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <PushButton href="/signup" className="mt-7 w-full" arrow>
              Create a free account
            </PushButton>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="scroll-mt-32 border-t border-line bg-white lg:scroll-mt-20">
        <div className="container grid gap-12 py-20 lg:grid-cols-[1fr_1.6fr] lg:py-28 [&>*]:min-w-0">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <SectionTitle>Honest answers, including the annoying ones.</SectionTitle>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-4 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-[transform,background-color,color] duration-200 group-open:rotate-45 group-open:border-ink group-open:bg-ink group-open:text-white"
                    aria-hidden
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Closing ---------- */}
      <section className="bg-brand text-white">
        <div className="container flex flex-col items-start gap-8 py-20 md:flex-row md:items-end md:justify-between lg:py-24">
          <h2 className="max-w-2xl font-display text-[38px] font-medium leading-[1.06] tracking-tight sm:text-display-lg">
            Your next reel will get comments.{' '}
            <span className="italic text-butter">Have something ready.</span>
          </h2>
          <PushButton href="/signup" variant="paper" size="lg" className="shrink-0" arrow>
            Start free
          </PushButton>
        </div>
      </section>
    </>
  );
}
