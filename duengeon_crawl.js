<!DOCTYPE html>
<html>
<head>
    <title>First-Person Dungeon Crawler</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="game"></canvas>
    <script>
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        
        // Set canvas to full window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Game settings
        const CELL_SIZE = 64;
        const FOV = Math.PI / 3; // 60 degrees
        const HALF_FOV = FOV / 2;
        const NUM_RAYS = canvas.width / 2;
        const STEP_ANGLE = FOV / NUM_RAYS;
        const WALL_HEIGHT = 100;
        
        // Player settings
        const player = {
            x: CELL_SIZE * 1.5,
            y: CELL_SIZE * 1.5,
            angle: Math.PI / 4,
            speed: 0
        };
        
        // Simple maze (1 = wall, 0 = path)
        const map = [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ];
        
        // Game loop
        function gameLoop() {
            update();
            render();
            requestAnimationFrame(gameLoop);
        }
        
        // Update player position
        function update() {
            if (player.speed === 0) return;
            
            const moveX = Math.cos(player.angle) * player.speed;
            const moveY = Math.sin(player.angle) * player.speed;
            
            // Check collision
            if (map[Math.floor((player.y) / CELL_SIZE)][Math.floor((player.x + moveX * 4) / CELL_SIZE)] === 0) {
                player.x += moveX;
            }
            if (map[Math.floor((player.y + moveY * 4) / CELL_SIZE)][Math.floor((player.x) / CELL_SIZE)] === 0) {
                player.y += moveY;
            }
        }
        
        // Render 3D view
        function render() {
            // Clear screen
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw ceiling
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
            
            // Draw floor
            ctx.fillStyle = '#333';
            ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
            
            // Cast rays
            for (let i = 0; i < NUM_RAYS; i++) {
                const rayAngle = player.angle - HALF_FOV + i * STEP_ANGLE;
                castRay(rayAngle, i);
            }
        }
        
        // Cast a single ray
        function castRay(rayAngle, rayIndex) {
            // Ray direction
            const rayDirX = Math.cos(rayAngle);
            const rayDirY = Math.sin(rayAngle);
            
            // Current position
            let rayX = player.x;
            let rayY = player.y;
            
            // Distance traveled
            let distance = 0;
            let hitWall = false;
            
            // DDA algorithm
            while (!hitWall && distance < 20 * CELL_SIZE) {
                distance += 1;
                rayX = player.x + rayDirX * distance;
                rayY = player.y + rayDirY * distance;
                
                // Check if ray hit a wall
                const mapX = Math.floor(rayX / CELL_SIZE);
                const mapY = Math.floor(rayY / CELL_SIZE);
                
                if (mapX < 0 || mapX >= map[0].length || mapY < 0 || mapY >= map.length) {
                    hitWall = true;
                    distance = 20 * CELL_SIZE;
                } else if (map[mapY][mapX] === 1) {
                    hitWall = true;
                }
            }
            
            // Fix fisheye effect
            distance *= Math.cos(player.angle - rayAngle);
            
            // Calculate wall height
            const wallHeight = (CELL_SIZE * canvas.height) / distance;
            
            // Draw wall slice
            const wallX = rayIndex * 2;
            const wallY = (canvas.height - wallHeight) / 2;
            
            // Shade based on distance
            const shade = Math.max(0, 255 - distance / 2);
            ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
            ctx.fillRect(wallX, wallY, 2, wallHeight);
        }
        
        // Handle keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') player.speed = 2;
            if (e.key === 'ArrowDown') player.speed = -2;
            if (e.key === 'ArrowLeft') player.angle -= 0.1;
            if (e.key === 'ArrowRight') player.angle += 0.1;
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.speed = 0;
        });
        
        // Start the game
        gameLoop();
    </script>
</body>
</html>