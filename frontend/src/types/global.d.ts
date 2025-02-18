declare global {
  interface Window {
    GameEngine: new () => {
      init(ctx: CanvasRenderingContext2D): void;
      start(): void;
    };
    SceneManager: new (game: any) => void;
    ASSET_MANAGER: {
      queueDownload(path: string): void;
      downloadAll(callback: () => void): void;
    };
    Timer: new () => {
      tick(): number;
      fps: number;
    };
  }
}

export {}; 