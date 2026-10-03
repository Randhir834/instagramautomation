import { z } from 'zod';

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Describe the item').max(200),
  quantity: z.number().positive().max(100_000),
  /** Unit price in the smallest currency unit (paise for INR). */
  unitPrice: z.number().int().min(0).max(1_000_000_000),
});

export const invoiceStatusSchema = z.enum(['DRAFT', 'SENT', 'PAID', 'VOID']);

export const createInvoiceSchema = z.object({
  clientName: z.string().trim().min(1, 'Enter the client name').max(120),
  clientEmail: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item').max(50),
  currency: z.string().length(3).toUpperCase().default('INR'),
  taxPercent: z.number().min(0).max(100).default(0),
});

export const updateInvoiceStatusSchema = z.object({ status: invoiceStatusSchema });

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceFormValues = z.input<typeof createInvoiceSchema>;

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/** All amounts in the smallest currency unit, rounded to whole units. */
export function calculateInvoiceTotals(
  items: Pick<InvoiceItem, 'quantity' | 'unitPrice'>[],
  taxPercent: number,
): InvoiceTotals {
  const subtotal = Math.round(items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0));
  const tax = Math.round((subtotal * taxPercent) / 100);
  return { subtotal, tax, total: subtotal + tax };
}
