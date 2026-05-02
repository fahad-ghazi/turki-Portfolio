import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';

import { env } from './env.js';
import { prismaPlugin } from './plugins/prisma.js';
import { authPlugin } from './plugins/auth.js';
import { ensureAdminSeed } from './lib/seed.js';

import { publicLeadsRoutes } from './routes/public/leads.js';
import { publicAnalyticsRoutes } from './routes/public/analytics.js';
import { publicInteractionsRoutes } from './routes/public/interactions.js';
import { publicErrorsRoutes } from './routes/public/errors.js';
import { publicFilmsRoutes } from './routes/public/films.js';
import { publicProjectsRoutes } from './routes/public/projects.js';
import { publicBlogRoutes } from './routes/public/blog.js';
import { publicContentRoutes } from './routes/public/content.js';

import { adminAuthRoutes } from './routes/admin/auth.js';
import { adminEntityRoutes } from './routes/admin/entities.js';

async function main() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
          : undefined,
    },
    trustProxy: true,
    bodyLimit: 1024 * 1024, // 1MB
  });

  await app.register(sensible);
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
  });
  await app.register(cookie, { secret: env.COOKIE_SECRET });
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'turki_admin_token', signed: true },
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });
  await app.register(rateLimit, {
    global: false, // we apply per-route
  });

  await app.register(prismaPlugin);
  await app.register(authPlugin);

  // Health
  app.get('/health', async () => ({ ok: true, version: '0.1.0' }));
  app.get('/api/health', async () => ({ ok: true, version: '0.1.0' }));

  // Public routes
  await app.register(publicLeadsRoutes, { prefix: '/api' });
  await app.register(publicAnalyticsRoutes, { prefix: '/api' });
  await app.register(publicInteractionsRoutes, { prefix: '/api' });
  await app.register(publicErrorsRoutes, { prefix: '/api' });
  await app.register(publicFilmsRoutes, { prefix: '/api' });
  await app.register(publicProjectsRoutes, { prefix: '/api' });
  await app.register(publicBlogRoutes, { prefix: '/api' });
  await app.register(publicContentRoutes, { prefix: '/api' });

  // Admin routes (under /api/admin)
  await app.register(adminAuthRoutes, { prefix: '/api/admin' });
  await app.register(adminEntityRoutes, { prefix: '/api/admin' });

  // Seed admin if needed (idempotent)
  await ensureAdminSeed(app.prisma, app.log);

  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err }, 'unhandled error');
    if (reply.sent) return;
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    reply.code(status).send({
      error: {
        code: err.code || 'INTERNAL',
        message: status >= 500 ? 'Internal server error' : err.message,
      },
    });
  });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info({ port: env.PORT, host: env.HOST, env: env.NODE_ENV }, 'turki-api ready');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
