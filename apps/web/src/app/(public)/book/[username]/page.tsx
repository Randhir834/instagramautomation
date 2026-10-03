'use client';

import { createBookingSchema } from '@repo/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CalendarCheck, CalendarX, Clock, Loader2 } from 'lucide-react';
import { use, useState } from 'react';
import { Avatar } from '@/components/layout/Brand';
import { PublicMessage } from '@/components/layout/PublicMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, Notice, Textarea } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiRequestError, apiGet, apiPost, errorMessage } from '@/lib/api';
import { cn, formatDay, formatTime, initials } from '@/lib/utils';

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

const minutesBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60_000);

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

  if (isLoading) {
    return (
      <p className="flex items-center justify-center gap-2 text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  }
  if (error || !data) {
    const missing = error instanceof ApiRequestError && error.status === 404;
    return (
      <PublicMessage
        icon={AlertCircle}
        title={missing ? 'We couldn’t find that booking page' : 'Something went wrong'}
      >
        {missing ? 'Check the link with whoever sent it to you.' : errorMessage(error)}
      </PublicMessage>
    );
  }

  if (done) {
    return (
      <PublicMessage
        icon={CalendarCheck}
        tone="success"
        eyebrow="You are booked"
        title={`${formatDay(done.startsAt)}, ${formatTime(done.startsAt)}`}
      >
        <p>
          Your call with {done.creatorName} runs until {formatTime(done.endsAt)}. A confirmation is
          on its way to <span className="font-medium text-ink">{email}</span>, and{' '}
          {done.creatorName} will send you the meeting details.
        </p>
      </PublicMessage>
    );
  }

  const days = groupByDay(data.slots);
  const chosen = data.slots.find((s) => s.id === slotId);

  return (
    <>
      <header className="mb-8 flex flex-col items-center text-center">
        <Avatar
          text={initials(data.creator.name)}
          className="h-16 w-16 text-lg shadow-soft ring-4 ring-white"
        />
        <h1 className="mt-4 font-display text-[32px] font-medium leading-tight tracking-tight [overflow-wrap:anywhere]">
          Book a call with {data.creator.name}
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-soft">Times are shown in your own timezone.</p>
      </header>

      {days.length === 0 ? (
        <PublicMessage icon={CalendarX} title="No open times right now">
          Check back soon, or ask {data.creator.name} to open a few more slots.
        </PublicMessage>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader title="1. Pick a time" />
            <CardContent className="space-y-6">
              {days.map(([day, slots]) => (
                <div key={day}>
                  <p className="mb-2.5 text-sm font-semibold text-ink">{day}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const selected = slotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSlotId(slot.id)}
                          className={cn(
                            'rounded-[10px] border px-3 py-2.5 text-sm font-semibold transition-[border-color,background-color,box-shadow,color]',
                            selected
                              ? 'border-ink bg-ink text-white shadow-xs'
                              : 'border-line-strong bg-white text-ink hover:border-ink',
                          )}
                        >
                          {formatTime(slot.startsAt)}
                          <span
                            className={cn(
                              'block text-xs font-medium',
                              selected ? 'text-white/80' : 'text-ink-soft',
                            )}
                          >
                            {minutesBetween(slot.startsAt, slot.endsAt)} min
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="2. Your details"
              description={
                chosen ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {formatDay(chosen.startsAt)},{' '}
                    {formatTime(chosen.startsAt)}
                  </span>
                ) : undefined
              }
            />
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <Field label="Anything they should know?" htmlFor="note" aside="Optional">
                <Textarea
                  id="note"
                  value={note}
                  maxLength={1000}
                  onChange={(e) => setNote(e.target.value)}
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
                {busy ? 'Booking…' : 'Book this call'}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </>
  );
}
