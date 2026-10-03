import { QUEUES } from '@repo/shared';

export { JOBS, QUEUES } from '@repo/shared';

/** Every queue registered with BullMQ. */
export const ALL_QUEUES = Object.values(QUEUES);

/** Defaults applied to every job unless overridden. */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5_000 },
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
} as const;
