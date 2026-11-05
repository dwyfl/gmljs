import { expect, test } from "vite-plus/test";
import * as root from "../src/index.ts";

test("exports the runtime API", () => {
  expect(Object.keys(root).sort()).toEqual([
    "GMLPlayer",
    "PlayOverlay",
    "PlayerButton",
    "PlayerCanvas",
    "PlayerContext",
    "PlayerController",
    "PlayerControls",
    "Seekbar",
    "SeekbarPreview",
    "TimeDisplay",
    "formatTime",
    "useGMLPlayer",
    "useKeyboardShortcuts",
    "usePlayerController",
    "usePlayerState",
  ]);
});
