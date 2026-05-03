// Generic admin CRUD over a fixed allowlist of entities.
// Path: /api/admin/entities/:entity[/:id]
// Verbs: GET (list/one), POST (create), PATCH (update), DELETE (delete)
//
// Pipeline for writes:
//   1. validate :entity is in the allowlist
//   2. parse the body with the per-entity Zod schema (if one exists)
//   3. translate snake_case API keys to camelCase Prisma fields
//   4. call Prisma model accessor
//   5. write an admin_actions row describing what just happened

import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi, fromApi } from '../../lib/serialize.js';
import { toPrismaOrderBy } from '../../lib/orderBy.js';
import { logAdminAction } from '../../lib/audit.js';
import { SCHEMAS_BY_ENTITY } from '../../schemas/entities.js';
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
  | 'source_ideas'
  | 'characters'
  | 'admin_actions';

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
    case 'characters':
      return prisma.character as unknown as ModelDelegate;
    case 'admin_actions':
      return prisma.adminAction as unknown as ModelDelegate;
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
  'characters',
  'admin_actions',
]);

// Read-only entities — admin_actions is an audit log, mutating it
// from the UI defeats its purpose. Listing is fine; creating/editing/
// deleting is not.
const READ_ONLY_ENTITIES: ReadonlySet<EntityKey> = new Set(['admin_actions']);

const listQuerySchema = z.object({
  order_by: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

function denyReadOnly(entity: EntityKey, reply: import('fastify').FastifyReply): boolean {
  if (READ_ONLY_ENTITIES.has(entity)) {
    reply.code(405).send({
      error: { code: 'READ_ONLY', message: `${entity} is a read-only audit log` },
    });
    return true;
  }
  return false;
}

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
    if (denyReadOnly(params.data.entity, reply)) return;
    const schema = SCHEMAS_BY_ENTITY[params.data.entity]?.create;
    let body: unknown = req.body;
    if (schema) {
      const validated = schema.safeParse(body);
      if (!validated.success) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION',
            message: 'Invalid input',
            details: validated.error.flatten(),
          },
        });
      }
      body = validated.data;
    }
    const data = fromApi(body);
    const model = modelFor(app.prisma, params.data.entity);
    const created = (await model.create({ data })) as { id?: string };
    await logAdminAction(app.prisma, req, {
      action: 'create',
      entity: params.data.entity,
      entityId: created?.id,
      payload: body,
    });
    return reply.code(201).send(toApi(created));
  });

  app.patch('/entities/:entity/:id', async (req, reply) => {
    const params = z
      .object({ entity: entityKeySchema, id: z.string().min(1) })
      .safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    }
    if (denyReadOnly(params.data.entity, reply)) return;
    const schema = SCHEMAS_BY_ENTITY[params.data.entity]?.update;
    let body: unknown = req.body;
    if (schema) {
      const validated = schema.safeParse(body);
      if (!validated.success) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION',
            message: 'Invalid input',
            details: validated.error.flatten(),
          },
        });
      }
      body = validated.data;
    }
    const data = fromApi(body);
    const model = modelFor(app.prisma, params.data.entity);
    const updated = await model.update({ where: { id: params.data.id }, data });
    await logAdminAction(app.prisma, req, {
      action: 'update',
      entity: params.data.entity,
      entityId: params.data.id,
      payload: body,
    });
    return toApi(updated);
  });

  app.delete('/entities/:entity/:id', async (req, reply) => {
    const params = z
      .object({ entity: entityKeySchema, id: z.string().min(1) })
      .safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    }
    if (denyReadOnly(params.data.entity, reply)) return;
    const model = modelFor(app.prisma, params.data.entity);
    await model.delete({ where: { id: params.data.id } });
    await logAdminAction(app.prisma, req, {
      action: 'delete',
      entity: params.data.entity,
      entityId: params.data.id,
    });
    return reply.code(204).send();
  });
};
