'use client';
import { useEffect, useRef } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleFullscreen = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    // Load scripts
    const assetManagerScript = document.createElement("script");
    const gameEngineScript = document.createElement("script");
    const timerScript = document.createElement("script");
    const sceneManagerScript = document.createElement("script");
    
    assetManagerScript.src = "/js/assetManager.js";
    gameEngineScript.src = "/js/gameengine.js";
    timerScript.src = "/js/timer.js";
    sceneManagerScript.src = "/js/sceneManager.js";
    
    // Chain load scripts in correct order
    assetManagerScript.onload = () => {
      document.body.appendChild(timerScript);
    };

    timerScript.onload = () => {
      document.body.appendChild(gameEngineScript);
    };

    gameEngineScript.onload = () => {
      document.body.appendChild(sceneManagerScript);
    };

    sceneManagerScript.onload = () => {
      if (window.ASSET_MANAGER && window.GameEngine && window.Timer && window.SceneManager && canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.focus();
        canvas.tabIndex = 0;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;

          const game = new window.GameEngine();
          game.init(ctx);
          new window.SceneManager(game);
          game.start();
        }
      }
    };

    document.body.appendChild(assetManagerScript);

    // Add fullscreen change listener
    const handleFullscreenChange = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (document.fullscreenElement) {
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
      } else {
        canvas.style.width = 'auto';
        canvas.style.height = 'auto';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.body.removeChild(assetManagerScript);
      document.body.removeChild(gameEngineScript);
      document.body.removeChild(timerScript);
      document.body.removeChild(sceneManagerScript);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div style={{ 
      textAlign: "center", 
      background: "#222", 
      color: "white", 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px"
    }}>
      <h1>Pong Game</h1>
      
      <div style={{ position: "relative" }}>
        <canvas 
          ref={canvasRef} 
          id="gameWorld" 
          width={800} 
          height={600}
          style={{ 
            border: "1px solid white",
            marginBottom: "10px"
          }} 
        />
        
        <div style={{
          marginTop: "10px",
          padding: "10px",
          background: "#333",
          borderRadius: "5px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input type="checkbox" id="debug" /> Debug
          </label>
          
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input type="checkbox" id="mute" /> Mute
          </label>
          
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label htmlFor="volume">Volume</label>
            <input 
              type="range" 
              id="volume" 
              min="0" 
              max="1" 
              step="0.1" 
              defaultValue="0.5"
              style={{ width: "100px" }}
            />
          </div>
          
          <button 
            id="fullscreenButton"
            onClick={toggleFullscreen}
            style={{
              padding: "5px 10px",
              background: "#444",
              border: "1px solid #666",
              color: "white",
              borderRadius: "3px",
              cursor: "pointer"
            }}
          >
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
