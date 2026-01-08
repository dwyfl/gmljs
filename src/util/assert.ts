import settings from "../settings.json";

export function assert(condition: any, message: string) {
  if (settings.assert.print_errors) {
    // eslint-disable-next-line no-console
    console.assert(condition, message);
  }
  if (settings.assert.throw_errors && !condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function assertString(str: string, message: string) {
  assert(typeof str === "string", message);
}

export function assertStringNotEmpty(str: string, message: string) {
  assert(typeof str === "string" && str.length, message);
}

export function assertNumber(num: number, message: string) {
  assert(typeof num === "number" && !isNaN(num) && isFinite(num), message);
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
