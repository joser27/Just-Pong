class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameEngine.addEntity(this);
        
        this.BACKEND_URL = 'https://backend-production-aba1.up.railway.app';
        
        // Paddle (player)
        this.paddle = {
            x: 400, y: 550, 
            width: 100, height: 10,
            color: "white", 
            speed: 10
        };
        
        // Ball
        this.ball = {
            x: 400, y: 300,
            size: 10,
            dx: 5, dy: -5,
            color: "red",
            baseSpeed: 5
        };
        
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

        // Paddle movement
        if (this.gameEngine.keys["ArrowLeft"]) this.paddle.x -= this.paddle.speed;
        if (this.gameEngine.keys["ArrowRight"]) this.paddle.x += this.paddle.speed;
        this.paddle.x = Math.max(0, Math.min(800 - this.paddle.width, this.paddle.x));
        
        // Ball movement
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Wall collisions
        if (this.ball.x - this.ball.size <= 0 || this.ball.x + this.ball.size >= 800) {
            this.ball.dx *= -1;
            this.ball.x = this.ball.x < 400 ? this.ball.size : 800 - this.ball.size; // Prevent sticking
        }
        if (this.ball.y - this.ball.size <= 0) {
            this.ball.dy *= -1;
            this.ball.y = this.ball.size; // Adjust position
        }
        
        // Paddle collision with improved physics
        if (this.ball.dy > 0) {
            const ballBottom = this.ball.y + this.ball.size;
            if (ballBottom >= this.paddle.y && 
                this.ball.x + this.ball.size > this.paddle.x && 
                this.ball.x - this.ball.size < this.paddle.x + this.paddle.width) {
                
                const paddleCenter = this.paddle.x + this.paddle.width/2;
                const hitOffset = (this.ball.x - paddleCenter) / (this.paddle.width/2);
                const maxAngle = Math.PI/3; // 60 degrees
                const angle = hitOffset * maxAngle;
                
                const speed = Math.hypot(this.ball.dx, this.ball.dy);
                const newSpeed = speed + Math.min(this.score * 0.2, 10);
                
                this.ball.dx = Math.sin(angle) * newSpeed;
                this.ball.dy = -Math.cos(angle) * newSpeed;
                this.score++;
                
                this.paddle.width = Math.max(30, 100 - this.score * 2);
            }
        }
        
        // Game over check
        if (this.ball.y + this.ball.size >= 600) {
            this.gameOver = true;
            // Submit score regardless of whether it's a high score
            this.submitHighScore(this.playerName, this.score);
            
            // Still update local high score if it's better
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.score);
            }
        }
    }

    resetGame() {
        this.score = 0;
        this.gameOver = false;
        this.paddle.width = 100;
        this.ball.x = 400;
        this.ball.y = 300;
        
        // Random initial angle (-45° to 45° from vertical)
        const angle = (Math.random() * Math.PI/2 - Math.PI/4);
        this.ball.dx = Math.sin(angle) * this.ball.baseSpeed;
        this.ball.dy = -Math.cos(angle) * this.ball.baseSpeed;
        
        // Random horizontal direction
        if (Math.random() < 0.5) this.ball.dx *= -1;
    }

    draw(ctx) {
        // Clear and draw background
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw paddle
        ctx.fillStyle = this.paddle.color;
        ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Draw ball
        ctx.fillStyle = this.ball.color;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw score
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        // Draw debug info if enabled
        if (this.debug) {
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText(`Ball Position: (${Math.round(this.ball.x)}, ${Math.round(this.ball.y)})`, 10, 570);
            ctx.fillText(`Ball Speed: (${this.ball.dx.toFixed(2)}, ${this.ball.dy.toFixed(2)})`, 10, 585);
            
            // Draw collision boxes
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
            ctx.beginPath();
            ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw game over
        if (this.gameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = "white";
            ctx.font = "40px Arial";
            ctx.fillText("Game Over!", 300, 250);
            ctx.font = "20px Arial";
            ctx.fillText("Press SPACE to restart", 300, 300);
        }

        // Draw leaderboard
        this.drawLeaderboard(ctx);
    }

    drawLeaderboard(ctx) {
        // Draw leaderboard background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(ctx.canvas.width - 200, 10, 190, 150);
        
        // Draw leaderboard title
        ctx.fillStyle = "gold";
        ctx.font = "bold 20px Arial";
        ctx.fillText("TOP SCORES", ctx.canvas.width - 180, 35);
        
        // Debug log
        console.log("Current highScores array:", this.highScores);
        
        // Draw high scores
        ctx.font = "16px Arial";
        if (this.highScores && this.highScores.length > 0) {
            this.highScores.forEach((entry, index) => {
                const color = entry.player_name === this.playerName ? "#90EE90" : "white";
                ctx.fillStyle = color;
                const score = entry.score.toString().padStart(5, ' ');
                ctx.fillText(
                    `${(index + 1)}. ${entry.player_name}: ${score}`, 
                    ctx.canvas.width - 180, 
                    60 + index * 25
                );
            });
        } else {
            ctx.fillStyle = "white";
            ctx.fillText("No scores yet", ctx.canvas.width - 180, 60);
        }
    }

    destroy() {
        if (this.scoreUpdateInterval) {
            clearInterval(this.scoreUpdateInterval);
        }
    }
}

// Add this line at the end of the file to make SceneManager available globally
window.SceneManager = SceneManager;

