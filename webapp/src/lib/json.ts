/**
 * Recursively converts values that are not JSON-serializable (notably `bigint`)
 * into JSON-safe equivalents.
 *
 * Prisma models can include `bigint` fields (e.g., monetary amounts). Returning
 * them directly from `NextResponse.json()` will throw:
 *   "TypeError: Do not know how to serialize a BigInt"
 */
export function toJsonSafe<T>(value: T): T {
  return _toJsonSafe(value) as T;
}

function _toJsonSafe(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  const t = typeof value;
  if (t === "bigint") return value.toString();
  if (t !== "object") return value;

  // Dates stringify fine via JSON, but normalizing avoids surprises across runtimes.
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map(_toJsonSafe);

  // If an object provides a custom JSON representation, prefer it.
  // (e.g., Prisma Decimal has `toJSON()`.)
  const maybeWithToJson = value as { toJSON?: () => unknown };
  if (typeof maybeWithToJson.toJSON === "function") {
    try {
      return _toJsonSafe(maybeWithToJson.toJSON());
    } catch {
      // Fall through to manual traversal
    }
  }

  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = _toJsonSafe(v);
  return out;
}
