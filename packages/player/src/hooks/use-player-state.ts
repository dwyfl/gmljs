import { useCallback, useSyncExternalStore } from "react";
import { usePlayerController } from "../context.ts";
import type { PlayerState } from "../player-controller.ts";

/**
 * Subscribes to the player state. With a selector, the component only re-renders when the
 * selected value changes, e.g. not on every frame for `(state) => state.isPlaying`.
 */
export function usePlayerState(): PlayerState;
export function usePlayerState<T>(selector: (state: PlayerState) => T): T;
export function usePlayerState<T>(selector?: (state: PlayerState) => T): T | PlayerState {
  const controller = usePlayerController();
  const getSnapshot = useCallback(() => {
    const state = controller.getSnapshot();
    return selector ? selector(state) : state;
  }, [controller, selector]);
  return useSyncExternalStore(controller.subscribe, getSnapshot, getSnapshot);
}
