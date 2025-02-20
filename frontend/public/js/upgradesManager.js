class UpgradesManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameEngine.addEntity(this);
        this.upgrades = [];
        this.spawnTimer = 0;
        this.spawnInterval = 10; // Seconds between spawns
        
        // Track active effects
        this.activeEffects = [];
        
        this.effects = {
            paddleGrow: { duration: 5, amount: 20 },
            ballSlow: { duration: 3, amount: 0.5 },
            speedUp: { duration: 5, amount: 2 },
            paddleShrink: { duration: 3, amount: -30 }
        };
    }

    update(dt) {
        this.spawnTimer += dt;

        // Update active effects
        this.activeEffects = this.activeEffects.filter(effect => {
            effect.timeLeft -= dt;
            
            // If effect expires, reverse it
            if (effect.timeLeft <= 0) {
                this.removeEffect(effect);
                return false;
            }
            return true;
        });

        // Spawn new upgrade
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnUpgrade();
        }

        // Update and check collisions
        this.upgrades = this.upgrades.filter(upgrade => {
            if (!upgrade.active) return false;

            upgrade.update(dt);
            
            const paddle = this.gameEngine.entities.find(e => e instanceof Paddle);
            const ball = this.gameEngine.entities.find(e => e instanceof Ball);
            
            if (upgrade.checkCollision(paddle, ball)) {
                this.applyUpgrade(upgrade.type, paddle, ball);
                upgrade.active = false;
                return false;
            }
            
            return true;
        });
    }

    draw(ctx) {
        this.upgrades.forEach(upgrade => upgrade.draw(ctx));
    }

    spawnUpgrade() {
        const types = ['paddleGrow', 'ballSlow', 'speedUp', 'paddleShrink'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (800 - 40) + 20; // Keep away from edges
        
        const upgrade = new Upgrade(this.gameEngine, x, 0, type);
        this.upgrades.push(upgrade);
    }

    removeEffect(effect) {
        switch(effect.type) {
            case 'paddleGrow':
            case 'paddleShrink':
                effect.target.width = effect.originalValue;
                break;
            case 'speedUp':
                effect.target.speed = effect.originalValue;
                break;
            case 'ballSlow':
                const currentSpeed = Math.hypot(effect.target.dx, effect.target.dy);
                const speedUpFactor = effect.originalValue / currentSpeed;
                effect.target.dx *= speedUpFactor;
                effect.target.dy *= speedUpFactor;
                break;
        }
    }

    applyUpgrade(type, paddle, ball) {
        switch(type) {
            case 'paddleGrow':
                const originalWidth = paddle.width;
                paddle.width += this.effects.paddleGrow.amount;
                this.activeEffects.push({
                    type: 'paddleGrow',
                    timeLeft: this.effects.paddleGrow.duration,
                    target: paddle,
                    originalValue: originalWidth
                });
                break;

            case 'ballSlow':
                const ballOriginalSpeed = Math.hypot(ball.dx, ball.dy);
                const slowFactor = this.effects.ballSlow.amount;
                ball.dx *= slowFactor;
                ball.dy *= slowFactor;
                this.activeEffects.push({
                    type: 'ballSlow',
                    timeLeft: this.effects.ballSlow.duration,
                    target: ball,
                    originalValue: ballOriginalSpeed
                });
                break;

            case 'speedUp':
                const originalSpeed = paddle.speed;
                paddle.speed *= this.effects.speedUp.amount;
                this.activeEffects.push({
                    type: 'speedUp',
                    timeLeft: this.effects.speedUp.duration,
                    target: paddle,
                    originalValue: originalSpeed
                });
                break;

            case 'paddleShrink':
                const paddleWidth = paddle.width;
                paddle.width = Math.max(20, paddle.width + this.effects.paddleShrink.amount);
                this.activeEffects.push({
                    type: 'paddleShrink',
                    timeLeft: this.effects.paddleShrink.duration,
                    target: paddle,
                    originalValue: paddleWidth
                });
                break;
        }
    }
}

window.UpgradesManager = UpgradesManager;



