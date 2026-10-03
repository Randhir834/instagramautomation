import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load the root .env for e2e tests (ConfigModule also does this, but Prisma
// needs DATABASE_URL in process.env before modules are created).
const envPath = resolve(__dirname, '../../../.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/\s+#.*$/, '').trim();
    }
  }
}
