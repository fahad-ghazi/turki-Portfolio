// Convert Prisma camelCase results <-> snake_case API JSON.
// Two overrides keep parity with the original base44 frontend, which expects
// `created_date` / `updated_date` (not `created_at` / `updated_at`).

const TO_API_OVERRIDES: Record<string, string> = {
  createdAt: 'created_date',
  updatedAt: 'updated_date',
};

const FROM_API_OVERRIDES: Record<string, string> = {
  created_date: 'createdAt',
  updated_date: 'updatedAt',
};

const camelToSnake = (s: string): string => s.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
const snakeToCamel = (s: string): string => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function toApi<T>(value: T): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toApi);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const newKey = TO_API_OVERRIDES[k] ?? camelToSnake(k);
      out[newKey] = toApi(v);
    }
    return out;
  }
  return value;
}

export function fromApi<T = Record<string, unknown>>(value: unknown): T {
  if (value === null || value === undefined) return value as T;
  if (Array.isArray(value)) return value.map(fromApi) as unknown as T;
  if (typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const newKey = FROM_API_OVERRIDES[k] ?? snakeToCamel(k);
      out[newKey] = fromApi(v);
    }
    return out as T;
  }
  return value as T;
}
