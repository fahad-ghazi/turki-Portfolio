import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { leadCreateSchema } from '../../schemas/lead.js';
import { hashIp } from '../../lib/ipHash.js';
import { toApi } from '../../lib/serialize.js';
import { notifyNewLead } from '../../lib/notify.js';

export const publicLeadsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post(
    '/leads',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 hour',
          keyGenerator: (req) => req.ip,
        },
      },
    },
    async (req, reply) => {
      const parsed = leadCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: { code: 'VALIDATION', message: 'Invalid input', details: parsed.error.flatten() },
        });
      }

      // Honeypot — silently succeed so bots don't retry
      if (parsed.data.website && parsed.data.website.length > 0) {
        req.log.warn({ ip: req.ip }, 'lead honeypot triggered');
        return reply.code(202).send({ ok: true });
      }

      const { website: _, ...payload } = parsed.data;
      const lead = await app.prisma.leadRequest.create({
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone ?? null,
          company: payload.company ?? null,
          requestType: payload.request_type,
          projectType: payload.project_type ?? null,
          approxBudget: payload.approx_budget ?? null,
          preferredTime: payload.preferred_time ?? null,
          message: payload.message ?? null,
          source: payload.source ?? null,
          sourcePage: payload.source_page ?? null,
          ipHash: hashIp(req.ip),
          userAgent: req.headers['user-agent']?.slice(0, 500) ?? null,
        },
      });

      // Best-effort notify; never block the response on email
      notifyNewLead({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        requestType: lead.requestType,
        projectType: lead.projectType,
        approxBudget: lead.approxBudget,
        message: lead.message,
        sourcePage: lead.sourcePage,
      }).catch((err) => req.log.error({ err }, 'lead notification failed'));

      return reply.code(201).send(toApi({ id: lead.id, status: lead.status, createdAt: lead.createdAt }));
    },
  );
};
