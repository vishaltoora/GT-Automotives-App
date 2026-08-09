import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * `useState` that survives leaving the page and coming back.
 *
 * List screens keep their filters, search text and page number here. Without
 * it, opening a record and pressing Back re-mounts the list with everything
 * cleared — so working through a filtered set means re-typing the search after
 * every record. The value is held in `sessionStorage` rather than the URL so
 * existing deep links keep working, and it is scoped to the tab: two tabs on
 * the same list are usually two different pieces of work.
 *
 * The stored value is merged over the defaults on read, so adding a filter to a
 * screen does not leave returning users with `undefined` where the new field
 * should be.
 */
export function usePersistedState<T>(
  storageKey: string,
  defaults: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStored(storageKey, defaults));

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Private browsing and a full quota both throw here. Losing the filter on
      // the next visit is a much smaller problem than breaking the screen.
    }
  }, [storageKey, value]);

  return [value, setValue];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStored<T>(storageKey: string, defaults: T): T {
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved === null) return defaults;

    const parsed = JSON.parse(saved);

    // Merge object shapes so a filter added since the value was stored still
    // gets its default instead of coming back missing.
    if (isPlainObject(defaults) && isPlainObject(parsed)) {
      return { ...defaults, ...parsed } as T;
    }

    // Anything of the wrong shape is stale storage from an earlier version of
    // the screen — fall back rather than hand the caller a surprise type.
    return typeof parsed === typeof defaults ? (parsed as T) : defaults;
  } catch {
    return defaults;
  }
}
