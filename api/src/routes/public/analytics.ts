import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { hashIp } from '../../lib/ipHash.js';

const eventTypes = z.enum([
  'page_view',
  'project_view',
  'article_read',
  'button_click',
  'share',
  'like',
  'lead',
  'error',
]);

const singleEvent = z.object({
  event_name: z.string().min(1).max(120),
  event_type: eventTypes.default('page_view'),
  page: z.string().max(300).optional().nullable(),
  section: z.string().max(120).optional().nullable(),
  target_id: z.string().max(120).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  device: z.string().max(60).optional().nullable(),
  browser: z.string().max(500).optional().nullable(),
  country: z.string().max(60).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  session_duration: z.number().nonnegative().optional().nullable(),
  privacy_consent: z.boolean().default(false),
});

const batchSchema = z.object({
  events: z.array(singleEvent).min(1).max(50),
});

const bodySchema = z.union([singleEvent, batchSchema]);

export const publicAnalyticsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 60 events per minute per IP (room for bursty SPAs)
  app.post(
    '/analytics/events',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute', keyGenerator: (req) => req.ip },
      },
    },
    async (req, reply) => {
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: { code: 'VALIDATION', message: 'Invalid input' },
        });
      }
      const events = 'events' in parsed.data ? parsed.data.events : [parsed.data];
      const ipHash = hashIp(req.ip);

      await app.prisma.analyticsEvent.createMany({
        data: events.map((e) => ({
          eventName: e.event_name,
          eventType: e.event_type,
          page: e.page ?? null,
          section: e.section ?? null,
          targetId: e.target_id ?? null,
          referrer: e.referrer ?? null,
          device: e.device ?? null,
          browser: e.browser?.slice(0, 500) ?? null,
          country: e.country ?? null,
          city: e.city ?? null,
          sessionDuration: e.session_duration ?? null,
          privacyConsent: e.privacy_consent,
          ipHash,
        })),
        skipDuplicates: true,
      });

      return reply.code(202).send({ ok: true, count: events.length });
    },
  );
};
