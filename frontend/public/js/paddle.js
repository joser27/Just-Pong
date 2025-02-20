class Paddle {
    constructor(gameEngine, x, y) {
        this.gameEngine = gameEngine;
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 10;
        this.color = "white";
        this.speed = 500; // pixels per second
        this.minWidth = 30;
    }

    update(dt) {
        // Paddle movement with delta time
        if (this.gameEngine.keys["ArrowLeft"]) {
            this.x -= this.speed * dt;
        }
        if (this.gameEngine.keys["ArrowRight"]) {
            this.x += this.speed * dt;
        }
        
        // Keep paddle in bounds
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    shrink(amount) {
        this.width = Math.max(this.minWidth, this.width - amount);
    }
}

window.Paddle = Paddle;
