import type { PrismaClient } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';
import { env } from '../env.js';
import { hashPassword } from './hash.js';

export async function ensureAdminSeed(prisma: PrismaClient, log: FastifyBaseLogger) {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    log.warn(
      'ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed. Set both to bootstrap the first admin.',
    );
    return;
  }

  const existing = await prisma.admin.findUnique({ where: { email: env.ADMIN_EMAIL } });
  if (existing) {
    log.debug({ email: env.ADMIN_EMAIL }, 'admin already exists, skipping seed');
    return;
  }

  // Only seed if NO admin exists at all (avoid creating a back-door if env leaks later)
  const anyAdmin = await prisma.admin.findFirst();
  if (anyAdmin) {
    log.warn(
      { existing: anyAdmin.email },
      'an admin already exists; refusing to seed a different one. Update the existing admin via the DB or admin UI.',
    );
    return;
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const admin = await prisma.admin.create({
    data: { email: env.ADMIN_EMAIL, passwordHash, name: 'Owner' },
    select: { id: true, email: true },
  });
  log.info({ email: admin.email }, 'seeded initial admin');
}
