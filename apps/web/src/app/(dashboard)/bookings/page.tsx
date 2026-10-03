'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Field, Notice, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border-2 border-ink bg-white p-5"
      noValidate
    >
      <h2 className="font-display text-xl">Open a slot</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
          <Select id="minutes" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </Select>
        </Field>
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
      <Button type="submit" className="mt-4" disabled={create.isPending}>
        {create.isPending ? 'Adding…' : 'Add slot'}
      </Button>
    </form>
  );
}

export default function BookingsPage() {
  const { data: user } = useCurrentUser();
  const slots = useSlots();
  const bookings = useBookings();
  const deleteSlot = useDeleteSlot();
  const cancel = useCancelBooking();
  const publicUrl = user ? `${WEB_URL}/book/${user.username}` : '';
  const upcoming = bookings.data?.filter((b) => b.status === 'CONFIRMED') ?? [];
  const openSlots = slots.data?.filter((s) => !s.isBooked) ?? [];
  const actionError = deleteSlot.error ?? cancel.error;

  return (
    <>
      <PageHeader title="Bookings" description="Open slots for 1:1 calls and see who booked." />

      {publicUrl ? (
        <Notice tone="info" className="mb-5">
          Your booking page:{' '}
          <a href={publicUrl} target="_blank" rel="noreferrer" className="break-all underline">
            {publicUrl}
          </a>
        </Notice>
      ) : null}
      {actionError ? (
        <Notice tone="error" className="mb-5">
          {errorMessage(actionError)}
        </Notice>
      ) : null}

      <AddSlotForm />

      <h2 className="mb-3 mt-8 font-display text-2xl">Booked calls</h2>
      {bookings.error ? <Notice tone="error">{errorMessage(bookings.error)}</Notice> : null}
      {bookings.data && upcoming.length === 0 ? (
        <EmptyState title="No one has booked yet">
          Share your booking page to get started.
        </EmptyState>
      ) : null}
      <ul className="space-y-3">
        {upcoming.map((booking) => (
          <li key={booking.id} className="rounded-xl border-2 border-ink bg-moss-tint p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  {formatDay(booking.slot.startsAt)}, {formatTime(booking.slot.startsAt)} to{' '}
                  {formatTime(booking.slot.endsAt)}
                </p>
                <p className="break-all text-sm">
                  {booking.guestName} ·{' '}
                  <a href={`mailto:${booking.guestEmail}`} className="underline">
                    {booking.guestEmail}
                  </a>
                </p>
                {booking.note ? (
                  <p className="mt-1 break-words text-sm text-ink/80">“{booking.note}”</p>
                ) : null}
              </div>
              <Button
                variant="outline"
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
                Cancel
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-8 font-display text-2xl">Open slots</h2>
      {slots.error ? <Notice tone="error">{errorMessage(slots.error)}</Notice> : null}
      {slots.data && openSlots.length === 0 ? (
        <EmptyState title="No open slots">
          Add one above and it appears on your booking page.
        </EmptyState>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {openSlots.map((slot) => (
          <li
            key={slot.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-white p-4"
          >
            <div>
              <p className="font-semibold">{formatDay(slot.startsAt)}</p>
              <p className="text-sm text-ink/75">
                {formatTime(slot.startsAt)} to {formatTime(slot.endsAt)} <Badge>Open</Badge>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={deleteSlot.isPending}
              onClick={() => deleteSlot.mutate(slot.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
