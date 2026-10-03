'use client';

import { CONTACT_TOPICS, contactFormSchema } from '@repo/shared';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Notice, Select, Textarea } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { apiPost, errorMessage } from '@/lib/api';

type Topic = (typeof CONTACT_TOPICS)[number];

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<Topic>(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    const parsed = contactFormSchema.safeParse({ name, email, topic, message });
    if (!parsed.success) {
      const found: Record<string, string> = {};
      for (const issue of parsed.error.issues) found[String(issue.path[0])] ??= issue.message;
      setErrors(found);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await apiPost('/public/contact', parsed.data);
      setSent(true);
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Card className="flex flex-col items-center px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss-tint text-moss">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-[26px] font-medium tracking-tight">Message sent</h2>
        <p className="mt-2 max-w-sm text-ink-soft">
          Thanks, {name.split(' ')[0]}. We’ll reply to{' '}
          <span className="font-medium text-ink">{email}</span> as soon as we can.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" htmlFor="contact-name" error={errors.name}>
            <Input
              id="contact-name"
              autoComplete="name"
              value={name}
              maxLength={100}
              aria-invalid={Boolean(errors.name) || undefined}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="contact-email" error={errors.email}>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(errors.email) || undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
        <Field label="What is it about?" htmlFor="contact-topic">
          <Select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value as Topic)}
          >
            {CONTACT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Message"
          htmlFor="contact-message"
          error={errors.message}
          aside={`${message.length}/3000`}
        >
          <Textarea
            id="contact-message"
            rows={6}
            value={message}
            maxLength={3000}
            aria-invalid={Boolean(errors.message) || undefined}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
          />
        </Field>
        {problem ? <Notice tone="error">{problem}</Notice> : null}
        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full sm:w-auto"
          disabled={busy}
        >
          {busy ? 'Sending…' : 'Send message'}
        </Button>
      </form>
    </Card>
  );
}
