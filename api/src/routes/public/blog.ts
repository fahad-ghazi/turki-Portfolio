import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toApi } from '../../lib/serialize.js';

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const publicBlogRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/blog', async (req, reply) => {
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid query' } });
    }
    const posts = await app.prisma.blogPost.findMany({
      where: { publishStatus: 'published' },
      orderBy: { updatedAt: 'desc' },
      take: parsed.data.limit,
      select: {
        id: true,
        title: true,
        slug: true,
        seoTitle: true,
        metaDescription: true,
        executiveSummary: true,
        heroImage: true,
        altText: true,
        keywords: true,
        publishStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return toApi(posts);
  });

  app.get('/blog/:slug', async (req, reply) => {
    const params = z.object({ slug: z.string().min(1).max(200) }).safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: { code: 'VALIDATION', message: 'Invalid slug' } });
    }
    const post = await app.prisma.blogPost.findFirst({
      where: { slug: params.data.slug, publishStatus: 'published' },
    });
    if (!post) {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Post not found' } });
    }
    return toApi(post);
  });
};
