import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createGMLView } from "@gmljs/render/browser";
import { GMLPlayer } from "../src/index.ts";
import type { FakeView } from "./helpers/fake-view.ts";

vi.mock("@gmljs/render/browser", async () => {
  const { FakeView } = await import("./helpers/fake-view.ts");
  return { createGMLView: vi.fn((gml: unknown) => new FakeView(gml)) };
});

const GML = "<gml/>";

/** The view created for the player (the first one; previews create more). */
function playerView(): FakeView {
  return vi.mocked(createGMLView).mock.results[0]?.value as FakeView;
}

beforeEach(() => {
  vi.mocked(createGMLView).mockClear();
});

afterEach(() => {
  cleanup();
});

describe("GMLPlayer", () => {
  test("renders a canvas, the play overlay and the controls", () => {
    const { container } = render(<GMLPlayer gml={GML} />);
    expect(container.querySelector("canvas.gmlp-canvas")).not.toBeNull();
    expect(container.querySelector(".gmlp-overlay")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Seek" })).toBeTruthy();
    expect(screen.getByText("0:00 | 0:10")).toBeTruthy();
    expect(createGMLView).toHaveBeenCalledWith(
      GML,
      expect.objectContaining({ type: "html-canvas" }),
    );
  });

  test("the play button toggles playback and hides the overlay", () => {
    const { container } = render(<GMLPlayer gml={GML} />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(playerView().start).toHaveBeenCalled();
    expect(container.querySelector(".gmlp-overlay")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(playerView().stop).toHaveBeenCalled();
  });

  test("clicking the canvas toggles playback", () => {
    const { container } = render(<GMLPlayer gml={GML} />);
    fireEvent.click(container.querySelector(".gmlp-stage")!);
    expect(playerView().start).toHaveBeenCalled();
  });

  test("the loop button toggles looping", () => {
    render(<GMLPlayer gml={GML} />);
    fireEvent.click(screen.getByRole("button", { name: "Disable loop" }));
    expect(playerView().setLoop).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("button", { name: "Enable loop" })).toBeTruthy();
  });

  test("autoPlay starts playback on mount", () => {
    render(<GMLPlayer gml={GML} autoPlay />);
    expect(playerView().start).toHaveBeenCalled();
  });

  test("controls={false} hides the control bar", () => {
    const { container } = render(<GMLPlayer gml={GML} controls={false} />);
    expect(container.querySelector(".gmlp-controls")).toBeNull();
  });

  test("a new gml prop replaces the document", () => {
    const { rerender } = render(<GMLPlayer gml={GML} />);
    rerender(<GMLPlayer gml="<gml><tag/></gml>" />);
    expect(playerView().setGml).toHaveBeenCalledWith("<gml><tag/></gml>");
    expect(createGMLView).toHaveBeenCalledTimes(1);
  });

  test("unmounting unloads the view", () => {
    const { unmount } = render(<GMLPlayer gml={GML} />);
    unmount();
    expect(playerView().unload).toHaveBeenCalled();
  });
});

describe("keyboard", () => {
  test("in focus mode, shortcuts apply to the focused player only", () => {
    render(<GMLPlayer gml={GML} />);
    fireEvent.keyDown(window, { key: " " });
    expect(playerView().start).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("region"), { key: " " });
    expect(playerView().start).toHaveBeenCalled();
  });

  test("in global mode, shortcuts apply anywhere", () => {
    render(<GMLPlayer gml={GML} keyboard="global" />);
    fireEvent.keyDown(document.body, { key: "r" });
    expect(playerView().setLoop).toHaveBeenLastCalledWith(false);
  });

  test("shortcuts are ignored in text inputs", () => {
    render(
      <>
        <input aria-label="text" />
        <GMLPlayer gml={GML} keyboard="global" />
      </>,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: " " });
    expect(playerView().start).not.toHaveBeenCalled();
  });

  test("arrow keys seek while paused", () => {
    render(<GMLPlayer gml={GML} />);
    const region = screen.getByRole("region");
    fireEvent.keyDown(region, { key: "ArrowRight", shiftKey: true });
    expect(playerView().setPosition).toHaveBeenLastCalledWith(0.1);
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(playerView().setPosition.mock.lastCall?.[0]).toBeCloseTo(0.09);
  });

  test("Escape calls onEscape", () => {
    const onEscape = vi.fn();
    render(<GMLPlayer gml={GML} onEscape={onEscape} />);
    fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  test("keyboard={false} disables shortcuts", () => {
    render(<GMLPlayer gml={GML} keyboard={false} />);
    fireEvent.keyDown(screen.getByRole("region"), { key: " " });
    expect(playerView().start).not.toHaveBeenCalled();
  });
});

describe("seekbar", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 4 }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("dragging scrubs and resumes playback", () => {
    render(<GMLPlayer gml={GML} preview={false} />);
    const view = playerView();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    const slider = screen.getByRole("slider");
    fireEvent.pointerDown(slider, { pointerId: 1, button: 0, clientX: 50 });
    expect(view.stop).toHaveBeenCalled();
    expect(view.setPosition).toHaveBeenLastCalledWith(0.25);

    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 150 });
    expect(view.setPosition).toHaveBeenLastCalledWith(0.75);
    expect(slider.getAttribute("aria-valuenow")).toBe("75");

    fireEvent.pointerUp(slider, { pointerId: 1 });
    expect(view.start).toHaveBeenCalledTimes(2);
  });

  test("hovering with a mouse shows the preview with its own view", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    try {
      const { container } = render(<GMLPlayer gml={GML} />);
      fireEvent.pointerMove(screen.getByRole("slider"), {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 100,
      });
      expect(container.querySelector(".gmlp-preview")).not.toBeNull();
      expect(createGMLView).toHaveBeenCalledTimes(2);
      const preview = vi.mocked(createGMLView).mock.results[1]?.value as FakeView;
      act(() => {
        vi.advanceTimersToNextFrame();
      });
      expect(preview.setPosition).toHaveBeenLastCalledWith(0.5);
      expect(preview.draw).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
