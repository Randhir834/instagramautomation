'use client';

import { CalendarClock, CalendarPlus, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState, Field, ListSkeleton, Notice, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  type Booking,
  useBookings,
  useCancelBooking,
  useCreateSlots,
  useDeleteSlot,
  useSlots,
} from '@/hooks/useBookings';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { errorMessage } from '@/lib/api';
import { formatDay, formatTime, WEB_URL } from '@/lib/utils';

const DURATIONS = [15, 30, 45, 60, 90];

/** "2026-10-06" for an <input type="date"> minimum of today, in local time. */
function todayLocal(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** A small "calendar page" showing the date. */
function DateTile({ value }: { value: string }) {
  const date = new Date(value);
  return (
    <span className="flex w-12 shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-white text-center shadow-xs">
      <span className="bg-brand py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
        {new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date)}
      </span>
      <span className="py-1 font-display text-lg font-semibold leading-none text-ink">
        {date.getDate()}
      </span>
    </span>
  );
}

function AddSlotForm() {
  const create = useCreateSlots();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [problem, setProblem] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    if (!date || !time) return setProblem('Pick a date and a start time.');
    // Built from local date + time, so the slot is in the creator's own timezone.
    const startsAt = new Date(`${date}T${time}`);
    if (Number.isNaN(startsAt.getTime())) return setProblem('That date or time is not valid.');
    if (startsAt <= new Date()) return setProblem('Pick a time in the future.');
    const endsAt = new Date(startsAt.getTime() + minutes * 60_000);
    create.mutate([{ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }], {
      onSuccess: () => setTime(''),
    });
  }

  return (
    <Card>
      <CardHeader
        title="Open a time slot"
        description="People can book it from your booking page."
      />
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <Field label="Date" htmlFor="date">
              <Input
                id="date"
                type="date"
                min={todayLocal()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Starts at" htmlFor="time">
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
            <Field label="Length" htmlFor="minutes">
              <Select
                id="minutes"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </Select>
            </Field>
            <Button
              type="submit"
              className="h-11 sm:col-span-3 sm:justify-self-start lg:col-span-1"
              disabled={create.isPending}
            >
              <CalendarPlus /> {create.isPending ? 'Adding…' : 'Add slot'}
            </Button>
          </div>
          {problem ? (
            <Notice tone="error" className="mt-4">
              {problem}
            </Notice>
          ) : null}
          {create.isError ? (
            <Notice tone="error" className="mt-4">
              {errorMessage(create.error)}
            </Notice>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const cancel = useCancelBooking();
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 p-5">
      <div className="flex min-w-0 items-start gap-4">
        <DateTile value={booking.slot.startsAt} />
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {formatTime(booking.slot.startsAt)} – {formatTime(booking.slot.endsAt)}
          </p>
          <p className="text-sm text-ink [overflow-wrap:anywhere]">
            {booking.guestName} ·{' '}
            <a href={`mailto:${booking.guestEmail}`} className="underline-offset-4 hover:underline">
              {booking.guestEmail}
            </a>
          </p>
          {booking.note ? (
            <p className="mt-1.5 rounded-lg bg-paper px-3 py-2 text-sm text-ink-soft [overflow-wrap:anywhere]">
              “{booking.note}”
            </p>
          ) : null}
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        disabled={cancel.isPending}
        onClick={() => {
          if (
            window.confirm(
              `Cancel the call with ${booking.guestName}? Let them know yourself; we do not email them.`,
            )
          ) {
            cancel.mutate(booking.id);
          }
        }}
      >
        Cancel call
      </Button>
    </div>
  );
}

export default function BookingsPage() {
  const { data: user } = useCurrentUser();
  const slots = useSlots();
  const bookings = useBookings();
  const deleteSlot = useDeleteSlot();
  const publicUrl = user ? `${WEB_URL}/book/${user.username}` : '';
  const upcoming = bookings.data?.filter((b) => b.status === 'CONFIRMED') ?? [];
  const openSlots = slots.data?.filter((s) => !s.isBooked) ?? [];

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Open time slots for 1:1 calls and see who booked."
        actions={
          publicUrl ? (
            <Button variant="outline" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink /> Booking page
              </a>
            </Button>
          ) : undefined
        }
      />

      {deleteSlot.isError ? (
        <Notice tone="error" className="mb-5">
          {errorMessage(deleteSlot.error)}
        </Notice>
      ) : null}

      <AddSlotForm />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Booked calls" description={`${upcoming.length} upcoming`} />
          {bookings.isLoading ? (
            <div className="p-5">
              <ListSkeleton rows={1} />
            </div>
          ) : null}
          {bookings.error ? (
            <div className="p-5">
              <Notice tone="error">{errorMessage(bookings.error)}</Notice>
            </div>
          ) : null}
          {bookings.data && upcoming.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={CalendarClock}
                title="No one has booked yet"
                className="border-0 bg-transparent py-6"
              >
                Share your booking page to get started.
              </EmptyState>
            </div>
          ) : null}
          <div className="divide-y divide-line">
            {upcoming.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Open slots" description={`${openSlots.length} available`} />
          {slots.error ? (
            <div className="p-5">
              <Notice tone="error">{errorMessage(slots.error)}</Notice>
            </div>
          ) : null}
          {slots.data && openSlots.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={CalendarPlus}
                title="No open slots"
                className="border-0 bg-transparent py-6"
              >
                Add one above and it appears on your booking page.
              </EmptyState>
            </div>
          ) : null}
          <div className="divide-y divide-line">
            {openSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-4">
                  <DateTile value={slot.startsAt} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{formatDay(slot.startsAt)}</p>
                    <p className="text-[13px] text-ink-soft">
                      {formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove the slot on ${formatDay(slot.startsAt)} at ${formatTime(slot.startsAt)}`}
                  disabled={deleteSlot.isPending}
                  className="hover:text-brand-dark"
                  onClick={() => deleteSlot.mutate(slot.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
