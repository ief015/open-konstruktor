import { encodeFromFile } from "./serialization";
import readLine from 'readline/promises';

const readline = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const filePath = await readline.question('Enter output file path: ');
  const encoded = await encodeFromFile(filePath);
  console.log(encoded);
}

main();
