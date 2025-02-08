// Game State
const gameState = {
    score: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    lives: 10,
    timer: 120,
    timerInterval: null,
    isPaused: false,
    currentProblem: null,
    achievements: JSON.parse(localStorage.getItem('achievements')) || [],
    dailyStreak: parseInt(localStorage.getItem('dailyStreak')) || 0,
    lastPlayed: localStorage.getItem('lastPlayed') || null,
    settings: JSON.parse(localStorage.getItem('gameSettings')) || {
        difficulty: 'medium',
        questionTypes: ['diff', 'antiderivative'],
        timer: 120,
    },
    leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || [],
    powerUps: { skip: 0, doubleScore: 0, extraTime: 0 },
    stats: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 },
    milestones: {
        scoreMilestones: { 50: 'skip', 100: 'doubleScore', 200: 'extraTime' },
        streakMilestones: { 5: 'doubleScore', 10: 'extraTime', 15: 'skip' },
    },
    milestoneHistory: [], // Tracks unlocked milestones during the session
};

// Constants for DOM Elements
const domElements = {
    score: document.getElementById('score-value'),
    highScore: document.getElementById('high-score-value'),
    lives: document.getElementById('lives-value'),
    timer: document.getElementById('timer-value'),
    question: document.getElementById('equation'),
    answerInput: document.getElementById('answer'),
    submitButton: document.getElementById('submit'),
    gameOverModal: document.getElementById('gameOverModal'),
    navbar: document.getElementById('navbar-brand'),
    leaderboard: document.getElementById('leaderboard'),
    skipButton: document.getElementById('skip-button'),
    doubleScoreButton: document.getElementById('double-score-button'),
    stats: document.getElementById('stats'),
    milestoneHistory: document.getElementById('milestone-history'),
};

// Update Displayed Scores
function updateScoreDisplay() {
    const { score, highScore, lives } = gameState;
    domElements.score.textContent = `Score: ${score}`;
    domElements.lives.textContent = `Lives: ${lives}`;
    if (score > highScore) {
        gameState.highScore = score;
        localStorage.setItem('highScore', score);
    }
    domElements.highScore.textContent = `High Score: ${gameState.highScore}`;
    checkMilestones();
}

// Update Power-Ups Display
function updatePowerUpsDisplay() {
    domElements.skipButton.textContent = `Skip (${gameState.powerUps.skip})`;
    domElements.doubleScoreButton.textContent = `Double Score (${gameState.powerUps.doubleScore})`;
    domElements.extraTimeButton.textContent = `Extra Time (${gameState.powerUps.extraTime})`;
}

// Update Game Stats Display
function updateStatsDisplay() {
    const { totalQuestions, correctAnswers, incorrectAnswers } = gameState.gameStats;
    domElements.stats.textContent = `Total Questions: ${totalQuestions}, Correct: ${correctAnswers}, Incorrect: ${incorrectAnswers}`;
}

// Enhanced Game State Variables
function updateScore(value) {
    gameState.score += value;
    localStorage.setItem('score', gameState.score);
    domElements.score.textContent = `Score: ${gameState.score}`;
    checkMilestones();
}

// Check for Milestones
function checkMilestones() {
    // Check score-based milestones
    Object.keys(gameState.milestones.scoreMilestones).forEach((milestone) => {
        if (gameState.score >= milestone && gameState.milestones.scoreMilestones[milestone]) {
            const powerUp = gameState.milestones.scoreMilestones[milestone];
            unlockMilestone(milestone, powerUp, 'score');
            delete gameState.milestones.scoreMilestones[milestone];
        }
    });

    // Check streak-based milestones
    Object.keys(gameState.milestones.streakMilestones).forEach((milestone) => {
        if (gameState.gameStats.correctAnswers >= milestone && gameState.milestones.streakMilestones[milestone]) {
            const powerUp = gameState.milestones.streakMilestones[milestone];
            unlockMilestone(milestone, powerUp, 'streak');
            delete gameState.milestones.streakMilestones[milestone];
        }
    });
}
// Check for Milestones
function checkMilestones() {
    // Check score-based milestones
    Object.keys(gameState.milestones.scoreMilestones).forEach((milestone) => {
        if (gameState.score >= milestone && gameState.milestones.scoreMilestones[milestone]) {
            const powerUp = gameState.milestones.scoreMilestones[milestone];
            unlockMilestone(milestone, powerUp, 'score');
            delete gameState.milestones.scoreMilestones[milestone];
        }
    });

    // Check streak-based milestones
    Object.keys(gameState.milestones.streakMilestones).forEach((milestone) => {
        if (gameState.stats.correctAnswers >= milestone && gameState.milestones.streakMilestones[milestone]) {
            const powerUp = gameState.milestones.streakMilestones[milestone];
            unlockMilestone(milestone, powerUp, 'streak');
            delete gameState.milestones.streakMilestones[milestone];
        }
    });
}

// Unlock Milestone
function unlockMilestone(value, powerUp, type) {
    gameState.powerUps[powerUp]++;
    gameState.milestoneHistory.push({ type, value, powerUp });
    showMilestoneNotification(powerUp, type, value);
    updateMilestoneHistoryDisplay();
}

// Show Milestone Notification
function showMilestoneNotification(powerUp, type, value) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <strong>Milestone Reached!</strong><br>
        ${type.charAt(0).toUpperCase() + type.slice(1)} Milestone (${value})<br>
        Gained 1 <em>${powerUp}</em> power-up!`;
    notification.style.cssText = `
        position: fixed;
        top: 10%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #4caf50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        text-align: center;
        animation: fadeOut 3s forwards;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Update Milestone History Display
function updateMilestoneHistoryDisplay() {
    domElements.milestoneHistory.innerHTML = '<h3>Milestone History</h3>';
    gameState.milestoneHistory.forEach(({ type, value, powerUp }) => {
        const historyItem = document.createElement('div');
        historyItem.innerHTML = `<strong>${type.charAt(0).toUpperCase() + type.slice(1)} Milestone</strong> (${value}): +1 <em>${powerUp}</em>`;
        domElements.milestoneHistory.appendChild(historyItem);
    });
}
// Power-Up Usage
function usePowerUp(type) {
    if (gameState.powerUps[type] > 0) {
        gameState.powerUps[type]--;
        if (type === 'skip') newProblem();
        if (type === 'extraTime') gameState.timer += 30;
        if (type === 'doubleScore') gameState.score += 20; // Applies instantly
        updateDisplay();
    } else alert(`No ${type} power-ups left!`);
}

// Timer Functionality
function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        domElements.timer.textContent = `Time: ${gameState.timer}`;
        if (gameState.timer <= 0) {
            endGame();
        }
    }, 1000);
}

// Problem Generation
function generateProblem(type) {
    const problems = {
        diff: getDifferentiationProblems(),
        antiderivative: getIntegrationProblems(),
    };
    const selectedType = type || gameState.settings.questionTypes[Math.floor(Math.random() * gameState.settings.questionTypes.length)];
    return problems[selectedType][Math.floor(Math.random() * problems[selectedType].length)];
}

// Function to create a new problem
function newProblem() {
    const problem = generateProblem();
    // Wrap LaTeX question with delimiters
    problem.question = problem.question;
    
    // Create a Mathfield element
    const mathField = document.createElement('math-field');
    mathField.value = problem.question;
    mathField.readOnly = true; // Make the Mathfield read-only
    mathField.virtualKeyboardMode = 'off'; // Disable the virtual keyboard
    mathField.showMenu = false; // Hide the menu button
    
    // Clear the previous question and append the new Mathfield element
    domElements.question.innerHTML = '';
    domElements.question.appendChild(mathField);
    
    console.log(problem.question);
    
    domElements.answerInput.value = ''; // Clear the input field
    domElements.question.classList.remove('incorrect');
    return problem;
}


// Differentiation problems categorized by difficulty
function getDifferentiationProblems() {
    const easy = [
        { question: "\\frac{d}{dx}(x^2)", answer: "2x" },
        { question: "\\frac{d}{dx}(2x^2)", answer: "4x" },
        { question: "\\frac{d}{dx}(3x^2)", answer: "6x" },
        { question: "\\frac{d}{dx}(x)", answer: "1" },
        { question: "\\frac{d}{dx}(8)", answer: "0" },
        { question: "\\frac{d}{dx}(15)", answer: "0" },
        { question: "\\frac{d}{dx}(20x)", answer: "20" },
        { question: "\\frac{d}{dx}(12x^2)", answer: "24x" },
    ];

    const medium = [
        { question: "\\frac{d}{dx}(4x^3)", answer: "12x^2" },
        { question: "\\frac{d}{dx}(13x^4)", answer: "52x^3"},
        { question: "\\frac{d}{dx}(7x^5)", answer: "35x^4" },
        { question: "\\frac{d}{dx}(9x^6)", answer: "54x^5" },
        { question: "\\frac{d}{dx}(11x^7)", answer: "77x^6" },
        { question: "\\frac{d}{dx}(5x^8)", answer: "40x^7" },
        { question: "\\frac{d}{dx}(3x^9)", answer: "27x^8" },
        { question: "\\frac{d}{dx}(2x^{10})", answer: "20x^9" },
        { question: "\\frac{d}{dx}(x^{11})", answer: "11x^{10}" },
        { question: "\\frac{d}{dx}(x^2 + 2x)", answer: "2x+2" },
        { question: "\\frac{d}{dx}(2x^2 + 4x)", answer: "4x+4" },
        { question: "\\frac{d}{dx}(3x^2 + 6x)", answer: "6x+6" },
        { question: "\\frac{d}{dx}(x + 2x^2)", answer: "1+4x" },
        { question: "\\frac{d}{dx}(2x + 4x^2)", answer: "2+8x" },
        { question: "\\frac{d}{dx}(3x + 6x^2)", answer: "3+12x" },
        { question: "\\frac{d}{dx}(4x^2 + 8x)", answer: "8x+8" },
        { question: "\\frac{d}{dx}(5x^2 + 10x)", answer: "10x+10" },
        { question: "\\frac{d}{dx}(6x^2 + 12x)", answer: "12x+12" },
        { question: "\\frac{d}{dx}(7x^2 + 14x)", answer: "14x+14" },
        { question: "\\frac{d}{dx}(8x^2 + 16x)", answer: "16x+16" },
        { question: "\\frac{d}{dx}(9x^2 + 18x)", answer: "18x+18" },
        { question: "\\frac{d}{dx}(10x^2 + 20x)", answer: "20x+20" },
        { question: "\\frac{d}{dx}(11x^2 + 22x)", answer: "22x+22" },
        { question: "\\frac{d}{dx}(12x^2 + 24x)", answer: "24x+24" },
        { question: "\\frac{d}{dx}(13x^2 + 26x)", answer: "26x+26" },
        { question: "\\frac{d}{dx}(14x^2 + 28x)", answer: "28x+28" },
        { question: "\\frac{d}{dx}(6x^3)", answer: "18x^2" },
        { question: "\\frac{d}{dx}(3x^4)", answer: "12x^3" },
        { question: "\\frac{d}{dx}(x^3)", answer: "3x^2" },
    ];

    const hard = [
        { question: "\\frac{d}{dx}(x^{10})", answer: "10x^9" },
        { question: "\\frac{d}{dx}(x^{11})", answer: "11x^{10}" },
        { question: "\\frac{d}{dx}(e^x)", answer: "e^x" },
        { question: "\\frac{d}{dx}(sin(x))", answer: "cos(x)" },
        { question: "\\frac{d}{dx}(cos(x))", answer: "-sin(x)" },
        { question: "\\frac{d}{dx}(tan(x))", answer: "sec^2(x)" },
        { question: "\\frac{d}{dx}(ln(x))", answer: "\\frac{1}{x}" },
        { question: "\\frac{d}{dx}(e^{2x})", answer: "2e^{2x}" },
        { question: "\\frac{d}{dx}(sin(2x))", answer: "2cos(2x)" },
        { question: "\\frac{d}{dx}(cos(2x))", answer: "-2sin(2x)" },
        { question: "\\frac{d}{dx}(tan(2x))", answer: "2sec^2(2x)" },
        { question: "\\frac{d}{dx}(ln(2x))", answer: "\\frac{1}{x}" },
        { question: "\\frac{d}{dx}(e^{3x})", answer: "3e^{3x}" },
        { question: "\\frac{d}{dx}(sin(3x))", answer: "3cos(3x)" },
        { question: "\\frac{d}{dx}(cos(3x))", answer: "-3sin(3x)" },
        { question: "\\frac{d}{dx}(tan(3x))", answer: "3sec^2(3x)" },
        { question: "\\frac{d}{dx}(ln(3x))", answer: "\\frac{1}{x}" },
        { question: "\\frac{d}{dx}(e^{4x})", answer: "4e^{4x}" },
        { question: "\\frac{d}{dx}(sin(4x))", answer: "4cos(4x)" },
        { question: "\\frac{d}{dx}(cos(4x))", answer: "-4sin(4x)" },
        { question: "\\frac{d}{dx}(tan(4x))", answer: "4sec^2(4x)" },
        { question: "\\frac{d}{dx}(ln(4x))", answer: "\\frac{1}{x}" },
        { question: "\\frac{d}{dx}(e^{5x})", answer: "5e^{5x}" },
        { question: "\\frac{d}{dx}(sin(5x))", answer: "5cos(5x)" },
        { question: "\\frac{d}{dx}(x^5 + 5)", answer: "5x^4" },
        { question: "\\frac{d}{dx}(x^6 - 3x^2 + 2)", answer: "6x^5-6x" },
        { question: "\\frac{d}{dx}(x^7 + 2x^3 + 3)", answer: "7x^6+6x^2" },
        { question: "\\frac{d}{dx}(x^8 - 4x^4 + 5)", answer: "8x^7-16x^3" },
        { question: "\\frac{d}{dx}(x^9 + 3x^5 + 7)", answer: "9x^8+15x^4" },
        { question: "\\frac{d}{dx}(x^{10} - 2x^6 + 9)", answer: "10x^9-12x^5" },
        { question: "\\frac{d}{dx}(x^{11} + 4x^7 + 11)", answer: "11x^{10}+28x^6" },
        { question: "\\frac{d}{dx}(x^{12} - 3x^8 + 13)", answer: "12x^{11}-24x^7" },
        { question: "\\frac{d}{dx}(x^{13} + 5x^9 + 17)", answer: "13x^{12}+45x^8" },
        { question: "\\frac{d}{dx}(x^{14} - 2x^{10} + 19)", answer: "14x^{13}-20x^9" },
        { question: "\\frac{d}{dx}(x^{15} + 3x^{11} + 23)", answer: "15x^{14}+33x^{10}" },
        { question: "\\frac{d}{dx}(x^{16} - 4x^{12} + 29)", answer: "16x^{15}-48x^{11}" },
        { question: "\\frac{d}{dx}(x^{17} + 5x^{13} + 31)", answer: "17x^{16}+65x^{12}" },
        { question: "\\frac{d}{dx}(x^{18} - 2x^{14} + 37)", answer: "18x^{17}-28x^{13}" },
        { question: "\\frac{d}{dx}(x^{19} + 3x^{15} + 41)", answer: "19x^{18}+45x^{14}" },
        { question: "\\frac{d}{dx}(x^{20} - 4x^{16} + 43)", answer: "20x^{19}-64x^{15}" },
        { question: "\\frac{d}{dx}(x^{21} + 5x^{17} + 47)", answer: "21x^{20}+85x^{16}" },
        { question: "\\frac{d}{dx}(x^{22} - 2x^{18} + 53)", answer: "22x^{21}-36x^{17}" },
        { question: "\\frac{d}{dx}(x^{23} + 3x^{19} + 59)", answer: "23x^{22}+57x^{18}" },
        { question: "\\frac{d}{dx}(x^{24} - 4x^{20} + 61)", answer: "24x^{23}-80x^{19}" },
        { question: "\\frac{d}{dx}(x^{25} + 5x^{21} + 67)", answer: "25x^{24}+105x^{20}" },
        { question: "\\frac{d}{dx}(x^{26} - 2x^{22} + 71)", answer: "26x^{25}-44x^{21}" },
        { question: "\\frac{d}{dx}(x^{27} + 3x^{23} + 73)", answer: "27x^{26}+69x^{22}" },
        { question: "\\frac{d}{dx}(x^{28} - 4x^{24} + 79)", answer: "28x^{27}-96x^{23}" },
        { question: "\\frac{d}{dx}(x^{29} + 5x^{25} + 83)", answer: "29x^{28}+125x^{24}" },
        { question: "\\frac{d}{dx}(x^{30} - 2x^{26} + 89)", answer: "30x^{29}-52x^{25}" },
        { question: "\\frac{d}{dx}(x^{31} + 3x^{27} + 97)", answer: "31x^{30}+81x^{26}" },
        { question: "\\frac{d}{dx}(x^{32} - 4x^{28} + 101)", answer: "32x^{31}-112x^{27}" },
        { question: "\\frac{d}{dx}(x^{33} + 5x^{29} + 103)", answer: "33x^{32}+145x^{28}" },
        { question: "\\frac{d}{dx}(x^{34} - 2x^{30} + 107)", answer: "34x^{33}-60x^{29}" },
        { question: "\\frac{d}{dx}(x^{35} + 3x^{31} + 109)", answer: "35x^{34}+93x^{30}" },
        { question: "\\frac{d}{dx}(x^{36} - 4x^{32} + 113)", answer: "36x^{35}-128x^{31}" },
        { question: "\\frac{d}{dx}(x^{37} + 5x^{33} + 127)", answer: "37x^{36}+165x^{32}" },
        { question: "\\frac{d}{dx}(x^{38} - 2x^{34} + 131)", answer: "38x^{37}-68x^{33}" },
        { question: "\\frac{d}{dx}(x^{39} + 3x^{35} + 137)", answer: "39x^{38}+105x^{34}" },
        { question: "\\frac{d}{dx}(x^{40} - 4x^{36} + 139)", answer: "40x^{39}-144x^{35}" },
        { question: "\\frac{d}{dx}(x^{41} + 5x^{37} + 149)", answer: "41x^{40}+185x^{36}" },
        { question: "\\frac{d}{dx}(x^{42} - 2x^{38} + 151)", answer: "42x^{41}-76x^{37}" },
        { question: "\\frac{d}{dx}(x^{43} + 3x^{39} + 157)", answer: "43x^{42}+117x^{38}" },
        { question: "\\frac{d}{dx}(x^{44} - 4x^{40} + 163)", answer: "44x^{43}-160x^{39}" },
        { question: "\\frac{d}{dx}(x^{45} + 5x^{41} + 167)", answer: "45x^{44}+205x^{40}" },
        { question: "\\frac{d}{dx}(x^{46} - 2x^{42} + 173)", answer: "46x^{45}-84x^{41}" },
        { question: "\\frac{d}{dx}(x^{47} + 3x^{43} + 179)", answer: "47x^{46}+129x^{42}" },
        { question: "\\frac{d}{dx}(x^{48} - 4x^{44} + 181)", answer: "48x^{47}-176x^{43}" },
        { question: "\\frac{d}{dx}(x^{49} + 5x^{45} + 191)", answer: "49x^{48}+225x^{44}" },
    ];
    const insane = [
        { question: "\\frac{d}{dx}(x^2e^x)", answer: "2xe^x + x^2e^x" },
        { question: "\\frac{d}{dx}(\\ln(x^2 + 1))", answer: "\\frac{2x}{x^2 + 1}" },
        { question: "\\frac{d}{dx}(\\sin(x^3))", answer: "3x^2\\cos(x^3)" },
        { question: "\\frac{d}{dx}(\\tan(2x))", answer: "2\\sec^2(2x)" },
        { question: "\\frac{d}{dx}(e^{x^2})", answer: "2xe^{x^2}" },
        { question: "\\frac{d}{dx}(x^3\\ln(x))", answer: "3x^2\\ln(x) + x^2" },
        { question: "\\frac{d}{dx}(\\frac{x}{x^2 + 1})", answer: "\\frac{1 - x^2}{(x^2 + 1)^2}" },
        { question: "\\frac{d}{dx}(\\sqrt{x^4 + 2})", answer: "\\frac{4x^3}{2\\sqrt{x^4 + 2}}" },
        { question: "\\frac{d}{dx}(\\cos^2(x))", answer: "-2\\cos(x)\\sin(x)" },
        { question: "\\frac{d}{dx}(x^x)", answer: "x^x(\\ln(x) + 1)" },
        { question: "\\frac{d}{dx}(\\arcsin(x^2))", answer: "\\frac{2x}{\\sqrt{1 - x^4}}" },
        { question: "\\frac{d}{dx}(\\ln(\\sin(x)))", answer: "\\cot(x)" },
    ];

    const impossible = [
        { question: "\\frac{d}{dx}(x^x^x)", answer: "No elementary solution" },
        { question: "\\frac{d}{dx}(e^{e^x})", answer: "e^{e^x}e^x" },
        { question: "\\frac{d}{dx}(\\ln(\\ln(\\ln(x))))", answer: "\\frac{1}{\\ln(\\ln(x))\\ln(x)x}" },
        { question: "\\frac{d}{dx}(\\sin(\\cos(\\tan(x))))", answer: "-\\cos(\\cos(\\tan(x)))\\sin(\\tan(x))\\sec^2(x)" },
        { question: "\\frac{d}{dx}(x^{x^2})", answer: "x^{x^2}(2x\\ln(x) + 1)" },
        { question: "\\frac{d}{dx}(\\arctan(\\sqrt{x^2 + 1}))", answer: "\\frac{x}{(x^2 + 1)\\sqrt{x^2 + 1}}" },
        { question: "\\frac{d}{dx}(e^{x\\sin(x)})", answer: "e^{x\\sin(x)}(\\sin(x) + x\\cos(x))" },
    ];

    const legend = [
        { question: "\\frac{d}{dx}(\\sin(x^2)\\cos(x^3))", answer: "2x\\cos(x^2)\\cos(x^3) - 3x^2\\sin(x^2)\\sin(x^3)" },
        { question: "\\frac{d}{dx}(\\sqrt{x^3 + e^x})", answer: "\\frac{3x^2 + e^x}{2\\sqrt{x^3 + e^x}}" },
        { question: "\\frac{d}{dx}(\\frac{x^3}{\\sin(x)})", answer: "\\frac{3x^2\\sin(x) - x^3\\cos(x)}{\\sin^2(x)}" },
        { question: "\\frac{d}{dx}(\\arcsin(x)\\cdot\\arctan(x))", answer: "\\arctan(x)\\sqrt{1 - x^2} + \\arcsin(x)/(1 + x^2)" },
    ];

    const goat = [
        { question: "\\frac{d}{dx}(x^2\\ln(x^2\\sin(x)))", answer: "2x\\ln(x^2\\sin(x)) + 2x\\cot(x) + 2x" },
        { question: "\\frac{d}{dx}(\\sin^2(x^2)\\cos^2(x^3))", answer: "4x\\cos(x^2)\\sin(x^2)\\cos^2(x^3) - 6x^2\\sin^2(x^2)\\sin(x^3)\\cos(x^3)" },
        { question: "\\frac{d}{dx}(\\ln(x\\cos(x))^x)", answer: "\\ln(x\\cos(x))^x(\\ln(\\ln(x\\cos(x))) + \\cot(x) + 1/x)" },
        { question: "\\frac{d}{dx}(\\tan(x)^{\\tan(x)})", answer: "\\tan(x)^{\\tan(x)}(\\ln(\\tan(x))\\sec^2(x) + \\tan(x))" },
        { question: "\\frac{d}{dx}(e^{x\\sin(x^2)})", answer: "e^{x\\sin(x^2)}(\\sin(x^2) + 2x^2\\cos(x^2))" },
        { question: "\\frac{d}{dx}(x\\uparrow\\uparrow x)", answer: "x\\uparrow\\uparrow x(\\ln(x) + x)" },
        { question: "\\frac{d}{dx}((x\\uparrow\\uparrow x)^x)", answer: "(x\\uparrow\\uparrow x)^x(\\ln(x\\uparrow\\uparrow x) + x\\ln(x))" },
        { question: "\\frac{d}{dx}(\\ln(x)\\uparrow\\uparrow x)", answer: "(\\ln(x)\\uparrow\\uparrow x)(\\frac{1}{x} + x\\ln(\\ln(x)))" },
    ];

    return { easy, medium, hard, insane, impossible, legend, goat };
}

// Integration problems categorized by difficulty
function getIntegrationProblems() {
    const easy = [
        { question: "\\int x \\, dx", answer: "\\frac{x^2}{2}+C" },
        { question: "\\int 5 \\, dx", answer: "5x+C" },
    ];

    const medium = [
        { question: "\\int 4x^3 \\, dx", answer: "x^4+C" },
        { question: "\\int x^4 \\, dx", answer: "\\frac{x^5}{5}+C" },
        { question: "\\int x^3 + 2x \\, dx", answer: "\\frac{x^4}{4}+x^2+C" },
        { question: "\\int 8x^2 \\, dx", answer: "\\frac{8x^3}{3}+C" },
        { question: "\\int 20x^3 \\, dx", answer: "5x^4+C" },
        { question: "\\int 50x^3 \\, dx", answer: "25x^4+C" },
    ];

    const hard = [
        { question: "\\int x^5 + 3 \\, dx", answer: "\\frac{x^6}{6}+3x+C" },
        { question: "\\int e^{-x} \\cdot \\cos(x) \\, dx", answer: "\\frac{-e^{-x}(\\cos(x) + \\sin(x))}{2} + C" },
        { question: "\\int \\frac{x}{x^2 + 1} \\, dx", answer: "0.5\\ln(x^2 + 1) + C" },
        { question: "\\int x^2 \\cdot e^{x^2} \\, dx", answer: "\\frac{1}{2}e^{x^2}(x^2 - 1) + C" },
        { question: "\\int x^3 \\, dx", answer: "\\frac{x^4}{4} + C" },
        { question: "\\int \\sec(x)^2 \\, dx", answer: "\\tan(x) + C" },
        { question: "\\int x \\cdot e^x \\, dx", answer: "(x - 1)e^x + C" },
    ];

    const insane = [
        { question: "\\int \\frac{e^x}{1 + e^{2x}} \\, dx", answer: "\\frac{1}{2}\\ln|1 + e^{2x}| + C" },
        { question: "\\int \\frac{\\ln(x)}{x} \\, dx", answer: "\\frac{(\\ln(x))^2}{2} + C" },
        { question: "\\int x^2 \\cdot e^{-x^2} \\, dx", answer: "-\\frac{1}{2}e^{-x^2}(x^2 + 1) + C" },
        { question: "\\int \\frac{1}{\\sqrt{x^4 + 1}} \\, dx", answer: "Elliptic substitution required" },
        { question: "\\int \\sin(x^2) \\, dx", answer: "Requires Fresnel functions" },
        { question: "\\int e^x \\sin(x) \\, dx", answer: "\\frac{1}{2}e^x(\\sin(x) - \\cos(x)) + C" },
        { question: "\\int \\frac{1}{x \\ln(x)} \\, dx", answer: "\\ln|\\ln(x)| + C" },
        { question: "\\int \\frac{x}{\\sqrt{x^2 + a^2}} \\, dx", answer: "\\sqrt{x^2 + a^2} - a\\ln(x + \\sqrt{x^2 + a^2}) + C" },
        { question: "\\int x \\arcsin(x) \\, dx", answer: "\\frac{x \\arcsin(x)}{2} - \\frac{\\sqrt{1 - x^2}}{2} + C" },
        { question: "\\int \\tan(x)^2 \\, dx", answer: "\\tan(x) - x + C" },
    ];

    const impossible = [
        { question: "\\int e^{x^2} \\, dx", answer: "No elementary solution" },
        { question: "\\int \\frac{1}{\\ln(x)} \\, dx", answer: "No elementary solution" },
        { question: "\\int \\sin(x^2) \\cdot e^{x^3} \\, dx", answer: "No elementary solution" },
        { question: "\\int \\sqrt{\\tan(x)} \\, dx", answer: "No elementary solution" },
        { question: "\\int x^x \\, dx", answer: "No elementary solution" },
        { question: "\\int \\sqrt{x^4 + 1} \\, dx", answer: "No elementary solution" },
        { question: "\\int e^{x^2} \\cdot \\ln(x) \\, dx", answer: "No elementary solution" },
        { question: "\\int \\frac{1}{\\sqrt{x^5 + 1}} \\, dx", answer: "No elementary solution" },
        { question: "\\int \\arctan(x^2) \\, dx", answer: "No elementary solution" },
        { question: "\\int \\ln(x^2 + 1) \\, dx", answer: "No elementary solution" },
    ];

    return { easy, medium, hard, insane, impossible };
}


// Display New Problem
function displayProblem() {
    gameState.currentProblem = newProblem();
    const { question } = gameState.currentProblem;
    const mathField = createMathField(question);
    domElements.question.innerHTML = '';
    domElements.question.appendChild(mathField);
    domElements.answerInput.value = '';
    gameState.gameStats.totalQuestions++;
    updateStatsDisplay();
    updateTimer();
}

// Create MathField Element
function createMathField(content) {
    const mathField = document.createElement('math-field');
    mathField.value = content;
    mathField.readOnly = true;
    mathField.virtualKeyboardMode = 'off';
    mathField.showMenu = false;
    return mathField;
}


// Answer Validation
function validateAnswer() {
    const userAnswer = domElements.answerInput.value.trim();
    const correctAnswer = gameState.currentProblem.answer.trim();
    if (userAnswer === correctAnswer) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    gameState.score += 10;
    gameState.timer += 10;
    correctSound.play();
    gameState.gameStats.correctAnswers++;
    updateScoreDisplay();
    displayProblem();
}

function handleIncorrectAnswer() {
    gameState.lives--;
    wrongSound.play();
    gameState.gameStats.incorrectAnswers++;
    updateScoreDisplay();
    if (gameState.lives <= 0) endGame();
}

// Adjust Game Difficulty
function adjustGameDifficulty(difficulty) {
    switch (difficulty) {
        case "easy":
            gameState.timer += 30;
            gameState.lives = 15;
            break;
        case "medium":
            gameState.timer += 25;
            gameState.lives = 10;
            break;
        case "hard":
            gameState.timer += 20;
            gameState.lives = 5;
            break;
        case "insane":
            gameState.timer += 20;
            gameState.lives = 4;
            break;
        case "impossible":
            gameState.timer += 20;
            gameState.lives = 3;
            break;
        case "legend":
            gameState.timer += 20;
            gameState.lives = 2;
            break;
        case "goat":
            gameState.timer += 20;
            gameState.lives = 1;
            break;
        default:
            console.error("Unknown difficulty level.");
    }
}

function updateTimer() {
    domElements.timer.textContent = `Time: ${gameState.timer}`;
    if (gameState.timer <= 0) {
        endGame();
    }
}
// End Game
function endGame() {
    clearInterval(gameState.timerInterval);
    const finalScore = gameState.score;
    const gameOverMessage = `Game Over! Final Score: ${finalScore}`;
    domElements.question.textContent = gameOverMessage;
    domElements.gameOverModal.style.display = 'block';
    updateLeaderboard(finalScore);
}

function updateLeaderboard(score) {
    const newEntry = { score, timestamp: new Date().toISOString() };
    gameState.leaderboard.push(newEntry);
    gameState.leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(gameState.leaderboard.slice(0, 10))); // Store only the top 10 scores
    displayLeaderboard();
}

function displayLeaderboard() {
    domElements.leaderboard.innerHTML = '<h3>Leaderboard</h3>';
    const topScores = gameState.leaderboard.slice(0, 10); // Display only the top 10 scores
    topScores.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        const formattedTimestamp = new Date(entry.timestamp).toLocaleString();
        entryElement.textContent = `${index + 1}. Score: ${entry.score} - ${formattedTimestamp}`;
        domElements.leaderboard.appendChild(entryElement);
    });
}

// Event Listeners
domElements.submitButton.addEventListener('click', validateAnswer);
domElements.skipButton.addEventListener('click', useSkip);
domElements.doubleScoreButton.addEventListener('click', useDoubleScore);
document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    const defaultTimer = 120;
    gameState.timer = gameState.settings.timer || defaultTimer;
    updateScoreDisplay();
    updatePowerUpsDisplay();
    startTimer();
    displayProblem();
    displayLeaderboard();
    updateStatsDisplay();
    adjustGameDifficulty(gameState.settings.difficulty);
}

// Shuffle Array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Save settings to localStorage and navigate to game page
const settingsForm = document.getElementById('settings-form');
const startGameButton = document.getElementById('startGame');

// Load settings from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || {
        diff: true,
        int: false,
        time: 60,
        difficulty: 1,
    };
    settingsForm.diffCheckbox.checked = savedSettings.diff;
    settingsForm.intCheckbox.checked = savedSettings.int;
    settingsForm.timeSlider.value = savedSettings.time;
    settingsForm.difficultySlider.value = savedSettings.difficulty;
    document.getElementById('timeValue').textContent = `${settingsForm.timeSlider.value} seconds`;
    document.getElementById('difficultyValue').textContent = settingsForm.difficultySlider.value;
});

// Save settings on Start Game
startGameButton.addEventListener('click', (e) => {
    e.preventDefault();
    const settings = {
        diff: settingsForm.diffCheckbox.checked,
        int: settingsForm.intCheckbox.checked,
        time: parseInt(settingsForm.timeSlider.value),
        difficulty: parseInt(settingsForm.difficultySlider.value),
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    gameState.settings = settings;
    window.location.href = 'game.html';
});