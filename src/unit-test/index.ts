import { PinNode } from "../simulation";

export type UnitTest = () => Promise<void>;

export function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

export function assertPin(pin: PinNode, expected: boolean|number) {
  if (pin.state != expected) {
    throw new Error(`Pin ${pin.label}: Expected ${!!expected}, got ${pin.state}`);
  }
}
