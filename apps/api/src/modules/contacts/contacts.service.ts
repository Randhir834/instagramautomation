import { Injectable, NotFoundException } from '@nestjs/common';
import type { Contact, Prisma } from '@prisma/client';
import type { ListContactsQuery, Paginated, UpdateContactInput } from '@repo/shared';
import { PrismaService } from '../../prisma/prisma.service';

const EXPORT_LIMIT = 50_000;

/** Quotes a CSV cell and defuses spreadsheet formulas (=, +, -, @ at the start). */
function csvCell(value: string | null | undefined): string {
  let text = value ?? '';
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Leads CRM: everyone who interacted with a connected account. */
@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  private where(userId: string, query: Partial<ListContactsQuery>): Prisma.ContactWhereInput {
    return {
      igAccount: { userId },
      ...(query.igAccountId ? { igAccountId: query.igAccountId } : {}),
      ...(query.tag ? { tags: { has: query.tag } } : {}),
      ...(query.search
        ? {
            OR: [
              { username: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };
  }

  async list(userId: string, query: ListContactsQuery): Promise<Paginated<Contact>> {
    const where = this.where(userId, query);
    const [items, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { lastInteractionAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.contact.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async update(userId: string, id: string, dto: UpdateContactInput): Promise<Contact> {
    await this.getOwned(userId, id);
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.prisma.contact.delete({ where: { id } });
  }

  async exportCsv(userId: string): Promise<string> {
    const contacts = await this.prisma.contact.findMany({
      where: this.where(userId, {}),
      orderBy: { createdAt: 'desc' },
      take: EXPORT_LIMIT,
    });
    const header = 'username,email,phone,tags,last_interaction,created';
    const rows = contacts.map((c) =>
      [
        csvCell(c.username),
        csvCell(c.email),
        csvCell(c.phone),
        csvCell(c.tags.join('; ')),
        csvCell(c.lastInteractionAt.toISOString()),
        csvCell(c.createdAt.toISOString()),
      ].join(','),
    );
    return [header, ...rows].join('\r\n');
  }

  /** Creates the contact on first interaction, otherwise bumps lastInteractionAt. */
  upsertFromInteraction(
    igAccountId: string,
    igScopedUserId: string,
    username?: string,
  ): Promise<Contact> {
    return this.prisma.contact.upsert({
      where: { igAccountId_igScopedUserId: { igAccountId, igScopedUserId } },
      create: { igAccountId, igScopedUserId, username },
      update: { lastInteractionAt: new Date(), ...(username ? { username } : {}) },
    });
  }

  private async getOwned(userId: string, id: string): Promise<Contact> {
    const contact = await this.prisma.contact.findFirst({
      where: { id, igAccount: { userId } },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }
}
