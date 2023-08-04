import { UnitTest } from ".";

import npn from "./tests/npn";
import pnp from "./tests/pnp";
import srlatch from "./tests/sr-latch";

const tests: Record<string, UnitTest> = {
  npn,
  pnp,
  srlatch,
};

export default tests;
