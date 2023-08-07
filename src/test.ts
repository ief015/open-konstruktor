import { UnitTest } from "@/unit-test";
import tests from "@/unit-test/tests";

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
    await run(name, test);
  }
  console.log(`>>> Success: ${success}, Failure: ${failure}`);
}

main();
