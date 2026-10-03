import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer-core';
import type { AppConfig } from '../../config/configuration';

/** Where Chrome/Chromium/Edge usually lives, checked when PUPPETEER_EXECUTABLE_PATH is not set. */
const BROWSER_CANDIDATES = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

/** Renders a Handlebars template to HTML and prints it to PDF with headless Chrome. */
@Injectable()
export class PdfService {
  private readonly templates = new Map<string, Handlebars.TemplateDelegate>();

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  private browserPath(): string {
    const configured = this.config.get('chromePath', { infer: true });
    const found = configured || BROWSER_CANDIDATES.find((path) => existsSync(path));
    if (!found) {
      throw new ServiceUnavailableException(
        'PDF generation needs Chrome. Set PUPPETEER_EXECUTABLE_PATH to its location.',
      );
    }
    return found;
  }

  renderHtml(templateName: string, data: Record<string, unknown>): string {
    let template = this.templates.get(templateName);
    if (!template) {
      const source = readFileSync(join(__dirname, 'templates', `${templateName}.hbs`), 'utf8');
      // Handlebars escapes every {{value}}, so client names cannot inject HTML.
      template = Handlebars.compile(source);
      this.templates.set(templateName, template);
    }
    return template(data);
  }

  async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      executablePath: this.browserPath(),
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      // The invoice is self-contained: block any network request it might try to make.
      await page.setRequestInterception(true);
      page.on('request', (req) => (req.url().startsWith('data:') ? req.continue() : req.abort()));
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
