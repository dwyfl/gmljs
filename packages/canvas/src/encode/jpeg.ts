export type ChromaSubsampling = "4:2:0" | "4:4:4";

export interface JpegSource {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

export interface JpegOptions {
  /** IJG-style quality, as an integer from 1 through 100. */
  readonly quality: number;
  readonly subsampling: ChromaSubsampling;
}

const ZIGZAG = new Uint8Array([
  0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18,
  24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37,
  47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63,
]);

const LUMINANCE_QUANTIZATION = new Uint8Array([
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113,
  92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
]);

const CHROMINANCE_QUANTIZATION = new Uint8Array([
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
]);

const DC_LUMINANCE_COUNTS = new Uint8Array([0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]);
const DC_LUMINANCE_VALUES = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
const AC_LUMINANCE_COUNTS = new Uint8Array([0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d]);
const AC_LUMINANCE_VALUES = new Uint8Array([
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
  0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
  0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
  0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
  0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
  0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
  0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
  0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
  0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa,
]);
const DC_CHROMINANCE_COUNTS = new Uint8Array([0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
const DC_CHROMINANCE_VALUES = DC_LUMINANCE_VALUES;
const AC_CHROMINANCE_COUNTS = new Uint8Array([0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77]);
const AC_CHROMINANCE_VALUES = new Uint8Array([
  0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
  0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
  0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
  0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
  0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
  0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
  0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
  0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
  0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
  0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa,
]);

const Y_DC = makeHuffmanTable(DC_LUMINANCE_COUNTS, DC_LUMINANCE_VALUES);
const Y_AC = makeHuffmanTable(AC_LUMINANCE_COUNTS, AC_LUMINANCE_VALUES);
const C_DC = makeHuffmanTable(DC_CHROMINANCE_COUNTS, DC_CHROMINANCE_VALUES);
const C_AC = makeHuffmanTable(AC_CHROMINANCE_COUNTS, AC_CHROMINANCE_VALUES);
const AAN_SCALE = new Float64Array([
  1, 1.387039845, 1.306562965, 1.175875602, 1, 0.785694958, 0.5411961, 0.275899379,
]);
const COLOR_TABLES = makeColorTables();

export function encodeJpeg(source: JpegSource, options: JpegOptions): Uint8Array {
  const { width, height } = source;
  if (width === 0 || height === 0) {
    throw new RangeError("JPEG images must have a non-zero width and height");
  }
  if (width > 0xffff || height > 0xffff) {
    throw new RangeError("JPEG dimensions must not exceed 65535");
  }
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new RangeError("JPEG quality must be an integer from 1 through 100");
  }

  const quantization = getQuantizationTables(options.quality);
  const output = new JpegWriter(Math.max(1024, Math.ceil(width * height * 0.5) + 1024));
  writeHeaders(output, width, height, options.subsampling, quantization);
  const encoder = new Encoder(source, options.subsampling, quantization, output);
  encoder.encode();
  output.finishBits();
  output.word(0xffd9);
  return output.finish();
}

interface QuantizationTables {
  readonly luminance: Uint8Array;
  readonly chrominance: Uint8Array;
  readonly luminanceReciprocal: Float64Array;
  readonly chrominanceReciprocal: Float64Array;
}

// Encoding is synchronous and invokes no user code, so one shared scratch set cannot be
// observed reentrantly. Reusing it removes the per-frame typed-array allocation churn.
const SCRATCH_Y = new Int16Array(256);
const SCRATCH_CB = new Int16Array(256);
const SCRATCH_CR = new Int16Array(256);
const SCRATCH_CB_DOWNSAMPLED = new Int16Array(64);
const SCRATCH_CR_DOWNSAMPLED = new Int16Array(64);
const SCRATCH_BLOCK = new Float64Array(64);
const SCRATCH_QUANTIZED = new Int32Array(64);
const SCRATCH_COLUMN_OFFSETS = new Int32Array(16);
const SCRATCH_ROW_OFFSETS = new Int32Array(16);
const QUANTIZATION_CACHE = Array.from<QuantizationTables | undefined>({ length: 101 });

class Encoder {
  private readonly source: JpegSource;
  private readonly subsampling: ChromaSubsampling;
  private readonly tables: QuantizationTables;
  private readonly bits: JpegWriter;
  private readonly mcuSize: number;
  private readonly words: Uint32Array | undefined;
  private readonly yPlane = SCRATCH_Y;
  private readonly cbPlane = SCRATCH_CB;
  private readonly crPlane = SCRATCH_CR;
  private readonly cbDownsampled = SCRATCH_CB_DOWNSAMPLED;
  private readonly crDownsampled = SCRATCH_CR_DOWNSAMPLED;
  private readonly columnOffsets = SCRATCH_COLUMN_OFFSETS;
  private readonly rowOffsets = SCRATCH_ROW_OFFSETS;
  private readonly block = SCRATCH_BLOCK;
  private readonly quantized = SCRATCH_QUANTIZED;
  private previousY = 0;
  private previousCb = 0;
  private previousCr = 0;

  constructor(
    source: JpegSource,
    subsampling: ChromaSubsampling,
    tables: QuantizationTables,
    bits: JpegWriter,
  ) {
    this.source = source;
    this.subsampling = subsampling;
    this.tables = tables;
    this.bits = bits;
    this.mcuSize = subsampling === "4:2:0" ? 16 : 8;
    // PixelBuffer starts at an aligned ArrayBuffer offset. Direct JpegSource callers may
    // pass an unaligned subarray, so those use the byte-wise fallback in isUniformMcu().
    this.words =
      (source.data.byteOffset & 3) === 0
        ? new Uint32Array(source.data.buffer, source.data.byteOffset, source.data.length >> 2)
        : undefined;
  }

  encode(): void {
    for (let top = 0; top < this.source.height; top += this.mcuSize) {
      for (let left = 0; left < this.source.width; left += this.mcuSize) {
        this.bits.reserveMcu(this.subsampling === "4:2:0" ? 6 : 3);
        if (this.isUniformMcu(left, top)) {
          this.encodeUniformMcu(left, top);
        } else {
          this.convertMcu(left, top);
          this.encodeConvertedMcu();
        }
      }
    }
  }

  private isUniformMcu(left: number, top: number): boolean {
    const { data, width, height } = this.source;
    const realWidth = Math.min(this.mcuSize, width - left);
    const realHeight = Math.min(this.mcuSize, height - top);
    const firstPixel = top * width + left;
    if (this.words) {
      const first = this.words[firstPixel]!;
      for (let row = 0; row < realHeight; row += 1) {
        let pixel = (top + row) * width + left;
        const end = pixel + realWidth;
        for (; pixel < end; pixel += 1) {
          if (this.words[pixel] !== first) return false;
        }
      }
      return true;
    }
    const first = firstPixel << 2;
    for (let row = 0; row < realHeight; row += 1) {
      let offset = ((top + row) * width + left) << 2;
      const end = offset + (realWidth << 2);
      for (; offset < end; offset += 4) {
        if (
          data[offset] !== data[first] ||
          data[offset + 1] !== data[first + 1] ||
          data[offset + 2] !== data[first + 2] ||
          data[offset + 3] !== data[first + 3]
        ) {
          return false;
        }
      }
    }
    return true;
  }

  private encodeUniformMcu(left: number, top: number): void {
    const offset = (top * this.source.width + left) << 2;
    const red = this.source.data[offset]!;
    const green = this.source.data[offset + 1]!;
    const blue = this.source.data[offset + 2]!;
    // Premultiplied RGB is already the Canvas result composited over opaque black.
    const y = luma(red, green, blue);
    const cb = blueDifference(red, green, blue);
    const cr = redDifference(red, green, blue);
    const yBlocks = this.subsampling === "4:2:0" ? 4 : 1;
    for (let block = 0; block < yBlocks; block += 1) {
      this.previousY = this.encodeConstant(
        y,
        this.tables.luminanceReciprocal,
        this.previousY,
        Y_DC,
        Y_AC,
      );
    }
    this.previousCb = this.encodeConstant(
      cb,
      this.tables.chrominanceReciprocal,
      this.previousCb,
      C_DC,
      C_AC,
    );
    this.previousCr = this.encodeConstant(
      cr,
      this.tables.chrominanceReciprocal,
      this.previousCr,
      C_DC,
      C_AC,
    );
  }

  private convertMcu(left: number, top: number): void {
    const { data, width, height } = this.source;
    for (let index = 0; index < this.mcuSize; index += 1) {
      this.columnOffsets[index] = Math.min(left + index, width - 1) << 2;
      this.rowOffsets[index] = Math.min(top + index, height - 1) * width * 4;
    }
    if (this.subsampling === "4:2:0") {
      let chroma = 0;
      for (let row = 0; row < 8; row += 1) {
        const upperRow = this.rowOffsets[row * 2]!;
        const lowerRow = this.rowOffsets[row * 2 + 1]!;
        let yUpper = row * 32;
        let yLower = yUpper + 16;
        for (let column = 0; column < 8; column += 1) {
          const leftColumn = this.columnOffsets[column * 2]!;
          const rightColumn = this.columnOffsets[column * 2 + 1]!;
          const upperLeft = upperRow + leftColumn;
          const upperRight = upperRow + rightColumn;
          const lowerLeft = lowerRow + leftColumn;
          const lowerRight = lowerRow + rightColumn;
          const red0 = data[upperLeft]!;
          const green0 = data[upperLeft + 1]!;
          const blue0 = data[upperLeft + 2]!;
          const red1 = data[upperRight]!;
          const green1 = data[upperRight + 1]!;
          const blue1 = data[upperRight + 2]!;
          const red2 = data[lowerLeft]!;
          const green2 = data[lowerLeft + 1]!;
          const blue2 = data[lowerLeft + 2]!;
          const red3 = data[lowerRight]!;
          const green3 = data[lowerRight + 1]!;
          const blue3 = data[lowerRight + 2]!;
          this.yPlane[yUpper] = luma(red0, green0, blue0);
          this.yPlane[yUpper + 1] = luma(red1, green1, blue1);
          this.yPlane[yLower] = luma(red2, green2, blue2);
          this.yPlane[yLower + 1] = luma(red3, green3, blue3);
          const red = red0 + red1 + red2 + red3;
          const green = green0 + green1 + green2 + green3;
          const blue = blue0 + blue1 + blue2 + blue3;
          this.cbDownsampled[chroma] =
            (-11059 * red - 21709 * green + 32768 * blue + 0x1ffff) >> 18;
          this.crDownsampled[chroma] = (32768 * red - 27439 * green - 5329 * blue + 0x1ffff) >> 18;
          chroma += 1;
          yUpper += 2;
          yLower += 2;
        }
      }
      return;
    }
    let output = 0;
    for (let row = 0; row < 8; row += 1) {
      const rowOffset = this.rowOffsets[row]!;
      for (let column = 0; column < 8; column += 1) {
        const sourceOffset = rowOffset + this.columnOffsets[column]!;
        const red = data[sourceOffset]!;
        const green = data[sourceOffset + 1]!;
        const blue = data[sourceOffset + 2]!;
        this.yPlane[output] = luma(red, green, blue);
        this.cbPlane[output] = blueDifference(red, green, blue);
        this.crPlane[output] = redDifference(red, green, blue);
        output += 1;
      }
    }
  }

  private encodeConvertedMcu(): void {
    if (this.subsampling === "4:2:0") {
      this.previousY = this.encodeBlock(
        this.yPlane,
        16,
        0,
        0,
        this.tables.luminanceReciprocal,
        this.previousY,
        Y_DC,
        Y_AC,
      );
      this.previousY = this.encodeBlock(
        this.yPlane,
        16,
        8,
        0,
        this.tables.luminanceReciprocal,
        this.previousY,
        Y_DC,
        Y_AC,
      );
      this.previousY = this.encodeBlock(
        this.yPlane,
        16,
        0,
        8,
        this.tables.luminanceReciprocal,
        this.previousY,
        Y_DC,
        Y_AC,
      );
      this.previousY = this.encodeBlock(
        this.yPlane,
        16,
        8,
        8,
        this.tables.luminanceReciprocal,
        this.previousY,
        Y_DC,
        Y_AC,
      );
      this.previousCb = this.encodeBlock(
        this.cbDownsampled,
        8,
        0,
        0,
        this.tables.chrominanceReciprocal,
        this.previousCb,
        C_DC,
        C_AC,
      );
      this.previousCr = this.encodeBlock(
        this.crDownsampled,
        8,
        0,
        0,
        this.tables.chrominanceReciprocal,
        this.previousCr,
        C_DC,
        C_AC,
      );
    } else {
      this.previousY = this.encodeBlock(
        this.yPlane,
        8,
        0,
        0,
        this.tables.luminanceReciprocal,
        this.previousY,
        Y_DC,
        Y_AC,
      );
      this.previousCb = this.encodeBlock(
        this.cbPlane,
        8,
        0,
        0,
        this.tables.chrominanceReciprocal,
        this.previousCb,
        C_DC,
        C_AC,
      );
      this.previousCr = this.encodeBlock(
        this.crPlane,
        8,
        0,
        0,
        this.tables.chrominanceReciprocal,
        this.previousCr,
        C_DC,
        C_AC,
      );
    }
  }

  private encodeConstant(
    value: number,
    reciprocal: Float64Array,
    previousDc: number,
    dcTable: Uint32Array,
    acTable: Uint32Array,
  ): number {
    const scaled = value * reciprocal[0]! * 64;
    const dc = scaled < 0 ? (scaled - 0.5) | 0 : (scaled + 0.5) | 0;
    writeCoefficient(this.bits, dc - previousDc, dcTable);
    this.bits.writePacked(acTable[0]!);
    return dc;
  }

  private encodeBlock(
    plane: Int16Array,
    stride: number,
    left: number,
    top: number,
    reciprocal: Float64Array,
    previousDc: number,
    dcTable: Uint32Array,
    acTable: Uint32Array,
  ): number {
    let output = 0;
    let input = top * stride + left;
    const first = plane[input]!;
    let constant = true;
    for (let row = 0; row < 8; row += 1) {
      const end = input + 8;
      for (; input < end; input += 1) {
        const value = plane[input]!;
        this.block[output] = value;
        constant &&= value === first;
        output += 1;
      }
      input += stride;
      input -= 8;
    }
    if (constant) {
      const scaled = first * reciprocal[0]! * 64;
      const dc = scaled < 0 ? (scaled - 0.5) | 0 : (scaled + 0.5) | 0;
      writeCoefficient(this.bits, dc - previousDc, dcTable);
      this.bits.writePacked(acTable[0]!);
      return dc;
    }
    forwardDct(this.block);
    let hasAc = false;
    for (let index = 0; index < 64; index += 1) {
      const scaled = this.block[index]! * reciprocal[index]!;
      const coefficient = scaled < 0 ? (scaled - 0.5) | 0 : (scaled + 0.5) | 0;
      const zigzag = ZIGZAG[index]!;
      this.quantized[zigzag] = coefficient;
      hasAc ||= zigzag !== 0 && coefficient !== 0;
    }

    const dc = this.quantized[0]!;
    writeCoefficient(this.bits, dc - previousDc, dcTable);
    if (!hasAc) {
      this.bits.writePacked(acTable[0]!);
      return dc;
    }

    let end = 63;
    while (this.quantized[end] === 0) end -= 1;
    let index = 1;
    while (index <= end) {
      let run = 0;
      while (this.quantized[index] === 0) {
        run += 1;
        index += 1;
      }
      while (run >= 16) {
        this.bits.writePacked(acTable[0xf0]!);
        run -= 16;
      }
      const value = this.quantized[index]!;
      const size = coefficientSize(value);
      this.bits.writeHuffmanValue(acTable[(run << 4) | size]!, extraBits(value, size), size);
      index += 1;
    }
    if (end !== 63) this.bits.writePacked(acTable[0]!);
    return dc;
  }
}

function forwardDct(data: Float64Array): void {
  for (let offset = 0; offset < 64; offset += 8) transform(data, offset, 1);
  for (let offset = 0; offset < 8; offset += 1) transform(data, offset, 8);
}

function transform(data: Float64Array, offset: number, step: number): void {
  const d0 = data[offset]!;
  const d1 = data[offset + step]!;
  const d2 = data[offset + step * 2]!;
  const d3 = data[offset + step * 3]!;
  const d4 = data[offset + step * 4]!;
  const d5 = data[offset + step * 5]!;
  const d6 = data[offset + step * 6]!;
  const d7 = data[offset + step * 7]!;
  const tmp0 = d0 + d7;
  const tmp7 = d0 - d7;
  const tmp1 = d1 + d6;
  const tmp6 = d1 - d6;
  const tmp2 = d2 + d5;
  const tmp5 = d2 - d5;
  const tmp3 = d3 + d4;
  const tmp4 = d3 - d4;
  const tmp10 = tmp0 + tmp3;
  const tmp13 = tmp0 - tmp3;
  const tmp11 = tmp1 + tmp2;
  const tmp12 = tmp1 - tmp2;
  data[offset] = tmp10 + tmp11;
  data[offset + step * 4] = tmp10 - tmp11;
  const z1 = (tmp12 + tmp13) * 0.707106781;
  data[offset + step * 2] = tmp13 + z1;
  data[offset + step * 6] = tmp13 - z1;
  const odd10 = tmp4 + tmp5;
  const odd11 = tmp5 + tmp6;
  const odd12 = tmp6 + tmp7;
  const z5 = (odd10 - odd12) * 0.382683433;
  const z2 = 0.5411961 * odd10 + z5;
  const z4 = 1.306562965 * odd12 + z5;
  const z3 = odd11 * 0.707106781;
  const z11 = tmp7 + z3;
  const z13 = tmp7 - z3;
  data[offset + step * 5] = z13 + z2;
  data[offset + step * 3] = z13 - z2;
  data[offset + step] = z11 + z4;
  data[offset + step * 7] = z11 - z4;
}

class JpegWriter {
  private data: Uint8Array;
  private offset = 0;
  private accumulator = 0;
  private bitLength = 0;

  constructor(initialCapacity: number) {
    this.data = new Uint8Array(initialCapacity);
  }

  byte(value: number): void {
    this.ensure(1);
    this.data[this.offset] = value;
    this.offset += 1;
  }

  word(value: number): void {
    this.ensure(2);
    this.data[this.offset] = value >>> 8;
    this.data[this.offset + 1] = value;
    this.offset += 2;
  }

  bytes(values: Uint8Array): void {
    this.ensure(values.length);
    this.data.set(values, this.offset);
    this.offset += values.length;
  }

  reserveMcu(blocks: number): void {
    // One baseline block needs at most 22 DC bits plus 63 × (16 Huffman + 10 extra)
    // AC bits. Rounded up and doubled for worst-case 0xff stuffing, that is under 416
    // bytes per block, so one capacity check here covers the complete MCU.
    this.ensure(blocks * 416 + 16);
  }

  write(value: number, length: number): void {
    let accumulator = (this.accumulator << length) | (value & ((1 << length) - 1));
    let bitLength = this.bitLength + length;
    let offset = this.offset;
    const data = this.data;
    while (bitLength >= 8) {
      bitLength -= 8;
      const byte = (accumulator >>> bitLength) & 0xff;
      data[offset] = byte;
      offset += 1;
      if (byte === 0xff) {
        data[offset] = 0;
        offset += 1;
      }
    }
    this.accumulator = accumulator;
    this.bitLength = bitLength;
    this.offset = offset;
  }

  writePacked(packed: number): void {
    const length = packed >>> 16;
    let accumulator = (this.accumulator << length) | (packed & 0xffff);
    let bitLength = this.bitLength + length;
    let offset = this.offset;
    const data = this.data;
    while (bitLength >= 8) {
      bitLength -= 8;
      const byte = (accumulator >>> bitLength) & 0xff;
      data[offset] = byte;
      offset += 1;
      if (byte === 0xff) {
        data[offset] = 0;
        offset += 1;
      }
    }
    this.accumulator = accumulator;
    this.bitLength = bitLength;
    this.offset = offset;
  }

  writeHuffmanValue(packed: number, value: number, length: number): void {
    const huffmanLength = packed >>> 16;
    let accumulator = (this.accumulator << huffmanLength) | (packed & 0xffff);
    let bitLength = this.bitLength + huffmanLength;
    let offset = this.offset;
    const data = this.data;
    while (bitLength >= 8) {
      bitLength -= 8;
      const byte = (accumulator >>> bitLength) & 0xff;
      data[offset] = byte;
      offset += 1;
      if (byte === 0xff) {
        data[offset] = 0;
        offset += 1;
      }
    }
    accumulator = (accumulator << length) | value;
    bitLength += length;
    while (bitLength >= 8) {
      bitLength -= 8;
      const byte = (accumulator >>> bitLength) & 0xff;
      data[offset] = byte;
      offset += 1;
      if (byte === 0xff) {
        data[offset] = 0;
        offset += 1;
      }
    }
    this.accumulator = accumulator;
    this.bitLength = bitLength;
    this.offset = offset;
  }

  finishBits(): void {
    if (this.bitLength !== 0) this.write((1 << (8 - this.bitLength)) - 1, 8 - this.bitLength);
  }

  finish(): Uint8Array {
    // Avoid copying normal outputs. Very compressible images get an exact copy so a tiny
    // JPEG does not retain the much larger estimate backing buffer.
    return this.data.length > this.offset * 2
      ? this.data.slice(0, this.offset)
      : this.data.subarray(0, this.offset);
  }

  private ensure(length: number): void {
    if (this.offset + length <= this.data.length) return;
    let capacity = this.data.length;
    while (capacity < this.offset + length) capacity *= 2;
    const grown = new Uint8Array(capacity);
    grown.set(this.data);
    this.data = grown;
  }
}

function writeHeaders(
  output: JpegWriter,
  width: number,
  height: number,
  subsampling: ChromaSubsampling,
  tables: QuantizationTables,
): void {
  output.word(0xffd8);
  output.word(0xffe0);
  output.word(16);
  output.bytes(new Uint8Array([0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]));
  output.word(0xffdb);
  output.word(132);
  output.byte(0);
  output.bytes(tables.luminance);
  output.byte(1);
  output.bytes(tables.chrominance);
  output.word(0xffc0);
  output.word(17);
  output.byte(8);
  output.word(height);
  output.word(width);
  output.byte(3);
  output.bytes(
    new Uint8Array([1, subsampling === "4:2:0" ? 0x22 : 0x11, 0, 2, 0x11, 1, 3, 0x11, 1]),
  );
  output.word(0xffc4);
  output.word(0x01a2);
  writeHuffmanDefinition(output, 0, DC_LUMINANCE_COUNTS, DC_LUMINANCE_VALUES);
  writeHuffmanDefinition(output, 0x10, AC_LUMINANCE_COUNTS, AC_LUMINANCE_VALUES);
  writeHuffmanDefinition(output, 1, DC_CHROMINANCE_COUNTS, DC_CHROMINANCE_VALUES);
  writeHuffmanDefinition(output, 0x11, AC_CHROMINANCE_COUNTS, AC_CHROMINANCE_VALUES);
  output.word(0xffda);
  output.word(12);
  output.bytes(new Uint8Array([3, 1, 0, 2, 0x11, 3, 0x11, 0, 0x3f, 0]));
}

function writeHuffmanDefinition(
  output: JpegWriter,
  identifier: number,
  counts: Uint8Array,
  values: Uint8Array,
): void {
  output.byte(identifier);
  output.bytes(counts);
  output.bytes(values);
}

function getQuantizationTables(quality: number): QuantizationTables {
  const cached = QUANTIZATION_CACHE[quality];
  if (cached) return cached;
  const tables = makeQuantizationTables(quality);
  QUANTIZATION_CACHE[quality] = tables;
  return tables;
}

function makeQuantizationTables(quality: number): QuantizationTables {
  const scale = quality < 50 ? 5000 / quality : 200 - quality * 2;
  const luminance = new Uint8Array(64);
  const chrominance = new Uint8Array(64);
  const luminanceReciprocal = new Float64Array(64);
  const chrominanceReciprocal = new Float64Array(64);
  for (let index = 0; index < 64; index += 1) {
    const zigzag = ZIGZAG[index]!;
    luminance[zigzag] = scaledQuantizer(LUMINANCE_QUANTIZATION[index]!, scale);
    chrominance[zigzag] = scaledQuantizer(CHROMINANCE_QUANTIZATION[index]!, scale);
  }
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const index = row * 8 + column;
      const divisor = AAN_SCALE[row]! * AAN_SCALE[column]! * 8;
      luminanceReciprocal[index] = 1 / (luminance[ZIGZAG[index]!]! * divisor);
      chrominanceReciprocal[index] = 1 / (chrominance[ZIGZAG[index]!]! * divisor);
    }
  }
  return { luminance, chrominance, luminanceReciprocal, chrominanceReciprocal };
}

function scaledQuantizer(base: number, scale: number): number {
  return Math.max(1, Math.min(255, Math.floor((base * scale + 50) / 100)));
}

function makeHuffmanTable(counts: Uint8Array, values: Uint8Array): Uint32Array {
  const table = new Uint32Array(256);
  let code = 0;
  let position = 0;
  for (let length = 1; length <= 16; length += 1) {
    for (let count = counts[length - 1]!; count > 0; count -= 1) {
      table[values[position]!] = (length << 16) | code;
      code += 1;
      position += 1;
    }
    code <<= 1;
  }
  return table;
}

function writeCoefficient(bits: JpegWriter, value: number, table: Uint32Array): void {
  const size = coefficientSize(value);
  if (size === 0) bits.writePacked(table[0]!);
  else bits.writeHuffmanValue(table[size]!, extraBits(value, size), size);
}

function coefficientSize(value: number): number {
  return value === 0 ? 0 : 32 - Math.clz32(Math.abs(value));
}

function extraBits(value: number, size: number): number {
  return value < 0 ? value - 1 + (1 << size) : value;
}

function luma(red: number, green: number, blue: number): number {
  return (
    ((COLOR_TABLES[red]! + COLOR_TABLES[green + 256]! + COLOR_TABLES[blue + 512]!) >> 16) - 128
  );
}

function blueDifference(red: number, green: number, blue: number): number {
  return (
    ((COLOR_TABLES[red + 768]! + COLOR_TABLES[green + 1024]! + COLOR_TABLES[blue + 1280]!) >> 16) -
    128
  );
}

function redDifference(red: number, green: number, blue: number): number {
  return (
    ((COLOR_TABLES[red + 1280]! + COLOR_TABLES[green + 1536]! + COLOR_TABLES[blue + 1792]!) >> 16) -
    128
  );
}

function makeColorTables(): Int32Array {
  const table = new Int32Array(2048);
  for (let value = 0; value < 256; value += 1) {
    table[value] = 19595 * value;
    table[value + 256] = 38470 * value;
    table[value + 512] = 7471 * value + 0x8000;
    table[value + 768] = -11059 * value;
    table[value + 1024] = -21709 * value;
    table[value + 1280] = 32768 * value + 0x807fff;
    table[value + 1536] = -27439 * value;
    table[value + 1792] = -5329 * value;
  }
  return table;
}
