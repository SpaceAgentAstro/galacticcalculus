// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global Firebase variables (provided by Canvas environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebase App and Services instances
let app;
let auth;
let db;
let userId = null; // To store the current user's ID

// Game State
const gameState = {
    score: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0, // Local storage for initial high score
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
    leaderboard: [], // Leaderboard will be fetched from Firestore
    powerUps: { skip: 0, doubleScore: 0, extraTime: 0 },
    stats: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0, gamesPlayed: 0 },
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
    question: document.getElementById('equation'), // This will now correctly reference the <math-field>
    answerInput: document.getElementById('answer'),
    submitButton: document.getElementById('submit'),
    gameOverModal: document.getElementById('gameOverModal'),
    navbar: document.getElementById('navbar-brand'), // This might need adjustment based on index.html
    leaderboardTableBody: document.getElementById('leaderboard-table-body'),
    skipButton: document.getElementById('skip-button'),
    doubleScoreButton: document.getElementById('double-score-button'),
    totalQuestions: document.getElementById('total-questions'),
    correctAnswers: document.getElementById('correct-answers'),
    incorrectAnswers: document.getElementById('incorrect-answers'),
    finalScore: document.getElementById('final-score'),
    restartGameButton: document.getElementById('restart-game'),
    // Auth related elements
    authLinks: document.getElementById('auth-links'),
    profileUsername: document.getElementById('username-display'),
    profileEmail: document.getElementById('email-display'),
    profileHighScore: document.getElementById('profile-high-score'),
    profileGamesPlayed: document.getElementById('games-played'),
    logoutButton: document.getElementById('logout'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    // Solution Modal elements
    solutionModal: document.getElementById('solutionModal'),
    solutionContent: document.getElementById('solutionContent'),
    closeSolutionModal: document.getElementById('close-solution-modal'),
    solutionLoading: document.getElementById('solutionLoading'), // New element for loading indicator
};

// Helper function to show a custom modal message
function showMessageModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <button class="btn secondary close-modal">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    modal.style.display = 'block'; // Show the modal
}

// Update Displayed Scores
function updateScoreDisplay() {
    const { score, highScore, lives } = gameState;
    if (domElements.score) domElements.score.textContent = score;
    if (domElements.lives) domElements.lives.textContent = lives;

    if (score > highScore) {
        gameState.highScore = score;
        localStorage.setItem('highScore', score); // Update local storage
    }
    if (domElements.highScore) domElements.highScore.textContent = gameState.highScore;
    checkMilestones();
}

// Update Power-Ups Display
function updatePowerUpsDisplay() {
    if (domElements.skipButton) domElements.skipButton.textContent = `Skip (${gameState.powerUps.skip})`;
    if (domElements.doubleScoreButton) domElements.doubleScoreButton.textContent = `Double Score (${gameState.powerUps.doubleScore})`;
    // Extra time button might not exist in game.html, check for it
    const extraTimeButton = document.getElementById('extra-time-button'); // Assuming an ID for this button
    if (extraTimeButton) extraTimeButton.textContent = `Extra Time (${gameState.powerUps.extraTime})`;
}

// Update Game Stats Display
function updateStatsDisplay() {
    const { totalQuestions, correctAnswers, incorrectAnswers } = gameState.stats;
    if (domElements.totalQuestions) domElements.totalQuestions.textContent = totalQuestions;
    if (domElements.correctAnswers) domElements.correctAnswers.textContent = correctAnswers;
    if (domElements.incorrectAnswers) domElements.incorrectAnswers.textContent = incorrectAnswers;
}

// Enhanced Game State Variables
function updateScore(value) {
    gameState.score += value;
    localStorage.setItem('score', gameState.score); // Update local storage for score
    if (domElements.score) domElements.score.textContent = gameState.score;
    checkMilestones();
}

// Check for Milestones
function checkMilestones() {
    // Check score-based milestones
    Object.keys(gameState.milestones.scoreMilestones).forEach((milestone) => {
        if (gameState.score >= milestone && gameState.milestones.scoreMilestones[milestone]) {
            const powerUp = gameState.milestones.scoreMilestones[milestone];
            unlockMilestone(milestone, powerUp, 'score');
            delete gameState.milestones.scoreMilestones[milestone]; // Remove milestone once unlocked
        }
    });

    // Check streak-based milestones
    Object.keys(gameState.milestones.streakMilestones).forEach((milestone) => {
        if (gameState.stats.correctAnswers >= milestone && gameState.milestones.streakMilestones[milestone]) {
            const powerUp = gameState.milestones.streakMilestones[milestone];
            unlockMilestone(milestone, powerUp, 'streak');
            delete gameState.milestones.streakMilestones[milestone]; // Remove milestone once unlocked
        }
    });
}

// Unlock Milestone
function unlockMilestone(value, powerUp, type) {
    gameState.powerUps[powerUp]++;
    gameState.milestoneHistory.push({ type, value, powerUp });
    showMilestoneNotification(powerUp, type, value);
    updatePowerUpsDisplay(); // Update power-up count on display
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

// Power-Up Usage functions
function useSkip() {
    usePowerUp('skip');
}

function useDoubleScore() {
    usePowerUp('doubleScore');
}

function useExtraTime() {
    usePowerUp('extraTime');
}

// Power-Up Usage
function usePowerUp(type) {
    if (gameState.powerUps[type] > 0) {
        gameState.powerUps[type]--;
        if (type === 'skip') newProblem();
        if (type === 'extraTime') gameState.timer += 30;
        if (type === 'doubleScore') gameState.score += 20; // Applies instantly
        updateDisplay();
    } else {
        showMessageModal(`No ${type} power-ups left!`);
    }
}

// Update all display elements
function updateDisplay() {
    updateScoreDisplay();
    updatePowerUpsDisplay();
    updateStatsDisplay();
    updateTimer();
}

// Timer Functionality
function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        if (domElements.timer) domElements.timer.textContent = gameState.timer;
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
    const difficultyLevel = parseInt(gameState.settings.difficulty); // Ensure difficulty is a number

    let problemSet;
    switch (difficultyLevel) {
        case 1: problemSet = problems[selectedType].easy; break;
        case 2: problemSet = problems[selectedType].medium; break;
        case 3: problemSet = problems[selectedType].hard; break;
        case 4: problemSet = problems[selectedType].insane; break;
        case 5: problemSet = problems[selectedType].impossible; break;
        case 6: problemSet = problems[selectedType].legend; break;
        case 7: problemSet = problems[selectedType].goat; break;
        case 8: problemSet = [...problems[selectedType].easy, ...problems[selectedType].medium, ...problems[selectedType].hard, ...problems[selectedType].insane, ...problems[selectedType].impossible, ...problems[selectedType].legend, ...problems[selectedType].goat]; shuffleArray(problemSet); break;
        default: problemSet = problems[selectedType].easy; // Default to easy
    }

    if (!problemSet || problemSet.length === 0) {
        console.error("No problems found for selected type and difficulty. Defaulting to easy differentiation.");
        return problems['diff'].easy[0]; // Fallback to a default problem
    }

    return problemSet[Math.floor(Math.random() * problemSet.length)];
}

// Function to create a new problem
function newProblem() {
    const problem = generateProblem();
    // Update the MathLive element's value directly
    if (domElements.question) {
        domElements.question.value = problem.question;
    }

    console.log(problem.question);

    if (domElements.answerInput) domElements.answerInput.value = ''; // Clear the input field
    if (domElements.question) domElements.question.classList.remove('incorrect');
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
    if (domElements.answerInput) domElements.answerInput.value = '';
    gameState.stats.totalQuestions++;
    updateStatsDisplay();
    updateTimer();
}

// Answer Validation
function validateAnswer() {
    const userAnswer = domElements.answerInput ? domElements.answerInput.value.trim() : '';
    const correctAnswer = gameState.currentProblem ? gameState.currentProblem.answer.trim() : '';

    if (userAnswer === correctAnswer) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    gameState.score += 10;
    gameState.timer += 10;
    const correctSound = document.getElementById('correctSound');
    if (correctSound) correctSound.play();
    gameState.stats.correctAnswers++;
    updateScoreDisplay();
    displayProblem();
}

async function handleIncorrectAnswer() {
    gameState.lives--;
    const wrongSound = document.getElementById('wrongSound');
    if (wrongSound) wrongSound.play();
    gameState.stats.incorrectAnswers++;
    updateScoreDisplay();

    // Show step-by-step solution
    if (gameState.currentProblem) {
        await getStepByStepSolution(gameState.currentProblem);
    }

    if (gameState.lives <= 0) endGame();
}

// AI Step-by-Step Solution
async function getStepByStepSolution(problem) {
    if (!domElements.solutionModal || !domElements.solutionContent || !domElements.solutionLoading) {
        console.error("Solution modal elements not found.");
        return;
    }

    domElements.solutionContent.innerHTML = ''; // Clear previous content
    domElements.solutionLoading.style.display = 'block'; // Show loading indicator
    domElements.solutionModal.style.display = 'block'; // Show the modal

    const prompt = `Provide a step-by-step solution for the following calculus problem.
    Question: ${problem.question}
    Correct Answer: ${problem.answer}
    Please explain each step clearly. Provide the solution in LaTeX format, wrapped in $$...$$ for display by MathLive.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        // The API key is automatically provided by the Canvas environment at runtime.
        // Do NOT hardcode your API key here or try to fetch it from an external source.
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        domElements.solutionLoading.style.display = 'none'; // Hide loading indicator

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const solutionText = result.candidates[0].content.parts[0].text;
            
            // Create a Mathfield element for the solution content
            const solutionMathField = document.createElement('math-field');
            solutionMathField.value = solutionText;
            solutionMathField.readOnly = true;
            solutionMathField.virtualKeyboardMode = 'off';
            solutionMathField.showMenu = false;
            domElements.solutionContent.appendChild(solutionMathField);

        } else {
            domElements.solutionContent.innerHTML = '<p>Could not generate a solution. Please try again.</p>';
            console.error("Unexpected API response structure:", result);
        }
    } catch (error) {
        domElements.solutionLoading.style.display = 'none'; // Hide loading indicator
        domElements.solutionContent.innerHTML = '<p>Error fetching solution. Please check your network connection.</p>';
        console.error("Error fetching solution from LLM:", error);
    }
}

// Adjust Game Difficulty
function adjustGameDifficulty(difficulty) {
    let difficultyName;
    switch (difficulty) {
        case 1: difficultyName = 'easy'; break;
        case 2: difficultyName = 'medium'; break;
        case 3: difficultyName = 'hard'; break;
        case 4: difficultyName = 'insane'; break;
        case 5: difficultyName = 'impossible'; break;
        case 6: difficultyName = 'legend'; break;
        case 7: difficultyName = 'goat'; break;
        case 8: difficultyName = 'mixed'; break;
        default: difficultyName = 'easy';
    }

    // Apply initial game parameters based on difficulty selected
    // Note: These values might be overridden if specific settings are loaded from localStorage
    switch (difficultyName) {
        case "easy":
            // Initial lives for easy
            gameState.lives = 15;
            break;
        case "medium":
            // Initial lives for medium
            gameState.lives = 10;
            break;
        case "hard":
            // Initial lives for hard
            gameState.lives = 5;
            break;
        case "insane":
            gameState.lives = 4;
            break;
        case "impossible":
            gameState.lives = 3;
            break;
        case "legend":
            gameState.lives = 2;
            break;
        case "goat":
            gameState.lives = 1;
            break;
        case "mixed":
            // Lives are not specifically adjusted for mixed, relies on default or prior settings
            break;
        default:
            console.error("Unknown difficulty level.");
    }
    // Timer is set from settings.time in initializeGame, not here.
}


function updateTimer() {
    if (domElements.timer) domElements.timer.textContent = gameState.timer;
    if (gameState.timer <= 0) {
        endGame();
    }
}

// End Game
async function endGame() {
    clearInterval(gameState.timerInterval);
    const finalScore = gameState.score;

    if (domElements.gameOverModal) {
        document.getElementById('game').style.display = 'none';
        domElements.gameOverModal.style.display = 'block';
        if (domElements.finalScore) domElements.finalScore.textContent = finalScore;
    }

    gameState.stats.gamesPlayed++;

    // Save user data and update leaderboard if user is authenticated
    if (userId) {
        await saveUserData(userId);
    }
    await updateLeaderboard(finalScore);
}

// Firebase Auth Functions

/**
 * Signs up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
async function signUpUser(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed up:", user.uid);
        // Save initial user data to Firestore
        await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/private/data/profile`), {
            username: username,
            email: user.email,
            highScore: 0,
            gamesPlayed: 0,
            createdAt: new Date().toISOString()
        });
        showMessageModal("Sign up successful! Welcome, " + username + "!");
        window.location.href = 'profile.html'; // Redirect to profile page after signup
    } catch (error) {
        console.error("Error signing up:", error);
        showMessageModal("Sign up failed: " + error.message);
    }
}

/**
 * Signs in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
async function signInUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user.uid);
        showMessageModal("Welcome back!");
        window.location.href = 'profile.html'; // Redirect to profile page after login
    } catch (error) {
        console.error("Error signing in:", error);
        showMessageModal("Login failed: " + error.message);
    }
}

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
async function signOutUser() {
    try {
        await signOut(auth);
        console.log("User signed out.");
        showMessageModal("You have been signed out.");
        window.location.href = 'index.html'; // Redirect to home page after logout
    } catch (error) {
        console.error("Error signing out:", error);
        showMessageModal("Logout failed: " + error.message);
    }
}

/**
 * Saves user data (high score, games played) to Firestore.
 * @param {string} uid User ID
 * @returns {Promise<void>}
 */
async function saveUserData(uid) {
    if (!db) {
        console.error("Firestore not initialized.");
        return;
    }
    const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/private/data/profile`);
    try {
        await setDoc(userDocRef, {
            highScore: gameState.highScore,
            gamesPlayed: gameState.stats.gamesPlayed
        }, { merge: true }); // Use merge to update existing fields without overwriting
        console.log("User data saved successfully!");
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

/**
 * Loads user data from Firestore and updates gameState.
 * @param {string} uid User ID
 * @returns {Promise<void>}
 */
async function loadUserData(uid) {
    if (!db) {
        console.error("Firestore not initialized.");
        return;
    }
    const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/private/data/profile`);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            gameState.highScore = data.highScore || 0;
            gameState.stats.gamesPlayed = data.gamesPlayed || 0;
            if (domElements.profileUsername) domElements.profileUsername.textContent = data.username || "Anonymous";
            if (domElements.profileEmail) domElements.profileEmail.textContent = data.email || "";
            if (domElements.profileHighScore) domElements.profileHighScore.textContent = gameState.highScore;
            if (domElements.profileGamesPlayed) domElements.profileGamesPlayed.textContent = gameState.stats.gamesPlayed;

            updateScoreDisplay(); // Update game high score display
            console.log("User data loaded:", data);
        } else {
            console.log("No user data found for", uid);
            // Initialize basic profile data if none exists
            if (domElements.profileUsername) domElements.profileUsername.textContent = "Anonymous";
            if (domElements.profileEmail) domElements.profileEmail.textContent = auth.currentUser ? auth.currentUser.email : "";
            if (domElements.profileHighScore) domElements.profileHighScore.textContent = "0";
            if (domElements.profileGamesPlayed) domElements.profileGamesPlayed.textContent = "0";
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

/**
 * Updates the leaderboard in Firestore and refreshes the display.
 * @param {number} finalScore The score to potentially add to the leaderboard.
 * @returns {Promise<void>}
 */
async function updateLeaderboard(finalScore) {
    if (!db) {
        console.error("Firestore not initialized.");
        return;
    }

    const leaderboardCollectionRef = collection(db, `artifacts/${appId}/public/data/leaderboard`);
    const currentUserName = auth.currentUser ? (domElements.profileUsername ? domElements.profileUsername.textContent : auth.currentUser.email || "Anonymous") : "Anonymous";

    try {
        // Add current game score to leaderboard if it's a valid score
        if (finalScore > 0) {
            await setDoc(doc(leaderboardCollectionRef, userId || crypto.randomUUID()), { // Use userId if logged in, else a random ID
                username: currentUserName,
                score: finalScore,
                timestamp: new Date().toISOString(),
                userId: userId || 'anonymous' // Store userId for unique entries if needed
            }, { merge: true }); // Merge to update existing user's score if they play again
        }

        // Fetch top 10 scores
        const q = query(leaderboardCollectionRef, limit(10)); // Removed orderBy to prevent index errors
        const querySnapshot = await getDocs(q);

        const newLeaderboard = [];
        querySnapshot.forEach((doc) => {
            newLeaderboard.push(doc.data());
        });

        // Sort in memory as orderBy is removed from query
        newLeaderboard.sort((a, b) => b.score - a.score);
        gameState.leaderboard = newLeaderboard;
        displayLeaderboard();
        console.log("Leaderboard updated and displayed.");
    } catch (error) {
        console.error("Error updating or fetching leaderboard:", error);
    }
}

/**
 * Displays the current leaderboard from gameState.
 */
function displayLeaderboard() {
    if (!domElements.leaderboardTableBody) {
        console.error("Leaderboard table body not found.");
        return;
    }
    domElements.leaderboardTableBody.innerHTML = ''; // Clear existing entries

    gameState.leaderboard.forEach((entry, index) => {
        const row = domElements.leaderboardTableBody.insertRow();
        const rankCell = row.insertCell();
        const playerCell = row.insertCell();
        const scoreCell = row.insertCell();

        rankCell.textContent = index + 1;
        playerCell.textContent = entry.username || "Anonymous";
        scoreCell.textContent = entry.score;
    });
}

/**
 * Updates the navigation links based on authentication status.
 * @param {object | null} user The Firebase user object or null if signed out.
 */
function updateAuthLinks(user) {
    if (!domElements.authLinks) return;

    domElements.authLinks.innerHTML = ''; // Clear existing links

    if (user) {
        // User is signed in
        const profileLink = document.createElement('li');
        profileLink.innerHTML = `<a href="profile.html"><i class="fas fa-user"></i> Profile</a>`;
        domElements.authLinks.appendChild(profileLink);

        const logoutLink = document.createElement('li');
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn logout-btn';
        logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
        logoutBtn.addEventListener('click', signOutUser);
        logoutLink.appendChild(logoutBtn);
        domElements.authLinks.appendChild(logoutLink);
    } else {
        // User is signed out
        const signupLink = document.createElement('li');
        signupLink.innerHTML = `<a href="signup.html">Sign Up</a>`;
        domElements.authLinks.appendChild(signupLink);

        const loginLink = document.createElement('li');
        loginLink.innerHTML = `<a href="login.html">Login</a>`;
        domElements.authLinks.appendChild(loginLink);
    }
}

// Event Listeners (ensure they are attached to existing elements)
if (domElements.submitButton) domElements.submitButton.addEventListener('click', validateAnswer);
if (domElements.skipButton) domElements.skipButton.addEventListener('click', useSkip);
if (domElements.doubleScoreButton) domElements.doubleScoreButton.addEventListener('click', useDoubleScore);
if (domElements.restartGameButton) domElements.restartGameButton.addEventListener('click', () => {
    // Reset game state
    gameState.score = 0;
    gameState.lives = 10; // Or reset to default from settings
    gameState.timer = gameState.settings.time;
    gameState.stats = { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0, gamesPlayed: gameState.stats.gamesPlayed }; // Keep gamesPlayed
    gameState.milestoneHistory = [];
    gameState.powerUps = { skip: 0, doubleScore: 0, extraTime: 0 };
    // Re-initialize game settings based on saved settings for a fresh start
    const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || {
        diff: true,
        int: false,
        time: 60,
        difficulty: 1,
    };
    gameState.settings = savedSettings;

    // Hide modal and show game elements
    if (domElements.gameOverModal) domElements.gameOverModal.style.display = 'none';
    const gameMain = document.getElementById('game');
    if (gameMain) gameMain.style.display = 'block';

    initializeGame(); // Restart the game
});

// Event listeners for authentication forms (signup/login pages)
document.addEventListener('DOMContentLoaded', () => {
    if (domElements.loginForm) {
        domElements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = domElements.loginForm.querySelector('#email').value;
            const password = domElements.loginForm.querySelector('#password').value;
            await signInUser(email, password);
        });
    }

    if (domElements.signupForm) {
        domElements.signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = domElements.signupForm.querySelector('#username').value;
            const email = domElements.signupForm.querySelector('#email').value;
            const password = domElements.signupForm.querySelector('#password').value;
            await signUpUser(email, password, username);
        });
    }

    if (domElements.logoutButton) {
        domElements.logoutButton.addEventListener('click', signOutUser);
    }
    
    // Close solution modal
    if (domElements.closeSolutionModal) {
        domElements.closeSolutionModal.addEventListener('click', () => {
            if (domElements.solutionModal) {
                domElements.solutionModal.style.display = 'none';
            }
        });
    }
});


// Game Initialization
async function initializeGame() {
    // Initialize Firebase only once
    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Sign in anonymously if no custom token, or use custom token
        await new Promise(resolve => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    userId = user.uid;
                    console.log("User is signed in:", userId);
                    updateAuthLinks(user);
                    await loadUserData(userId); // Load user-specific data from Firestore
                } else {
                    userId = null;
                    console.log("User is signed out.");
                    updateAuthLinks(null);
                    // Reset profile data if user signs out
                    if (domElements.profileUsername) domElements.profileUsername.textContent = '[Username]';
                    if (domElements.profileEmail) domElements.profileEmail.textContent = '[User Email]';
                    if (domElements.profileHighScore) domElements.profileHighScore.textContent = '[High Score]';
                    if (domElements.profileGamesPlayed) domElements.profileGamesPlayed.textContent = '[Games Played]';

                    // Sign in anonymously if not authenticated and no custom token provided (for guests)
                    if (!initialAuthToken && !auth.currentUser) {
                         await signInAnonymously(auth);
                         console.log("Signed in anonymously for guest session.");
                    }
                }
                unsubscribe(); // Unsubscribe after initial state is determined
                resolve();
            });
        });

        // Use custom token if available (this block executes after onAuthStateChanged resolves)
        if (initialAuthToken && !auth.currentUser) {
            try {
                await signInWithCustomToken(auth, initialAuthToken);
                console.log("Signed in with custom token.");
            } catch (error) {
                console.error("Error signing in with custom token:", error);
                await signInAnonymously(auth); // Fallback to anonymous
                console.log("Signed in anonymously after custom token failed.");
            }
        }
    }


    // Set initial timer based on settings or default
    gameState.timer = gameState.settings.time;
    // Set lives based on initial difficulty settings, then adjust further
    adjustGameDifficulty(gameState.settings.difficulty);

    // Initial display updates
    updateScoreDisplay();
    updatePowerUpsDisplay();
    updateStatsDisplay();
    startTimer();
    displayProblem();
    await displayLeaderboard(); // Ensure leaderboard is fetched after Firebase is ready

    // Sound toggle logic
    const soundToggleCheckbox = document.getElementById('sound-toggle-checkbox');
    const wrongSound = document.getElementById('wrongSound');
    const correctSound = document.getElementById('correctSound');
    // Assuming these sounds exist, if not, they will be null and cause errors
    // Removed references to non-existent audio elements to prevent errors
    // const doubleScoreSound = document.getElementById('doubleScoreSound');
    // const skipSound = document.getElementById('skipSound');
    // const powerUpSound = document.getElementById('powerUpSound');
    // const timerSound = document.getElementById('timerSound');
    // const leaderboardSound = document.getElementById('leaderboardSound');
    // const statsSound = document.getElementById('statsSound');
    // const submitSound = document.getElementById('submitSound');
    // const backgroundMusic = document.getElementById('backgroundMusic');


    // Load sound settings from localStorage
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (soundToggleCheckbox) {
        soundToggleCheckbox.checked = soundEnabled;
    }


    // Update sound elements based on the initial setting
    if (wrongSound) wrongSound.muted = !soundEnabled;
    if (correctSound) correctSound.muted = !soundEnabled;
    // if (doubleScoreSound) doubleScoreSound.muted = !soundEnabled;
    // if (skipSound) skipSound.muted = !soundEnabled;
    // if (powerUpSound) powerUpSound.muted = !soundEnabled;
    // if (timerSound) timerSound.muted = !soundEnabled;
    // if (leaderboardSound) leaderboardSound.muted = !soundEnabled;
    // if (statsSound) statsSound.muted = !soundEnabled;
    // if (submitSound) submitSound.muted = !soundEnabled;
    // if (backgroundMusic) backgroundMusic.muted = !soundEnabled;


    // Add event listener for the sound toggle checkbox
    if (soundToggleCheckbox) {
        soundToggleCheckbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            if (wrongSound) wrongSound.muted = !isChecked;
            if (correctSound) correctSound.muted = !isChecked;
            localStorage.setItem('soundEnabled', isChecked);
        });
    }

}

// Shuffle Array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// Save settings to localStorage and navigate to game page (from options.html)
// This part of the code is likely executed on options.html, not game.html
const settingsForm = document.querySelector('#options .settings');
const startGameButton = document.getElementById('startGame');

if (document.body.id === 'options-page') { // Add an ID to your options.html body for specific script execution
    window.addEventListener('DOMContentLoaded', () => {
        const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || {
            diff: true,
            int: false,
            time: 60,
            difficulty: 1,
        };
        if (settingsForm) {
            const diffCheckbox = settingsForm.querySelector('#diffCheckbox');
            const intCheckbox = settingsForm.querySelector('#intCheckbox');
            const timeSlider = settingsForm.querySelector('#timeSlider');
            const difficultySlider = settingsForm.querySelector('#difficultySlider');
            const timeValue = document.getElementById('timeValue');
            const difficultyValue = document.getElementById('difficultyValue');

            if (diffCheckbox) diffCheckbox.checked = savedSettings.diff;
            if (intCheckbox) intCheckbox.checked = savedSettings.int;
            if (timeSlider) {
                timeSlider.value = savedSettings.time;
                if (timeValue) timeValue.textContent = `${savedSettings.time} seconds`;
                timeSlider.addEventListener('input', () => {
                    if (timeValue) timeValue.textContent = `${timeSlider.value} seconds`;
                });
            }
            if (difficultySlider) {
                difficultySlider.value = savedSettings.difficulty;
                if (difficultyValue) difficultyValue.textContent = savedSettings.difficulty;
                difficultySlider.addEventListener('input', () => {
                    if (difficultyValue) difficultyValue.textContent = difficultySlider.value;
                });
            }
        }
    });

    if (startGameButton) {
        startGameButton.addEventListener('click', (e) => {
            e.preventDefault();
            const settings = {
                diff: settingsForm.querySelector('#diffCheckbox').checked,
                int: settingsForm.querySelector('#intCheckbox').checked,
                time: parseInt(settingsForm.querySelector('#timeSlider').value),
                difficulty: parseInt(settingsForm.querySelector('#difficultySlider').value),
            };
            localStorage.setItem('gameSettings', JSON.stringify(settings));
            gameState.settings = settings; // Update game state for the upcoming game
            window.location.href = 'game.html';
        });
    }
}

// Initializing the game only when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);
