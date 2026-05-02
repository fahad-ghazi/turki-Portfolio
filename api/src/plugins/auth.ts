import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    admin?: { id: string; email: string };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: 'admin' };
    user: { sub: string; email: string; role: 'admin' };
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  app.decorate('requireAdmin', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
      const payload = req.user;
      if (payload.role !== 'admin') {
        return reply.code(403).send({ error: { code: 'FORBIDDEN', message: 'Admin only' } });
      }
      req.admin = { id: payload.sub, email: payload.email };
    } catch {
      return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Login required' } });
    }
  });
});
