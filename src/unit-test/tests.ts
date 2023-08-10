import { UnitTest } from "@/unit-test";

import npn from "@/unit-test/tests/npn";
import pnp from "@/unit-test/tests/pnp";
import srLatch from "@/unit-test/tests/sr-latch";
import lineDecoder from "@/unit-test/tests/2to4-line-decoder";
import andOrGate from "@/unit-test/tests/4-input-and-or-gate";
import dualFixedFreqOsc from "@/unit-test/tests/dual-fixed-freq-oscillator";
import serialization from "@/unit-test/tests/serialization";
import serializationMetalBug from "@/unit-test/tests/serialization-metal-bug";
import fieldGraphDrawing from "@/unit-test/tests/field-graph-drawing";
import andOrGateImported from "@/unit-test/tests/4-input-and-or-gate-imported";

const tests: Record<string, UnitTest> = {
  npn,
  pnp,
  srLatch,
  lineDecoder,
  andOrGate,
  dualFixedFreqOsc,
  serialization,
  serializationMetalBug,
  fieldGraphDrawing,
  andOrGateImported,
};

export default tests;
