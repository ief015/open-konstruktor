import { encodeFromFile } from "@/serialization";
import * as readLine from 'readline/promises';

const readline = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const filePath = await readline.question('Enter input file path: ');
  const encoded = await encodeFromFile(filePath);
  console.log(encoded);
  readline.close();
}

main();
