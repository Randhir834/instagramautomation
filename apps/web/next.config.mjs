import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(dirname, '../..');

// One .env at the repo root is shared by the API and the web app.
loadEnv({ path: path.join(repoRoot, '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a production build run next to `next dev` without sharing its folder:
  //   NEXT_DIST_DIR=.next-build pnpm build
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Only non-secret values may be exposed to the browser here.
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME ?? 'APP_NAME',
    NEXT_PUBLIC_API_URL: process.env.API_URL ?? 'http://localhost:4000',
    NEXT_PUBLIC_WEB_URL: process.env.WEB_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? '',
  },
  // Linting runs from the repo root (`pnpm lint`) with the shared config.
  eslint: { ignoreDuringBuilds: true },
  // Standalone output is for the Docker image only (it needs symlinks,
  // which fail on Windows without developer mode).
  ...(process.env.BUILD_STANDALONE === '1'
    ? { output: 'standalone', outputFileTracingRoot: repoRoot }
    : {}),
};

export default nextConfig;
