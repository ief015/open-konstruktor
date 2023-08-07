import fs from 'fs';
import zlib from 'zlib';
import { Base64String } from '@/serialization';

export async function decode(saveData: Base64String, outFile?: string): Promise<Buffer> {
  const saveBuffer = Buffer.from(saveData.replace(/\s/g, ''), 'base64');
  const inflated = await new Promise<Buffer>((resove, reject) => {
    zlib.inflate(saveBuffer, (err, res) => (err ? reject(err) : resove(res)));
  });
  if (outFile) {
    await new Promise<void>((resolve, reject) => {
      fs.writeFile(outFile, inflated, (err) => (err ? reject(err) : resolve()));
    });
  }
  return inflated;
}
