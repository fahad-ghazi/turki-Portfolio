// Parse base44-style orderBy strings ("-created_date", "display_order")
// into Prisma orderBy objects. Field names are converted snake_case → camelCase
// with the two date overrides.

const SNAKE_TO_CAMEL_OVERRIDES: Record<string, string> = {
  created_date: 'createdAt',
  updated_date: 'updatedAt',
};

const snakeToCamel = (s: string): string => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export interface ParsedOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export function parseOrderBy(input: string | undefined | null): ParsedOrderBy {
  const raw = (input ?? '-createdAt').trim();
  let direction: 'asc' | 'desc' = 'asc';
  let field = raw;
  if (raw.startsWith('-')) {
    direction = 'desc';
    field = raw.slice(1);
  } else if (raw.startsWith('+')) {
    field = raw.slice(1);
  }
  const camel = SNAKE_TO_CAMEL_OVERRIDES[field] ?? snakeToCamel(field);
  return { field: camel, direction };
}

export function toPrismaOrderBy(input: string | undefined | null) {
  const { field, direction } = parseOrderBy(input);
  return { [field]: direction } as Record<string, 'asc' | 'desc'>;
}
