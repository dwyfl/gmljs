import type { GMLView } from "@gmljs/render";
import { vi, type Mock } from "vite-plus/test";
import type { CreateViewFn } from "../../src/player-controller.ts";

/**
 * A stand-in for GMLView: an EventTarget with the playback state and methods the player uses.
 * jsdom has no canvas 2D context, so the real view can't run in tests.
 */
export class FakeView extends EventTarget {
  isPlaying = false;
  isLooping = true;
  time = 0;
  totalTime = 10;
  totalFrames = 11;
  gml: unknown;
  renderContext = { width: 640, height: 480 };

  constructor(gml: unknown) {
    super();
    this.gml = gml;
  }

  get state() {
    const frameIndex = Math.round((this.time / this.totalTime) * (this.totalFrames - 1));
    return {
      time: this.time,
      totalTime: this.totalTime,
      frameIndex,
      totalFrames: this.totalFrames,
    };
  }

  start = vi.fn(() => {
    this.isPlaying = true;
    this.dispatchEvent(new CustomEvent("start"));
  });
  stop = vi.fn(() => {
    this.isPlaying = false;
    this.dispatchEvent(new CustomEvent("stop"));
  });
  setLoop = vi.fn((value: boolean) => {
    this.isLooping = value;
  });
  setSpeed: Mock<(speed: number) => void> = vi.fn();
  setPosition = vi.fn((position: number) => {
    this.time = position * this.totalTime;
  });
  setSize = vi.fn((width: number, height: number) => {
    this.renderContext = { width, height };
  });
  setGml = vi.fn((gml: unknown) => {
    this.gml = gml;
  });
  setRenderOptions: Mock<(options: object) => void> = vi.fn();
  draw: Mock<() => void> = vi.fn();
  unload: Mock<() => void> = vi.fn();
}

/** A createView function recording every view it creates. */
export function fakeViewFactory() {
  const views: FakeView[] = [];
  const createView = vi.fn((gml: unknown) => {
    const view = new FakeView(gml);
    views.push(view);
    return view;
  });
  return { views, createView: createView as unknown as CreateViewFn & typeof createView };
}

export type { GMLView };
