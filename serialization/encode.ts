import { deflate } from 'pako';
import type { Base64String } from '@/serialization';
import { DesignData } from '@/serialization/DesignData';

export function encode(saveData: Buffer | DesignData): Base64String {
  const buf = saveData instanceof DesignData ? saveData.toBuffer() : saveData;
  const deflated = deflate(buf, { level: 9 });
  return Buffer.from(deflated).toString('base64');
}
