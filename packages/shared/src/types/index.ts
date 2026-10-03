import type { PlanId } from '../constants/plans';

/** Shape of the logged-in user returned by `GET /auth/me`. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  plan: PlanId;
}

/** JWT payload stored in the httpOnly access cookie. */
export interface JwtPayload {
  sub: string;
  email: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

/** Job payload: raw Meta webhook body pushed by the receiver. */
export interface MetaEventJob {
  eventId: string;
  receivedAt: string;
  body: unknown;
}

/** Job payload: raw Razorpay webhook body pushed by the receiver. */
export interface RazorpayEventJob {
  eventId: string;
  receivedAt: string;
  body: unknown;
}

/** Job payload: send a DM in reply to a comment (private reply). */
export interface PrivateReplyJob {
  igAccountId: string;
  contactId: string;
  automationId: string;
  commentId: string;
  message: string;
}

/** Job payload: post a public reply under a comment. */
export interface CommentReplyJob {
  igAccountId: string;
  contactId: string;
  automationId: string;
  commentId: string;
  message: string;
}

/** Job payload: follow-up DM inside the 24h messaging window. */
export interface DmJob {
  igAccountId: string;
  contactId: string;
  automationId?: string;
  recipientId: string;
  message: string;
  quickReplies?: { title: string; payload: string }[];
  /** Adds Instagram's one-tap "share email / phone" chip. */
  askFor?: 'email' | 'phone';
}

/** Job payload: transactional email. */
export interface EmailJob {
  to: string;
  subject: string;
  html: string;
}
