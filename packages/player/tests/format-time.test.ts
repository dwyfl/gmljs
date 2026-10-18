import { expect, test } from "vite-plus/test";
import { formatTime } from "../src/format-time.ts";

test.each([
  [0, "0:00"],
  [1.9, "0:01"],
  [59.99, "0:59"],
  [60, "1:00"],
  [754, "12:34"],
  [-3, "0:00"],
])("formatTime(%d) is %s", (seconds, expected) => {
  expect(formatTime(seconds)).toBe(expected);
});
