import { emailButton, emailLayout, escapeHtml } from './layout';

export interface BuiltEmail {
  subject: string;
  html: string;
}

const p = (text: string) => `<p style="margin:0 0 12px">${text}</p>`;

/** Sent to a buyer once their payment is confirmed. */
export function deliveryEmail(params: {
  appName: string;
  productTitle: string;
  sellerName: string;
  downloadUrl: string;
}): BuiltEmail {
  const title = escapeHtml(params.productTitle);
  return {
    subject: `Your download: ${params.productTitle}`,
    html: emailLayout(
      params.appName,
      'Thanks for your purchase',
      p(`You bought <strong>${title}</strong> from ${escapeHtml(params.sellerName)}.`) +
        emailButton('Download your file', params.downloadUrl) +
        p('Keep this email. You can use the link again whenever you need the file.'),
    ),
  };
}

/** Sent to the guest who booked a call. */
export function bookingGuestEmail(params: {
  appName: string;
  creatorName: string;
  when: string;
}): BuiltEmail {
  return {
    subject: `Your call with ${params.creatorName} is booked`,
    html: emailLayout(
      params.appName,
      'Your call is booked',
      p(`You are booked with <strong>${escapeHtml(params.creatorName)}</strong>.`) +
        p(`<strong>When:</strong> ${escapeHtml(params.when)}`) +
        p(`${escapeHtml(params.creatorName)} will get in touch with the meeting details.`),
    ),
  };
}

/** Sent to the creator when someone books one of their slots. */
export function bookingCreatorEmail(params: {
  appName: string;
  guestName: string;
  guestEmail: string;
  when: string;
  note?: string | null;
  dashboardUrl: string;
}): BuiltEmail {
  return {
    subject: `New booking: ${params.guestName}`,
    html: emailLayout(
      params.appName,
      'You have a new booking',
      p(`<strong>${escapeHtml(params.guestName)}</strong> (${escapeHtml(params.guestEmail)})`) +
        p(`<strong>When:</strong> ${escapeHtml(params.when)}`) +
        (params.note ? p(`<strong>Note:</strong> ${escapeHtml(params.note)}`) : '') +
        emailButton('See your bookings', params.dashboardUrl),
    ),
  };
}
