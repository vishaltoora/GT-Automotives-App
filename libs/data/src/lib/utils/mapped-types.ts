import { getMetadataStorage, IsOptional } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = any> = new (...args: any[]) => T;

// ── class-validator helpers ──────────────────────────────────────────────────

function cvProperties(classRef: Constructor): string[] {
  try {
    const storage = getMetadataStorage();
    const metas = (storage as any).getTargetValidationMetadatas(
      classRef,
      '',
      false,
      false,
    ) as Array<{ propertyName: string }>;
    return [...new Set(metas.map((m) => m.propertyName))];
  } catch {
    return [];
  }
}

function copyCvMetadata(
  source: Constructor,
  target: Constructor,
  filter?: (key: string) => boolean,
) {
  try {
    const storage = getMetadataStorage();
    const metas = (storage as any).getTargetValidationMetadatas(
      source,
      '',
      false,
      false,
    ) as Array<{ propertyName: string; [k: string]: unknown }>;
    metas
      .filter((m) => !filter || filter(m.propertyName))
      .forEach((m) => (storage as any).addValidationMetadata({ ...m, target }));
  } catch {
    // silently skip when class-validator is unavailable
  }
}

// ── class-transformer helpers ────────────────────────────────────────────────

const CT_STORAGE_KEYS = [
  '_typeMetadatas',
  '_transformMetadatas',
  '_excludeMetadatas',
  '_exposeMetadatas',
] as const;

function copyCtMetadata(
  source: Constructor,
  target: Constructor,
  filter?: (key: string) => boolean,
) {
  try {
    // Wrapped in try/catch — silently fails in browser where CJS require is absent
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { defaultMetadataStorage: ts } = require('class-transformer/cjs/storage');
    for (const storeKey of CT_STORAGE_KEYS) {
      const sourceMap: Map<string, unknown> | undefined = ts[storeKey]?.get(source);
      if (!sourceMap) continue;
      for (const [prop, meta] of sourceMap.entries()) {
        if (filter && !filter(prop)) continue;
        if (!ts[storeKey].has(target)) ts[storeKey].set(target, new Map());
        ts[storeKey].get(target).set(prop, { ...(meta as object), target });
      }
    }
  } catch {
    // silently skip when class-transformer/cjs/storage is unavailable
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a new class where every property of `classRef` is optional.
 * Equivalent to `@nestjs/mapped-types` PartialType but without the @nestjs/common dependency.
 */
export function PartialType<T>(classRef: Constructor<T>): Constructor<Partial<T>> {
  abstract class PartialClass extends (classRef as Constructor) {}

  copyCvMetadata(classRef, PartialClass as Constructor);
  copyCtMetadata(classRef, PartialClass as Constructor);

  cvProperties(classRef).forEach((prop) => {
    IsOptional()(PartialClass.prototype, prop);
  });

  return PartialClass as Constructor<Partial<T>>;
}

/**
 * Creates a new class that omits the listed keys from `classRef`.
 * Equivalent to `@nestjs/mapped-types` OmitType but without the @nestjs/common dependency.
 */
export function OmitType<T, K extends keyof T>(
  classRef: Constructor<T>,
  keys: readonly K[],
): Constructor<Omit<T, K>> {
  const omit = new Set(keys as unknown as string[]);
  const keep = (p: string) => !omit.has(p);

  abstract class OmitClass {}
  copyCvMetadata(classRef, OmitClass as Constructor, keep);
  copyCtMetadata(classRef, OmitClass as Constructor, keep);

  return OmitClass as Constructor<Omit<T, K>>;
}

/**
 * Creates a new class that contains only the listed keys from `classRef`.
 * Equivalent to `@nestjs/mapped-types` PickType but without the @nestjs/common dependency.
 */
export function PickType<T, K extends keyof T>(
  classRef: Constructor<T>,
  keys: readonly K[],
): Constructor<Pick<T, K>> {
  const pick = new Set(keys as unknown as string[]);
  const keep = (p: string) => pick.has(p);

  abstract class PickClass {}
  copyCvMetadata(classRef, PickClass as Constructor, keep);
  copyCtMetadata(classRef, PickClass as Constructor, keep);

  return PickClass as Constructor<Pick<T, K>>;
}

/**
 * Creates a new class that merges properties from both `classARef` and `classBRef`.
 * Equivalent to `@nestjs/mapped-types` IntersectionType but without the @nestjs/common dependency.
 */
export function IntersectionType<A, B>(
  classARef: Constructor<A>,
  classBRef: Constructor<B>,
): Constructor<A & B> {
  abstract class IntersectionClass {}

  for (const src of [classARef, classBRef]) {
    copyCvMetadata(src, IntersectionClass as Constructor);
    copyCtMetadata(src, IntersectionClass as Constructor);
  }

  return IntersectionClass as Constructor<A & B>;
}
