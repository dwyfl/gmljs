import type { GML, GMLView, RenderOptions } from "@gmljs/render";
import { createGMLView, type RenderContextHtmlCanvasOptions } from "@gmljs/render/browser";

export interface PlayerState {
  /** A view is attached to a canvas. */
  ready: boolean;
  isPlaying: boolean;
  isLooping: boolean;
  /** Playback was started or the position changed at least once. */
  hasStarted: boolean;
  isScrubbing: boolean;
  speed: number;
  /** Seconds. */
  currentTime: number;
  /** Seconds. */
  totalTime: number;
  /** currentTime / totalTime, 0..1. */
  position: number;
  /** frameIndex / (totalFrames - 1), 0..1. */
  framePosition: number;
}

export type CreateViewFn = (
  gml: string | GML,
  options: RenderContextHtmlCanvasOptions & Partial<RenderOptions>,
) => GMLView;

export interface PlayerControllerOptions {
  loop?: boolean;
  speed?: number;
  renderOptions?: Partial<RenderOptions>;
  /** Creates the view for a canvas. Defaults to createGMLView from @gmljs/render/browser. */
  createView?: CreateViewFn;
}

type Listener = () => void;

const VIEW_EVENTS = ["start", "stop", "restart"] as const;

/**
 * Framework-agnostic playback controller for one GMLView. It owns the playback settings and
 * exposes the UI state as an immutable snapshot (for useSyncExternalStore), synced from the
 * view once per frame while playing.
 */
export class PlayerController {
  private _view: GMLView | null = null;
  private _gml: string | GML | null = null;
  private _renderOptions: Partial<RenderOptions>;
  /** Creates views for this player's documents; also used by SeekbarPreview. */
  readonly createView: CreateViewFn;
  private readonly _listeners = new Set<Listener>();
  private _syncRequest: number | null = null;
  private _resumeAfterScrub = false;
  private _state: PlayerState;

  constructor({
    loop = true,
    speed = 1,
    renderOptions = {},
    createView = createGMLView,
  }: PlayerControllerOptions = {}) {
    this._renderOptions = renderOptions;
    this.createView = createView;
    this._state = {
      ready: false,
      isPlaying: false,
      isLooping: loop,
      hasStarted: false,
      isScrubbing: false,
      speed,
      currentTime: 0,
      totalTime: 0,
      position: 0,
      framePosition: 0,
    };
  }

  /** The view, while attached. */
  get view(): GMLView | null {
    return this._view;
  }

  /** The parsed document of the attached view, or the document to attach. */
  get gml(): string | GML | null {
    return this._view?.gml ?? this._gml;
  }

  get renderOptions(): Partial<RenderOptions> {
    return this._renderOptions;
  }

  subscribe = (listener: Listener): (() => void) => {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  };

  getSnapshot = (): PlayerState => this._state;

  /**
   * Creates a view drawing into the canvas, sized in canvas (device) pixels. A previously
   * attached view is unloaded.
   */
  attach(canvas: HTMLCanvasElement, gml: string | GML, width: number, height: number): void {
    this.detach();
    this._gml = gml;
    const view = this.createView(gml, {
      type: "html-canvas",
      canvas,
      width,
      height,
      ...this._renderOptions,
    });
    for (const type of VIEW_EVENTS) {
      view.addEventListener(type, this._handleViewEvent);
    }
    view.setLoop(this._state.isLooping);
    view.setSpeed(this._state.speed);
    view.draw();
    this._view = view;
    this._update({ ready: true, isPlaying: view.isPlaying, ...this._readTime(view) });
  }

  detach(): void {
    const view = this._view;
    if (!view) {
      return;
    }
    this._cancelSync();
    for (const type of VIEW_EVENTS) {
      view.removeEventListener(type, this._handleViewEvent);
    }
    view.unload();
    this._view = null;
    this._resumeAfterScrub = false;
    this._update({ ready: false, isPlaying: false, isScrubbing: false });
  }

  setGml(gml: string | GML): void {
    if (gml === this._gml) {
      return;
    }
    this._gml = gml;
    const view = this._view;
    if (!view) {
      return;
    }
    view.setGml(gml);
    view.draw();
    this._update({ hasStarted: view.isPlaying, ...this._readTime(view) });
    // Subscribers reading `gml` (e.g. SeekbarPreview) need to know even if no state changed.
    this._emit();
  }

  setRenderOptions(renderOptions: Partial<RenderOptions>): void {
    this._renderOptions = renderOptions;
    this._view?.setRenderOptions(renderOptions);
    this._view?.draw();
  }

  /** Sets the canvas size in canvas (device) pixels. */
  resize(width: number, height: number): void {
    const view = this._view;
    if (!view || width <= 0 || height <= 0) {
      return;
    }
    view.setSize(width, height);
    // Resizing clears the canvas: redraw before the browser paints.
    view.draw();
  }

  play(): void {
    this._update({ hasStarted: true });
    this._view?.start();
  }

  pause(): void {
    this._view?.stop();
  }

  togglePlay(): void {
    if (this._view?.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setLoop(loop: boolean): void {
    this._view?.setLoop(loop);
    this._update({ isLooping: loop });
  }

  toggleLoop(): void {
    this.setLoop(!this._state.isLooping);
  }

  setSpeed(speed: number): void {
    this._view?.setSpeed(speed);
    this._update({ speed });
  }

  /** Moves to a position (0..1) and draws it. */
  seekTo(position: number): void {
    const view = this._view;
    if (!view) {
      return;
    }
    view.setPosition(position);
    view.draw();
    this._update({ hasStarted: true, ...this._readTime(view) });
  }

  /** Moves by a number of seconds. Ignored while playing. */
  seekBy(seconds: number): void {
    const view = this._view;
    if (!view || view.isPlaying) {
      return;
    }
    const { time, totalTime } = view.state;
    const target = Math.max(0, Math.min(totalTime, time + seconds));
    if (target !== time && totalTime > 0) {
      this.seekTo(target / totalTime);
    }
  }

  /** Pauses playback while the user drags the seekbar. */
  beginScrub(): void {
    if (this._state.isScrubbing) {
      return;
    }
    this._resumeAfterScrub = this._view?.isPlaying ?? false;
    this.pause();
    this._update({ isScrubbing: true });
  }

  scrubTo(position: number): void {
    this.seekTo(position);
  }

  /** Resumes playback if it was playing when the drag began. */
  endScrub(): void {
    if (!this._state.isScrubbing) {
      return;
    }
    this._update({ isScrubbing: false });
    if (this._resumeAfterScrub) {
      this._resumeAfterScrub = false;
      this.play();
    }
  }

  private _handleViewEvent = (event: Event): void => {
    const view = this._view;
    if (!view) {
      return;
    }
    if (event.type === "stop") {
      this._cancelSync();
    } else {
      this._requestSync();
    }
    this._update({ isPlaying: view.isPlaying, ...this._readTime(view) });
  };

  /** The view runs its own frame loop but has no per-frame event, so poll its state. */
  private _requestSync(): void {
    if (this._syncRequest !== null) {
      return;
    }
    this._syncRequest = requestAnimationFrame(() => {
      this._syncRequest = null;
      const view = this._view;
      if (!view) {
        return;
      }
      this._update({ isPlaying: view.isPlaying, ...this._readTime(view) });
      if (view.isPlaying) {
        this._requestSync();
      }
    });
  }

  private _cancelSync(): void {
    if (this._syncRequest !== null) {
      cancelAnimationFrame(this._syncRequest);
      this._syncRequest = null;
    }
  }

  private _readTime(view: GMLView) {
    const { time, totalTime, frameIndex, totalFrames } = view.state;
    return {
      currentTime: time,
      totalTime,
      position: totalTime > 0 ? time / totalTime : 0,
      framePosition: totalFrames > 1 ? frameIndex / (totalFrames - 1) : 0,
    };
  }

  private _update(changes: Partial<PlayerState>): void {
    const current = this._state;
    const changed = (Object.keys(changes) as (keyof PlayerState)[]).some(
      (key) => changes[key] !== current[key],
    );
    if (!changed) {
      return;
    }
    this._state = { ...current, ...changes };
    this._emit();
  }

  private _emit(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }
}
