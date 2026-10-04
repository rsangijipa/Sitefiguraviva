import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deeply serializes an object to ensuring it's safe for Next.js Server-to-Client component boundaries.
 * Specifically converts Firestore Timestamps to ISO strings or plain numbers.
 */
export function deepSafeSerialize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepSafeSerialize(item)) as any;
  }

  // Handle Firestore Timestamps (objects with toDate() or specific seconds/nanoseconds structure)
  if (typeof obj === "object") {
    // Check for Firestore Timestamp-like structure from Admin SDK or Client SDK
    const anyObj = obj as any;
    if (
      anyObj.seconds !== undefined ||
      anyObj._seconds !== undefined ||
      typeof anyObj.toDate === "function"
    ) {
      // Debugging weird timestamp objects
      // if (anyObj._seconds !== undefined) console.log('Found raw timestamp:', anyObj);

      try {
        let date: Date;
        if (typeof anyObj.toDate === "function") {
          date = anyObj.toDate();
        } else if (anyObj.seconds !== undefined) {
          date = new Date(anyObj.seconds * 1000);
        } else {
          date = new Date(anyObj._seconds * 1000);
        }
        return date.toISOString() as any;
      } catch (e) {
        return String(obj) as any;
      }
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString() as any;
    }

    // Handle Plain Objects
    // We must ensure we returning a PLAIN object, stripping prototypes
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = deepSafeSerialize(value);
    }
    return serialized;
  }

  // Force return of primitive values to avoid any object wrappers
  return JSON.parse(JSON.stringify(obj));
}
