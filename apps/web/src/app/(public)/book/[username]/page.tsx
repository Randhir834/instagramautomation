'use client';

import { createBookingSchema } from '@repo/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { use, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Notice, Textarea } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiRequestError, apiGet, apiPost, errorMessage } from '@/lib/api';
import { cn, formatDay, formatTime } from '@/lib/utils';

interface OpenSlot {
  id: string;
  startsAt: string;
  endsAt: string;
}
interface BookingPageData {
  creator: { name: string; username: string };
  slots: OpenSlot[];
}
interface Confirmation {
  startsAt: string;
  endsAt: string;
  creatorName: string;
}

/** Groups slots under the day they fall on, in the visitor's own timezone. */
function groupByDay(slots: OpenSlot[]): [string, OpenSlot[]][] {
  const days = new Map<string, OpenSlot[]>();
  for (const slot of slots) {
    const day = formatDay(slot.startsAt);
    days.set(day, [...(days.get(day) ?? []), slot]);
  }
  return [...days.entries()];
}

/** Public booking page. */
export default function BookingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const queryClient = useQueryClient();
  const queryKey = ['book', username];
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => apiGet<BookingPageData>(`/public/book/${encodeURIComponent(username)}`),
    retry: false,
  });

  const [slotId, setSlotId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Confirmation | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotId) return setProblem('Pick a time first.');
    const parsed = createBookingSchema.safeParse({
      slotId,
      guestName: name,
      guestEmail: email,
      note: note.trim() || undefined,
    });
    if (!parsed.success) return setProblem(parsed.error.issues[0]?.message ?? 'Check the form.');
    setProblem(null);
    setBusy(true);
    try {
      setDone(await apiPost<Confirmation>('/public/book', parsed.data));
    } catch (err) {
      setProblem(errorMessage(err));
      // Someone else may have taken the slot: show the up-to-date list.
      setSlotId(null);
      await queryClient.invalidateQueries({ queryKey });
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-center text-ink/75">Loading…</p>;
  if (error || !data) {
    const missing = error instanceof ApiRequestError && error.status === 404;
    return (
      <div className="rounded-2xl border-2 border-ink bg-white p-8 text-center">
        <h1 className="font-display text-3xl">
          {missing ? 'We could not find that booking page' : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-ink/75">
          {missing ? 'Check the link with whoever sent it to you.' : errorMessage(error)}
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="slab rounded-2xl bg-moss-tint p-6 text-center sm:p-10">
        <p className="text-sm font-bold uppercase tracking-wide text-moss">You are booked</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">
          {formatDay(done.startsAt)}, {formatTime(done.startsAt)}
        </h1>
        <p className="mt-3 text-ink/80">
          Your call with {done.creatorName} runs until {formatTime(done.endsAt)}. A confirmation is
          on its way to {email}, and {done.creatorName} will send you the meeting details.
        </p>
      </div>
    );
  }

  const days = groupByDay(data.slots);

  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="break-words font-display text-4xl">Book a call with {data.creator.name}</h1>
        <p className="mt-2 text-ink/75">Times are shown in your own timezone.</p>
      </header>

      {days.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-ink/30 bg-white p-8 text-center text-ink/75">
          There are no open times right now. Check back soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <section className="rounded-2xl border-2 border-ink bg-white p-5">
            <h2 className="font-display text-xl">1. Pick a time</h2>
            <div className="mt-4 space-y-5">
              {days.map(([day, slots]) => (
                <div key={day}>
                  <p className="mb-2 text-sm font-semibold">{day}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={slotId === slot.id}
                        onClick={() => setSlotId(slot.id)}
                        className={cn(
                          'rounded-lg border-2 border-ink px-3 py-2 text-sm font-semibold transition-colors',
                          slotId === slot.id ? 'bg-ink text-white' : 'bg-white hover:bg-butter',
                        )}
                      >
                        {formatTime(slot.startsAt)} to {formatTime(slot.endsAt)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border-2 border-ink bg-white p-5">
            <h2 className="font-display text-xl">2. Your details</h2>
            <Field label="Your name" htmlFor="guestName">
              <Input
                id="guestName"
                autoComplete="name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Your email" htmlFor="guestEmail">
              <Input
                id="guestEmail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Anything they should know? (optional)" htmlFor="note">
              <Textarea
                id="note"
                value={note}
                maxLength={1000}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </section>

          {problem ? <Notice tone="error">{problem}</Notice> : null}
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>
            {busy ? 'Booking…' : 'Book this call'}
          </Button>
        </form>
      )}
    </>
  );
}
