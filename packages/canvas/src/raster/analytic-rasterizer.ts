import type { RgbaColor } from "../color/parse.ts";
import type { FillRule, FlattenedSubpath } from "../path/path.ts";
import { PixelBuffer } from "../pixels/pixel-buffer.ts";

const SUBPIXEL_SCALE = 256;

export class AnalyticRasterizer {
  private deltas = new Float64Array();
  private touchedCells = new Uint32Array();
  private touchedFlags = new Uint8Array();
  private touchedCount = 0;

  fill(
    subpaths: readonly FlattenedSubpath[],
    buffer: PixelBuffer,
    color: RgbaColor,
    fillRule: FillRule,
  ): void {
    let minimumX = Number.POSITIVE_INFINITY;
    let minimumY = Number.POSITIVE_INFINITY;
    let maximumX = Number.NEGATIVE_INFINITY;
    let maximumY = Number.NEGATIVE_INFINITY;

    for (const { points } of subpaths) {
      const pointCount = points.length / 2;
      if (pointCount < 2) {
        continue;
      }
      let x0 = quantize(points[points.length - 2]!);
      let y0 = quantize(points[points.length - 1]!);
      for (let point = 0; point < pointCount; point += 1) {
        const x1 = quantize(points[point * 2]!);
        const y1 = quantize(points[point * 2 + 1]!);
        if (y0 !== y1) {
          minimumX = Math.min(minimumX, x0, x1);
          minimumY = Math.min(minimumY, y0, y1);
          maximumX = Math.max(maximumX, x0, x1);
          maximumY = Math.max(maximumY, y0, y1);
        }
        x0 = x1;
        y0 = y1;
      }
    }

    if (minimumX === Number.POSITIVE_INFINITY) {
      return;
    }

    const originX = Math.max(0, Math.min(buffer.width, Math.floor(minimumX)));
    const originY = Math.max(0, Math.min(buffer.height, Math.floor(minimumY)));
    const endX = Math.max(0, Math.min(buffer.width, Math.ceil(maximumX)));
    const endY = Math.max(0, Math.min(buffer.height, Math.ceil(maximumY)));
    if (endX <= originX || endY <= originY) {
      return;
    }

    const width = endX - originX;
    const height = endY - originY;
    const stride = width + 1;
    this.ensureWorkspace(stride * height);

    this.touchedCount = 0;
    for (const { points } of subpaths) {
      const pointCount = points.length / 2;
      if (pointCount < 2) {
        continue;
      }
      let x0 = points[points.length - 2]!;
      let y0 = points[points.length - 1]!;
      for (let point = 0; point < pointCount; point += 1) {
        const x1 = points[point * 2]!;
        const y1 = points[point * 2 + 1]!;
        this.addEdge(x0, y0, x1, y1, originX, originY, width, height, stride);
        x0 = x1;
        y0 = y1;
      }
    }

    if (this.touchedCount === 0) {
      return;
    }
    // Sorting unique delta cells lets the compositor emit the constant-coverage
    // spans between edge events instead of visiting every pixel in each row.
    const touchedCells = this.touchedCells.subarray(0, this.touchedCount);
    touchedCells.sort();
    buffer.compositeCoverage(
      this.deltas,
      touchedCells,
      this.touchedFlags,
      stride,
      originX,
      originY,
      width,
      color,
      fillRule,
    );
  }

  private ensureWorkspace(deltaLength: number): void {
    if (this.deltas.length < deltaLength) {
      const length = grownLength(this.deltas.length, deltaLength);
      this.deltas = new Float64Array(length);
      this.touchedCells = new Uint32Array(length);
      this.touchedFlags = new Uint8Array(length);
    }
  }

  private addEdge(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    originX: number,
    originY: number,
    width: number,
    height: number,
    stride: number,
  ): void {
    const quantizedX0 = quantize(x0);
    const quantizedY0 = quantize(y0);
    const quantizedX1 = quantize(x1);
    const quantizedY1 = quantize(y1);
    const edgeDy = quantizedY1 - quantizedY0;
    if (edgeDy === 0) {
      return;
    }
    const edgeDx = quantizedX1 - quantizedX0;
    const firstRow = Math.max(0, Math.floor(Math.min(quantizedY0, quantizedY1)) - originY);
    const finalRow = Math.min(height, Math.ceil(Math.max(quantizedY0, quantizedY1)) - originY);

    for (let row = firstRow; row < finalRow; row += 1) {
      const canvasRow = row + originY;
      const atRowStart = (canvasRow - quantizedY0) / edgeDy;
      const atRowEnd = (canvasRow + 1 - quantizedY0) / edgeDy;
      const t0 = Math.max(0, Math.min(1, Math.min(atRowStart, atRowEnd)));
      const t1 = Math.max(0, Math.min(1, Math.max(atRowStart, atRowEnd)));
      if (t1 <= t0) {
        continue;
      }
      const xa = quantizedX0 + edgeDx * t0 - originX;
      const xb = quantizedX0 + edgeDx * t1 - originX;
      const dy = edgeDy * (t1 - t0);
      this.addRowSegment(row, xa, xb, dy, width, stride);
    }
  }

  private addRowSegment(
    row: number,
    xa: number,
    xb: number,
    dy: number,
    width: number,
    stride: number,
  ): void {
    const base = row * stride;
    const minimumX = Math.min(xa, xb);
    const maximumX = Math.max(xa, xb);
    const prefixEnd = Math.max(0, Math.min(width, Math.floor(minimumX)));
    const deltas = this.deltas;
    const touchedCells = this.touchedCells;
    const touchedFlags = this.touchedFlags;
    let touchedCount = this.touchedCount;
    // Keep this marking inline: addRowSegment is the hottest edge-walking loop.
    let deltaIndex = base + prefixEnd;
    if (touchedFlags[deltaIndex] === 0) {
      touchedFlags[deltaIndex] = 1;
      touchedCells[touchedCount] = deltaIndex;
      touchedCount += 1;
    }
    deltas[deltaIndex]! -= dy;

    const firstCell = Math.max(0, Math.floor(minimumX));
    const finalCell = Math.min(width, Math.ceil(maximumX));
    const dx = xb - xa;
    for (let x = firstCell; x < finalCell; x += 1) {
      const localStart = xa - x;
      const integral =
        dx === 0
          ? Math.min(1, Math.max(0, localStart))
          : (clampedIntegral(localStart + dx) - clampedIntegral(localStart)) / dx;
      const coverage = dy * integral;
      deltaIndex = base + x;
      if (touchedFlags[deltaIndex] === 0) {
        touchedFlags[deltaIndex] = 1;
        touchedCells[touchedCount] = deltaIndex;
        touchedCount += 1;
      }
      deltas[deltaIndex]! += coverage;
      deltaIndex += 1;
      if (touchedFlags[deltaIndex] === 0) {
        touchedFlags[deltaIndex] = 1;
        touchedCells[touchedCount] = deltaIndex;
        touchedCount += 1;
      }
      deltas[deltaIndex]! -= coverage;
    }
    this.touchedCount = touchedCount;
  }
}

function grownLength(current: number, required: number): number {
  let length = Math.max(256, current);
  while (length < required) {
    length *= 2;
  }
  return length;
}

function quantize(value: number): number {
  return Math.round(value * SUBPIXEL_SCALE) / SUBPIXEL_SCALE;
}

// Antiderivative of clamp(value, 0, 1). This gives the exact average horizontal
// coverage of a linear edge segment without supersampling.
function clampedIntegral(value: number): number {
  if (value <= 0) {
    return 0;
  }
  if (value < 1) {
    return (value * value) / 2;
  }
  return value - 0.5;
}
