import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CreateBookingInput } from '@repo/shared';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { bookingCreatorEmail, bookingGuestEmail } from '../email/templates/messages';

/** "Tue, 6 Oct 2026, 4:30 pm IST" */
function formatWhen(date: Date): string {
  return (
    new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    }).format(date) + ' IST'
  );
}

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  listForUser(userId: string) {
    return this.prisma.booking.findMany({
      where: { slot: { userId } },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        note: true,
        status: true,
        slot: { select: { id: true, startsAt: true, endsAt: true } },
      },
      orderBy: { slot: { startsAt: 'asc' } },
    });
  }

  async book(dto: CreateBookingInput) {
    const booking = await this.prisma.$transaction(async (tx) => {
      // Claim the slot atomically: only one request can flip isBooked from false to true.
      const claimed = await tx.bookingSlot.updateMany({
        where: { id: dto.slotId, isBooked: false, startsAt: { gt: new Date() } },
        data: { isBooked: true },
      });
      if (claimed.count !== 1) {
        throw new ConflictException('Sorry, that slot was just taken. Please pick another.');
      }
      // A cancelled booking may still sit on this slot; replace it.
      await tx.booking.deleteMany({ where: { slotId: dto.slotId } });
      return tx.booking.create({
        data: {
          slotId: dto.slotId,
          guestName: dto.guestName,
          guestEmail: dto.guestEmail,
          note: dto.note,
        },
        select: {
          id: true,
          guestName: true,
          guestEmail: true,
          note: true,
          slot: {
            select: {
              startsAt: true,
              endsAt: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
      });
    });

    const appName = this.config.get('appName', { infer: true });
    const when = formatWhen(booking.slot.startsAt);
    const creator = booking.slot.user;
    const guest = bookingGuestEmail({ appName, creatorName: creator.name, when });
    const host = bookingCreatorEmail({
      appName,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      when,
      note: booking.note,
      dashboardUrl: `${this.config.get('webUrl', { infer: true })}/bookings`,
    });
    // EmailService never throws, so a mail problem cannot undo the booking.
    await Promise.all([
      this.email.send({ to: booking.guestEmail, ...guest }),
      this.email.send({ to: creator.email, ...host }),
    ]);

    return {
      id: booking.id,
      startsAt: booking.slot.startsAt,
      endsAt: booking.slot.endsAt,
      creatorName: creator.name,
    };
  }

  /** Creator cancels a booking; the slot opens up again. */
  async cancel(userId: string, bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, slot: { userId } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    await this.prisma.$transaction([
      this.prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } }),
      this.prisma.bookingSlot.update({ where: { id: booking.slotId }, data: { isBooked: false } }),
    ]);
  }
}
