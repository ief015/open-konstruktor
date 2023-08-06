import { UnitTest } from ".";

import npn from "./tests/npn";
import pnp from "./tests/pnp";
import srLatch from "./tests/sr-latch";
import lineDecoder from "./tests/2to4-line-decoder";
import andOrGate from "./tests/4-input-and-or-gate";
import dualFixedFreqOsc from "./tests/dual-fixed-freq-oscillator";
import serialization from "./tests/serialization";
import serializationMetalBug from "./tests/serialization-metal-bug";

const tests: Record<string, UnitTest> = {
  npn,
  pnp,
  srLatch,
  lineDecoder,
  andOrGate,
  dualFixedFreqOsc,
  serialization,
  serializationMetalBug,
};

export default tests;
