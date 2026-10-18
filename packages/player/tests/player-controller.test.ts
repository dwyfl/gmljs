import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { PlayerController } from "../src/player-controller.ts";
import { fakeViewFactory, type FakeView } from "./helpers/fake-view.ts";

function setup(options: ConstructorParameters<typeof PlayerController>[0] = {}) {
  const { views, createView } = fakeViewFactory();
  const controller = new PlayerController({ ...options, createView });
  const canvas = document.createElement("canvas");
  controller.attach(canvas, "<gml/>", 640, 480);
  const view = views[0] as FakeView;
  const listener = vi.fn();
  controller.subscribe(listener);
  return { controller, view, views, createView, canvas, listener };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("attach / detach", () => {
  test("creates a view for the canvas with the settings", () => {
    const { createView, canvas, view, controller } = setup({
      loop: false,
      speed: 2,
      renderOptions: { color: "red" },
    });
    expect(createView).toHaveBeenCalledWith("<gml/>", {
      type: "html-canvas",
      canvas,
      width: 640,
      height: 480,
      color: "red",
    });
    expect(view.setLoop).toHaveBeenCalledWith(false);
    expect(view.setSpeed).toHaveBeenCalledWith(2);
    expect(view.draw).toHaveBeenCalled();
    expect(controller.getSnapshot()).toMatchObject({
      ready: true,
      isPlaying: false,
      isLooping: false,
      totalTime: 10,
    });
  });

  test("detach unloads the view and stops listening", () => {
    const { controller, view, listener } = setup();
    controller.detach();
    expect(view.unload).toHaveBeenCalled();
    expect(controller.view).toBeNull();
    expect(controller.getSnapshot().ready).toBe(false);
    listener.mockClear();
    view.dispatchEvent(new CustomEvent("start"));
    expect(listener).not.toHaveBeenCalled();
  });

  test("attaching again replaces the view", () => {
    const { controller, view, views, canvas } = setup();
    controller.attach(canvas, "<gml/>", 10, 10);
    expect(view.unload).toHaveBeenCalled();
    expect(views).toHaveLength(2);
    expect(controller.view).toBe(views[1]);
  });
});

describe("snapshot", () => {
  test("stays the same object when nothing changed", () => {
    const { controller, listener } = setup();
    const before = controller.getSnapshot();
    controller.setLoop(true);
    controller.setSpeed(1);
    expect(controller.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  test("follows the view while playing", () => {
    const { controller, view } = setup();
    controller.play();
    expect(controller.getSnapshot()).toMatchObject({ isPlaying: true, hasStarted: true });

    view.time = 5;
    vi.advanceTimersToNextFrame();
    expect(controller.getSnapshot()).toMatchObject({ currentTime: 5, position: 0.5 });
    expect(controller.getSnapshot().framePosition).toBeCloseTo(0.5);

    controller.pause();
    view.time = 7;
    vi.advanceTimersToNextFrame();
    expect(controller.getSnapshot()).toMatchObject({ isPlaying: false, currentTime: 5 });
  });

  test("notices when the view stops by itself", () => {
    const { controller, view } = setup();
    controller.play();
    view.isPlaying = false;
    view.time = 10;
    vi.advanceTimersToNextFrame();
    expect(controller.getSnapshot()).toMatchObject({ isPlaying: false, position: 1 });
  });
});

describe("playback", () => {
  test("togglePlay starts and stops", () => {
    const { controller, view } = setup();
    controller.togglePlay();
    expect(view.start).toHaveBeenCalledTimes(1);
    controller.togglePlay();
    expect(view.stop).toHaveBeenCalledTimes(1);
  });

  test("toggleLoop updates the view and the state", () => {
    const { controller, view } = setup();
    controller.toggleLoop();
    expect(view.setLoop).toHaveBeenLastCalledWith(false);
    expect(controller.getSnapshot().isLooping).toBe(false);
  });

  test("seekTo moves, draws and marks the player as started", () => {
    const { controller, view } = setup();
    view.draw.mockClear();
    controller.seekTo(0.25);
    expect(view.setPosition).toHaveBeenCalledWith(0.25);
    expect(view.draw).toHaveBeenCalled();
    expect(controller.getSnapshot()).toMatchObject({
      position: 0.25,
      currentTime: 2.5,
      hasStarted: true,
    });
  });

  test("seekBy clamps to the document and is ignored while playing", () => {
    const { controller, view } = setup();
    controller.seekBy(-1);
    expect(view.setPosition).not.toHaveBeenCalled();
    controller.seekBy(100);
    expect(view.setPosition).toHaveBeenLastCalledWith(1);

    view.setPosition.mockClear();
    controller.play();
    controller.seekBy(-1);
    expect(view.setPosition).not.toHaveBeenCalled();
  });

  test("scrubbing pauses and resumes playback", () => {
    const { controller, view } = setup();
    controller.play();
    controller.beginScrub();
    expect(view.isPlaying).toBe(false);
    expect(controller.getSnapshot().isScrubbing).toBe(true);
    controller.scrubTo(0.6);
    expect(view.setPosition).toHaveBeenLastCalledWith(0.6);
    controller.endScrub();
    expect(view.isPlaying).toBe(true);
    expect(controller.getSnapshot().isScrubbing).toBe(false);
  });

  test("scrubbing while paused stays paused", () => {
    const { controller, view } = setup();
    controller.beginScrub();
    controller.endScrub();
    expect(view.start).not.toHaveBeenCalled();
  });
});

describe("settings", () => {
  test("setGml replaces the document once", () => {
    const { controller, view, listener } = setup();
    controller.setGml("<gml/>");
    expect(view.setGml).not.toHaveBeenCalled();
    controller.setGml("<gml><tag/></gml>");
    expect(view.setGml).toHaveBeenCalledWith("<gml><tag/></gml>");
    expect(listener).toHaveBeenCalled();
  });

  test("resize sets the size and redraws, ignoring empty sizes", () => {
    const { controller, view } = setup();
    controller.resize(0, 100);
    expect(view.setSize).not.toHaveBeenCalled();
    view.draw.mockClear();
    controller.resize(320, 240);
    expect(view.setSize).toHaveBeenCalledWith(320, 240);
    expect(view.draw).toHaveBeenCalled();
  });

  test("setRenderOptions applies and remembers the options", () => {
    const { controller, view } = setup();
    controller.setRenderOptions({ background: "black" });
    expect(view.setRenderOptions).toHaveBeenCalledWith({ background: "black" });
    expect(controller.renderOptions).toEqual({ background: "black" });
  });
});
