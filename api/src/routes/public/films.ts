import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi } from '../../lib/serialize.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  order_by: z.string().optional(),
});

export const publicFilmsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/films', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid query' } });
    }
    const films = await app.prisma.film.findMany({
      where: { publishStatus: 'published' },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: parsed.data.limit,
    });
    return toApi(films);
  });
};
