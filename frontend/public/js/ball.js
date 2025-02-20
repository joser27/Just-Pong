class Ball {
    constructor(gameEngine, x, y) {
        this.gameEngine = gameEngine;
        this.x = x;
        this.y = y;
        this.size = 10;
        this.color = "red";
        this.baseSpeed = 300; // pixels per second
        this.dx = this.baseSpeed;
        this.dy = -this.baseSpeed;
        this.resetPosition = { x, y };
    }

    update(dt) {
        // Ball movement with delta time
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        
        // Wall collisions
        if (this.x - this.size <= 0 || this.x + this.size >= 800) {
            this.dx *= -1;
            this.x = this.x < 400 ? this.size : 800 - this.size;
        }
        if (this.y - this.size <= 0) {
            this.dy *= -1;
            this.y = this.size;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    checkPaddleCollision(paddle, onCollision) {
        if (this.dy > 0) {
            const ballBottom = this.y + this.size;
            if (ballBottom >= paddle.y && 
                this.x + this.size > paddle.x && 
                this.x - this.size < paddle.x + paddle.width) {
                
                const paddleCenter = paddle.x + paddle.width/2;
                const hitOffset = (this.x - paddleCenter) / (paddle.width/2);
                const maxAngle = Math.PI/3;
                const angle = hitOffset * maxAngle;
                
                const speed = Math.hypot(this.dx, this.dy);
                const newSpeed = speed + 20; // Speed increase in pixels per second
                
                this.dx = Math.sin(angle) * newSpeed;
                this.dy = -Math.cos(angle) * newSpeed;
                
                if (onCollision) onCollision();
                return true;
            }
        }
        return false;
    }

    reset() {
        this.x = this.resetPosition.x;
        this.y = this.resetPosition.y;
        
        const angle = (Math.random() * Math.PI/2 - Math.PI/4);
        this.dx = Math.sin(angle) * this.baseSpeed;
        this.dy = -Math.cos(angle) * this.baseSpeed;
        
        if (Math.random() < 0.5) this.dx *= -1;
    }
}

window.Ball = Ball;

