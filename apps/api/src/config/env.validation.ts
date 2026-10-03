import { z } from 'zod';

const optional = z.string().optional().default('');

/**
 * Core vars are required so the app fails fast on boot.
 * Integration keys are optional until the phase that uses them;
 * each service checks for its own keys when called.
 */
export const envSchema = z.object({
  APP_NAME: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  WEB_URL: z.string().url(),
  API_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().optional(),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,

  TOKEN_ENCRYPTION_KEY: z
    .string()
    .refine(
      (v) => Buffer.from(v, 'base64').length === 32,
      'TOKEN_ENCRYPTION_KEY must be 32 bytes, base64-encoded',
    ),

  META_APP_ID: optional,
  META_APP_SECRET: optional,
  META_WEBHOOK_VERIFY_TOKEN: optional,
  META_REDIRECT_URI: optional,

  RAZORPAY_KEY_ID: optional,
  RAZORPAY_KEY_SECRET: optional,
  RAZORPAY_WEBHOOK_SECRET: optional,
  RAZORPAY_PLAN_PREMIUM_ID: optional,
  RAZORPAY_PLAN_PROFESSIONAL_ID: optional,

  R2_ACCOUNT_ID: optional,
  R2_ACCESS_KEY_ID: optional,
  R2_SECRET_ACCESS_KEY: optional,
  R2_BUCKET: optional,
  R2_PUBLIC_URL: optional,

  RESEND_API_KEY: optional,
  EMAIL_FROM: optional,

  SENTRY_DSN: optional,

  // Optional overrides, only used by tests to point at fake servers.
  META_GRAPH_URL: optional,
  META_OAUTH_URL: optional,
  META_AUTHORIZE_URL: optional,
  RAZORPAY_API_URL: optional,
  RESEND_API_URL: optional,
  PUPPETEER_EXECUTABLE_PATH: optional,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}\nSee .env.example`);
  }
  return result.data;
}
