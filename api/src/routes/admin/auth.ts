import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../../lib/hash.js';
import { env } from '../../env.js';

const loginSchema = z.object({
  email: z.string().email().max(180),
  password: z.string().min(8).max(200),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(200),
  newPassword: z.string().min(8).max(200),
});

const COOKIE_NAME = 'turki_admin_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  signed: true,
  path: '/',
};

export const adminAuthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post(
    '/login',
    {
      config: {
        rateLimit: { max: 10, timeWindow: '15 minutes', keyGenerator: (req) => req.ip },
      },
    },
    async (req, reply) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid input' } });
      }
      const admin = await app.prisma.admin.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      // Always do hash verify even on miss — constant-time-ish to slow enumeration
      const ok = admin
        ? await verifyPassword(admin.passwordHash, parsed.data.password)
        : await verifyPassword(
            '$argon2id$v=19$m=65536,t=3,p=4$YWJjZGVmZ2hpamtsbW5vcA$d3JvbmcgcGFzc3dvcmQK',
            parsed.data.password,
          );
      if (!admin || !ok) {
        return reply.code(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      }

      await app.prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });

      const token = app.jwt.sign({ sub: admin.id, email: admin.email, role: 'admin' });
      reply.setCookie(COOKIE_NAME, token, COOKIE_OPTS);
      return reply.send({ id: admin.id, email: admin.email, name: admin.name });
    },
  );

  app.post('/logout', async (req, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: '/' });
    return reply.send({ ok: true });
  });

  app.get('/me', { preHandler: [app.requireAdmin] }, async (req) => {
    const admin = await app.prisma.admin.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, email: true, name: true, lastLoginAt: true },
    });
    return admin;
  });

  // Self-service password change. Lets the admin rotate their own credentials
  // from the UI so we can drop ADMIN_PASSWORD from runtime env.
  app.post(
    '/me/password',
    {
      preHandler: [app.requireAdmin],
      config: {
        rateLimit: { max: 5, timeWindow: '15 minutes', keyGenerator: (req) => req.ip },
      },
    },
    async (req, reply) => {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: { code: 'VALIDATION', message: 'Invalid input', details: parsed.error.flatten() },
        });
      }
      const { currentPassword, newPassword } = parsed.data;
      if (currentPassword === newPassword) {
        return reply.code(400).send({
          error: { code: 'SAME_PASSWORD', message: 'New password must differ from current' },
        });
      }
      const admin = await app.prisma.admin.findUnique({ where: { id: req.admin!.id } });
      if (!admin) {
        return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Admin not found' } });
      }
      const ok = await verifyPassword(admin.passwordHash, currentPassword);
      if (!ok) {
        return reply.code(401).send({
          error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' },
        });
      }
      const newHash = await hashPassword(newPassword);
      await app.prisma.admin.update({
        where: { id: admin.id },
        data: { passwordHash: newHash },
      });
      return reply.send({ ok: true });
    },
  );
};
