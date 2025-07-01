class DinoGame {
    constructor() {
        this.dino = document.getElementById('dino');
        this.game = document.getElementById('game');
        this.score = document.getElementById('score');
        this.highScore = document.getElementById('highScore');
        this.gameOver = document.getElementById('gameOver');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.isJumping = false;
        this.isDucking = false;
        this.gameStarted = false;
        this.currentScore = 0;
        this.highScoreValue = localStorage.getItem('dinoHighScore') || 0;
        this.gameSpeed = 6; // Increased base speed
        this.obstacles = [];
        this.obstacleTypes = {
            ground: ['cactus-small', 'cactus-medium', 'cactus-large', 'cactus-group'],
            air: ['bird-low', 'bird-medium', 'bird-high']
        };
        
        this.setupEventListeners();
        this.updateHighScore();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.startGame());
    }

    handleKeyDown(event) {
        if (!this.gameStarted) return;
        
        if ((event.code === 'Space' || event.code === 'ArrowUp') && !this.isJumping) {
            this.jump();
        } else if (event.code === 'ArrowDown' && !this.isDucking) {
            this.duck();
        }
    }

    handleKeyUp(event) {
        if (event.code === 'ArrowDown' && this.isDucking) {
            this.unduck();
        }
    }

    jump() {
        this.isJumping = true;
        this.dino.classList.add('jumping');
        
        setTimeout(() => {
            this.dino.classList.remove('jumping');
            this.isJumping = false;
        }, 800); // Increased jump duration to match CSS
    }

    duck() {
        this.isDucking = true;
        this.dino.classList.add('ducking');
    }

    unduck() {
        this.isDucking = false;
        this.dino.classList.remove('ducking');
    }

    startGame() {
        this.resetGame();
        this.gameStarted = true;
        this.startButton.classList.add('hidden');
        this.gameOver.classList.add('hidden');
        this.gameLoop();
        this.spawnObstacles();
    }

    resetGame() {
        this.currentScore = 0;
        this.gameSpeed = 6;
        this.score.textContent = '0';
        this.obstacles.forEach(obstacle => obstacle.element.remove());
        this.obstacles = [];
        this.isJumping = false;
        this.isDucking = false;
    }

    createObstacle() {
        const obstacle = document.createElement('div');
        
        // Randomly choose between ground and air obstacles
        const isGroundObstacle = Math.random() > 0.3; // 70% chance for ground obstacles
        const types = isGroundObstacle ? this.obstacleTypes.ground : this.obstacleTypes.air;
        const type = types[Math.floor(Math.random() * types.length)];
        
        obstacle.classList.add('obstacle');
        
        if (type.startsWith('cactus')) {
            obstacle.classList.add('cactus');
            if (type === 'cactus-small') obstacle.classList.add('small');
            else if (type === 'cactus-medium') obstacle.classList.add('medium');
            else if (type === 'cactus-large') obstacle.classList.add('large');
            else obstacle.classList.add('group');
        } else {
            obstacle.classList.add('bird');
            if (type === 'bird-low') obstacle.classList.add('low');
            else if (type === 'bird-medium') obstacle.classList.add('medium');
            else obstacle.classList.add('high');
        }
        
        obstacle.style.left = '800px';
        this.game.appendChild(obstacle);
        this.obstacles.push({ element: obstacle, type: type });
    }

    moveObstacles() {
        this.obstacles.forEach((obstacle, index) => {
            const currentLeft = parseFloat(obstacle.element.style.left);
            if (currentLeft <= -50) {
                obstacle.element.remove();
                this.obstacles.splice(index, 1);
                this.updateScore();
            } else {
                obstacle.element.style.left = `${currentLeft - this.gameSpeed}px`;
            }
        });
    }

    checkCollision(obstacle) {
        const dinoRect = this.dino.getBoundingClientRect();
        const obstacleRect = obstacle.element.getBoundingClientRect();

        // Adjust collision box based on ducking state
        const dinoCollisionBox = {
            top: this.isDucking ? dinoRect.top + dinoRect.height * 0.5 : dinoRect.top,
            bottom: dinoRect.bottom,
            left: dinoRect.left + 10,
            right: dinoRect.right - 10
        };

        // Check if obstacle is a bird and player isn't ducking
        if (obstacle.type.startsWith('bird') && !this.isDucking) {
            return !(dinoCollisionBox.right < obstacleRect.left || 
                    dinoCollisionBox.left > obstacleRect.right || 
                    dinoCollisionBox.bottom < obstacleRect.top || 
                    dinoCollisionBox.top > obstacleRect.bottom);
        }

        // For ground obstacles
        return !(dinoCollisionBox.right < obstacleRect.left || 
                dinoCollisionBox.left > obstacleRect.right || 
                dinoCollisionBox.bottom < obstacleRect.top);
    }

    updateScore() {
        this.currentScore++;
        this.score.textContent = this.currentScore;
        
        if (this.currentScore > this.highScoreValue) {
            this.highScoreValue = this.currentScore;
            this.updateHighScore();
            localStorage.setItem('dinoHighScore', this.highScoreValue);
        }

        // Increase game speed every 5 points
        if (this.currentScore % 5 === 0) {
            this.gameSpeed += 0.2;
        }
    }

    updateHighScore() {
        this.highScore.textContent = this.highScoreValue;
    }

    spawnObstacles() {
        if (!this.gameStarted) return;

        this.createObstacle();
        
        // Random delay between obstacles based on game speed
        const minDelay = 800 / (this.gameSpeed * 0.2);
        const maxDelay = 1500 / (this.gameSpeed * 0.2);
        const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
        
        setTimeout(() => this.spawnObstacles(), randomDelay);
    }

    gameLoop() {
        if (!this.gameStarted) return;

        this.moveObstacles();

        // Check for collisions
        for (const obstacle of this.obstacles) {
            if (this.checkCollision(obstacle)) {
                this.endGame();
                return;
            }
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    endGame() {
        this.gameStarted = false;
        this.gameOver.classList.remove('hidden');
    }
}

// Initialize the game
const game = new DinoGame(); 