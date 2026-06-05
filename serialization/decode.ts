import { inflate } from 'pako';
import type { Base64String } from '@/serialization';

export function decode(saveData: Base64String): Uint8Array {
  const saveBuffer: Uint8Array = Uint8Array.from(
    atob(saveData.replace(/\s/g, '')),
    (c) => c.charCodeAt(0),
  );
  const inflated = inflate(saveBuffer);
  return inflated;
}
