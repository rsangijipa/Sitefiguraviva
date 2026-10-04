function serializeFirestoreValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const maybeTimestamp = value as {
      seconds?: number;
      nanoseconds?: number;
      _seconds?: number;
      _nanoseconds?: number;
      toDate?: () => Date;
    };

    if (
      typeof maybeTimestamp.seconds === "number" ||
      typeof maybeTimestamp._seconds === "number" ||
      typeof maybeTimestamp.toDate === "function"
    ) {
      if (typeof maybeTimestamp.seconds === "number") {
        return {
          seconds: maybeTimestamp.seconds,
          nanoseconds: maybeTimestamp.nanoseconds || 0,
        };
      }

      if (typeof maybeTimestamp._seconds === "number") {
        return {
          seconds: maybeTimestamp._seconds,
          nanoseconds: maybeTimestamp._nanoseconds || 0,
        };
      }

      const date = maybeTimestamp.toDate?.();
      return date ? { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 } : null;
    }

    const serialized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(record)) {
      serialized[key] = serializeFirestoreValue(nestedValue);
    }
    return serialized;
  }

  return value;
}

export function serializeDocument<T>(
  doc: FirebaseFirestore.DocumentSnapshot,
): T | null {
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...(serializeFirestoreValue(doc.data() || {}) as Record<string, unknown>),
  } as T;
}

export function serializeQuery<T>(
  snapshot: FirebaseFirestore.QuerySnapshot,
): T[] {
  return snapshot.docs
    .map((doc) => serializeDocument<T>(doc))
    .filter((doc): doc is T => doc !== null);
}
