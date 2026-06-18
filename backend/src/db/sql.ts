export function toPgParams(sql: string, params: unknown[] = []): { text: string; values: unknown[] } {
  let index = 0;
  const text = sql.replace(/\?/g, () => `$${++index}`);
  return { text, values: params };
}

export function parseJsonField(value: unknown): Record<string, number> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, number>;
  }
  return JSON.parse(String(value || '{}')) as Record<string, number>;
}

export function isTruthyDbFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 't';
}
