import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSlotsInput, slotsOverlap } from '@repo/shared';
import { PrismaService } from '../../prisma/prisma.service';

/** Slots the creator has opened for 1:1 calls. */
@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  listSlots(userId: string) {
    return this.prisma.bookingSlot.findMany({
      where: { userId, endsAt: { gte: new Date() } },
      select: { id: true, startsAt: true, endsAt: true, isBooked: true },
      orderBy: { startsAt: 'asc' },
    });
  }

  async listOpenSlots(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true, name: true, username: true },
    });
    if (!user) throw new NotFoundException('Creator not found');
    const slots = await this.prisma.bookingSlot.findMany({
      where: { userId: user.id, isBooked: false, startsAt: { gt: new Date() } },
      select: { id: true, startsAt: true, endsAt: true },
      orderBy: { startsAt: 'asc' },
      take: 200,
    });
    return { creator: { name: user.name, username: user.username }, slots };
  }

  async createSlots(userId: string, dto: CreateSlotsInput) {
    const now = new Date();
    const sorted = [...dto.slots].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

    for (const [i, slot] of sorted.entries()) {
      if (slot.startsAt <= now) throw new BadRequestException('Slots must be in the future');
      const next = sorted[i + 1];
      if (next && slotsOverlap(slot, next)) {
        throw new BadRequestException('Two of these slots overlap each other');
      }
    }

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) throw new BadRequestException('Add at least one slot');
    const clash = await this.prisma.bookingSlot.findFirst({
      where: {
        userId,
        startsAt: { lt: last.endsAt },
        endsAt: { gt: first.startsAt },
        OR: sorted.map((s) => ({ startsAt: { lt: s.endsAt }, endsAt: { gt: s.startsAt } })),
      },
    });
    if (clash) throw new ConflictException('One of these overlaps a slot you already have');

    await this.prisma.bookingSlot.createMany({
      data: sorted.map((s) => ({ userId, startsAt: s.startsAt, endsAt: s.endsAt })),
    });
    return this.listSlots(userId);
  }

  async deleteSlot(userId: string, slotId: string): Promise<void> {
    const slot = await this.prisma.bookingSlot.findFirst({ where: { id: slotId, userId } });
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.isBooked) {
      throw new ConflictException('This slot is booked. Cancel the booking first.');
    }
    await this.prisma.bookingSlot.delete({ where: { id: slotId } });
  }
}
