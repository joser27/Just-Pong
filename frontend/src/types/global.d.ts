declare global {
  interface Window {
    GameEngine: {
      new(): GameEngineInstance;
    };
    SceneManager: new (game: GameEngineInstance) => void;
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

interface GameEngineInstance {
  init(ctx: CanvasRenderingContext2D): void;
  start(): void;
}

export {}; 