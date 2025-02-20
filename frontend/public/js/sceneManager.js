class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameEngine.addEntity(this);
        
        this.BACKEND_URL = 'https://backend-production-aba1.up.railway.app';
        
        // Create paddle and ball instances
        this.paddle = new Paddle(gameEngine, 400, 550);
        this.ball = new Ball(gameEngine, 400, 300);
        
        // Add them to game engine
        this.gameEngine.addEntity(this.paddle);
        this.gameEngine.addEntity(this.ball);
        
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.gameOver = false;
        this.highScores = [];

        // Always prompt for name at start
        this.playerName = this.promptForPlayerName();
        
        this.resetGame();
        this.fetchHighScores();
        this.scoreUpdateInterval = setInterval(() => this.fetchHighScores(), 10000);
        this.initializeButtons();
        this.upgradesManager = new UpgradesManager(gameEngine);
        this.gameEngine.addEntity(this.upgradesManager);
    }

    initializeButtons() {
        const debugCheckbox = document.getElementById("debug");
        const muteCheckbox = document.getElementById("mute");
        const volumeSlider = document.getElementById("volume");

        if (debugCheckbox) {
            debugCheckbox.addEventListener("change", () => {
                this.debug = debugCheckbox.checked;
            });
        }

        if (muteCheckbox && volumeSlider) {
            muteCheckbox.addEventListener("change", () => {
                if (muteCheckbox.checked) {
                    this.previousVolume = volumeSlider.value;
                    volumeSlider.value = "0";
                } else {
                    volumeSlider.value = this.previousVolume || "0.5";
                }
                this.updateVolume();
            });

            volumeSlider.addEventListener("input", () => {
                this.updateVolume();
                if (volumeSlider.value === "0") {
                    muteCheckbox.checked = true;
                } else {
                    muteCheckbox.checked = false;
                    this.previousVolume = volumeSlider.value;
                }
            });
        }
    }

    updateVolume() {
        const volumeSlider = document.getElementById("volume");
        if (volumeSlider) {
           
        }
    }

    promptForPlayerName() {
        let name = null;
        while (!name) {  // Keep prompting until a valid name is entered
            name = prompt("Please enter your name to play:", "");
            if (name === null) {  // If user clicks cancel
                name = "Anonymous";  // Default fallback
            }
            name = name.trim();  // Remove whitespace
            if (name.length < 1) {
                alert("Please enter a valid name!");
                name = null;
            }
            if (name.length > 20) {  // Limit name length
                alert("Name must be 20 characters or less!");
                name = null;
            }
        }
        localStorage.setItem('playerName', name);
        return name;
    }

    fetchHighScores() {
        fetch(`${this.BACKEND_URL}/api/highscores`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched high scores:", data);
            this.highScores = data.slice(0, 5);
        })
        .catch(error => console.error("Error fetching high scores:", error));
    }

    submitHighScore(playerName, score) {
        console.log("Submitting score:", { playerName, score });
        if (!playerName || playerName === "Player1") {
            playerName = this.promptForPlayerName();
        }
        
        fetch(`${this.BACKEND_URL}/api/highscores`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ 
                player_name: playerName, 
                score: score 
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Score submission response:", data);
            this.fetchHighScores();
        })
        .catch(error => console.error("Error submitting score:", error));
    }

    update() {
        if (this.gameOver) {
            if (this.gameEngine.keys[" "]) {
                this.resetGame();
            }
            return;
        }


        // Check for paddle hit
        if (this.ball.checkPaddleCollision(this.paddle, () => {
            this.score++;
            this.paddle.shrink(2);
        })) {
            // Collision handled in ball class
        }
        
        // Game over check
        if (this.ball.y + this.ball.size >= 600) {
            this.gameOver = true;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.score);
                this.submitHighScore(this.playerName, this.score);
            }
        }
    }

    resetGame() {
        this.score = 0;
        this.gameOver = false;
        this.paddle.width = 100;
        this.ball.reset();
    }

    draw(ctx) {
        // Clear and draw background
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw paddle
        this.paddle.draw(ctx);
        
        // Draw ball
        this.ball.draw(ctx);
        
        // Draw current score (right side)
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`Score: ${this.score}`, 780, 30);
        
        // Draw leaderboard (left side)
        this.drawLeaderboard(ctx);
        
        // Draw game over
        if (this.gameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = "white";
            ctx.font = "40px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Game Over!", 400, 250);
            ctx.font = "20px Arial";
            ctx.fillText("Press SPACE to restart", 400, 300);
        }
    }

    drawLeaderboard(ctx) {
        // Draw leaderboard background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(10, 10, 190, 150);
        
        // Draw leaderboard title
        ctx.fillStyle = "gold";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("TOP SCORES", 20, 35);
        
        // Draw high scores
        ctx.font = "16px Arial";
        if (this.highScores && this.highScores.length > 0) {
            this.highScores.forEach((entry, index) => {
                const color = entry.player_name === this.playerName ? "#90EE90" : "white";
                ctx.fillStyle = color;
                const score = entry.score.toString().padStart(5, ' ');
                ctx.fillText(
                    `${(index + 1)}. ${entry.player_name}: ${score}`, 
                    20, 
                    60 + index * 25
                );
            });
        } else {
            ctx.fillStyle = "white";
            ctx.fillText("No scores yet", 20, 60);
        }
    }

    destroy() {
        if (this.scoreUpdateInterval) {
            clearInterval(this.scoreUpdateInterval);
        }
    }
}
window.SceneManager = SceneManager;

