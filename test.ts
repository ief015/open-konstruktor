import * as fs from 'fs';
import * as path from 'path';
import { UnitTest } from 'utils/assert';

const __dirname = path.resolve();

const tests: { [key: string]: UnitTest } = {};

fs.readdirSync("./tests")
  .filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.ts'))
  .map((file) => { tests[file.slice(0, -3)] = import(path.join(__dirname + '/tests', file)) as any; });

console.log(tests)

let success = 0;
let failure = 0;
const run = async (name: string, test: UnitTest) => {
  try {
    await test();
    console.log(`>>> PASS: ${name}`);
    success++;
  } catch (e) {
    console.error(`>>> FAIL: ${name}`);
    console.error(e);
    failure++;
  }
}

const main = async () => {
  for (const name in tests) {
    const test = tests[name];
    await run(name, await test);
  }
  console.log(`>>> Success: ${success}, Failure: ${failure}`);
}

main();
