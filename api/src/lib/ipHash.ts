import { createHash } from 'node:crypto';
import { env } from '../env.js';

// One-way hash so we can do per-IP rate limiting + dedup without storing raw IPs.
// Salted with COOKIE_SECRET so dumps can't be rainbow-tabled trivially.
export function hashIp(ip: string | undefined | null): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip + ':' + env.COOKIE_SECRET).digest('hex').slice(0, 32);
}
