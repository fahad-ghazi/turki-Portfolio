import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { seedContentForce } from '../../seed/seedContent.js';

// Force-reseed endpoint: re-runs the JSON → DB upsert. Useful when the
// admin updates the bundled catalog and wants to reset DB rows back to
// the canonical baseline. Idempotent — only touches rows by static id.
export const adminSeedRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post('/seed/content', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const result = await seedContentForce(app.prisma, app.log);
    return reply.send(result);
  });
};
