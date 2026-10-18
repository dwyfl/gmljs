import { useEffect, useRef, type RefObject } from "react";
import type { PlayerController } from "../player-controller.ts";

/** "focus": while the player has focus. "global": anywhere on the page. false: disabled. */
export type KeyboardMode = "focus" | "global" | false;

export interface KeyboardShortcutsOptions {
  mode: KeyboardMode;
  /** Called on Escape, unless it exits fullscreen. */
  onEscape?: () => void;
}

/** Seconds per arrow key press; Shift and Alt each multiply it by 10. */
const SEEK_STEP = 0.1;

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/**
 * Space: play/pause. Left/Right: seek (paused only). R: toggle loop. Escape: exit fullscreen,
 * else `onEscape`.
 */
export function useKeyboardShortcuts(
  ref: RefObject<HTMLElement | null>,
  controller: PlayerController,
  { mode, onEscape }: KeyboardShortcutsOptions,
): void {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    const element = ref.current;
    const target = mode === "global" ? window : element;
    if (!mode || !target) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || isEditable(event.target)) {
        return;
      }
      switch (event.key) {
        case " ":
          // Let a focused button handle Space itself.
          if (event.target instanceof HTMLButtonElement) {
            return;
          }
          controller.togglePlay();
          break;
        case "ArrowLeft":
        case "ArrowRight": {
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const multiplier = (event.shiftKey ? 10 : 1) * (event.altKey ? 10 : 1);
          controller.seekBy(direction * SEEK_STEP * multiplier);
          break;
        }
        case "r":
        case "R":
          controller.toggleLoop();
          break;
        case "Escape":
          if (element && document.fullscreenElement === element) {
            // The browser exits fullscreen itself.
            return;
          }
          if (!onEscapeRef.current) {
            return;
          }
          onEscapeRef.current();
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    target.addEventListener("keydown", onKeyDown as EventListener);
    return () => target.removeEventListener("keydown", onKeyDown as EventListener);
  }, [ref, controller, mode]);
}
