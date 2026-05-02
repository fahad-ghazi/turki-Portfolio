import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi } from '../../lib/serialize.js';

const schema = z.object({
  project_id: z.string().min(1).max(120),
  category_id: z.string().min(1).max(120),
  action: z.enum(['like', 'share']),
  user_identifier: z.string().max(120).optional().nullable(),
});

export const publicInteractionsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post(
    '/interactions',
    {
      config: {
        rateLimit: { max: 30, timeWindow: '1 minute', keyGenerator: (req) => req.ip },
      },
    },
    async (req, reply) => {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid input' } });
      }
      const created = await app.prisma.projectInteraction.create({
        data: {
          projectId: parsed.data.project_id,
          categoryId: parsed.data.category_id,
          action: parsed.data.action,
          userIdentifier: parsed.data.user_identifier ?? null,
        },
      });
      return reply.code(201).send(toApi(created));
    },
  );

  app.get('/interactions/counts', async (req, reply) => {
    const querySchema = z.object({
      project_id: z.string().optional(),
      category_id: z.string().optional(),
    });
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid query' } });
    }
    const where: Record<string, unknown> = {};
    if (parsed.data.project_id) where.projectId = parsed.data.project_id;
    if (parsed.data.category_id) where.categoryId = parsed.data.category_id;

    const grouped = await app.prisma.projectInteraction.groupBy({
      by: ['projectId', 'action'],
      where,
      _count: { _all: true },
    });

    return grouped.map((g) => ({
      project_id: g.projectId,
      action: g.action,
      count: g._count._all,
    }));
  });
};
