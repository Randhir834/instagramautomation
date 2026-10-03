import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ContactFormInput, contactFormSchema } from '@repo/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AppConfig } from '../../config/configuration';
import { EmailService } from '../email/email.service';
import { emailLayout, escapeHtml } from '../email/templates/layout';

/** The website's "Contact us" form. Messages are emailed to SUPPORT_EMAIL. */
@Controller('public/contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(
    private readonly email: EmailService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async send(
    @Body(new ZodValidationPipe(contactFormSchema)) dto: ContactFormInput,
  ): Promise<{ received: true }> {
    const to = this.config.get('email.support', { infer: true });
    if (!to) {
      // Never lose a message silently: it stays in the server log until an inbox is set.
      this.logger.warn(
        `Contact form (no SUPPORT_EMAIL set): ${dto.topic} from ${dto.name} <${dto.email}>: ${dto.message}`,
      );
      return { received: true };
    }
    const body =
      `<p style="margin:0 0 8px"><strong>From:</strong> ${escapeHtml(dto.name)} (${escapeHtml(dto.email)})</p>` +
      `<p style="margin:0 0 16px"><strong>Topic:</strong> ${escapeHtml(dto.topic)}</p>` +
      `<p style="margin:0;white-space:pre-wrap">${escapeHtml(dto.message)}</p>`;
    await this.email.send({
      to,
      subject: `[Contact] ${dto.topic}: ${dto.name}`,
      html: emailLayout(
        this.config.get('appName', { infer: true }),
        'New message from the website',
        body,
      ),
    });
    return { received: true };
  }
}
