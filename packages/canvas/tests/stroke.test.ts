import { describe, expect, test } from "vite-plus/test";
import { Canvas } from "../src/node.ts";

describe("stroke state", () => {
  test("uses Canvas 2D defaults and ignores invalid assignments", () => {
    const context = new Canvas(1, 1).getContext("2d");
    expect({
      strokeStyle: context.strokeStyle,
      lineWidth: context.lineWidth,
      lineCap: context.lineCap,
      lineJoin: context.lineJoin,
      miterLimit: context.miterLimit,
    }).toEqual({
      strokeStyle: "#000000",
      lineWidth: 1,
      lineCap: "butt",
      lineJoin: "miter",
      miterLimit: 10,
    });

    context.strokeStyle = "not a color";
    context.lineWidth = 0;
    context.lineWidth = Number.NaN;
    context.miterLimit = -1;
    expect(context.strokeStyle).toBe("#000000");
    expect(context.lineWidth).toBe(1);
    expect(context.miterLimit).toBe(10);
  });

  test("resets stroke state when a canvas dimension changes", () => {
    const canvas = new Canvas(2, 2);
    const context = canvas.getContext("2d");
    context.strokeStyle = "red";
    context.lineWidth = 7;
    context.lineCap = "round";
    context.lineJoin = "bevel";
    context.miterLimit = 3;
    canvas.width = 2;
    expect(context.strokeStyle).toBe("#000000");
    expect(context.lineWidth).toBe(1);
    expect(context.lineCap).toBe("butt");
    expect(context.lineJoin).toBe("miter");
    expect(context.miterLimit).toBe(10);
  });
});

describe("stroke geometry", () => {
  test("draws an exact horizontal butt-capped stroke", () => {
    const canvas = new Canvas(7, 5);
    const context = canvas.getContext("2d");
    context.lineWidth = 2;
    context.moveTo(1, 2);
    context.lineTo(6, 2);
    context.stroke();
    expect(alpha(canvas)).toEqual(
      [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 255, 255, 255, 255, 255, 0],
        [0, 255, 255, 255, 255, 255, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ].flat(),
    );
  });

  test("distinguishes an empty subpath from a zero-length segment", () => {
    const empty = new Canvas(5, 5);
    const emptyContext = empty.getContext("2d");
    emptyContext.lineWidth = 2;
    emptyContext.lineCap = "square";
    emptyContext.moveTo(2, 2);
    emptyContext.stroke();
    expect(alpha(empty).every((value) => value === 0)).toBe(true);

    const dot = new Canvas(5, 5);
    const dotContext = dot.getContext("2d");
    dotContext.lineWidth = 2;
    dotContext.lineCap = "square";
    dotContext.moveTo(2, 2);
    dotContext.lineTo(2, 2);
    dotContext.stroke();
    expect(alpha(dot).filter((value) => value === 255)).toHaveLength(4);
  });

  test("draws round zero-length segments and ignores butt zero-length segments", () => {
    const butt = new Canvas(7, 7);
    const a = butt.getContext("2d");
    a.lineWidth = 4;
    a.moveTo(3.5, 3.5);
    a.lineTo(3.5, 3.5);
    a.stroke();
    expect(alpha(butt).every((value) => value === 0)).toBe(true);

    const round = new Canvas(7, 7);
    const b = round.getContext("2d");
    b.lineWidth = 4;
    b.lineCap = "round";
    b.moveTo(3.5, 3.5);
    b.lineTo(3.5, 3.5);
    b.stroke();
    expect(alpha(round).reduce((sum, value) => sum + value / 255, 0)).toBeGreaterThan(12);
  });

  test("handles repeated points and 180-degree turns", () => {
    const canvas = new Canvas(12, 8);
    const context = canvas.getContext("2d");
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.moveTo(2, 4);
    context.lineTo(9, 4);
    context.lineTo(9, 4);
    context.lineTo(4, 4);
    context.stroke();
    expect(alpha(canvas).some((value) => value > 0)).toBe(true);
  });

  test("keeps near-reversal inner joins within their adjacent segments", () => {
    const canvas = new Canvas(100, 40);
    const context = canvas.getContext("2d");
    context.lineWidth = 8;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.moveTo(8, 20);
    context.lineTo(88, 20);
    context.lineTo(84, 22.5);
    context.stroke();
    expect(alpha(canvas)[20 * 100 + 48]).toBe(255);
  });

  test("uses opposite-winding boundaries for a closed stroke", () => {
    const canvas = new Canvas(9, 9);
    const context = canvas.getContext("2d");
    context.lineWidth = 2;
    context.rect(1, 1, 7, 7);
    context.stroke();
    expect(alpha(canvas)[4 * 9 + 4]).toBe(0);
    expect(alpha(canvas)[1 * 9 + 4]).toBe(255);
  });

  test("composites a translucent self-overlapping stroke once", () => {
    const canvas = new Canvas(12, 12);
    const context = canvas.getContext("2d");
    context.strokeStyle = "rgba(255, 0, 0, 0.5)";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.moveTo(2, 2);
    context.lineTo(10, 10);
    context.moveTo(10, 2);
    context.lineTo(2, 10);
    context.stroke();
    expect(alpha(canvas)[6 * 12 + 6]).toBe(128);
    expect(Math.max(...alpha(canvas))).toBe(128);
  });

  test("miterLimit falls back to a bevel for sharp joins", () => {
    const sharpMiter = angledStroke("miter", 10);
    const limitedMiter = angledStroke("miter", 1);
    const bevel = angledStroke("bevel", 10);
    expect(alpha(limitedMiter)).toEqual(alpha(bevel));
    expect(ink(sharpMiter)).toBeGreaterThan(ink(limitedMiter));
  });

  test("strokeRect does not alter the current path", () => {
    const canvas = new Canvas(10, 10);
    const context = canvas.getContext("2d");
    context.lineWidth = 2;
    context.moveTo(1, 1);
    context.lineTo(9, 1);
    context.strokeRect(2, 3, 6, 5);
    context.strokeStyle = "red";
    context.stroke();
    expect(Array.from(canvas.pixels.slice((1 * 10 + 5) * 4, (1 * 10 + 5) * 4 + 4))).toEqual([
      255, 0, 0, 255,
    ]);
  });

  test("supports very thin and very wide strokes", () => {
    const thin = new Canvas(8, 4);
    const a = thin.getContext("2d");
    a.lineWidth = 0.5;
    a.moveTo(0, 1.5);
    a.lineTo(8, 1.5);
    a.stroke();
    expect(alpha(thin).some((value) => value > 0 && value < 255)).toBe(true);

    const wide = new Canvas(8, 8);
    const b = wide.getContext("2d");
    b.lineWidth = 40;
    b.moveTo(-10, 4);
    b.lineTo(18, 4);
    b.stroke();
    expect(alpha(wide).every((value) => value === 255)).toBe(true);
  });
});

function angledStroke(lineJoin: "bevel" | "miter", miterLimit: number): Canvas {
  const canvas = new Canvas(30, 30);
  const context = canvas.getContext("2d");
  context.lineWidth = 6;
  context.lineJoin = lineJoin;
  context.miterLimit = miterLimit;
  context.moveTo(4, 25);
  context.lineTo(15, 4);
  context.lineTo(18, 25);
  context.stroke();
  return canvas;
}

function ink(canvas: Canvas): number {
  return alpha(canvas).reduce((sum, value) => sum + value, 0);
}

function alpha(canvas: Canvas): number[] {
  const values: number[] = [];
  for (let index = 3; index < canvas.pixels.length; index += 4) {
    values.push(canvas.pixels[index]!);
  }
  return values;
}
