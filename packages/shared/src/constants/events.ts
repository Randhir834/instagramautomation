/** BullMQ queue names. One queue per kind of work. */
export const QUEUES = {
  META_EVENTS: 'meta-events',
  PRIVATE_REPLY: 'private-reply',
  COMMENT_REPLY: 'comment-reply',
  DM: 'dm',
  RAZORPAY_EVENTS: 'razorpay-events',
  EMAIL: 'email',
} as const;
export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/** Job names used inside the queues above. */
export const JOBS = {
  PROCESS_META_EVENT: 'process-meta-event',
  SEND_PRIVATE_REPLY: 'send-private-reply',
  SEND_COMMENT_REPLY: 'send-comment-reply',
  SEND_DM: 'send-dm',
  PROCESS_RAZORPAY_EVENT: 'process-razorpay-event',
  SEND_EMAIL: 'send-email',
} as const;
export type JobName = (typeof JOBS)[keyof typeof JOBS];

export const WEBHOOK_SOURCES = ['META', 'RAZORPAY'] as const;
export type WebhookSource = (typeof WEBHOOK_SOURCES)[number];
