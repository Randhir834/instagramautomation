import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  calculateInvoiceTotals,
  CreateInvoiceInput,
  InvoiceItem,
  InvoiceStatus,
} from '@repo/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PdfService } from './pdf.service';

const PUBLIC_FIELDS = {
  id: true,
  number: true,
  clientName: true,
  items: true,
  currency: true,
  taxPercent: true,
  total: true,
  status: true,
  issuedAt: true,
  user: { select: { name: true } },
} as const;

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount / 100);
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly storage: StorageService,
  ) {}

  list(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      select: {
        id: true,
        number: true,
        clientName: true,
        currency: true,
        total: true,
        status: true,
        issuedAt: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateInvoiceInput) {
    const { total } = calculateInvoiceTotals(dto.items, dto.taxPercent);
    // Numbers run INV-0001, INV-0002... per creator. If two requests race for
    // the same number the unique index rejects one and we try the next.
    for (let attempt = 0; attempt < 5; attempt++) {
      const count = await this.prisma.invoice.count({ where: { userId } });
      const number = `INV-${String(count + 1 + attempt).padStart(4, '0')}`;
      try {
        return await this.prisma.invoice.create({
          data: {
            userId,
            number,
            clientName: dto.clientName,
            clientEmail: dto.clientEmail || null,
            items: dto.items as unknown as Prisma.InputJsonValue,
            currency: dto.currency,
            taxPercent: dto.taxPercent,
            total,
            status: 'DRAFT',
          },
          select: { id: true, number: true },
        });
      } catch (err) {
        if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') {
          throw err;
        }
      }
    }
    throw new Error('Could not allocate an invoice number');
  }

  async setStatus(userId: string, id: string, status: InvoiceStatus) {
    await this.getOwned(userId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.prisma.invoice.delete({ where: { id } });
  }

  /** Public view: the unguessable id is the share link. Drafts stay private. */
  async getPublic(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id }, select: PUBLIC_FIELDS });
    if (!invoice || invoice.status === 'DRAFT') throw new NotFoundException('Invoice not found');
    return this.present(invoice);
  }

  async getForOwner(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      select: PUBLIC_FIELDS,
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.present(invoice);
  }

  /** Renders the invoice as a PDF. `userId` set = owner access (drafts allowed). */
  async renderPdf(id: string, userId?: string): Promise<{ filename: string; pdf: Buffer }> {
    const invoice = userId ? await this.getForOwner(userId, id) : await this.getPublic(id);
    const html = this.pdf.renderHtml('invoice', {
      number: invoice.number,
      sellerName: invoice.sellerName,
      clientName: invoice.clientName,
      issuedAt: new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(invoice.issuedAt),
      currency: invoice.currency,
      taxPercent: invoice.taxPercent,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: money(item.unitPrice, invoice.currency),
        amount: money(Math.round(item.quantity * item.unitPrice), invoice.currency),
      })),
      subtotal: money(invoice.subtotal, invoice.currency),
      tax: money(invoice.tax, invoice.currency),
      total: money(invoice.total, invoice.currency),
    });
    const pdf = await this.pdf.htmlToPdf(html);

    // Keep a copy in storage when it is configured; the response does not depend on it.
    if (this.storage.isConfigured) {
      const key = `invoices/${id}.pdf`;
      this.storage
        .putObject(key, pdf, 'application/pdf')
        .then(() => this.prisma.invoice.update({ where: { id }, data: { pdfKey: key } }))
        .catch((err: Error) => this.logger.warn(`Could not store invoice PDF: ${err.message}`));
    }
    return { filename: `${invoice.number}.pdf`, pdf };
  }

  private present(invoice: Prisma.InvoiceGetPayload<{ select: typeof PUBLIC_FIELDS }>) {
    const items = invoice.items as unknown as InvoiceItem[];
    const taxPercent = Number(invoice.taxPercent);
    const totals = calculateInvoiceTotals(items, taxPercent);
    return {
      id: invoice.id,
      number: invoice.number,
      clientName: invoice.clientName,
      sellerName: invoice.user.name,
      items,
      currency: invoice.currency,
      taxPercent,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: invoice.total,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
    };
  }

  private async getOwned(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, userId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }
}
