import { describe, expect, test } from "vite-plus/test";
import { Canvas } from "../src/node.ts";

describe("path construction", () => {
  test("implicitly closes open subpaths when filling", () => {
    const canvas = new Canvas(2, 2);
    const context = canvas.getContext("2d");
    context.moveTo(0, 0);
    context.lineTo(2, 0);
    context.lineTo(0, 2);
    context.fill();
    expect(alpha(canvas)).toEqual([255, 128, 128, 0]);
  });

  test("beginPath discards the current path", () => {
    const canvas = new Canvas(2, 1);
    const context = canvas.getContext("2d");
    context.rect(0, 0, 1, 1);
    context.beginPath();
    context.rect(1, 0, 1, 1);
    context.fill();
    expect(alpha(canvas)).toEqual([0, 255]);
  });

  test("fill does not consume the current path", () => {
    const canvas = new Canvas(1, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "rgba(255, 0, 0, 0.5)";
    context.rect(0, 0, 1, 1);
    context.fill();
    context.fill();
    expect([...canvas.pixels]).toEqual([192, 0, 0, 192]);
  });

  test("lineTo without a subpath behaves like moveTo", () => {
    const canvas = new Canvas(2, 2);
    const context = canvas.getContext("2d");
    context.lineTo(0, 0);
    context.lineTo(2, 0);
    context.lineTo(0, 2);
    context.fill();
    expect(alpha(canvas)).toEqual([255, 128, 128, 0]);
  });

  test("a segment after closePath starts at the closed subpath origin", () => {
    const canvas = new Canvas(3, 2);
    const context = canvas.getContext("2d");
    context.moveTo(0, 0);
    context.lineTo(1, 0);
    context.lineTo(0, 1);
    context.closePath();
    context.lineTo(3, 0);
    context.lineTo(3, 2);
    context.fill();
    expect(alpha(canvas).some((value) => value > 0)).toBe(true);
  });

  test("ignores non-finite commands and rejects negative arc radii", () => {
    const canvas = new Canvas(2, 2);
    const context = canvas.getContext("2d");
    context.rect(0, 0, 2, 2);
    context.lineTo(Number.NaN, 1);
    context.fill();
    expect(alpha(canvas)).toEqual([255, 255, 255, 255]);
    expect(() => context.arc(1, 1, -1, 0, Math.PI)).toThrow(RangeError);
  });
});

describe("analytic filling", () => {
  test("path rectangles exactly match the rectangle fast path", () => {
    const direct = new Canvas(5, 4);
    direct.getContext("2d").fillRect(0.25, 0.75, 3.5, 2.5);

    const path = new Canvas(5, 4);
    const context = path.getContext("2d");
    context.rect(0.25, 0.75, 3.5, 2.5);
    context.fill();
    expect(path.pixels).toEqual(direct.pixels);
  });

  test("is invariant to contour direction", () => {
    const clockwise = new Canvas(2, 2);
    const a = clockwise.getContext("2d");
    a.moveTo(0, 0);
    a.lineTo(2, 0);
    a.lineTo(0, 2);
    a.fill();

    const counterclockwise = new Canvas(2, 2);
    const b = counterclockwise.getContext("2d");
    b.moveTo(0, 2);
    b.lineTo(2, 0);
    b.lineTo(0, 0);
    b.fill();
    expect(counterclockwise.pixels).toEqual(clockwise.pixels);
  });

  test("supports non-zero and even-odd rules", () => {
    const nonzero = nestedRectangles("nonzero");
    const evenodd = nestedRectangles("evenodd");
    expect(alpha(nonzero)[14]).toBe(255);
    expect(alpha(evenodd)[14]).toBe(0);
  });

  test("composites overlapping translucent contours only once", () => {
    const canvas = new Canvas(3, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "rgba(255, 0, 0, 0.5)";
    context.rect(0, 0, 2, 1);
    context.rect(1, 0, 2, 1);
    context.fill();
    expect([...canvas.pixels]).toEqual([128, 0, 0, 128, 128, 0, 0, 128, 128, 0, 0, 128]);
  });

  test("cancels even-odd overlap before compositing", () => {
    const canvas = new Canvas(3, 1);
    const context = canvas.getContext("2d");
    context.rect(0, 0, 2, 1);
    context.rect(1, 0, 2, 1);
    context.fill("evenodd");
    expect(alpha(canvas)).toEqual([255, 0, 255]);
  });

  test("opposite contour directions make a non-zero hole", () => {
    const canvas = new Canvas(6, 6);
    const context = canvas.getContext("2d");
    context.rect(0, 0, 6, 6);
    context.moveTo(2, 2);
    context.lineTo(2, 4);
    context.lineTo(4, 4);
    context.lineTo(4, 2);
    context.closePath();
    context.fill();
    expect(alpha(canvas)[14]).toBe(0);
  });

  test("clips paths outside every canvas edge", () => {
    const canvas = new Canvas(3, 2);
    const context = canvas.getContext("2d");
    context.rect(-10, -10, 30, 30);
    context.fill();
    expect(alpha(canvas)).toEqual([255, 255, 255, 255, 255, 255]);
  });
});

describe("curve flattening", () => {
  test("fills quadratic and cubic curves", () => {
    const canvas = new Canvas(20, 20);
    const context = canvas.getContext("2d");
    context.moveTo(1, 18);
    context.quadraticCurveTo(10, -8, 19, 18);
    context.bezierCurveTo(14, 12, 6, 12, 1, 18);
    context.fill();
    const covered = alpha(canvas).filter((value) => value > 0).length;
    expect(covered).toBeGreaterThan(100);
  });

  test("normalizes arc sweeps and fills a full circle", () => {
    const canvas = new Canvas(20, 20);
    const context = canvas.getContext("2d");
    context.arc(10, 10, 7, 0, Math.PI * 4);
    context.fill();
    const coverage = alpha(canvas).reduce((sum, value) => sum + value / 255, 0);
    expect(coverage).toBeGreaterThan(150);
    expect(coverage).toBeLessThan(156);
  });
});

function nestedRectangles(rule: "nonzero" | "evenodd"): Canvas {
  const canvas = new Canvas(6, 6);
  const context = canvas.getContext("2d");
  context.rect(0, 0, 6, 6);
  context.rect(2, 2, 2, 2);
  context.fill(rule);
  return canvas;
}

function alpha(canvas: Canvas): number[] {
  const values: number[] = [];
  for (let i = 3; i < canvas.pixels.length; i += 4) {
    values.push(canvas.pixels[i]!);
  }
  return values;
}
