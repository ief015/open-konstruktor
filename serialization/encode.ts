import { deflate } from 'pako';
import type { Base64String } from '@/serialization';
import { DesignData } from '@/serialization/DesignData';

export function encode(saveData: Uint8Array | DesignData): Base64String {
  const buf =
    saveData instanceof DesignData ? saveData.toByteArray() : saveData;
  const deflated = deflate(buf, { level: 9 });
  return btoa(String.fromCharCode(...deflated));
}
