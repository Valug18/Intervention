document.addEventListener('DOMContentLoaded', () => {
    const game = document.getElementById('game');
    const story = document.getElementById('story');
    const options = document.getElementById('options');
    const startButton = document.getElementById('start-button');
    const progressBar = document.getElementById('progress');
    const sceneContainer = document.getElementById('scene-container');
    let progressPercentage = 0;
    let state = {};
    let typing = false;
    let typingTimeout;

    const clickSound = new Audio('click-sound.mp3');
    clickSound.load();

    startButton.addEventListener('click', startGame);

    function startGame() {
        startButton.style.display = 'none';
        game.style.display = 'block';
        sceneContainer.style.display = 'block';
        setTimeout(() => game.classList.add('show'), 10); // Añade clase para la transición
        state = {};
        progressPercentage = 0;
        updateProgress(0);
        showTextNode(1);
    }

    function showTextNode(textNodeIndex) {
        const textNode = textNodes.find(node => node.id === textNodeIndex);
        story.innerHTML = '';
        typeWriter(textNode.text, story, 50);
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
        const nextTextNodeId = option.nextText;
        if (nextTextNodeId === -1) return startGame();
        state = Object.assign(state, option.setState);
        updateProgress(20); // Aumenta el progreso en un 20%
        showTextNode(nextTextNodeId);
    }

    function updateProgress(percentage) {
        progressPercentage += percentage;
        progressBar.style.width = progressPercentage + '%';
    }

    function typeWriter(text, element, speed) {
        let i = 0;
        typing = true;
        element.innerHTML = '';

        function type() {
            if (i < text.length && typing) {
                element.innerHTML += text.charAt(i);
                i++;
                typingTimeout = setTimeout(type, speed);
            } else {
                typing = false;
            }
        }
        type();
    }

    function stopTyping() {
        typing = false;
        clearTimeout(typingTimeout);
    }

    options.addEventListener('click', stopTyping);

    const textNodes = [
        {
            id: 1,
            text: 'Eres un perito que acaba de llegar a la escena de un crimen. ¿Qué haces primero?',
            options: [
                { text: 'Examinar el cuerpo', nextText: 2 },
                { text: 'Hablar con los testigos', nextText: 3 },
                { text: 'Buscar evidencia en el área', nextText: 4 }
            ]
        },
        {
            id: 2,
            text: 'Encuentras una pista importante en el cuerpo. ¿Qué haces ahora?',
            options: [
                { text: 'Recolectar la evidencia', nextText: 5 },
                { text: 'Ignorar la pista y seguir buscando', nextText: 4 }
            ]
        },
        {
            id: 3,
            text: 'Los testigos mencionan haber visto a alguien huyendo. ¿Qué haces?',
            options: [
                { text: 'Crear un retrato hablado', nextText: 5 },
                { text: 'No confiar en los testigos y seguir buscando', nextText: 4 }
            ]
        },
        {
            id: 4,
            text: 'Encuentras huellas en el área. ¿Qué haces?',
            options: [
                { text: 'Tomar fotos de las huellas', nextText: 5 },
                { text: 'Ignorar las huellas', nextText: 5 }
            ]
        },
        {
            id: 5,
            text: 'Con toda la información recopilada, ¿quién crees que es el culpable?',
            options: [
                { text: 'El mayordomo', nextText: 6 },
                { text: 'El vecino', nextText: 7 },
                { text: 'El jardinero', nextText: 8 },
                { text: 'No tienes suficiente información', nextText: 9 }
            ]
        },
        {
            id: 6,
            text: '¡Correcto! La evidencia apuntaba al mayordomo. ¡Has resuelto el caso!',
            options: [{ text: 'Jugar de nuevo', nextText: -1 }]
        },
        {
            id: 7,
            text: 'El retrato no coincidía con el vecino. No lograste resolver el caso.',
            options: [{ text: 'Intentar de nuevo', nextText: -1 }]
        },
        {
            id: 8,
            text: 'Las fotos de las huellas llevaban al jardinero. ¡Caso resuelto!',
            options: [{ text: 'Jugar de nuevo', nextText: -1 }]
        },
        {
            id: 9,
            text: 'Sin suficiente información, el caso quedó sin resolver.',
            options: [{ text: 'Intentar de nuevo', nextText: -1 }]
        }
    ];
});
