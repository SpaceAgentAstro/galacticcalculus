// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global Firebase variables (provided by Canvas environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? initialAuthToken : null; // Fixed typo: 'initialAuthToken' instead of '__initial_auth_token'

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
        difficulty: 1, // Default to easy (level 1)
        questionTypes: ['diff'], // Default to differentiation
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

/**
 * Maps numeric difficulty to a descriptive string for AI prompt.
 * @param {number} difficulty - The numeric difficulty level (1-8).
 * @returns {string} A descriptive string for the AI.
 */
function getDifficultyDescription(difficulty) {
    switch (difficulty) {
        case 1: return "very simple (e.g., derivative of x^2, integral of constant)";
        case 2: return "easy (e.g., derivative of polynomial, simple power rule integral)";
        case 3: return "medium (e.g., basic chain rule, simple substitution integral)";
        case 4: return "hard (e.g., product/quotient rule, integration by parts)";
        case 5: return "insane (e.g., complex chain rule, trigonometric substitution, partial fractions)";
        case 6: return "legend (e.g., implicit differentiation, advanced integration techniques)";
        case 7: return "goat (e.g., related rates, optimization problems, complex series integration)";
        case 8: return "extremely challenging (e.g., multi-variable calculus concepts, complex differential equations)";
        default: return "easy";
    }
}

/**
 * Generates a differentiation problem using the Gemini API.
 * @param {number} difficulty - The difficulty level.
 * @returns {Promise<{question: string, answer: string}>} A promise that resolves to the generated problem.
 */
async function getDifferentiationProblemFromAI(difficulty) {
    const difficultyDesc = getDifficultyDescription(difficulty);
    const prompt = `Generate a differentiation problem for a calculus game. The question should be a derivative with respect to x, formatted in LaTeX using \\frac{d}{dx}. The answer should also be in LaTeX format. Ensure the problem is ${difficultyDesc}. Provide the response as a JSON object with 'question' and 'answer' fields.`;

    try {
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "question": { "type": "STRING" },
                        "answer": { "type": "STRING" }
                    },
                    "required": ["question", "answer"],
                    "propertyOrdering": ["question", "answer"] // Ensure order
                }
            }
        };
        const apiKey = ""; // Canvas will provide this at runtime
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonString = result.candidates[0].content.parts[0].text;
            // Attempt to parse the JSON string. The API might return it as a stringified JSON.
            const parsedResult = JSON.parse(jsonString);
            if (parsedResult.question && parsedResult.answer) {
                return parsedResult;
            } else {
                console.error("Generated JSON is missing 'question' or 'answer' fields:", parsedResult);
                throw new Error("Invalid problem structure from AI.");
            }
        } else {
            console.error("Unexpected AI response structure for differentiation problem:", result);
            throw new Error("Failed to generate differentiation problem.");
        }
    } catch (error) {
        console.error("Error generating differentiation problem from AI:", error);
        // Fallback to a hardcoded easy problem if AI generation fails
        return { question: "\\frac{d}{dx}(x^2)", answer: "2x" };
    }
}

/**
 * Generates an integration problem using the Gemini API.
 * @param {number} difficulty - The difficulty level.
 * @returns {Promise<{question: string, answer: string}>} A promise that resolves to the generated problem.
 */
async function getIntegrationProblemFromAI(difficulty) {
    const difficultyDesc = getDifficultyDescription(difficulty);
    const prompt = `Generate an integration problem for a calculus game. The question should be an integral formatted in LaTeX using \\int and dx. The answer should also be in LaTeX format and include the constant of integration +C. Ensure the problem is ${difficultyDesc}. Provide the response as a JSON object with 'question' and 'answer' fields.`;

    try {
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "question": { "type": "STRING" },
                        "answer": { "type": "STRING" }
                    },
                    "required": ["question", "answer"],
                    "propertyOrdering": ["question", "answer"] // Ensure order
                }
            }
        };
        const apiKey = ""; // Canvas will provide this at runtime
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonString = result.candidates[0].content.parts[0].text;
            // Attempt to parse the JSON string. The API might return it as a stringified JSON.
            const parsedResult = JSON.parse(jsonString);
            if (parsedResult.question && parsedResult.answer) {
                return parsedResult;
            } else {
                console.error("Generated JSON is missing 'question' or 'answer' fields:", parsedResult);
                throw new Error("Invalid problem structure from AI.");
            }
        } else {
            console.error("Unexpected AI response structure for integration problem:", result);
            throw new Error("Failed to generate integration problem.");
        }
    } catch (error) {
        console.error("Error generating integration problem from AI:", error);
        // Fallback to a hardcoded easy problem if AI generation fails
        return { question: "\\int x \\, dx", answer: "\\frac{x^2}{2}+C" };
    }
}


// Problem Generation
async function generateProblem() {
    const selectedType = gameState.settings.questionTypes[Math.floor(Math.random() * gameState.settings.questionTypes.length)];
    const difficultyLevel = parseInt(gameState.settings.difficulty);

    let problem;
    if (selectedType === 'diff') {
        problem = await getDifferentiationProblemFromAI(difficultyLevel);
    } else if (selectedType === 'antiderivative') { // Assuming 'antiderivative' corresponds to 'int' for problem types
        problem = await getIntegrationProblemFromAI(difficultyLevel);
    } else {
        // Fallback if no valid type is selected
        console.warn("No valid question type selected. Defaulting to easy differentiation.");
        problem = await getDifferentiationProblemFromAI(1);
    }
    return problem;
}

// Function to create a new problem
async function newProblem() { // Made async to await problem generation
    const problem = await generateProblem();
    // Update the MathLive element's value directly
    if (domElements.question) {
        domElements.question.value = problem.question;
    }

    console.log("Generated Problem:", problem.question);
    console.log("Expected Answer:", problem.answer);

    if (domElements.answerInput) domElements.answerInput.value = ''; // Clear the input field
    if (domElements.question) domElements.question.classList.remove('incorrect');
    return problem;
}


// Display New Problem
async function displayProblem() { // Made async to await problem generation
    gameState.currentProblem = await newProblem();
    if (domElements.answerInput) domElements.answerInput.value = '';
    gameState.stats.totalQuestions++;
    updateStatsDisplay();
    updateTimer();
}

// Answer Validation
function validateAnswer() {
    const userAnswer = domElements.answerInput ? domElements.answerInput.value.trim() : '';
    const correctAnswer = gameState.currentProblem ? gameState.currentProblem.answer.trim() : '';

    // Normalize answers for comparison: remove all whitespace and "+C" for integration
    const normalizedUserAnswer = userAnswer.replace(/\s+/g, '').replace(/\+C/g, '');
    const normalizedCorrectAnswer = correctAnswer.replace(/\s+/g, '').replace(/\+C/g, '');

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
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
    else displayProblem(); // Move to the next problem after showing solution
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
    Please explain each step clearly. Provide the solution in LaTeX format, wrapped in $$...$$ for display by MathLive. If no elementary solution exists, state that.`;

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
    await displayProblem(); // Ensure problem is generated before displaying
    await displayLeaderboard(); // Ensure leaderboard is fetched after Firebase is ready

    // Sound toggle logic
    const soundToggleCheckbox = document.getElementById('sound-toggle-checkbox');
    const wrongSound = document.getElementById('wrongSound');
    const correctSound = document.getElementById('correctSound');
    // Removed references to non-existent audio elements to prevent errors


    // Load sound settings from localStorage
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (soundToggleCheckbox) {
        soundToggleCheckbox.checked = soundEnabled;
    }


    // Update sound elements based on the initial setting
    if (wrongSound) wrongSound.muted = !soundEnabled;
    if (correctSound) correctSound.muted = !soundEnabled;


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
