document.addEventListener('DOMContentLoaded', () => {
    const game = document.getElementById('game');
    const startButton = document.getElementById('start-button');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const story = document.getElementById('story');
    const options = document.getElementById('options');
    const progressBar = document.getElementById('progress');

    // Configuración del canvas
    canvas.width = 800;
    canvas.height = 400;
    game.appendChild(canvas);

    let progressPercentage = 0;
    let state = { evidence: [], score: 0 };
    let player = { x: 50, y: 50, speed: 3, width: 32, height: 32 };
    let gameState = 'exploring'; // 'exploring' o 'dialogue'
    let currentNode = 1;
    let interactables = [];

    // Audio
    const clickSound = new Audio('click-sound.mp3');
    const backgroundMusic = new Audio('background-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;

    // Controles
    const keys = {};
    document.addEventListener('keydown', (e) => (keys[e.key] = true));
    document.addEventListener('keyup', (e) => (keys[e.key] = false));

    startButton.addEventListener('click', startGame);

    function startGame() {
        startButton.style.display = 'none';
        game.style.display = 'block';
        backgroundMusic.play();
        resetGame();
        loadScene(1);
        gameLoop();
    }

    function resetGame() {
        state = { evidence: [], score: 0 };
        progressPercentage = 0;
        player.x = 50;
        player.y = 50;
        updateProgress(0);
    }

    function loadScene(sceneId) {
        const scene = scenes.find(s => s.id === sceneId);
        interactables = scene.interactables;
        currentNode = sceneId;
        gameState = 'exploring';
        story.innerHTML = scene.description;
        options.innerHTML = '';
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar escenario simple
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Suelo
        
        // Dibujar interactuables
        interactables.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.width, item.height);
            if (checkCollision(player, item)) {
                showDialogue(item.nodeId);
            }
        });

        // Dibujar jugador
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Movimiento
        if (gameState === 'exploring') {
            if (keys['ArrowUp']) player.y -= player.speed;
            if (keys['ArrowDown']) player.y += player.speed;
            if (keys['ArrowLeft']) player.x -= player.speed;
            if (keys['ArrowRight']) player.x += player.speed;

            // Límites
            player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
            player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
        }

        requestAnimationFrame(gameLoop);
    }

    function checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    function showDialogue(nodeId) {
        if (gameState === 'dialogue') return;
        gameState = 'dialogue';
        
        const textNode = textNodes.find(node => node.id === nodeId);
        story.innerHTML = textNode.text;
        options.innerHTML = '';

        textNode.options.forEach(option => {
            const button = document.createElement('button');
            button.innerText = option.text;
            button.classList.add('option-button');
            button.addEventListener('click', () => selectOption(option));
            options.appendChild(button);
        });
    }

    function selectOption(option) {
        clickSound.play();
        
        if (option.evidence) {
            state.evidence.push(option.evidence);
            state.score += option.score || 10;
            story.innerHTML += `<br>Evidencia encontrada: ${option.evidence}`;
        }

        if (option.nextScene) {
            loadScene(option.nextScene);
        } else if (option.nextText === -1) {
            backgroundMusic.pause();
            startGame();
        } else {
            gameState = 'exploring';
            showDialogue(option.nextText);
        }

        updateProgress(option.progress || 20);
    }

    function updateProgress(percentage) {
        progressPercentage = Math.min(100, progressPercentage + percentage);
        progressBar.style.width = progressPercentage + '%';
    }

    // Definición de Escenas
    const scenes = [
        {
            id: 1,
            description: 'Estás en la escena del crimen: una sala desordenada.',
            interactables: [
                { x: 200, y: 100, width: 40, height: 40, color: 'red', nodeId: 1 }, // Cuerpo
                { x: 400, y: 200, width: 30, height: 60, color: 'yellow', nodeId: 2 }, // Testigo
                { x: 600, y: 50, width: 50, height: 20, color: 'green', nodeId: 3 } // Evidencia
            ]
        },
        {
            id: 2,
            description: 'Un callejón oscuro cerca de la casa.',
            interactables: [
                { x: 300, y: 150, width: 30, height: 30, color: 'purple', nodeId: 4 }, // Cuchillo
                { x: 500, y: 250, width: 40, height: 20, color: 'gray', nodeId: 5 } // Huellas
            ]
        }
    ];

    // Nodos de Texto
    const textNodes = [
        {
            id: 1,
            text: 'Examinas el cuerpo y encuentras una herida. ¿Qué haces?',
            options: [
                { text: 'Analizar herida', evidence: 'Herida extraña', score: 15, nextText: 6 },
                { text: 'Volver', nextText: null }
            ]
        },
        {
            id: 2,
            text: 'El testigo dice que vio a alguien huir. ¿Qué haces?',
            options: [
                { text: 'Hacer retrato', evidence: 'Retrato hablado', score: 20, nextScene: 2 },
                { text: 'Volver', nextText: null }
            ]
        },
        {
            id: 3,
            text: 'Encuentras una chaqueta tirada. ¿Qué haces?',
            options: [
                { text: 'Recolectar', evidence: 'Chaqueta roja', score: 15, nextText: 6 },
                { text: 'Volver', nextText: null }
            ]
        },
        {
            id: 4,
            text: 'Un cuchillo ensangrentado en el callejón. ¿Qué haces?',
            options: [
                { text: 'Recolectar', evidence: 'Cuchillo', score: 25, nextText: 6 },
                { text: 'Volver', nextText: null }
            ]
        },
        {
            id: 5,
            text: 'Huellas frescas en el lodo. ¿Qué haces?',
            options: [
                { text: 'Fotografiar', evidence: 'Fotos de huellas', score: 15, nextText: 6 },
                { text: 'Volver', nextText: null }
            ]
        },
        {
            id: 6,
            text: 'Con la evidencia, ¿quién es el culpable?',
            options: [
                { text: 'Mayordomo', nextText: 7 },
                { text: 'Jardinero', nextText: 8 },
                { text: 'Seguir buscando', nextScene: 2 }
            ]
        },
        {
            id: 7,
            text: '¡Correcto! El mayordomo es atrapado. Puntuación: ' + state.score,
            options: [{ text: 'Jugar de nuevo', nextText: -1 }]
        },
        {
            id: 8,
            text: '¡Correcto! El jardinero confiesa. Puntuación: ' + state.score,
            options: [{ text: 'Jugar de nuevo', nextText: -1 }]
        }
    ];
});
