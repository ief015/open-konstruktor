import { decode } from "./serialization";
import readLine from 'readline/promises';

const readline = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const lines: string[] = [];
  
  console.log('Paste save data (enter empty line to continue):');

  await new Promise<void>(resolve => {
    const onLine = (line: string) => {
      const trimmed = line.trim().replace(/\s/g, '');
      if (trimmed.length > 0) {
        lines.push(trimmed);
      } else {
        readline.off('line', onLine);
        resolve();
      }
    }
    readline.on('line', onLine);
  });

  const saveData = lines.join('');

  if (!saveData) {
    console.error('Exiting: no save data provided');
    process.exit();
  }

  const fileName = await readline.question(
    'Enter output file name\n(will be saved to ./output/, leave empty to use date): '
  );
  const defaultFileName = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  let filePath = `.\\output\\${fileName || defaultFileName}`;
  if (!filePath.endsWith('.bin')) {
    filePath += '.bin';
  }

  console.log('Decoding...');
  await decode(saveData, filePath);
  console.log(`Saved to ${filePath}`);
}

async function loop() {
  while (true) {
    await main();
  }
}

loop();
