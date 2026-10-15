import { describe, expect, test } from "vite-plus/test";
import { parseCssColor } from "../src/color/parse.ts";

describe("CSS colors", () => {
  test.each([
    ["#123", [17, 34, 51, 255]],
    ["#0f08", [0, 255, 0, 136]],
    ["#102030", [16, 32, 48, 255]],
    ["#10203040", [16, 32, 48, 64]],
    ["rgb(255, 0, 127)", [255, 0, 127, 255]],
    ["rgba(100%, 0%, 50%, 25%)", [255, 0, 128, 64]],
    ["rgb(100% 0 50% / .25)", [255, 0, 128, 64]],
    ["rgb(300 -10 1e2)", [255, 0, 100, 255]],
    ["hsl(0 100% 50%)", [255, 0, 0, 255]],
    ["hsl(.5turn 100% 50% / 50%)", [0, 255, 255, 128]],
    ["hsla(120, 100%, 25%, 0.5)", [0, 128, 0, 128]],
    ["ReBeccAPurple", [102, 51, 153, 255]],
    ["transparent", [0, 0, 0, 0]],
  ] as const)("parses %s", (input, expected) => {
    const actual = parseCssColor(input);
    expect(actual && [actual.r, actual.g, actual.b, actual.a]).toEqual(expected);
  });

  test.each([
    "",
    "constructor",
    "__proto__",
    "toString",
    "#12",
    "rgb(10%, 20, 30%)",
    "rgb(1 2)",
    "rgb(1, 2, 3 / .5)",
    "hsl(0 20 30)",
    "not-a-color",
  ])("rejects %s", (input) => {
    expect(parseCssColor(input)).toBeUndefined();
  });
});
