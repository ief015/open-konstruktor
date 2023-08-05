import { UnitTest } from ".";

import npn from "./tests/npn";
import pnp from "./tests/pnp";
import srlatch from "./tests/sr-latch";
import linedecoder from "./tests/2to4-line-decoder";

const tests: Record<string, UnitTest> = {
  npn,
  pnp,
  srlatch,
  linedecoder,
};

export default tests;
