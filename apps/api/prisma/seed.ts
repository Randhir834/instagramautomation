import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Creates a demo user so the dashboard has something to show locally. */
async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo Creator',
      username: 'demo',
      // No password: real auth arrives in Phase 1.
    },
  });
  console.log(`Seeded user ${user.email} (${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
