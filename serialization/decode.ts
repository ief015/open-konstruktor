import { inflate } from 'pako';
import type { Base64String } from '@/serialization';

export function decode(saveData: Base64String): Buffer {
  const saveBuffer: Uint8Array = Uint8Array.from(
    Buffer.from(saveData.replace(/\s/g, ''), 'base64'),
  );
  const inflated = inflate(saveBuffer);
  return Buffer.from(inflated);
}
