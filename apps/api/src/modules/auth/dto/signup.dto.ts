import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export type SignupDto = z.infer<typeof signupSchema>;
