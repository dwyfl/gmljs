export type Deflate = (data: Uint8Array) => Promise<Uint8Array>;

export interface PngSource {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const CRC_TABLE = makeCrcTable();

export async function encodePng(source: PngSource, deflate: Deflate): Promise<Uint8Array> {
  const { width, height } = source;
  if (width === 0 || height === 0) {
    throw new RangeError("PNG images must have a non-zero width and height");
  }

  const rowBytes = width * 4;
  const filtered = new Uint8Array((rowBytes + 1) * height);
  let previous = new Uint8Array(rowBytes);
  let current = new Uint8Array(rowBytes);

  for (let y = 0; y < height; y += 1) {
    unpremultiplyRow(source.data, y * rowBytes, current);
    const filter = chooseFilter(current, previous);
    const outputOffset = y * (rowBytes + 1);
    filtered[outputOffset] = filter;
    writeFilteredRow(filtered, outputOffset + 1, current, previous, filter);
    const swap = previous;
    previous = current;
    current = swap;
  }

  const compressed = await deflate(filtered);
  const header = new Uint8Array(13);
  writeU32(header, 0, width);
  writeU32(header, 4, height);
  header[8] = 8;
  header[9] = 6;

  return concatenate([
    PNG_SIGNATURE,
    chunk("IHDR", header),
    chunk("IDAT", compressed),
    chunk("IEND", new Uint8Array()),
  ]);
}

function unpremultiplyRow(source: Uint8Array, offset: number, output: Uint8Array): void {
  output.set(source.subarray(offset, offset + output.length));
  for (let x = 0; x < output.length; x += 4) {
    const alpha = output[x + 3]!;
    if (alpha !== 0 && alpha !== 255) {
      output[x] = Math.min(255, Math.round((output[x]! * 255) / alpha));
      output[x + 1] = Math.min(255, Math.round((output[x + 1]! * 255) / alpha));
      output[x + 2] = Math.min(255, Math.round((output[x + 2]! * 255) / alpha));
    }
  }
}

function chooseFilter(current: Uint8Array, previous: Uint8Array): number {
  let noneScore = 0;
  let subScore = 0;
  let upScore = 0;
  let averageScore = 0;
  let paethScore = 0;

  // Sampling alternate pixels retains all color channels and all five filters while
  // halving the heuristic's hot loop. It only affects compressed size, not decoded pixels.
  for (let pixel = 0; pixel < current.length; pixel += 8) {
    for (let channel = 0; channel < 4; channel += 1) {
      const index = pixel + channel;
      const raw = current[index]!;
      const left = index >= 4 ? current[index - 4]! : 0;
      const up = previous[index]!;
      const upLeft = index >= 4 ? previous[index - 4]! : 0;
      noneScore += signedByteMagnitude(raw);
      subScore += signedByteMagnitude((raw - left) & 0xff);
      upScore += signedByteMagnitude((raw - up) & 0xff);
      averageScore += signedByteMagnitude((raw - ((left + up) >> 1)) & 0xff);
      paethScore += signedByteMagnitude((raw - paeth(left, up, upLeft)) & 0xff);
    }
  }

  let bestFilter = 0;
  let bestScore = noneScore;
  if (subScore < bestScore) {
    bestFilter = 1;
    bestScore = subScore;
  }
  if (upScore < bestScore) {
    bestFilter = 2;
    bestScore = upScore;
  }
  if (averageScore < bestScore) {
    bestFilter = 3;
    bestScore = averageScore;
  }
  if (paethScore < bestScore) {
    bestFilter = 4;
  }
  return bestFilter;
}

function signedByteMagnitude(value: number): number {
  return value < 128 ? value : 256 - value;
}

function writeFilteredRow(
  output: Uint8Array,
  outputOffset: number,
  current: Uint8Array,
  previous: Uint8Array,
  filter: number,
): void {
  if (filter === 0) {
    output.set(current, outputOffset);
    return;
  }
  if (filter === 1) {
    for (let index = 0; index < current.length; index += 1) {
      const left = index >= 4 ? current[index - 4]! : 0;
      output[outputOffset + index] = current[index]! - left;
    }
    return;
  }
  if (filter === 2) {
    for (let index = 0; index < current.length; index += 1) {
      output[outputOffset + index] = current[index]! - previous[index]!;
    }
    return;
  }
  if (filter === 3) {
    for (let index = 0; index < current.length; index += 1) {
      const left = index >= 4 ? current[index - 4]! : 0;
      output[outputOffset + index] = current[index]! - ((left + previous[index]!) >> 1);
    }
    return;
  }
  for (let index = 0; index < current.length; index += 1) {
    const left = index >= 4 ? current[index - 4]! : 0;
    const upLeft = index >= 4 ? previous[index - 4]! : 0;
    output[outputOffset + index] = current[index]! - paeth(left, previous[index]!, upLeft);
  }
}

function paeth(left: number, up: number, upLeft: number): number {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  return leftDistance <= upDistance && leftDistance <= upLeftDistance
    ? left
    : upDistance <= upLeftDistance
      ? up
      : upLeft;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const output = new Uint8Array(data.length + 12);
  writeU32(output, 0, data.length);
  for (let i = 0; i < 4; i += 1) {
    output[4 + i] = type.charCodeAt(i);
  }
  output.set(data, 8);
  writeU32(output, output.length - 4, crc32(output, 4, output.length - 4));
  return output;
}

function crc32(data: Uint8Array, start: number, end: number): number {
  let crc = 0xffffffff;
  for (let i = start; i < end; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < table.length; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
}

function writeU32(output: Uint8Array, offset: number, value: number): void {
  output[offset] = value >>> 24;
  output[offset + 1] = value >>> 16;
  output[offset + 2] = value >>> 8;
  output[offset + 3] = value;
}

function concatenate(parts: readonly Uint8Array[]): Uint8Array {
  let length = 0;
  for (const part of parts) {
    length += part.length;
  }
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}
