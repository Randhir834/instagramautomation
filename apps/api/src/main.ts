import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { initSentry } from './common/utils/sentry';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  initSentry();
  // rawBody is required to verify webhook signatures (Meta, Razorpay).
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const config = app.get(ConfigService<AppConfig, true>);

  // Behind a host's proxy (Railway, Render) the real client IP is in
  // X-Forwarded-For; rate limiting needs it.
  if (config.get('isProd', { infer: true })) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.enableCors({ origin: config.get('webUrl', { infer: true }), credentials: true });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableShutdownHooks();

  const port = config.get('port', { infer: true });
  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
