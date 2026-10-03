import { z } from 'zod';

export const CONTACT_TOPICS = [
  'General question',
  'Help with my account',
  'Billing',
  'Privacy',
] as const;

/** The public "Contact us" form. */
export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  topic: z.enum(CONTACT_TOPICS),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more (at least 10 characters)')
    .max(3000, 'Please keep it under 3,000 characters'),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
