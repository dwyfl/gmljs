import { useEffect, useRef } from "react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { PlayerContext } from "../src/context.ts";
import { PlayerController } from "../src/player-controller.ts";
import { PlayerCanvas } from "../src/components/player-canvas.tsx";
import { fakeViewFactory, type FakeView } from "./helpers/fake-view.ts";

afterEach(() => {
  cleanup();
});

function Harness({
  controller,
  clickToPlay,
}: {
  controller: PlayerController;
  clickToPlay?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    controller.attach(canvasRef.current!, "<gml/>", 640, 480);
    return () => controller.detach();
  }, [controller]);
  return (
    <PlayerContext.Provider value={controller}>
      <PlayerCanvas canvasRef={canvasRef} clickToPlay={clickToPlay} />
    </PlayerContext.Provider>
  );
}

describe("PlayerCanvas", () => {
  test("a click toggles playback by default", () => {
    const { createView, views } = fakeViewFactory();
    const controller = new PlayerController({ createView });
    const { container } = render(<Harness controller={controller} />);
    fireEvent.click(container.querySelector(".gmlp-stage")!);
    expect((views[0] as FakeView).start).toHaveBeenCalled();
  });

  test("clickToPlay={false} disables the click handler", () => {
    const { createView, views } = fakeViewFactory();
    const controller = new PlayerController({ createView });
    const { container } = render(<Harness controller={controller} clickToPlay={false} />);
    fireEvent.click(container.querySelector(".gmlp-stage")!);
    expect((views[0] as FakeView).start).not.toHaveBeenCalled();
  });
});
