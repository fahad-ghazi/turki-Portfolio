import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi } from '../../lib/serialize.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  work_type: z.string().optional(),
});

export const publicProjectsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/portfolio-projects', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid query' } });
    }
    const projects = await app.prisma.portfolioProject.findMany({
      where: {
        publishStatus: 'published',
        ...(parsed.data.work_type ? { workType: parsed.data.work_type } : {}),
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: parsed.data.limit,
    });
    return toApi(projects);
  });

  app.get('/portfolio-projects/:id', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid id' } });
    }
    const project = await app.prisma.portfolioProject.findFirst({
      where: { id: params.data.id, publishStatus: 'published' },
    });
    if (!project) {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }
    return toApi(project);
  });
};
