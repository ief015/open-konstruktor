import { PinNode } from "@/simulation";
import { expect } from "vitest";

export type UnitTest = () => void|Promise<void>;

export function assertEqual<T>(actual: T, expected: T, message?: string) {
  expect(actual, message).toBe(expected);
}

export function assertPin(pin: PinNode, expected: boolean|number, message?: string) {
  if (!pin.path) {
    message = message ? (`${message}\n`) : '';
    throw new Error(message + `Pin ${pin.label}: No path`);
  }
  expect(pin.path.state).toBe(!!expected);
}
