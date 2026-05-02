import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const errorTypes = z.enum([
  'javascript',
  'api',
  'failed_request',
  'image_loading',
  'video_loading',
  'performance',
  'broken_link',
]);
const severities = z.enum(['low', 'medium', 'high', 'critical']);

const schema = z.object({
  page: z.string().min(1).max(300),
  error_type: errorTypes.default('javascript'),
  message: z.string().min(1).max(4000),
  device: z.string().max(60).optional().nullable(),
  browser: z.string().max(500).optional().nullable(),
  severity: severities.default('medium'),
});

export const publicErrorsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post(
    '/site-errors',
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
      // Dedup: same page + same message → bump count instead of inserting
      const existing = await app.prisma.siteError.findFirst({
        where: { page: parsed.data.page, message: parsed.data.message, status: 'open' },
        select: { id: true },
      });
      if (existing) {
        await app.prisma.siteError.update({
          where: { id: existing.id },
          data: { count: { increment: 1 }, updatedAt: new Date() },
        });
      } else {
        await app.prisma.siteError.create({
          data: {
            page: parsed.data.page,
            errorType: parsed.data.error_type,
            message: parsed.data.message,
            device: parsed.data.device ?? null,
            browser: parsed.data.browser?.slice(0, 500) ?? null,
            severity: parsed.data.severity,
          },
        });
      }
      return reply.code(202).send({ ok: true });
    },
  );
};
