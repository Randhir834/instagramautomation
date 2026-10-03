/** Typed config tree built from validated env vars. Read via ConfigService<AppConfig, true>. */
export default function configuration() {
  const env = process.env;
  const apiUrl = env.API_URL ?? 'http://localhost:4000';
  return {
    appName: env.APP_NAME ?? 'APP_NAME',
    nodeEnv: env.NODE_ENV ?? 'development',
    isProd: env.NODE_ENV === 'production',
    webUrl: env.WEB_URL ?? 'http://localhost:3000',
    apiUrl,
    port: Number(env.PORT ?? new URL(apiUrl).port ?? 4000) || 4000,
    databaseUrl: env.DATABASE_URL ?? '',
    redisUrl: env.REDIS_URL ?? 'redis://localhost:6379',
    auth: {
      jwtSecret: env.JWT_SECRET ?? '',
      jwtExpiresIn: '7d' as const,
      googleClientId: env.GOOGLE_CLIENT_ID ?? '',
      googleClientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
    },
    security: {
      tokenEncryptionKey: env.TOKEN_ENCRYPTION_KEY ?? '',
    },
    meta: {
      appId: env.META_APP_ID ?? '',
      appSecret: env.META_APP_SECRET ?? '',
      webhookVerifyToken: env.META_WEBHOOK_VERIFY_TOKEN ?? '',
      redirectUri: env.META_REDIRECT_URI || `${apiUrl}/instagram/callback`,
      // Instagram API with Instagram Login. Version checked against Meta docs, Oct 2026.
      graphUrl: env.META_GRAPH_URL || 'https://graph.instagram.com/v25.0',
      oauthUrl: env.META_OAUTH_URL || 'https://api.instagram.com',
      authorizeUrl: env.META_AUTHORIZE_URL || 'https://www.instagram.com/oauth/authorize',
    },
    razorpay: {
      keyId: env.RAZORPAY_KEY_ID ?? '',
      keySecret: env.RAZORPAY_KEY_SECRET ?? '',
      webhookSecret: env.RAZORPAY_WEBHOOK_SECRET ?? '',
      planPremiumId: env.RAZORPAY_PLAN_PREMIUM_ID ?? '',
      planProfessionalId: env.RAZORPAY_PLAN_PROFESSIONAL_ID ?? '',
      apiUrl: env.RAZORPAY_API_URL || 'https://api.razorpay.com/v1',
    },
    r2: {
      accountId: env.R2_ACCOUNT_ID ?? '',
      accessKeyId: env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? '',
      bucket: env.R2_BUCKET ?? '',
      publicUrl: env.R2_PUBLIC_URL ?? '',
    },
    email: {
      resendApiKey: env.RESEND_API_KEY ?? '',
      from: env.EMAIL_FROM ?? '',
      apiUrl: env.RESEND_API_URL || 'https://api.resend.com',
    },
    sentryDsn: env.SENTRY_DSN ?? '',
    chromePath: env.PUPPETEER_EXECUTABLE_PATH ?? '',
  };
}

export type AppConfig = ReturnType<typeof configuration>;
