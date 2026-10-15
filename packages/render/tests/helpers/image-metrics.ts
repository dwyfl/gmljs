import { createHash } from "node:crypto";
import { PNG } from "pngjs";

export interface DecodedImage {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

export interface ImageMetrics {
  readonly candidateInkMass: number;
  readonly referenceInkMass: number;
  readonly inkMassBias: number;
  readonly meanAbsoluteDifference: number;
  readonly maxAbsoluteDifference: number;
  readonly shareOver16: number;
  readonly overPixels: number;
  readonly underPixels: number;
  readonly touchedPixels: number;
  readonly worstX: number;
  readonly worstY: number;
}

export function decodePng(bytes: Uint8Array): DecodedImage {
  const png = PNG.sync.read(Buffer.from(bytes));
  return { width: png.width, height: png.height, data: png.data };
}

export function compareImages(candidate: DecodedImage, reference: DecodedImage): ImageMetrics {
  assertSameDimensions(candidate, reference);
  let candidateInkMass = 0;
  let referenceInkMass = 0;
  let absoluteDifference = 0;
  let maxAbsoluteDifference = 0;
  let over16 = 0;
  let overPixels = 0;
  let underPixels = 0;
  let touchedPixels = 0;
  let worstX = 0;
  let worstY = 0;

  for (let pixel = 0; pixel < candidate.width * candidate.height; pixel += 1) {
    const offset = pixel * 4;
    const candidateLuminance = luminance(candidate.data, offset);
    const referenceLuminance = luminance(reference.data, offset);
    const candidateInk = 255 - candidateLuminance;
    const referenceInk = 255 - referenceLuminance;
    candidateInkMass += candidateInk;
    referenceInkMass += referenceInk;
    if (candidateInk <= 0 && referenceInk <= 0) {
      continue;
    }

    touchedPixels += 1;
    const signedDifference = referenceLuminance - candidateLuminance;
    const difference = Math.abs(signedDifference);
    absoluteDifference += difference;
    if (difference > maxAbsoluteDifference) {
      maxAbsoluteDifference = difference;
      worstX = pixel % candidate.width;
      worstY = Math.floor(pixel / candidate.width);
    }
    if (difference > 16) {
      over16 += 1;
    }
    if (signedDifference > 0) {
      overPixels += 1;
    } else if (signedDifference < 0) {
      underPixels += 1;
    }
  }

  return {
    candidateInkMass,
    referenceInkMass,
    inkMassBias: referenceInkMass === 0 ? 0 : candidateInkMass / referenceInkMass - 1,
    meanAbsoluteDifference: absoluteDifference / Math.max(1, touchedPixels),
    maxAbsoluteDifference,
    shareOver16: over16 / Math.max(1, touchedPixels),
    overPixels,
    underPixels,
    touchedPixels,
    worstX,
    worstY,
  };
}

export function pixelHash(image: DecodedImage): string {
  return createHash("sha256").update(image.data).digest("hex");
}

export function encodePng(image: DecodedImage): Uint8Array {
  const png = new PNG({ width: image.width, height: image.height });
  png.data.set(image.data);
  return PNG.sync.write(png);
}

export function makeDifferenceHeatmap(
  candidate: DecodedImage,
  reference: DecodedImage,
): Uint8Array {
  assertSameDimensions(candidate, reference);
  const png = new PNG({ width: candidate.width, height: candidate.height });
  for (let pixel = 0; pixel < candidate.width * candidate.height; pixel += 1) {
    const offset = pixel * 4;
    const difference = luminance(reference.data, offset) - luminance(candidate.data, offset);
    const intensity = Math.min(255, Math.round(Math.abs(difference) * 4));
    png.data[offset] = difference > 0 ? intensity : 0;
    png.data[offset + 1] = 0;
    png.data[offset + 2] = difference < 0 ? intensity : 0;
    png.data[offset + 3] = 255;
  }
  return PNG.sync.write(png);
}

export function cropImage(
  image: DecodedImage,
  centerX: number,
  centerY: number,
  size = 64,
): Uint8Array {
  const width = Math.min(size, image.width);
  const height = Math.min(size, image.height);
  const startX = Math.max(0, Math.min(image.width - width, centerX - Math.floor(width / 2)));
  const startY = Math.max(0, Math.min(image.height - height, centerY - Math.floor(height / 2)));
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    const sourceOffset = ((startY + y) * image.width + startX) * 4;
    const targetOffset = y * width * 4;
    png.data.set(image.data.subarray(sourceOffset, sourceOffset + width * 4), targetOffset);
  }
  return PNG.sync.write(png);
}

export function rgbaImage(width: number, height: number, data: Uint8Array): DecodedImage {
  if (data.length !== width * height * 4) {
    throw new RangeError("RGBA image byte length does not match its dimensions");
  }
  return { width, height, data };
}

export function boxDownsample(image: DecodedImage, scale: number): DecodedImage {
  if (!Number.isSafeInteger(scale) || scale <= 0) {
    throw new RangeError("Downsample scale must be a positive integer");
  }
  if (image.width % scale !== 0 || image.height % scale !== 0) {
    throw new RangeError("Source dimensions must be divisible by the downsample scale");
  }
  const width = image.width / scale;
  const height = image.height / scale;
  const output = new Uint8Array(width * height * 4);
  const samples = scale * scale;
  for (let targetY = 0; targetY < height; targetY += 1) {
    for (let targetX = 0; targetX < width; targetX += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      for (let sourceY = 0; sourceY < scale; sourceY += 1) {
        let offset = ((targetY * scale + sourceY) * image.width + targetX * scale) * 4;
        const end = offset + scale * 4;
        for (; offset < end; offset += 4) {
          red += image.data[offset]!;
          green += image.data[offset + 1]!;
          blue += image.data[offset + 2]!;
          alpha += image.data[offset + 3]!;
        }
      }
      const target = (targetY * width + targetX) * 4;
      output[target] = Math.round(red / samples);
      output[target + 1] = Math.round(green / samples);
      output[target + 2] = Math.round(blue / samples);
      output[target + 3] = Math.round(alpha / samples);
    }
  }
  return { width, height, data: output };
}

function luminance(data: Uint8Array, offset: number): number {
  const alpha = data[offset + 3]! / 255;
  const red = data[offset]! * alpha + 255 * (1 - alpha);
  const green = data[offset + 1]! * alpha + 255 * (1 - alpha);
  const blue = data[offset + 2]! * alpha + 255 * (1 - alpha);
  return (red + green + blue) / 3;
}

function assertSameDimensions(first: DecodedImage, second: DecodedImage): void {
  if (first.width !== second.width || first.height !== second.height) {
    throw new RangeError("Images must have matching dimensions");
  }
}
