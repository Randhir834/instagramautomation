import * as Sentry from '@sentry/node';

let enabled = false;

/** Turns on error monitoring when SENTRY_DSN is set. Safe to call when it is not. */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || enabled) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0,
  });
  enabled = true;
}

/** Reports an unexpected error. Does nothing when Sentry is not configured. */
export function captureError(error: unknown): void {
  if (enabled) Sentry.captureException(error);
}
