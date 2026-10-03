import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/** Transactional email through Resend's HTTP API. */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  private get email() {
    return this.config.get('email', { infer: true });
  }

  get isConfigured(): boolean {
    return Boolean(this.email.resendApiKey && this.email.from);
  }

  /**
   * Sends an email. Never throws: a failed email must not undo the payment or
   * booking that triggered it. Returns whether it was actually sent.
   * Without Resend keys (local development) the email is only logged.
   */
  async send(input: SendEmailInput): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.log(`[email not sent: Resend not configured] to=${input.to} "${input.subject}"`);
      return false;
    }
    try {
      const res = await fetch(`${this.email.apiUrl}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.email.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.email.from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        this.logger.error(
          `Resend rejected email to ${input.to}: ${res.status} ${await res.text()}`,
        );
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(`Email to ${input.to} failed: ${(err as Error).message}`);
      return false;
    }
  }
}
