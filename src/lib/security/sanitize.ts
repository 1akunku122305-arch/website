/**
 * Recursive input sanitization and payload limiting.
 * Applied to all incoming JSON before validation.
 */

const MAX_STRING_LENGTH = 20_000;
const MAX_DEPTH = 12;
const MAX_KEYS = 500;

export function sanitizeValue(input: unknown, depth = 0): unknown {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    if (input.length > MAX_STRING_LENGTH) {
      return input.slice(0, MAX_STRING_LENGTH);
    }
    // Strip control characters that are not part of normal text.
    return input.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  }
  if (typeof input === 'number' || typeof input === 'boolean') return input;
  if (typeof input === 'bigint' || typeof input === 'symbol' || typeof input === 'function') {
    return undefined;
  }
  if (depth >= MAX_DEPTH) return undefined;
  if (Array.isArray(input)) {
    return input.slice(0, MAX_KEYS).map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    const entries = Object.entries(input as Record<string, unknown>).slice(0, MAX_KEYS);
    for (const [k, v] of entries) {
      out[k] = sanitizeValue(v, depth + 1);
    }
    return out;
  }
  return undefined;
}

export function payloadBytes(request: Request): Promise<unknown> {
  return request.json().catch(() => undefined);
}
