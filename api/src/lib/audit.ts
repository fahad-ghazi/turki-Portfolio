import type { FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { hashIp } from './ipHash.js';

type ActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'password_change'
  | 'seed';

/**
 * Append a row to admin_actions describing what the admin just did.
 * Best-effort — failures are logged but never bubble up to the caller,
 * because losing audit visibility shouldn't take down the actual write.
 */
export async function logAdminAction(
  prisma: PrismaClient,
  req: FastifyRequest,
  params: {
    action: ActionType;
    entity?: string | null;
    entityId?: string | null;
    payload?: unknown;
  },
): Promise<void> {
  const admin = req.admin;
  try {
    await prisma.adminAction.create({
      data: {
        adminId: admin?.id ?? null,
        adminEmail: admin?.email ?? null,
        action: params.action,
        entity: params.entity ?? null,
        entityId: params.entityId ?? null,
        payload: params.payload === undefined ? null : (params.payload as object),
        ipHash: hashIp(req.ip),
        userAgent: req.headers['user-agent']?.slice(0, 500) ?? null,
      },
    });
  } catch (err) {
    req.log.error({ err }, 'admin audit log write failed');
  }
}
