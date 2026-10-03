import { PLAN_LIMITS } from '@repo/shared';
import { Check } from 'lucide-react';
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
    body: '“Sent it to your DMs!” shows up under their comment, so everyone else watching knows it works.',
  },
  {
    swatch: 'bg-paper',
    title: 'And a DM with the thing they asked for',
    body: 'The link, a button, a question. If they share an email, it is saved to your contacts.',
  },
];

const STEPS = [
  {
    n: '1',
    bg: 'bg-butter',
    title: 'Connect your Instagram',
    body: 'Log in on Instagram’s own screen and approve access. We never see your password. You need a Business or Creator account, which is a free switch in Instagram settings.',
    visual: <ConnectMock />,
  },
  {
    n: '2',
    bg: 'bg-rose',
    title: 'Pick a post and a word',
    body: 'This reel, the word PRICE. Or every post you publish, and any of five words. Your call.',
    visual: <KeywordMock />,
  },
  {
    n: '3',
    bg: 'bg-sky-tint',
    title: 'Write what happens next',
    body: 'A public reply, then a DM. Add a button, ask for an email, or hold the link until they follow. Switch it on and go film something.',
    visual: <MessageMock />,
  },
];

const MONEY = [
  {
    title: 'A small store behind your bio link',
    body: 'Sell PDFs, presets, courses or templates. Buyers pay by UPI or card and get the download by email straight away.',
  },
  {
    title: '1:1 calls people book themselves',
    body: 'Open a few slots, share the page, done. No back-and-forth about timings in the DMs.',
  },
  {
    title: 'Invoices for brand deals',
    body: 'Line items, GST, a clean PDF and a link to send. Nicer than a screenshot of a spreadsheet.',
  },
];

const FAQ = [
  {
    q: 'Will this get my account banned?',
    a: `${APP_NAME} talks to Instagram through Meta’s official API, the one Meta gives businesses for exactly this. No password sharing, no browser bot, no scraping. We also stick to Meta’s messaging limits, which is why a few things below are deliberately not possible.`,
  },
  {
    q: 'What kind of Instagram account do I need?',
    a: 'A Business or Creator account. Personal accounts can’t use automated messaging; that is Instagram’s rule, not ours. Switching takes about a minute in Instagram settings and costs nothing.',
  },
  {
    q: 'Can I message everyone who ever commented?',
    a: 'No. Instagram allows one DM in response to each comment, and after that you can keep chatting only while the person has replied to you in the last 24 hours. So no cold blasts to your whole audience. People hear from you because they asked.',
  },
  {
    q: 'What happens when I hit the free limit?',
    a: `The free plan covers ${num(FREE.maxAutomations)} automations and ${num(FREE.maxDmsPerMonth)} DMs a month. If a reel takes off and you run out, new DMs pause until next month or until you upgrade. Nothing is deleted and your contacts stay yours.`,
  },
  {
    q: 'How do payments for my products work?',
    a: 'Buyers pay through Razorpay (UPI, cards, netbanking). Once the payment is confirmed they get a private download link by email. You will need your own Razorpay account with KYC completed.',
  },
  {
    q: 'Can I take my contacts with me?',
    a: 'Yes. The emails and phone numbers people share belong to you. And if you disconnect your Instagram account, we delete the data tied to it.',
  },
];

function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'inline-block -rotate-1 rounded-md border-2 border-ink bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ink',
        className,
      )}
    >
      {children}
    </p>
  );
}

function Tile({
  title,
  body,
  className = '',
  children,
}: {
  title: string;
  body: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={`slab flex flex-col rounded-3xl p-6 ${className}`}>
      <div className="mb-6 flex-1">{children}</div>
      <h3 className="font-display text-2xl leading-snug">{title}</h3>
      <p className="mt-2 leading-relaxed text-ink/70">{body}</p>
    </article>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="container grid [&>*]:min-w-0 items-center gap-10 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-16">
        <div>
          <Label>For Instagram creators</Label>
          <h1 className="mt-6 font-display text-[2.7rem] leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            They comment{' '}
            <span className="relative inline-block rotate-[-2deg] rounded-xl border-2 border-ink bg-butter px-3 italic shadow-[0_4px_0_0_#1a1714]">
              price
            </span>
            <br />
            The link is already in their DMs.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/75 sm:text-xl">
            {APP_NAME} replies to the comment, sends the message and saves their email.
            Automatically, every time, while you do literally anything else.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <PushButton href="/signup" size="lg" arrow>
              Start free
            </PushButton>
            <PushButton href="#how" size="lg" variant="white">
              See how it works
            </PushButton>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink/70">
            {[
              `${num(FREE.maxDmsPerMonth)} free DMs a month`,
              'No card needed',
              'Uses Instagram’s official API',
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-moss text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={4} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </section>

      {/* ---------- One comment, three things ---------- */}
      <section className="border-y-2 border-ink bg-sky text-white">
        <div className="container grid [&>*]:min-w-0 items-center gap-10 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-24">
          <FlowStack />
          <div>
            <Label>What actually happens</Label>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] sm:text-5xl">
              One comment. <span className="italic text-butter">Three things happen.</span>
            </h2>
            <ol className="mt-9 space-y-6">
              {ONE_COMMENT.map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink font-display text-xl text-ink shadow-[0_3px_0_0_#1a1714] ${item.swatch}`}
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
      <section id="how" className="container scroll-mt-32 md:scroll-mt-20 py-20 lg:py-28">
        <Label className="bg-butter">Setting it up</Label>
        <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.08] sm:text-5xl">
          Three steps. Done between two cups of chai.
        </h2>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className={`slab flex flex-col rounded-3xl p-6 ${step.bg}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-white font-display text-2xl">
                {step.n}
              </span>
              <h3 className="mt-5 font-display text-2xl leading-snug">{step.title}</h3>
              <p className="mt-2 flex-1 leading-relaxed text-ink/75">{step.body}</p>
              <div className="mt-6">{step.visual}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Try it ---------- */}
      <section className="border-y-2 border-ink bg-moss text-paper">
        <div className="container grid [&>*]:min-w-0 gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-24">
          <div>
            <Label>Try it right here</Label>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] sm:text-5xl">
              Go on, <span className="italic text-butter">be the follower.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/90">
              Type a comment and watch what the automation does with it. A comment without the
              keyword gets left alone, so nobody is spammed.
            </p>
            <p className="mt-6 font-hand text-3xl text-butter">try “this looks amazing” too →</p>
          </div>
          <div className="text-ink">
            <KeywordDemo />
          </div>
        </div>
      </section>

      {/* ---------- DM features ---------- */}
      <section id="features" className="container scroll-mt-32 md:scroll-mt-20 py-20 lg:py-28">
        <Label className="bg-rose">What&apos;s inside</Label>
        <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.08] sm:text-5xl">
          Small details that make it feel like you wrote it.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Tile
            className="bg-white"
            title="Replies that don’t all look the same"
            body="Write a few versions of your public reply and we rotate through them, so your comments don’t read like a stuck record."
          >
            <RepliesMock />
          </Tile>
          <Tile
            className="bg-butter"
            title="Follow first, then the link"
            body="Hold the good stuff until they follow you. We check, and only then send it."
          >
            <FollowGateMock />
          </Tile>
          <Tile
            className="bg-moss-tint"
            title="Emails and numbers, saved for you"
            body="Ask for an email or phone in the chat. Everyone lands in a simple contact list, so the audience is yours and not just the algorithm’s."
          >
            <ContactsMock />
          </Tile>
        </div>
      </section>

      {/* ---------- Selling ---------- */}
      <section className="border-y-2 border-ink bg-rose-tint">
        <div className="container grid [&>*]:min-w-0 items-center gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <Label className="bg-brand text-white">And when they want to pay you</Label>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] sm:text-5xl">
              The DM is the start.{' '}
              <span className="italic text-brand">This is the money part.</span>
            </h2>
            <ul className="mt-9 space-y-6">
              {MONEY.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-butter">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 max-w-md leading-relaxed text-ink/70">{item.body}</p>
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
        <div className="slab grid gap-8 [&>*]:min-w-0 rounded-[2rem] bg-butter p-7 md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <div>
            <Label>Pricing</Label>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] sm:text-5xl">
              Free until it&apos;s clearly working.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/75">
              Most creators can run their first few launches without paying anything. Upgrade when a
              reel outgrows the free limit, not before.
            </p>
            <PushButton href="/pricing" variant="white" className="mt-7" arrow>
              Compare all plans
            </PushButton>
          </div>
          <div className="rounded-2xl border-2 border-ink bg-white p-6">
            <p className="font-display text-6xl">
              ₹0 <span className="font-sans text-base text-ink/75">/ month</span>
            </p>
            <ul className="mt-5 space-y-3">
              {[
                `${num(FREE.maxAutomations)} automations`,
                `${num(FREE.maxDmsPerMonth)} DMs every month`,
                'Public replies, buttons and email capture',
                'Your contact list',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                    <Check className="h-3 w-3" strokeWidth={4} />
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
      <section id="faq" className="scroll-mt-32 md:scroll-mt-20 border-t-2 border-ink bg-white">
        <div className="container grid [&>*]:min-w-0 gap-10 py-20 lg:grid-cols-[1fr_1.6fr] lg:py-28">
          <div>
            <Label className="bg-sky-tint">Questions</Label>
            <h2 className="mt-5 font-display text-4xl leading-[1.08]">
              Honest answers, including the annoying ones.
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border-2 border-ink bg-paper px-5 py-4 open:bg-butter-tint"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-xl leading-none transition-transform group-open:rotate-45 group-open:bg-brand group-open:text-white"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink/75">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Closing ---------- */}
      <section className="border-t-2 border-ink bg-brand text-white">
        <div className="container flex flex-col items-start gap-8 py-20 md:flex-row md:items-end md:justify-between lg:py-24">
          <h2 className="max-w-2xl font-display text-4xl leading-[1.08] sm:text-6xl">
            Your next reel will get comments.
            <br />
            <span className="italic text-butter">Have something ready.</span>
          </h2>
          <PushButton href="/signup" variant="butter" size="lg" className="shrink-0" arrow>
            Start free
          </PushButton>
        </div>
      </section>
    </>
  );
}
