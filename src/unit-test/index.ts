import { PinNode } from "@/simulation";

export type UnitTest = () => Promise<void>;

export function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    message = (`${message}\n`) || '';
    throw new Error(message + `Expected ${expected}, got ${actual}`);
  }
}

export function assertEqualArray<T>(actual: T[], expected: T[], message?: string) {
  if (actual.length !== expected.length) {
    message = (`${message}\n`) || '';
    throw new Error(message + `Expected array length ${expected.length}, got ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      message = (`${message}\n`) || '';
      throw new Error(message + `Expected ${expected[i]} at index ${i}, got ${actual[i]}`);
    }
  }
}

export function assertPin(pin: PinNode, expected: boolean|number, message?: string) {
  if (pin.state != expected) {
    message = (`${message}\n`) || '';
    throw new Error(message + `Pin ${pin.label}: Expected ${!!expected}, got ${pin.state}`);
  }
}
