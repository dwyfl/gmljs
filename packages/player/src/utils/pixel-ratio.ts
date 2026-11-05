/** Device pixels per CSS pixel; 1 outside the browser. */
export function getPixelRatio(): number {
  return typeof window !== "undefined" && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
}

/** Converts a CSS length to whole device pixels (at least 1). */
export function toDevicePixels(cssPixels: number, ratio = getPixelRatio()): number {
  return Math.max(1, Math.round(cssPixels * ratio));
}
