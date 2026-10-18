import { createContext, useContext } from "react";
import type { PlayerController } from "./player-controller.ts";

export const PlayerContext = createContext<PlayerController | null>(null);

/** The controller of the enclosing player (GMLPlayer or a PlayerContext provider). */
export function usePlayerController(): PlayerController {
  const controller = useContext(PlayerContext);
  if (!controller) {
    throw new Error("usePlayerController must be used inside a GMLPlayer or PlayerContext");
  }
  return controller;
}
