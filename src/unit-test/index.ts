import tests from "./tests";

export type UnitTest = () => Promise<void>;

export function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

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

(async () => {
  for (const name in tests) {
    const test = tests[name];
    await run(name, test);
  }
  console.log(`>>> Success: ${success}, Failure: ${failure}`);
})();
