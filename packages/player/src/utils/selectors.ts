import type { PlayerState } from "../player-controller.ts";

/** Shared usePlayerState selectors, so components re-render on the same field identity. */

export const selectReady = (state: PlayerState) => state.ready;
export const selectIsPlaying = (state: PlayerState) => state.isPlaying;
export const selectIsLooping = (state: PlayerState) => state.isLooping;
export const selectPosition = (state: PlayerState) => state.position;
export const selectFramePosition = (state: PlayerState) => state.framePosition;
// Whole seconds, so time-based UI re-renders once per second rather than every frame.
export const selectCurrentSeconds = (state: PlayerState) => Math.floor(state.currentTime);
export const selectTotalSeconds = (state: PlayerState) => Math.floor(state.totalTime);
