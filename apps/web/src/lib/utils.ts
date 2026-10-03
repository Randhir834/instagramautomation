import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Brand placeholder: always read from env, never hardcode. */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'APP_NAME';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

/** Merges Tailwind classes (shadcn/ui helper). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** 49900 -> "₹499" (drops ".00", keeps real paise) */
export function formatMoney(amountInSmallestUnit: number, currency = 'INR'): string {
  const whole = amountInSmallestUnit % 100 === 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
  }).format(amountInSmallestUnit / 100);
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatTime(value: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' }).format(new Date(value));
}

/** "Tuesday, 6 October" */
export function formatDay(value: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}
