import { ArrowRight, CreditCard, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/marketing/ContactForm';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = { title: 'Contact us' };

const SHORTCUTS: { icon: LucideIcon; title: string; text: string; href: string; cta: string }[] = [
  {
    icon: Sparkles,
    title: 'New here?',
    text: 'See how it works, start to finish.',
    href: '/#how',
    cta: 'How it works',
  },
  {
    icon: CreditCard,
    title: 'Plans and pricing',
    text: 'What’s free and what’s coming.',
    href: '/pricing',
    cta: 'See pricing',
  },
  {
    icon: ShieldCheck,
    title: 'Your data',
    text: 'Remove your data at any time.',
    href: '/data-deletion',
    cta: 'Delete my data',
  },
];

export default function ContactPage() {
  return (
    <section className="container py-14 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16 [&>*]:min-w-0">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-dark">
            Contact
          </p>
          <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.06] tracking-tight text-balance sm:text-display-md">
            We’d love to hear from you.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
            Questions, feedback or a problem with your account: send us a note and a real person
            from {APP_NAME} will get back to you.
          </p>

          <ul className="mt-10 space-y-3">
            {SHORTCUTS.map(({ icon: Icon, title, text, href, cta }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-xs transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-soft"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-deep text-ink">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{title}</span>
                    <span className="block text-sm text-ink-soft">{text}</span>
                  </span>
                  <span className="hidden items-center gap-1 text-sm font-semibold text-ink sm:flex">
                    {cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
