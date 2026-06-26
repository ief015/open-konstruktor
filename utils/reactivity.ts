import type { ShallowReactive, ShallowRef } from 'vue';
import { toRefs } from '@vueuse/core';

// This is a modification of toReactive from vueuse to get the same functionality but with shallow reactivity.
// https://github.com/vueuse/vueuse/blob/main/packages/shared/toReactive/index.ts
/**
 * Converts ref to shallow reactive.
 *
 * @see https://vueuse.org/toReactive
 * @param objectRef A ref of object
 */
export function toShallowReactive<T extends object>(
  objectRef: MaybeRef<T>,
): ShallowReactive<T> {
  if (!isRef(objectRef)) return shallowReactive(objectRef);
  const proxy = new Proxy(
    {},
    {
      get(_, p, receiver) {
        return unref(Reflect.get(objectRef.value, p, receiver));
      },
      set(_, p, value) {
        if (isRef((objectRef.value as any)[p]) && !isRef(value))
          (objectRef.value as any)[p].value = value;
        else (objectRef.value as any)[p] = value;
        return true;
      },
      deleteProperty(_, p) {
        return Reflect.deleteProperty(objectRef.value, p);
      },
      has(_, p) {
        return Reflect.has(objectRef.value, p);
      },
      ownKeys() {
        return Object.keys(objectRef.value);
      },
      getOwnPropertyDescriptor() {
        return {
          enumerable: true,
          configurable: true,
        };
      },
    },
  );
  return reactive(proxy) as ShallowReactive<T>;
}

/**
 * Extended `toRefs` that also accepts refs of an object.
 * Alias for `toRefs(toShallowReactive(objectRef))`.
 * @param objectRef A ref of object
 * @returns An object of shallow refs
 */
export function toShallowRefs<T extends object>(objectRef: MaybeRef<T>) {
  const reactiveObject = toShallowReactive(objectRef);
  return toRefs(reactiveObject);
}
