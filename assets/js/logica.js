
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-game');
const resetButton = document.getElementById('reset-game');
const toggleModeButton = document.getElementById('toggle-mode');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const scoreDisplay = document.getElementById('score');
const themeSelect = document.getElementById('theme-select');
const difficultySelect = document.getElementById('difficulty-select');
const playersInfo = document.getElementById('players-info');
const leaderboardBody = document.getElementById('leaderboard-body');


let acerto = document.getElementById('acerto');
let erro = document.getElementById('erro');
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer;
let seconds = 0;
let gameStarted = false;
let score = 0;
let currentTheme = 'emojis';
let currentDifficulty = 'easy';
let isTwoPlayerMode = false;
let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;

    
const themes = {
    emojis: ['😀', '😎', '🥳', '🤔', '😍', '🤯', '🥶', '🤠', '👽', '🤖', '👻', '🎃', '🦄', '🐶', '🐱', '🦊'],
    animais: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐺', '🐵', '🐔'],
    frutas: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥭', '🍎', '🍏', '🍐'],
    plantas: ['🌵', '🌴', '🌻', '🍄', '🪻', '🌼', '🌾', '🌹', '🌺', '🍁', '🍀', '🌱', '🪵', '🎍', '🌲', '🪷'],
    comida: ['🌭', '🍔', '🍟', '🥪', '🍝', '🍱', '🍫', '🍩', '🍰', '🍨', '🧁', '🥞', '🍳', '🍙', '🍮', '🍪']
    
};

const difficulties = {
    easy: { gridSize: 4, timeLimit: 60 },
    medium: { gridSize: 6, timeLimit: 180 },
    hard: { gridSize: 8, timeLimit: 240 },
    imposible: { gridSize: 10, timeLimit: 300}
};

function createCard(content) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="card-content">${content}</div>`;
    card.addEventListener('click', flipCard);
    return card;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    score = 0;
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    updateDisplay();
    
    const { gridSize, timeLimit } = difficulties[currentDifficulty];
    const shuffledTheme = shuffleArray([...themes[currentTheme]]).slice(0, (gridSize * gridSize) / 2);
    const shuffledCards = shuffleArray([...shuffledTheme, ...shuffledTheme]);
    
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameBoard.innerHTML = '';
    cards = shuffledCards.map(createCard);
    cards.forEach(card => gameBoard.appendChild(card));
    
    timer = setInterval(() => {
        seconds++;
        if (seconds >= timeLimit) {
            endGame(false);
        }
        updateDisplay();
    }, 1000);
    
    updatePlayersInfo();
}

function flipCard() {
    if (!gameStarted || this.classList.contains('flipped') || flippedCards.length === 2) return;
    
    this.classList.add('flipped');
    
    flippedCards.push(this);
    moves++;
    
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
    
    updateDisplay();
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.textContent === card2.textContent;
    
    if (isMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        acerto.play();
        updateScore(true);
        
        if (isTwoPlayerMode) {
            if (currentPlayer === 1) {
                player1Score++;
            } else {
                player2Score++;
            }
            updatePlayersInfo();
        }
        
        if (matchedPairs === cards.length / 2) {
            endGame(true);
        }
    } else {
        card1.classList.add('shake');
        card2.classList.add('shake');
        erro.play();
        updateScore(false);
        setTimeout(() => {
            card1.classList.remove('flipped', 'shake');
            card2.classList.remove('flipped', 'shake');
        }, 500);
        if (isTwoPlayerMode) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayersInfo();
        }
    }
    
    flippedCards = [];
}

function updateScore(isMatch) {
    const baseScore = 10;
    const timeBonus = Math.max(0, difficulties[currentDifficulty].timeLimit - seconds);
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[currentDifficulty];
    
    if (isMatch) {
        score += Math.round((baseScore + timeBonus) * difficultyMultiplier);
    } else {
        score = Math.max(0, score - Math.round(baseScore / 2));
    }
    
    updateDisplay();
}

function endGame(isWin) {
    clearInterval(timer);
    gameStarted = false;
    if (isWin) {
        
        alert(`Parabéns! Você completou o jogo em ${seconds} segundos com ${moves} movimentos e pontuação ${score}.`);
        updateLeaderboard();
    } else {
        
        alert('Tempo esgotado! Tente novamente.');
    }
}

function resetGame() {
    clearInterval(timer);
    gameStarted = false;
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    score = 0;
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    updateDisplay();
    updatePlayersInfo();
}

function updateDisplay() {
    timerDisplay.textContent = `Tempo: ${seconds}s`;
    movesDisplay.textContent = `Movimentos: ${moves}`;
    scoreDisplay.textContent = `Pontuação: ${score}`;
}

function updatePlayersInfo() {
    if (isTwoPlayerMode) {
        playersInfo.innerHTML = `
            <div class="placar-players">
                <span class="title-tow">Placar de jogadores</span>
                <div class="placas">
                <div class="player-info ${currentPlayer === 1 ? 'current-player' : ''}">Jogador 1: ${player1Score}</div>
                <div class="player-info ${currentPlayer === 2 ? 'current-player' : ''}">Jogador 2: ${player2Score}</div>
                </div>
            </div>
            
        `;
    } else {
        playersInfo.innerHTML = '';
    }
}

function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('memoryGameLeaderboard') || '[]');
    

    const nameInputContainer = document.getElementById('player-name-input');
    nameInputContainer.classList.add('show');

    
    const submitButton = document.getElementById('submit-name');
    submitButton.addEventListener('click', () => {
        const playerName = document.getElementById('player-name').value;

        if (playerName) {
            leaderboard.push({ name: playerName, score: score });
            leaderboard.sort((a, b) => b.score - a.score);
            leaderboard.splice(10); 
            
            
            localStorage.setItem('memoryGameLeaderboard', JSON.stringify(leaderboard));
            
            
            nameInputContainer.classList.remove('show');
            nameInputContainer.querySelector('input').value = '';
            
           
            displayLeaderboard();
        }
    });
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('memoryGameLeaderboard') || '[]');
    leaderboardBody.innerHTML = leaderboard.map((entry, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
        </tr>
    `).join('');
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('memoryGameLeaderboard') || '[]');
    leaderboardBody.innerHTML = leaderboard.map((entry, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
        </tr>
    `).join('');
}



startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    resetGame();
});
difficultySelect.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    resetGame();
});
toggleModeButton.addEventListener('click', () => {
    isTwoPlayerMode = !isTwoPlayerMode;
    toggleModeButton.textContent = `Modo: ${isTwoPlayerMode ? '2 Jogadores' : '1 Jogador'}`;
    resetGame();
});

displayLeaderboard();
     


