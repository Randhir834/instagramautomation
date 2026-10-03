import { z } from 'zod';

export const slotSchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((s) => s.endsAt > s.startsAt, 'The end time must be after the start time')
  .refine(
    (s) => s.endsAt.getTime() - s.startsAt.getTime() <= 8 * 60 * 60 * 1000,
    'A slot can be at most 8 hours long',
  );

export const createSlotsSchema = z.object({
  slots: z.array(slotSchema).min(1).max(100),
});

export const createBookingSchema = z.object({
  slotId: z.string().min(1),
  guestName: z.string().trim().min(1, 'Enter your name').max(100),
  guestEmail: z.string().trim().toLowerCase().email('Enter a valid email'),
  note: z.string().trim().max(1000).optional(),
});

export type SlotInput = z.infer<typeof slotSchema>;
export type CreateSlotsInput = z.infer<typeof createSlotsSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** True if two time ranges share any moment. Touching ends do not count. */
export function slotsOverlap(
  a: { startsAt: Date; endsAt: Date },
  b: { startsAt: Date; endsAt: Date },
): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}
