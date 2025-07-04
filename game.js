const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player;
let projectiles = [];
let enemies = [];
let score = 0;
let gameOver = false;

// Player properties
const playerWidth = 50;
const playerHeight = 50;
let playerX = canvas.width / 2 - playerWidth / 2;
const playerY = canvas.height - playerHeight - 10;
const playerSpeed = 10;

// Projectile properties
const projectileRadius = 5;
const projectileSpeed = 7;

// Enemy properties
const enemyWidth = 50;
const enemyHeight = 50;
const enemySpeed = 2;
const enemySpawnInterval = 2000; // milliseconds
let lastEnemySpawn = 0;

// Event listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('keydown', handleRestartKey); // Added for restart

let rightPressed = false;
let leftPressed = false;

function handleKeyDown(event) {
    if (gameOver) return; // Don't process game controls if game is over

    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = true;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === ' ' || event.key === 'Spacebar') {
        shootProjectile();
    }
}

function handleKeyUp(event) {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = false;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function handleRestartKey(event) {
    if (gameOver) {
        // Check if any key is pressed. More specific key checks can be added if needed.
        resetGame();
    }
}


function resetGame() {
    gameOver = false;
    score = 0;
    playerX = canvas.width / 2 - playerWidth / 2;
    projectiles = [];
    enemies = [];
    lastEnemySpawn = Date.now(); // Reset spawn timer

    // Ensure player object is also reset if its properties were changed directly
    player.x = playerX;

    // No need to call gameLoop() here if it's already running via requestAnimationFrame
    // If gameLoop was explicitly stopped, it would need a restart.
    // Our current gameLoop continues running but just draws gameOver screen.
    // Once gameOver is false, it will resume normal game drawing.
}

function shootProjectile() {
    const projectile = {
        x: playerX + playerWidth / 2,
        y: playerY,
        radius: projectileRadius,
        speed: projectileSpeed,
        color: 'red'
    };
    projectiles.push(projectile);
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - enemyWidth);
    const y = 0;
    const enemy = {
        x: x,
        y: y,
        width: enemyWidth,
        height: enemyHeight,
        speed: enemySpeed,
        color: 'blue'
    };
    enemies.push(enemy);
}

function updatePlayer() {
    if (rightPressed && playerX < canvas.width - playerWidth) {
        playerX += playerSpeed;
    }
    if (leftPressed && playerX > 0) {
        playerX -= playerSpeed;
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.y -= p.speed;
        if (p.y + p.radius < 0) {
            projectiles.splice(i, 1);
        }
    }
}

function updateEnemies() {
    const now = Date.now();
    if (now - lastEnemySpawn > enemySpawnInterval) {
        lastEnemySpawn = now;
        spawnEnemy();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.speed;
        if (e.y > canvas.height) {
            enemies.splice(i, 1);
            // Game over if enemy reaches bottom (optional)
            // gameOver = true;
        }
    }
}

function checkCollisions() {
    // Projectile vs Enemy
    for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const p = projectiles[i];
            const e = enemies[j];

            if (p && e &&
                p.x - p.radius < e.x + e.width &&
                p.x + p.radius > e.x &&
                p.y - p.radius < e.y + e.height &&
                p.y + p.radius > e.y
            ) {
                projectiles.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                break; // Break inner loop as projectile is gone
            }
        }
    }

    // Player vs Enemy
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (
            playerX < e.x + e.width &&
            playerX + playerWidth > e.x &&
            playerY < e.y + e.height &&
            playerY + playerHeight > e.y
        ) {
            gameOver = true;
            break;
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = 'green';
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
}

function drawProjectiles() {
    projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

function drawGameOver() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '30px Arial';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '20px Arial';
        ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 60);
    }
}

function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updatePlayer();
        updateProjectiles();
        updateEnemies();
        checkCollisions();

        drawPlayer();
        drawProjectiles();
        drawEnemies();
        drawScore();
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize player (though it's mostly defined by constants)
player = {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight,
    speed: playerSpeed
};

// Start the game loop
gameLoop();
