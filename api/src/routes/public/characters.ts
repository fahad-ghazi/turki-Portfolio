import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi } from '../../lib/serialize.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const publicCharactersRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/characters', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid query' } });
    }
    const characters = await app.prisma.character.findMany({
      where: { publishStatus: 'published' },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: parsed.data.limit,
    });
    return toApi(characters);
  });

  app.get('/characters/:id', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid id' } });
    }
    const ch = await app.prisma.character.findFirst({
      where: { id: params.data.id, publishStatus: 'published' },
    });
    if (!ch) {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Character not found' } });
    }
    return toApi(ch);
  });
};
