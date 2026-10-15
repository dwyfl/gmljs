import type { RgbaColor } from "../color/parse.ts";
import type { FillRule } from "../path/path.ts";

const ENDIAN_PROBE = new Uint8Array(new Uint32Array([0x01020304]).buffer);
const LITTLE_ENDIAN = ENDIAN_PROBE[0] === 0x04;

export class PixelBuffer {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
  private readonly words: Uint32Array;
  private readonly blendScale = new Uint8Array(256);
  private blendPairs: Uint16Array | undefined;
  private blendInverse = -1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
    this.words = new Uint32Array(this.data.buffer);
  }

  clearRect(x: number, y: number, width: number, height: number): void {
    const bounds = this.clipRect(x, y, width, height);
    if (!bounds) {
      return;
    }
    const [x0, y0, x1, y1] = bounds;
    if (allIntegers(x0, y0, x1, y1)) {
      for (let row = y0; row < y1; row += 1) {
        this.words.fill(0, row * this.width + x0, row * this.width + x1);
      }
      return;
    }
    this.paintFractionalRect(x0, y0, x1, y1, undefined);
  }

  fillRect(x: number, y: number, width: number, height: number, color: RgbaColor): void {
    const bounds = this.clipRect(x, y, width, height);
    if (!bounds) {
      return;
    }
    const [x0, y0, x1, y1] = bounds;
    if (allIntegers(x0, y0, x1, y1)) {
      if (x0 === 0 && x1 === this.width) {
        this.compositeSpan(y0 * this.width, (y1 - y0) * this.width, color, 255);
        return;
      }
      for (let row = y0; row < y1; row += 1) {
        this.compositeSpan(row * this.width + x0, x1 - x0, color, 255);
      }
      return;
    }
    this.paintFractionalRect(x0, y0, x1, y1, color);
  }

  compositeCoverage(
    deltas: Float64Array,
    touchedCells: Uint32Array,
    touchedFlags: Uint8Array,
    stride: number,
    originX: number,
    originY: number,
    width: number,
    color: RgbaColor,
    fillRule: FillRule,
  ): void {
    const evenOdd = fillRule === "evenodd";
    let touchedIndex = 0;
    while (touchedIndex < touchedCells.length) {
      const firstCell = touchedCells[touchedIndex]!;
      const y = Math.floor(firstCell / stride);
      const deltaOffset = y * stride;
      const rowEnd = deltaOffset + stride;
      const pixelOffset = (y + originY) * this.width + originX;
      let windingArea = 0;
      let runStart = firstCell - deltaOffset;
      let runCoverage = 0;
      while (touchedIndex < touchedCells.length) {
        const cell = touchedCells[touchedIndex]!;
        if (cell >= rowEnd) {
          break;
        }
        const x = cell - deltaOffset;
        windingArea += deltas[cell]!;
        deltas[cell] = 0;
        touchedFlags[cell] = 0;

        let coverage = -1;
        if (x < width) {
          let magnitude = Math.abs(windingArea);
          if (evenOdd) {
            magnitude %= 2;
            if (magnitude > 1) {
              magnitude = 2 - magnitude;
            }
          }
          coverage = Math.round(Math.min(1, magnitude) * 255);
        }
        if (coverage !== runCoverage) {
          if (runCoverage > 0) {
            this.compositeSpan(pixelOffset + runStart, x - runStart, color, runCoverage);
          }
          runStart = x;
          runCoverage = coverage;
        }
        touchedIndex += 1;
      }
    }
  }

  private paintFractionalRect(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: RgbaColor | undefined,
  ): void {
    const firstX = Math.floor(x0);
    const lastX = Math.ceil(x1) - 1;
    const firstY = Math.floor(y0);
    const lastY = Math.ceil(y1) - 1;

    for (let y = firstY; y <= lastY; y += 1) {
      const yCoverage = Math.min(y + 1, y1) - Math.max(y, y0);
      if (yCoverage < 1 || firstX === lastX) {
        for (let x = firstX; x <= lastX; x += 1) {
          const xCoverage = Math.min(x + 1, x1) - Math.max(x, x0);
          this.paintPixel(y * this.width + x, xCoverage * yCoverage, color);
        }
        continue;
      }

      let fullStart = firstX;
      let fullEnd = lastX + 1;
      const leftCoverage = Math.min(firstX + 1, x1) - Math.max(firstX, x0);
      if (leftCoverage < 1) {
        this.paintPixel(y * this.width + firstX, leftCoverage, color);
        fullStart += 1;
      }
      const rightCoverage = Math.min(lastX + 1, x1) - Math.max(lastX, x0);
      if (rightCoverage < 1) {
        this.paintPixel(y * this.width + lastX, rightCoverage, color);
        fullEnd -= 1;
      }
      if (fullEnd > fullStart) {
        const offset = y * this.width + fullStart;
        if (color) {
          this.compositeSpan(offset, fullEnd - fullStart, color, 255);
        } else {
          this.words.fill(0, offset, offset + fullEnd - fullStart);
        }
      }
    }
  }

  private paintPixel(pixel: number, coverage: number, color: RgbaColor | undefined): void {
    const coverageByte = Math.round(coverage * 255);
    if (coverageByte <= 0) {
      return;
    }
    if (color) {
      this.compositeSpan(pixel, 1, color, coverageByte);
    } else if (coverageByte >= 255) {
      this.words[pixel] = 0;
    } else {
      const offset = pixel * 4;
      const inverse = 255 - coverageByte;
      this.data[offset] = divide255(this.data[offset]! * inverse);
      this.data[offset + 1] = divide255(this.data[offset + 1]! * inverse);
      this.data[offset + 2] = divide255(this.data[offset + 2]! * inverse);
      this.data[offset + 3] = divide255(this.data[offset + 3]! * inverse);
    }
  }

  private compositeSpan(pixel: number, length: number, color: RgbaColor, coverage: number): void {
    const sourceAlpha = divide255(color.a * coverage);
    if (sourceAlpha === 0) {
      return;
    }
    if (sourceAlpha === 255) {
      this.words.fill(packRgba(color.r, color.g, color.b, 255), pixel, pixel + length);
      return;
    }

    const sourceR = divide255(color.r * sourceAlpha);
    const sourceG = divide255(color.g * sourceAlpha);
    const sourceB = divide255(color.b * sourceAlpha);
    const inverse = 255 - sourceAlpha;
    const sourceWord = packRgba(sourceR, sourceG, sourceB, sourceAlpha);
    const end = pixel + length;
    if (length >= 4096) {
      const firstDestination = this.words[pixel]!;
      let scan = pixel + 1;
      while (scan < end && this.words[scan] === firstDestination) {
        scan += 1;
      }
      if (scan === end) {
        const laneMask = 0x00ff00ff;
        const laneBias = 0x00800080;
        let even = (firstDestination & laneMask) * inverse + laneBias;
        let odd = ((firstDestination >>> 8) & laneMask) * inverse + laneBias;
        even = ((even + ((even >>> 8) & laneMask)) >>> 8) & laneMask;
        odd = ((odd + ((odd >>> 8) & laneMask)) >>> 8) & laneMask;
        const output = (sourceWord + even + (odd << 8)) >>> 0;
        this.words.fill(output, pixel, end);
        return;
      }

      if (inverse !== this.blendInverse) {
        for (let value = 0; value < 256; value += 1) {
          this.blendScale[value] = divide255(value * inverse);
        }
        const pairs = (this.blendPairs ??= new Uint16Array(65536));
        for (let high = 0; high < 256; high += 1) {
          const highByte = this.blendScale[high]! << 8;
          const pairOffset = high << 8;
          for (let low = 0; low < 256; low += 1) {
            pairs[pairOffset + low] = highByte | this.blendScale[low]!;
          }
        }
        this.blendInverse = inverse;
      }
      const pairs = this.blendPairs!;
      for (; pixel < end; pixel += 1) {
        const destination = this.words[pixel]!;
        const scaled = pairs[destination & 0xffff]! | (pairs[destination >>> 16]! << 16);
        this.words[pixel] = (sourceWord + scaled) >>> 0;
      }
      return;
    }

    const laneMask = 0x00ff00ff;
    const laneBias = 0x00800080;
    const sourceEven = sourceWord & laneMask;
    const sourceOdd = (sourceWord >>> 8) & laneMask;
    for (; pixel < end; pixel += 1) {
      const destination = this.words[pixel]!;
      let even = (destination & laneMask) * inverse + laneBias;
      let odd = ((destination >>> 8) & laneMask) * inverse + laneBias;
      even = ((even + ((even >>> 8) & laneMask)) >>> 8) & laneMask;
      odd = ((odd + ((odd >>> 8) & laneMask)) >>> 8) & laneMask;
      this.words[pixel] = (sourceEven + even + ((sourceOdd + odd) << 8)) >>> 0;
    }
  }

  private clipRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): readonly [number, number, number, number] | undefined {
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width === 0 ||
      height === 0
    ) {
      return undefined;
    }
    let x0 = width < 0 ? x + width : x;
    let x1 = width < 0 ? x : x + width;
    let y0 = height < 0 ? y + height : y;
    let y1 = height < 0 ? y : y + height;
    x0 = Math.max(0, Math.min(this.width, x0));
    x1 = Math.max(0, Math.min(this.width, x1));
    y0 = Math.max(0, Math.min(this.height, y0));
    y1 = Math.max(0, Math.min(this.height, y1));
    return x1 > x0 && y1 > y0 ? [x0, y0, x1, y1] : undefined;
  }
}

function allIntegers(...values: number[]): boolean {
  return values.every(Number.isInteger);
}

function divide255(value: number): number {
  const biased = value + 128;
  return (biased + (biased >> 8)) >> 8;
}

function packRgba(r: number, g: number, b: number, a: number): number {
  return LITTLE_ENDIAN
    ? (r | (g << 8) | (b << 16) | (a << 24)) >>> 0
    : ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
}
