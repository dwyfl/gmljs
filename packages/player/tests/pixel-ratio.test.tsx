import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createGMLView } from "@gmljs/render/browser";
import { GMLPlayer } from "../src/index.ts";
import { toDevicePixels } from "../src/utils/pixel-ratio.ts";

vi.mock("@gmljs/render/browser", async () => {
  const { FakeView } = await import("./helpers/fake-view.ts");
  return { createGMLView: vi.fn((gml: unknown) => new FakeView(gml)) };
});

beforeEach(() => {
  vi.mocked(createGMLView).mockClear();
  vi.stubGlobal("devicePixelRatio", 2);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("toDevicePixels rounds to whole pixels, at least 1", () => {
  expect(toDevicePixels(100, 1.5)).toBe(150);
  expect(toDevicePixels(10.3, 1)).toBe(10);
  expect(toDevicePixels(0, 2)).toBe(1);
  expect(toDevicePixels(100)).toBe(200);
});

test("the player canvas is sized in device pixels", () => {
  render(<GMLPlayer gml="<gml/>" />);
  // jsdom has no layout, so the canvas falls back to 640 × 480 CSS pixels.
  expect(createGMLView).toHaveBeenCalledWith(
    "<gml/>",
    expect.objectContaining({ width: 1280, height: 960 }),
  );
});

test("the seekbar preview is sized in device pixels", () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
    DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 4 }),
  );
  const { container } = render(<GMLPlayer gml="<gml/>" />);
  fireEvent.pointerMove(screen.getByRole("slider"), {
    pointerId: 1,
    pointerType: "mouse",
    clientX: 100,
  });
  // 160 CSS pixels wide, 120 high (the fake view's 4:3 aspect ratio).
  expect(createGMLView).toHaveBeenLastCalledWith(
    "<gml/>",
    expect.objectContaining({ width: 320, height: 240 }),
  );
  const canvas = container.querySelector<HTMLCanvasElement>(".gmlp-preview-canvas");
  expect(canvas?.style.width).toBe("160px");
  expect(canvas?.style.height).toBe("120px");
});
