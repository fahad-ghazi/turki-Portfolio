import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi } from '../../lib/serialize.js';

const querySchema = z.object({
  page: z.string().max(120).optional(),
  section: z.string().max(120).optional(),
});

export const publicContentRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/site-content', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid query' } });
    }
    const where: Record<string, unknown> = { status: 'published' };
    if (parsed.data.page) where.page = parsed.data.page;
    if (parsed.data.section) where.section = parsed.data.section;

    const items = await app.prisma.siteContent.findMany({
      where,
      orderBy: [{ page: 'asc' }, { order: 'asc' }],
    });
    return toApi(items);
  });
};
