import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email();

/** Loose international phone check: optional +, 7-15 digits. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ''))
  .pipe(z.string().regex(/^\+?\d{7,15}$/, 'Invalid phone number'));

export const updateContactSchema = z.object({
  email: emailSchema.nullable().optional(),
  phone: phoneSchema.nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
});

export const listContactsQuerySchema = z.object({
  igAccountId: z.string().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
