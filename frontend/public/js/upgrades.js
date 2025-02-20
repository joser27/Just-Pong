class Upgrade {
    constructor(gameEngine, x, y, type) {
        this.gameEngine = gameEngine;
        this.x = x;
        this.y = y;
        this.width = 30;  // Adjusted for images
        this.height = 30; // Adjusted for images
        this.type = type;
        this.speed = 100; // pixels per second
        this.active = true;
        
        // Load images
        this.images = {
            'paddleGrow': new Image(),
            'ballSlow': new Image(),
            'speedUp': new Image(),
            'paddleShrink': new Image()
        };
        this.images.paddleGrow.src = '/spinach.png';
        this.images.ballSlow.src = '/snow.png';
        this.images.speedUp.src = '/lightning.png';
        this.images.paddleShrink.src = '/poison.png';
    }

    update(dt) {
        if (!this.active) return;
        
        this.y += this.speed * dt;
        
        // Deactivate if falls off screen
        if (this.y > 600) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        
        // Draw the image centered at (x,y)
        const image = this.images[this.type];
        if (image.complete) {  // Only draw if image is loaded
            ctx.drawImage(
                image,
                this.x - this.width/2,
                this.y - this.height/2,
                this.width,
                this.height
            );
        }
    }

    checkCollision(paddle, ball) {
        if (!this.active) return false;

        // Check paddle collision
        if (this.y + this.height/2 >= paddle.y &&
            this.x + this.width/2 >= paddle.x &&
            this.x - this.width/2 <= paddle.x + paddle.width) {
            return true;
        }

        // Check ball collision
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ball.size + this.width/2;
    }
}

window.Upgrade = Upgrade;


