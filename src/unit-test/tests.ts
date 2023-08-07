import { UnitTest } from "@/unit-test";

import npn from "@/unit-test/tests/npn";
import pnp from "@/unit-test/tests/pnp";
import srLatch from "@/unit-test/tests/sr-latch";
import lineDecoder from "@/unit-test/tests/2to4-line-decoder";
import andOrGate from "@/unit-test/tests/4-input-and-or-gate";
import dualFixedFreqOsc from "@/unit-test/tests/dual-fixed-freq-oscillator";
import serialization from "@/unit-test/tests/serialization";
import serializationMetalBug from "@/unit-test/tests/serialization-metal-bug";

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
