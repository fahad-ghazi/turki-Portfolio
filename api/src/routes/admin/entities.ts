// Generic admin CRUD over a fixed allowlist of entities.
// Path: /api/admin/entities/:entity[/:id]
// Verbs: GET (list/one), POST (create), PATCH (update), DELETE (delete)
//
// We use an allowlist + Prisma model accessor mapping rather than
// dynamic indexing so a typo in the URL can't reach an unrelated table.

import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi, fromApi } from '../../lib/serialize.js';
import { toPrismaOrderBy } from '../../lib/orderBy.js';
import type { PrismaClient } from '@prisma/client';

type EntityKey =
  | 'portfolio_projects'
  | 'films'
  | 'blog_posts'
  | 'media_assets'
  | 'site_content'
  | 'lead_requests'
  | 'project_interactions'
  | 'analytics_events'
  | 'site_errors'
  | 'seo_issues'
  | 'source_ideas';

type ModelDelegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<unknown | null>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
  count: (args?: unknown) => Promise<number>;
};

function modelFor(prisma: PrismaClient, entity: EntityKey): ModelDelegate {
  switch (entity) {
    case 'portfolio_projects':
      return prisma.portfolioProject as unknown as ModelDelegate;
    case 'films':
      return prisma.film as unknown as ModelDelegate;
    case 'blog_posts':
      return prisma.blogPost as unknown as ModelDelegate;
    case 'media_assets':
      return prisma.mediaAsset as unknown as ModelDelegate;
    case 'site_content':
      return prisma.siteContent as unknown as ModelDelegate;
    case 'lead_requests':
      return prisma.leadRequest as unknown as ModelDelegate;
    case 'project_interactions':
      return prisma.projectInteraction as unknown as ModelDelegate;
    case 'analytics_events':
      return prisma.analyticsEvent as unknown as ModelDelegate;
    case 'site_errors':
      return prisma.siteError as unknown as ModelDelegate;
    case 'seo_issues':
      return prisma.seoIssue as unknown as ModelDelegate;
    case 'source_ideas':
      return prisma.sourceIdea as unknown as ModelDelegate;
  }
}

const entityKeySchema = z.enum([
  'portfolio_projects',
  'films',
  'blog_posts',
  'media_assets',
  'site_content',
  'lead_requests',
  'project_interactions',
  'analytics_events',
  'site_errors',
  'seo_issues',
  'source_ideas',
]);

const listQuerySchema = z.object({
  order_by: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminEntityRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.requireAdmin);

  app.get('/entities/:entity', async (req, reply) => {
    const params = z.object({ entity: entityKeySchema }).safeParse(req.params);
    const query = listQuerySchema.safeParse(req.query);
    if (!params.success || !query.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    }
    const model = modelFor(app.prisma, params.data.entity);
    const orderBy = toPrismaOrderBy(query.data.order_by ?? '-created_date');
    const [items, total] = await Promise.all([
      model.findMany({ orderBy, take: query.data.limit, skip: query.data.offset }),
      model.count(),
    ]);
    return { items: toApi(items), total };
  });

  app.get('/entities/:entity/:id', async (req, reply) => {
    const params = z
      .object({ entity: entityKeySchema, id: z.string().min(1) })
      .safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    }
    const model = modelFor(app.prisma, params.data.entity);
    const item = await model.findUnique({ where: { id: params.data.id } });
    if (!item) {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Not found' } });
    }
    return toApi(item);
  });

  app.post('/entities/:entity', async (req, reply) => {
    const params = z.object({ entity: entityKeySchema }).safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    }
    const data = fromApi(req.body);
    const model = modelFor(app.prisma, params.data.entity);
    const created = await model.create({ data });
    return reply.code(201).send(toApi(created));
  });

  app.patch('/entities/:entity/:id', async (req, reply) => {
    const params = z
      .object({ entity: entityKeySchema, id: z.string().min(1) })
      .safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    }
    const data = fromApi(req.body);
    const model = modelFor(app.prisma, params.data.entity);
    const updated = await model.update({ where: { id: params.data.id }, data });
    return toApi(updated);
  });

  app.delete('/entities/:entity/:id', async (req, reply) => {
    const params = z
      .object({ entity: entityKeySchema, id: z.string().min(1) })
      .safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    }
    const model = modelFor(app.prisma, params.data.entity);
    await model.delete({ where: { id: params.data.id } });
    return reply.code(204).send();
  });
};
