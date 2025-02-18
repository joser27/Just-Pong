// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class Timer {
    constructor() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.lastTimestamp = 0;
        this.fps = 0;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = 0;
    };

    tick() {
        const current = Date.now();
        const delta = (current - this.lastTimestamp) / 1000;
        this.lastTimestamp = current;

        // Update FPS counter every second
        this.framesThisSecond++;
        if (current > this.lastFpsUpdate + 1000) {
            this.fps = this.framesThisSecond;
            this.framesThisSecond = 0;
            this.lastFpsUpdate = current;
        }

        const gameDelta = Math.min(delta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    };
};

window.Timer = Timer;
