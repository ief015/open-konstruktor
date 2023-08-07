import { PinNode } from "@/simulation";

export type UnitTest = () => Promise<void>;

export function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

export function assertEqualArray<T>(actual: T[], expected: T[]) {
  if (actual.length !== expected.length) {
    throw new Error(`Expected array length ${expected.length}, got ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`Expected ${expected[i]} at index ${i}, got ${actual[i]}`);
    }
  }
}

export function assertPin(pin: PinNode, expected: boolean|number) {
  if (pin.state != expected) {
    throw new Error(`Pin ${pin.label}: Expected ${!!expected}, got ${pin.state}`);
  }
}
