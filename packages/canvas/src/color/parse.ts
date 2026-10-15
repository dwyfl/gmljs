import { NAMED_COLORS } from "./named-colors.ts";

export interface RgbaColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
const HUE = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(deg|grad|rad|turn)?$/i;

export function parseCssColor(input: string): RgbaColor | undefined {
  const value = input.trim().toLowerCase();
  if (value === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  if (Object.hasOwn(NAMED_COLORS, value)) {
    return unpack(NAMED_COLORS[value]!, 255);
  }

  if (value.startsWith("#")) {
    return parseHex(value);
  }

  const call = /^(rgb|rgba|hsl|hsla)\((.*)\)$/.exec(value);
  if (!call) {
    return undefined;
  }
  const name = call[1]!;
  const body = call[2]!.trim();
  return name.startsWith("rgb") ? parseRgb(body) : parseHsl(body);
}

function parseHex(value: string): RgbaColor | undefined {
  const hex = value.slice(1);
  if (!/^(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/.test(hex)) {
    return undefined;
  }
  if (hex.length <= 4) {
    const r = Number.parseInt(hex[0]! + hex[0]!, 16);
    const g = Number.parseInt(hex[1]! + hex[1]!, 16);
    const b = Number.parseInt(hex[2]! + hex[2]!, 16);
    const a = hex.length === 4 ? Number.parseInt(hex[3]! + hex[3]!, 16) : 255;
    return { r, g, b, a };
  }
  return unpack(
    Number.parseInt(hex.slice(0, 6), 16),
    hex.length === 8 ? Number.parseInt(hex.slice(6), 16) : 255,
  );
}

function parseRgb(body: string): RgbaColor | undefined {
  const tokens = splitFunction(body);
  if (!tokens || tokens.channels.length !== 3) {
    return undefined;
  }

  if (tokens.legacy) {
    const percentages = tokens.channels.map((token) => token.endsWith("%"));
    if (!percentages.every((isPercent) => isPercent === percentages[0])) {
      return undefined;
    }
  }

  const channels = tokens.channels.map(parseRgbChannel);
  const alpha = tokens.alpha === undefined ? 255 : parseAlpha(tokens.alpha);
  if (channels.some((channel) => channel === undefined) || alpha === undefined) {
    return undefined;
  }
  return {
    r: channels[0]!,
    g: channels[1]!,
    b: channels[2]!,
    a: alpha,
  };
}

function parseHsl(body: string): RgbaColor | undefined {
  const tokens = splitFunction(body);
  if (!tokens || tokens.channels.length !== 3) {
    return undefined;
  }
  const hue = parseHue(tokens.channels[0]!);
  const saturation = parsePercentage(tokens.channels[1]!);
  const lightness = parsePercentage(tokens.channels[2]!);
  const alpha = tokens.alpha === undefined ? 255 : parseAlpha(tokens.alpha);
  if (
    hue === undefined ||
    saturation === undefined ||
    lightness === undefined ||
    alpha === undefined
  ) {
    return undefined;
  }

  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const section = hue / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (section < 1) {
    r = chroma;
    g = x;
  } else if (section < 2) {
    r = x;
    g = chroma;
  } else if (section < 3) {
    g = chroma;
    b = x;
  } else if (section < 4) {
    g = x;
    b = chroma;
  } else if (section < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }
  const match = l - chroma / 2;
  return {
    r: Math.round((r + match) * 255),
    g: Math.round((g + match) * 255),
    b: Math.round((b + match) * 255),
    a: alpha,
  };
}

interface FunctionTokens {
  channels: string[];
  alpha?: string;
  legacy: boolean;
}

function splitFunction(body: string): FunctionTokens | undefined {
  if (body.includes(",")) {
    if (body.includes("/")) {
      return undefined;
    }
    const parts = body.split(",").map((part) => part.trim());
    if ((parts.length !== 3 && parts.length !== 4) || parts.some((part) => !part)) {
      return undefined;
    }
    return {
      channels: parts.slice(0, 3),
      alpha: parts[3],
      legacy: true,
    };
  }

  const slashParts = body.split("/");
  if (slashParts.length > 2) {
    return undefined;
  }
  const channels = slashParts[0]!.trim().split(/\s+/).filter(Boolean);
  const alpha = slashParts[1]?.trim();
  if (alpha === "" || (alpha !== undefined && /\s/.test(alpha))) {
    return undefined;
  }
  return { channels, alpha, legacy: false };
}

function parseRgbChannel(token: string): number | undefined {
  if (token.endsWith("%")) {
    const value = parseNumber(token.slice(0, -1));
    return value === undefined ? undefined : Math.round((clamp(value, 0, 100) * 255) / 100);
  }
  const value = parseNumber(token);
  return value === undefined ? undefined : Math.round(clamp(value, 0, 255));
}

function parseAlpha(token: string): number | undefined {
  if (token.endsWith("%")) {
    const value = parseNumber(token.slice(0, -1));
    return value === undefined ? undefined : Math.round((clamp(value, 0, 100) * 255) / 100);
  }
  const value = parseNumber(token);
  return value === undefined ? undefined : Math.round(clamp(value, 0, 1) * 255);
}

function parsePercentage(token: string): number | undefined {
  return token.endsWith("%") ? parseNumber(token.slice(0, -1)) : undefined;
}

function parseHue(token: string): number | undefined {
  const match = HUE.exec(token);
  if (!match) {
    return undefined;
  }
  let value = Number(match[1]);
  if (!Number.isFinite(value)) {
    return undefined;
  }
  switch (match[2]) {
    case "grad":
      value *= 0.9;
      break;
    case "rad":
      value *= 180 / Math.PI;
      break;
    case "turn":
      value *= 360;
      break;
  }
  return ((value % 360) + 360) % 360;
}

function parseNumber(token: string): number | undefined {
  if (!NUMBER.test(token)) {
    return undefined;
  }
  const value = Number(token);
  return Number.isFinite(value) ? value : undefined;
}

function unpack(rgb: number, a: number): RgbaColor {
  return {
    r: (rgb >>> 16) & 0xff,
    g: (rgb >>> 8) & 0xff,
    b: rgb & 0xff,
    a,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
