export {};

declare global {
  interface Window {
    YT?: typeof YT;

    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    class Player {
      constructor(element: string | HTMLElement, options: PlayerOptions);

      getCurrentTime(): number;

      getDuration(): number;

      seekTo(seconds: number, allowSeekAhead: boolean): void;

      destroy(): void;
    }

    interface PlayerOptions {
      events?: PlayerEvents;
    }

    interface PlayerEvents {
      onReady?: (event: PlayerEvent) => void;

      onStateChange?: (event: OnStateChangeEvent) => void;
    }

    interface PlayerEvent {
      target: Player;
    }

    interface OnStateChangeEvent {
      target: Player;

      data: number;
    }

    enum PlayerState {
      UNSTARTED = -1,

      ENDED = 0,

      PLAYING = 1,

      PAUSED = 2,

      BUFFERING = 3,

      CUED = 5,
    }

    export function get(iframeId: string): Player | null {
      throw new Error("Function not implemented.");
    }
  }
}
