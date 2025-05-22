import { encode } from "@/serialization";
import { readFile } from "fs/promises";
import { createInterface } from 'readline/promises';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const filePath = await readline.question('Enter input file path: ');
  const buf = await readFile(filePath);
  const encoded = await encode(buf);
  console.log(encoded);
  readline.close();
}

main();
