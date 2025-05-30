console.log("Script loaded.");

// Firebase Imports (MUST be at the top for module loading)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         GoogleAuthProvider, GithubAuthProvider, OAuthProvider, signInWithPopup // Apple and Microsoft providers, and signInWithPopup
       } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Initialization
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

// Ensure projectId and other essential config properties are present for Firebase initialization
if (!firebaseConfig.projectId) {
    console.warn("Firebase projectId not found in __firebase_config. Using placeholder values. Please ensure Firebase is properly configured in your environment.");
    firebaseConfig = {
        apiKey: firebaseConfig.apiKey || "AIzaSyBCrjRoCRrC-zhOr_1aGASG6e9H47a9yNg", // Replace with your actual API Key
        authDomain: firebaseConfig.authDomain || "YOUR_FIREBASE_AUTH_DOMAIN", // Replace with your actual Auth Domain
        projectId: "galactic-calculus", // Replace with your actual Project ID
        storageBucket: firebaseConfig.storageBucket || "galactic-calculus.firebasestorage.app", // Replace with your actual Storage Bucket
        messagingSenderId: firebaseConfig.messagingSenderId || "YOUR_FIREBASE_MESSAGING_SENDER_ID", // Replace with your actual Messaging Sender ID
        appId: firebaseConfig.appId || "1:852530228562:android:a54678e94cd456e2fade8b" // Replace with your actual App ID
    };
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Firebase Auth Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const appleProvider = new OAuthProvider('apple.com'); // Apple provider
const microsoftProvider = new OAuthProvider('microsoft.com'); // Microsoft provider

// Global Firebase variables for user and auth state
let currentUserId = null;
let isAuthReady = false; // Flag to ensure Firestore operations happen after auth is ready

// Game State
const gameState = {
  score: 0,
  highScore: 0, // Will be loaded from Firestore or local storage
  lives: 10,
  timer: 120,
  timerInterval: null,
  isPaused: false,
  currentProblem: null,
  achievements: [], // Will be loaded from Firestore or local storage
  dailyStreak: 0, // Will be loaded from Firestore or local storage
  lastPlayed: null, // Will be loaded from Firestore or local storage
  galacticCoins: 0, // Will be loaded from Firestore or local storage
  username: "Guest", // Default username, will be updated from Firestore
  settings:
    JSON.parse(localStorage.getItem("gameSettings")) || {
      difficulty: 2,
      diff: true, // Default to differentiation problems
      int: false, // Default to no integration problems
      timer: 120,
    },
  leaderboard: [], // Will be loaded from Firestore
  powerUps: { skip: 0, doubleScore: 0, extraTime: 0 }, // Will be loaded from Firestore or local storage
  stats: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 }, // Will be loaded from Firestore or local storage
  milestones: {
    scoreMilestones: { 50: "skip", 100: "doubleScore", 200: "extraTime" },
    streakMilestones: { 5: "doubleScore", 10: "extraTime", 15: "skip" },
  },
  milestoneHistory: [],
  shopItems: {
    skip: { cost: 50, description: "Skip the current problem" },
    doubleScore: { cost: 100, description: "Double score for next 3 problems" },
    extraTime: { cost: 75, description: "Add 30 seconds to the timer" },
  }
};

/**
 * DOM Elements object.
 * Caches references to frequently accessed DOM elements for efficiency.
 */
const domElements = {
  score: document.getElementById("score-value"),
  highScore: document.getElementById("high-score-value"),
  lives: document.getElementById("lives-value"),
  timer: document.getElementById("timer-value"),
  galacticCoins: document.getElementById("galactic-coins-value"),
  question: document.getElementById("equation"),
  answerInput: document.getElementById("answer"), // This now refers to the math-field element
  submitButton: document.getElementById("submit"),
  gameOverModal: document.getElementById("gameOverModal"),
  finalScoreDisplay: document.getElementById("final-score-display"),
  navbar: document.getElementById("navbar-brand"),
  leaderboard: document.getElementById("leaderboard"),
  skipButton: document.getElementById("skip-button"),
  doubleScoreButton: document.getElementById("double-score-button"),
  extraTimeButton: document.getElementById("extra-time-button"),
  stats: document.getElementById("stats"),
  milestoneHistory: document.getElementById("milestone-history"),
  shopButton: document.getElementById("shop-button"),
  shopModal: document.getElementById("shopModal"),
  shopItemsContainer: document.getElementById("shop-items-container"),
  authLinks: document.getElementById("auth-links"),
  loginForm: document.getElementById("login-form"),
  signupForm: document.getElementById("signup-form"),
  logoutButton: document.getElementById("logout"),
  profileUsername: document.getElementById("profile-username"),
  profileEmail: document.getElementById("profile-email"),
  profileHighScore: document.getElementById("profile-high-score"),
  profileGamesPlayed: document.getElementById("profile-games-played"),
  profileUserId: document.getElementById("profile-user-id"), // New: for displaying user ID
  aiAssistantModal: document.getElementById("aiAssistantModal"), // New: AI Assistant modal
  aiSolutionContent: document.getElementById("ai-solution-content"), // New: AI Solution content area
  aiLoadingIndicator: document.getElementById("ai-loading-indicator") // New: AI Loading indicator
};

// Audio for feedback (ensure these paths are correct or provide placeholder sounds)
const correctSound = new Audio("sounds/correct.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");
const coinSound = new Audio("sounds/coin.mp3");
const purchaseSound = new Audio("sounds/purchase.mp3");

/**
 * Updates the displayed score, high score, lives, and galactic coins in the UI.
 */
function updateScoreDisplay() {
  if (domElements.score) domElements.score.textContent = `Score: ${gameState.score}`;
  if (domElements.lives) domElements.lives.textContent = `Lives: ${gameState.lives}`;
  if (domElements.galacticCoins) domElements.galacticCoins.textContent = `Coins: ${gameState.galacticCoins}`;
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    if (currentUserId) saveUserData(); // Persist new high score to Firestore
  }
  if (domElements.highScore) domElements.highScore.textContent = `High Score: ${gameState.highScore}`;
  checkMilestones();
}

/**
 * Updates the text content of power-up buttons to reflect current counts.
 */
function updatePowerUpsDisplay() {
  if (domElements.skipButton) domElements.skipButton.textContent = `Skip (${gameState.powerUps.skip})`;
  if (domElements.doubleScoreButton) domElements.doubleScoreButton.textContent = `Double Score (${gameState.powerUps.doubleScore})`;
  if (domElements.extraTimeButton) domElements.extraTimeButton.textContent = `Extra Time (${gameState.powerUps.extraTime})`;
}

/**
 * Updates the detailed game statistics display in the UI.
 */
function updateStatsDisplay() {
  const { totalQuestions, correctAnswers, incorrectAnswers } = gameState.stats;
  if (domElements.stats) {
    domElements.stats.innerHTML = `
      <h3 class="text-2xl font-semibold text-blue-300 mb-4">Game Statistics</h3>
      <p><strong>Total Questions:</strong> ${totalQuestions}</p>
      <p><strong>Correct Answers:</strong> ${correctAnswers}</p>
      <p><strong>Incorrect Answers:</strong> ${incorrectAnswers}</p>
    `;
  }
}

/**
 * Helper function to update the game score.
 * @param {number} value - The amount to add to the current score.
 */
function updateScore(value) {
  gameState.score += value;
  updateScoreDisplay();
  checkMilestones();
}

/**
 * Checks if any score or streak milestones have been reached.
 */
function checkMilestones() {
  Object.keys(gameState.milestones.scoreMilestones).forEach((milestone) => {
    const milestoneValue = parseInt(milestone);
    if (gameState.score >= milestoneValue && gameState.milestones.scoreMilestones[milestone]) {
      const powerUp = gameState.milestones.scoreMilestones[milestone];
      unlockMilestone(milestoneValue, powerUp, "score");
      delete gameState.milestones.scoreMilestones[milestone];
    }
  });

  Object.keys(gameState.milestones.streakMilestones).forEach((milestone) => {
    const milestoneValue = parseInt(milestone);
    if (gameState.stats.correctAnswers >= milestoneValue && gameState.milestones.streakMilestones[milestone]) {
      const powerUp = gameState.milestones.streakMilestones[milestone];
      unlockMilestone(milestoneValue, powerUp, "streak");
      delete gameState.milestones.streakMilestones[milestone];
    }
  });
}

/**
 * Unlocks a specified power-up and records the milestone in history.
 */
function unlockMilestone(value, powerUp, type) {
  gameState.powerUps[powerUp]++;
  gameState.milestoneHistory.push({ type, value, powerUp, timestamp: new Date().toISOString() });
  showMilestoneNotification(powerUp, type, value);
  updateMilestoneHistoryDisplay();
  updatePowerUpsDisplay();
  if (currentUserId) saveUserData(); // Persist power-up changes
}

/**
 * Displays a temporary notification for an unlocked milestone.
 */
function showMilestoneNotification(powerUp, type, value) {
  const notification = document.createElement("div");
  notification.classList.add('fixed', 'top-10', 'left-1/2', '-translate-x-1/2', 'bg-green-600', 'text-white', 'p-4', 'rounded-lg', 'shadow-xl', 'z-50', 'text-center', 'animate-fadeInOut');
  notification.innerHTML = `
      <strong class="text-xl">Milestone Reached!</strong><br>
      ${type.charAt(0).toUpperCase() + type.slice(1)} Milestone (${value})<br>
      Gained 1 <em class="font-semibold">${powerUp.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}</em> power-up!`;
  document.body.appendChild(notification);

  if (!document.getElementById('fadeInOutStyle')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'fadeInOutStyle';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -50px); }
      }
      .animate-fadeInOut {
        animation: fadeInOut 3s forwards;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  setTimeout(() => notification.remove(), 3000);
}

/**
 * Updates the display of the milestone history section.
 */
function updateMilestoneHistoryDisplay() {
  if (domElements.milestoneHistory) {
    domElements.milestoneHistory.innerHTML = '<h3 class="text-2xl font-semibold text-blue-300 mb-4">Milestone History</h3>';
    if (gameState.milestoneHistory.length === 0) {
      domElements.milestoneHistory.innerHTML += '<p class="text-gray-400">No milestones unlocked yet.</p>';
      return;
    }
    gameState.milestoneHistory.forEach(({ type, value, powerUp, timestamp }) => {
      const historyItem = document.createElement("div");
      historyItem.classList.add('py-2', 'border-b', 'border-gray-600', 'last:border-b-0');
      historyItem.innerHTML = `
        <span class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)} Milestone</span> (${value}):
        +1 <em class="font-medium text-purple-300">${powerUp.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}</em>
        <span class="text-gray-400 text-sm block">${new Date(timestamp).toLocaleString()}</span>
      `;
      domElements.milestoneHistory.appendChild(historyItem);
    });
  }
}

/**
 * Handles the usage of a power-up.
 */
function usePowerUp(type) {
  if (gameState.powerUps[type] > 0) {
    gameState.powerUps[type]--;
    if (type === "skip") {
      displayProblem();
    } else if (type === "extraTime") {
      gameState.timer += 30;
      updateTimer();
    } else if (type === "doubleScore") {
      gameState.score += 20;
      updateScoreDisplay();
    }
    updatePowerUpsDisplay();
    if (currentUserId) saveUserData(); // Persist power-up changes
  } else {
    console.log(`No ${type} power-ups left!`);
    const noPowerUpMessage = document.createElement('div');
    noPowerUpMessage.classList.add('fixed', 'top-10', 'left-1/2', '-translate-x-1/2', 'bg-red-600', 'text-white', 'p-3', 'rounded-lg', 'shadow-xl', 'z-50', 'text-center', 'animate-fadeInOut');
    noPowerUpMessage.textContent = `No ${type.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} power-ups left!`;
    document.body.appendChild(noPowerUpMessage);
    setTimeout(() => noPowerUpMessage.remove(), 2000);
  }
}

// Wrapper functions for power-up buttons
function useSkip() {
  usePowerUp("skip");
}
function useDoubleScore() {
  usePowerUp("doubleScore");
}
function useExtraTime() {
  usePowerUp("extraTime");
}

/**
 * Starts or restarts the game timer.
 */
function startTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timerInterval = setInterval(() => {
    gameState.timer--;
    updateTimer();
    if (gameState.timer <= 0) {
      endGame();
    }
  }, 1000);
}

/**
 * Updates the timer display.
 */
function updateTimer() {
  if (domElements.timer) {
    domElements.timer.textContent = `Time: ${gameState.timer}`;
  }
}

/**
 * Generates a random math problem based on selected question types and difficulty.
 */
function generateProblem(type) {
  const differentiationProblems = getDifferentiationProblems();
  const integrationProblems = getIntegrationProblems();

  const problemsByType = {
    diff: differentiationProblems,
    antiderivative: integrationProblems,
  };

  const currentDifficulty = gameState.settings.difficulty;

  const availableQuestionTypes = [];
  if (gameState.settings.diff) {
    availableQuestionTypes.push("diff");
  }
  if (gameState.settings.int) {
    availableQuestionTypes.push("antiderivative");
  }

  if (availableQuestionTypes.length === 0) {
    availableQuestionTypes.push("diff");
    console.warn("No question types selected in settings. Defaulting to Differentiation.");
  }

  const selectedType = type || availableQuestionTypes[Math.floor(Math.random() * availableQuestionTypes.length)];

  const problemSetForDifficulty = problemsByType[selectedType][currentDifficulty] || problemsByType[selectedType][1];

  if (!problemSetForDifficulty || problemSetForDifficulty.length === 0) {
    console.error(`No problems found for type: ${selectedType} and difficulty: ${currentDifficulty}. Generating a fallback problem.`);
    return { question: "$$\\frac{d}{dx}(x)$$", answer: "$$1$$" };
  }

  return problemSetForDifficulty[Math.floor(Math.random() * problemSetForDifficulty.length)];
}

/**
 * Creates a new problem and displays it in the UI using MathLive.
 */
function newProblem() {
  const problem = generateProblem();
  // Set the value for the display math-field
  if (domElements.question && domElements.question.querySelector('math-field')) {
    domElements.question.querySelector('math-field').value = problem.question;
  } else if (domElements.question) {
    // If math-field doesn't exist, create it
    const mathField = document.createElement("math-field");
    mathField.value = problem.question;
    mathField.readOnly = true;
    mathField.virtualKeyboardMode = "off";
    mathField.showMenu = false;
    domElements.question.innerHTML = ""; // Clear existing content
    domElements.question.appendChild(mathField);
  }
  console.log("New Problem:", problem.question);

  // Clear the input math-field
  if (domElements.answerInput) {
    domElements.answerInput.value = "";
    domElements.answerInput.classList.remove("correct-answer-feedback", "incorrect-answer-feedback");
  }
  return problem;
}

/**
 * Displays a new problem, increments total questions, and updates stats.
 */
function displayProblem() {
  gameState.currentProblem = newProblem();
  gameState.stats.totalQuestions++;
  updateStatsDisplay();
  if (currentUserId) saveUserData(); // Persist stats
}

/**
 * Validates the user's answer against the current problem's answer.
 */
function validateAnswer() {
  if (!gameState.currentProblem || !domElements.answerInput) return;

  // Get the value from the MathLive input field
  const userAnswer = domElements.answerInput.value.trim();
  const correctAnswer = gameState.currentProblem.answer.trim().replace(/\s/g, '').replace(/\+C/g, '');
  const cleanedUserAnswer = userAnswer.trim().replace(/\s/g, '').replace(/\+C/g, '');

  if (cleanedUserAnswer === correctAnswer) {
    handleCorrectAnswer();
  } else {
    handleIncorrectAnswer();
  }
}

/**
 * Handles a correct answer: increments score, adds time, plays sound,
 * updates stats, and displays a new problem.
 */
function handleCorrectAnswer() {
  gameState.score += 10;
  gameState.galacticCoins += 5;
  gameState.timer += 10;
  correctSound.play().catch(e => console.error("Error playing sound:", e));
  coinSound.play().catch(e => console.error("Error playing coin sound:", e));
  gameState.stats.correctAnswers++;
  if (domElements.answerInput) {
    domElements.answerInput.classList.add("correct-answer-feedback");
  }
  setTimeout(() => {
    if (domElements.answerInput) {
      domElements.answerInput.classList.remove("correct-answer-feedback");
      domElements.answerInput.value = ""; // Clear input after feedback
    }
    updateScoreDisplay();
    displayProblem();
  }, 500);
  if (currentUserId) saveUserData(); // Persist stats and coins
}

/**
 * Handles an incorrect answer: decrements lives, plays sound,
 * updates stats, and checks for game over.
 */
async function handleIncorrectAnswer() {
  gameState.lives--;
  wrongSound.play().catch(e => console.error("Error playing sound:", e));
  gameState.stats.incorrectAnswers++;
  if (domElements.answerInput) {
    domElements.answerInput.classList.add("incorrect-answer-feedback");
  }

  // Show AI Assistant modal
  if (gameState.currentProblem) {
    showAIAssistantModal(); // Show loading state first
    const solution = await generateAISolution(gameState.currentProblem);
    domElements.aiSolutionContent.innerHTML = solution; // Update with actual solution
    // Ensure MathLive renders the LaTeX
    if (typeof MathLive !== 'undefined') {
      MathLive.renderMathInElement(domElements.aiSolutionContent);
    }
    domElements.aiLoadingIndicator.classList.add('hidden'); // Hide loading indicator
  }

  setTimeout(() => {
    if (domElements.answerInput) {
      domElements.answerInput.classList.remove("incorrect-answer-feedback");
      domElements.answerInput.value = ""; // Clear input after feedback
    }
    updateScoreDisplay();
    if (gameState.lives <= 0) {
      endGame();
    } else {
      // If game is not over, display next problem after a short delay
      // The AI modal will remain open until closed by user
      // displayProblem(); // This will be called after closing AI modal
    }
  }, 500);
  if (currentUserId) saveUserData(); // Persist stats
}

/**
 * Adjusts game difficulty based on the numeric slider value from settings.
 */
function adjustGameDifficulty(difficultyValue) {
  let diffLabel;
  switch (difficultyValue) {
    case 1: // Easy
      diffLabel = "easy";
      gameState.timer = 180;
      gameState.lives = 15;
      break;
    case 2: // Medium
      diffLabel = "medium";
      gameState.timer = 120;
      gameState.lives = 10;
      break;
    case 3: // Hard
      diffLabel = "hard";
      gameState.timer = 90;
      gameState.lives = 7;
      break;
    case 4: // Insane
      diffLabel = "insane";
      gameState.timer = 60;
      gameState.lives = 5;
      break;
    case 5: // Impossible
      diffLabel = "impossible";
      gameState.timer = 45;
      gameState.lives = 3;
      break;
    default:
      console.error("Unknown difficulty level. Defaulting to medium.");
      diffLabel = "medium";
      gameState.timer = 120;
      gameState.lives = 10;
  }
  gameState.settings.difficultyLabel = diffLabel;
  updateTimer();
  updateScoreDisplay();
}

/**
 * Ends the game: clears timer, displays final score, shows game over modal,
 * and updates the leaderboard.
 */
function endGame() {
  clearInterval(gameState.timerInterval);
  const finalScore = gameState.score;
  if (domElements.finalScoreDisplay) {
    domElements.finalScoreDisplay.textContent = finalScore; // Updated to directly set textContent
  }
  if (domElements.gameOverModal) {
    domElements.gameOverModal.classList.remove("hidden");
    domElements.gameOverModal.classList.add("show");
  }
  updateLeaderboard(finalScore);
  if (currentUserId) saveUserData(); // Save final game state to Firestore
}

/**
 * Saves relevant game state data to Firestore for authenticated users,
 * or to local storage for guest users.
 */
async function saveUserData() {
    if (!currentUserId) {
        console.warn("Cannot save user data: No user authenticated.");
        return;
    }
    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, 'data');
    try {
        await setDoc(userDocRef, {
            username: gameState.username,
            highScore: gameState.highScore,
            galacticCoins: gameState.galacticCoins,
            powerUps: gameState.powerUps,
            stats: gameState.stats,
            achievements: gameState.achievements,
            dailyStreak: gameState.dailyStreak,
            lastPlayed: gameState.lastPlayed,
        }, { merge: true }); // Use merge to avoid overwriting other fields
        console.log("User data saved successfully to Firestore.");
    } catch (e) {
        console.error("Error saving user data to Firestore:", e);
    }
}

/**
 * Loads user-specific game state data from Firestore for authenticated users,
 * or from local storage for guest users.
 */
async function loadUserData() {
    if (!currentUserId) {
        // Load from local storage for guest user
        gameState.highScore = parseInt(localStorage.getItem("highScore")) || 0;
        gameState.galacticCoins = parseInt(localStorage.getItem("galacticCoins")) || 0;
        gameState.achievements = JSON.parse(localStorage.getItem("achievements")) || [];
        gameState.dailyStreak = parseInt(localStorage.getItem("dailyStreak")) || 0;
        gameState.lastPlayed = localStorage.getItem("lastPlayed") || null;
        gameState.powerUps = JSON.parse(localStorage.getItem("powerUps")) || { skip: 0, doubleScore: 0, extraTime: 0 };
        gameState.stats = JSON.parse(localStorage.getItem("gameStats")) || { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 };
        gameState.username = "Guest";
        console.log("Loaded game state from local storage (Guest mode).");
        return;
    }

    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, 'data');
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            gameState.username = data.username || "Guest";
            gameState.highScore = data.highScore || 0;
            gameState.galacticCoins = data.galacticCoins || 0;
            gameState.powerUps = data.powerUps || { skip: 0, doubleScore: 0, extraTime: 0 };
            gameState.stats = data.stats || { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 };
            gameState.achievements = data.achievements || [];
            gameState.dailyStreak = data.dailyStreak || 0;
            gameState.lastPlayed = data.lastPlayed || null;
            console.log("Loaded user data from Firestore:", data);
        } else {
            console.log("No profile data found for user, creating default.");
            gameState.username = auth.currentUser.displayName || "User_" + currentUserId.substring(0, 5); // Use display name from auth if available
            gameState.highScore = 0;
            gameState.galacticCoins = 0;
            gameState.powerUps = { skip: 0, doubleScore: 0, extraTime: 0 };
            gameState.stats = { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 };
            gameState.achievements = [];
            gameState.dailyStreak = 0;
            gameState.lastPlayed = null;
            await setDoc(userDocRef, { // Use setDoc to create the document
                username: gameState.username,
                email: auth.currentUser.email || null, // Capture email if available
                highScore: gameState.highScore,
                galacticCoins: gameState.galacticCoins,
                powerUps: gameState.powerUps,
                stats: gameState.stats,
                achievements: gameState.achievements,
                dailyStreak: gameState.dailyStreak,
                lastPlayed: gameState.lastPlayed,
            });
            console.log("Created default user profile in Firestore.");
        }
    } catch (e) {
        console.error("Error loading user data from Firestore:", e);
        // Fallback to local storage if Firestore fails for some reason
        loadGameStateFromLocalStorage();
    }
    // After loading, update UI
    updateScoreDisplay();
    updatePowerUpsDisplay();
    updateStatsDisplay();
    updateMilestoneHistoryDisplay();
    displayLeaderboard(); // Refresh leaderboard with potentially new user score
    checkDailyLogin(); // Check daily login after user data is loaded
}

// Helper to load from local storage (used as fallback or for guest)
function loadGameStateFromLocalStorage() {
    gameState.highScore = parseInt(localStorage.getItem("highScore")) || 0;
    gameState.galacticCoins = parseInt(localStorage.getItem("galacticCoins")) || 0;
    gameState.achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    gameState.dailyStreak = parseInt(localStorage.getItem("dailyStreak")) || 0;
    gameState.lastPlayed = localStorage.getItem("lastPlayed") || null;
    gameState.powerUps = JSON.parse(localStorage.getItem("powerUps")) || { skip: 0, doubleScore: 0, extraTime: 0 };
    gameState.stats = JSON.parse(localStorage.getItem("gameStats")) || { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 };
    gameState.username = "Guest";
    console.log("Loaded game state from local storage (fallback/guest).");
}


/**
 * Adds the current game score to the leaderboard and persists it to Firestore.
 */
async function updateLeaderboard(score) {
    if (!isAuthReady) {
        console.warn("Auth not ready, skipping leaderboard update.");
        return;
    }

    const leaderboardCollectionRef = collection(db, `artifacts/${appId}/public/data/leaderboard`);
    const username = gameState.username || "Guest"; // Use actual username

    try {
        await addDoc(leaderboardCollectionRef, {
            score: score,
            timestamp: new Date().toISOString(),
            userId: currentUserId,
            username: username
        });
        console.log("Score added to leaderboard.");
        displayLeaderboard();
    } catch (e) {
        console.error("Error adding score to leaderboard:", e);
    }
}

/**
 * Displays the current top 10 scores in the leaderboard section from Firestore.
 */
async function displayLeaderboard() {
    if (!domElements.leaderboard || !isAuthReady) {
        console.warn("Leaderboard element or Auth not ready, skipping display.");
        return;
    }

    domElements.leaderboard.innerHTML = '<h3 class="text-2xl font-semibold text-blue-300 mb-4">Leaderboard</h3>';
    const leaderboardCollectionRef = collection(db, `artifacts/${appId}/public/data/leaderboard`);
    const q = query(leaderboardCollectionRef, orderBy("score", "desc"), limit(10));

    try {
        const querySnapshot = await getDocs(q);
        const topScores = [];
        querySnapshot.forEach((doc) => {
            topScores.push(doc.data());
        });

        if (topScores.length === 0) {
            domElements.leaderboard.innerHTML += '<p class="text-gray-400">No scores yet. Play to get on the leaderboard!</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('min-w-full', 'divide-y', 'divide-gray-600', 'rounded-lg', 'overflow-hidden');
        table.innerHTML = `
            <thead class="bg-gray-600">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider rounded-tl-lg">Rank</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Username</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Score</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider rounded-tr-lg">Date</th>
            </tr>
            </thead>
            <tbody class="bg-gray-700 divide-y divide-gray-600">
            </tbody>
        `;
        const tbody = table.querySelector('tbody');

        topScores.forEach((entry, index) => {
            const row = tbody.insertRow();
            row.classList.add('hover:bg-gray-600', 'transition-colors', 'duration-200');
            const formattedTimestamp = new Date(entry.timestamp).toLocaleString();
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200">${entry.username || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200">${entry.score}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${formattedTimestamp}</td>
            `;
        });
        domElements.leaderboard.appendChild(table);
    } catch (e) {
        console.error("Error displaying leaderboard:", e);
    }
}

/**
 * Initializes the game state and UI elements when the page loads.
 */
function initializeGame() {
  console.log("Initializing game state...");

  // Load settings from local storage (these are not user-specific and can be local)
  const savedSettings = JSON.parse(localStorage.getItem("gameSettings"));
  if (savedSettings) {
    gameState.settings = {
      ...gameState.settings,
      ...savedSettings,
    };
  }

  // Adjust difficulty based on settings
  adjustGameDifficulty(gameState.settings.difficulty);

  // The rest of the initialization (loading user data, starting timer, displaying problem)
  // is now handled by the onAuthStateChanged listener to ensure Firebase is ready.

  console.log("Game initialized with settings:", gameState.settings);
}

// Firebase Authentication State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("User logged in (Firebase):", currentUserId);

        // Sign in with custom token if available, otherwise anonymously
        // This block ensures the Canvas environment's auth token is used if provided,
        // otherwise falls back to anonymous sign-in.
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try {
                await signInWithCustomToken(auth, __initial_auth_token);
                console.log("Signed in with custom token.");
            } catch (error) {
                console.error("Error signing in with custom token:", error);
                await signInAnonymously(auth);
                console.log("Signed in anonymously due to custom token error.");
            }
        } else {
            await signInAnonymously(auth);
            console.log("Signed in anonymously.");
        }

        // Load user-specific data from Firestore after auth is confirmed
        await loadUserData();
        initializeAuthLinks(); // Update auth links based on logged-in status
    } else {
        currentUserId = null;
        console.log("User logged out or not authenticated (Firebase).");
        initializeAuthLinks(); // Update auth links based on logged-out status
        // Clear user-specific data and load from local storage for anonymous/guest user
        loadGameStateFromLocalStorage();
        updateScoreDisplay();
        updatePowerUpsDisplay();
        updateStatsDisplay();
        updateMilestoneHistoryDisplay();
        displayLeaderboard();
    }
    isAuthReady = true; // Set auth ready flag

    // If on game page, start game after auth is ready and data is loaded
    if (window.location.pathname.includes('game.html')) {
        // Only start if timer is not already running (prevents multiple starts on page load)
        if (!gameState.timerInterval) {
            // Initialize the MathLive display field for the first question
            if (domElements.question && !domElements.question.querySelector('math-field')) {
                const mathFieldDisplay = document.createElement("math-field");
                mathFieldDisplay.readOnly = true;
                mathFieldDisplay.virtualKeyboardMode = "off";
                mathFieldDisplay.showMenu = false;
                domElements.question.appendChild(mathFieldDisplay);
            }
            startTimer();
            displayProblem();
        }
    }
});


// --- Problem Generation Helper Functions ---
// (These remain the same as they are static data)

function getDifferentiationProblems() {
  return {
    1: [ // Easy
      { question: "$$\\frac{d}{dx}(x^2)$$", answer: "$$2x$$" },
      { question: "$$\\frac{d}{dx}(3x)$$", answer: "$$3$$" },
      { question: "$$\\frac{d}{dx}(5)$$", answer: "$$0$$" },
      { question: "$$\\frac{d}{dx}(x)$$", answer: "$$1$$" },
      { question: "$$\\frac{d}{dx}(7x+2)$$", answer: "$$7$$" },
    ],
    2: [ // Medium
      { question: "$$\\frac{d}{dx}(x^3 + 2x)$$", answer: "$$3x^2 + 2$$" },
      { question: "$$\\frac{d}{dx}(\\sin(x))$$", answer: "$$\\cos(x)$$" },
      { question: "$$\\frac{d}{dx}(e^x)$$", answer: "$$e^x$$" },
      { question: "$$\\frac{d}{dx}(\\ln(x))$$", answer: "$$\\frac{1}{x}$$" },
      { question: "$$\\frac{d}{dx}(x^4 - 3x^2 + 1)$$", answer: "$$4x^3 - 6x$$" },
    ],
    3: [ // Hard
      { question: "$$\\frac{d}{dx}(x^2 \\cos(x))$$", answer: "$$2x\\cos(x) - x^2\\sin(x)$$" },
      { question: "$$\\frac{d}{dx}(\\frac{\\sin(x)}{x})$$", answer: "$$\\frac{x\\cos(x) - \\sin(x)}{x^2}$$" },
      { question: "$$\\frac{d}{dx}(\\ln(x^2+1))$$", answer: "$$\\frac{2x}{x^2+1}$$" },
      { question: "$$\\frac{d}{dx}(\\sqrt{x})$$", answer: "$$\\frac{1}{2\\sqrt{x}}$$"},
      { question: "$$\\frac{d}{dx}(\\tan(x))$$", answer: "$$\\sec^2(x)$$"},
    ],
    4: [ // Insane (more complex chain/product/quotient rules)
      { question: "$$\\frac{d}{dx}((3x^2+1)^4)$$", answer: "$$24x(3x^2+1)^3$$" },
      { question: "$$\\frac{d}{dx}(e^{\\sin(x)})$$", answer: "$$\\cos(x)e^{\\sin(x)}$$" },
      { question: "$$\\frac{d}{dx}(\\tan(x^2))$$", answer: "$$2x\\sec^2(x^2)$$"},
      { question: "$$\\frac{d}{dx}(\\frac{e^x}{x})$$", answer: "$$\\frac{e^x(x-1)}{x^2}$$"},
      { question: "$$\\frac{d}{dx}(\\sin(\\ln(x)))$$", answer: "$$\\frac{\\cos(\\ln(x))}{x}$$"}
    ],
    5: [ // Impossible (implicit, higher order, tricky functions)
      { question: "$$\\frac{d}{dx}(\\sqrt{x^2+1})$$", answer: "$$\\frac{x}{\\sqrt{x^2+1}}$$"},
      { question: "$$\\frac{d}{dx}(\\arcsin(x))$$", answer: "$$\\frac{1}{\\sqrt{1-x^2}}$$"},
      { question: "$$\\frac{d}{dx}(x^x)$$", answer: "$$x^x(1+\\ln(x))$$"},
      { question: "$$\\frac{d}{dx}(\\text{sech}(x))$$", answer: "$$-\\text{sech}(x)\\tanh(x)$$"},
      { question: "$$\\frac{d}{dx}(\\text{arccosh}(x))$$", answer: "$$\\frac{1}{\\sqrt{x^2-1}}$$"}
    ]
  };
}

function getIntegrationProblems() {
  return {
    1: [ // Easy
      { question: "$$\\int x \\, dx$$", answer: "$$\\frac{x^2}{2} + C$$" },
      { question: "$$\\int 4 \\, dx$$", answer: "$$4x + C$$" },
      { question: "$$\\int \\cos(x) \\, dx$$", answer: "$$\\sin(x) + C$$" },
      { question: "$$\\int e^x \\, dx$$", answer: "$$e^x + C$$" },
      { question: "$$\\int \\frac{1}{x} \\, dx$$", answer: "$$\\ln|x| + C$$" },
    ],
    2: [ // Medium
      { question: "$$\\int (x^2 + 3x) \\, dx$$", answer: "$$\\frac{x^3}{3} + \\frac{3x^2}{2} + C$$" },
      { question: "$$\\int e^{2x} \\, dx$$", answer: "$$\\frac{1}{2}e^{2x} + C$$" },
      { question: "$$\\int \\sin(x) \\, dx$$", answer: "$$-\\cos(x) + C$$" },
      { question: "$$\\int (\\frac{1}{\\sqrt{x}}) \\, dx$$", answer: "$$2\\sqrt{x} + C$$"},
      { question: "$$\\int \\sec^2(x) \\, dx$$", answer: "$$\\tan(x) + C$$"}
    ],
    3: [ // Hard (basic substitution, by parts)
      { question: "$$\\int x \\sin(x) \\, dx$$", answer: "$$\\sin(x) - x\\cos(x) + C$$" },
      { question: "$$\\int x e^{x^2} \\, dx$$", answer: "$$\\frac{1}{2}e^{x^2} + C$$" },
      { question: "$$\\int \\ln(x) \\, dx$$", answer: "$$x\\ln(x) - x + C$$" },
      { question: "$$\\int \\frac{1}{x^2+1} \\, dx$$", answer: "$$\\arctan(x) + C$$"},
      { question: "$$\\int \\frac{\\cos(x)}{\\sin(x)} \\, dx$$", answer: "$$\\ln|\\sin(x)| + C$$"}
    ],
    4: [ // Insane (more complex substitution, partial fractions)
      { question: "$$\\int \\frac{1}{x^2-1} \\, dx$$", answer: "$$\\frac{1}{2}\\ln|\\frac{x-1}{x+1}| + C$$" },
      { question: "$$\\int \\frac{x}{x^2+4} \\, dx$$", answer: "$$\\frac{1}{2}\\ln(x^2+4) + C$$" },
      { question: "$$\\int \\sin^2(x) \\, dx$$", answer: "$$\\frac{x}{2} - \\frac{1}{4}\\sin(2x) + C$$"}
    ],
    5: [ // Impossible (trigonometric substitution, advanced by parts)
      { question: "$$\\int \\sqrt{1-x^2} \\, dx$$", answer: "$$\\frac{x}{2}\\sqrt{1-x^2} + \\frac{1}{2}\\arcsin(x) + C$$"},
      { question: "$$\\int e^x \\cos(x) \\, dx$$", answer: "$$\\frac{1}{2}e^x(\\sin(x) + \\cos(x)) + C$$"},
      { question: "$$\\int \\sec^3(x) \\, dx$$", answer: "$$\\frac{1}{2}\\sec(x)\\tan(x) + \\frac{1}{2}\\ln|\\sec(x) + \\tan(x)| + C$$"},
      { question: "$$\\int \\frac{1}{x\\ln(x)} \\, dx$$", answer: "$$\\ln|\\ln(x)| + C$$"},
      { question: "$$\\int \\frac{1}{x^2+4x+5} \\, dx$$", answer: "$$\\arctan(x+2) + C$$"}
    ]
  };
}

/**
 * Checks if the user has logged in today and awards a daily bonus if applicable.
 */
function checkDailyLogin() {
  const today = new Date().toDateString();
  if (gameState.lastPlayed !== today) {
    gameState.dailyStreak++;
    gameState.lastPlayed = today;
    gameState.galacticCoins += 10;
    showDailyRewardNotification(gameState.dailyStreak, 10);
    if (currentUserId) saveUserData(); // Persist streak and coins
  } else {
    console.log("Already received daily reward for today.");
  }
}

/**
 * Displays a notification for the daily login reward.
 */
function showDailyRewardNotification(streak, coinsEarned) {
  const notification = document.createElement("div");
  notification.classList.add('fixed', 'top-10', 'left-1/2', '-translate-x-1/2', 'bg-blue-600', 'text-white', 'p-4', 'rounded-lg', 'shadow-xl', 'z-50', 'text-center', 'animate-fadeInOut');
  notification.innerHTML = `
      <strong class="text-xl">Daily Login Bonus!</strong><br>
      Streak: ${streak} days!<br>
      You earned <em class="font-semibold">${coinsEarned} Galactic Coins!</em>`;
  document.body.appendChild(notification);
  coinSound.play().catch(e => console.error("Error playing sound:", e));

  if (!document.getElementById('fadeInOutStyle')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'fadeInOutStyle';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -50px); }
      }
      .animate-fadeInOut {
        animation: fadeInOut 3s forwards;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  setTimeout(() => notification.remove(), 3000);
}

/**
 * Opens the shop modal and populates it with available items.
 */
function openShopModal() {
  if (domElements.shopModal) {
    domElements.shopModal.classList.remove("hidden");
    domElements.shopModal.classList.add("show");
    populateShopItems();
  }
}

/**
 * Closes the shop modal.
 */
function closeShopModal() {
  if (domElements.shopModal) {
    domElements.shopModal.classList.remove("show");
    domElements.shopModal.classList.add("hidden");
  }
}

/**
 * Populates the shop modal with purchasable items.
 */
function populateShopItems() {
  if (!domElements.shopItemsContainer) return;

  domElements.shopItemsContainer.innerHTML = '';

  for (const itemKey in gameState.shopItems) {
    const item = gameState.shopItems[itemKey];
    const itemElement = document.createElement('div');
    itemElement.classList.add('shop-item');
    itemElement.innerHTML = `
      <h4 class="text-xl font-semibold text-purple-300">${itemKey.replace(/([A-Z])/g, ' $1').trim()}</h4>
      <p class="text-gray-300">${item.description}</p>
      <div class="flex items-center justify-center mt-2">
        <span class="text-yellow-400 text-lg font-bold mr-2">${item.cost}</span>
        <i class="fas fa-coins text-yellow-400 text-xl"></i>
      </div>
      <button class="buy-button mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200" data-item="${itemKey}">
        Buy
      </button>
    `;
    domElements.shopItemsContainer.appendChild(itemElement);
  }

  domElements.shopItemsContainer.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const itemToBuy = event.target.dataset.item;
      purchasePowerUp(itemToBuy);
    });
  });
}

/**
 * Handles the purchase of a power-up from the shop.
 */
function purchasePowerUp(itemKey) {
  const item = gameState.shopItems[itemKey];
  if (!item) {
    console.error("Attempted to purchase non-existent item:", itemKey);
    return;
  }

  if (gameState.galacticCoins >= item.cost) {
    gameState.galacticCoins -= item.cost;
    gameState.powerUps[itemKey]++;
    purchaseSound.play().catch(e => console.error("Error playing sound:", e));
    showPurchaseNotification(`Purchased ${itemKey.replace(/([A-Z])/g, ' $1').trim()}!`, 'success');
    updateScoreDisplay();
    updatePowerUpsDisplay();
    if (currentUserId) saveUserData();
    populateShopItems();
  } else {
    showPurchaseNotification("Not enough coins!", 'error');
    console.log("Not enough coins to buy", itemKey);
  }
}

/**
 * Displays a temporary notification for a purchase.
 */
function showPurchaseNotification(message, type) {
  const notification = document.createElement("div");
  notification.classList.add('fixed', 'top-10', 'left-1/2', '-translate-x-1/2', 'p-4', 'rounded-lg', 'shadow-xl', 'z-50', 'text-center', 'animate-fadeInOut');

  if (type === 'success') {
    notification.classList.add('bg-green-600', 'text-white');
  } else if (type === 'error') {
    notification.classList.add('bg-red-600', 'text-white');
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  if (!document.getElementById('fadeInOutStyle')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'fadeInOutStyle';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -50px); }
      }
      .animate-fadeInOut {
        animation: fadeInOut 3s forwards;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  setTimeout(() => notification.remove(), 3000);
}

/**
 * Opens the AI Assistant modal and displays the solution.
 * Shows a loading indicator while the solution is being fetched.
 */
function showAIAssistantModal() {
  if (domElements.aiAssistantModal) {
    domElements.aiAssistantModal.classList.remove("hidden");
    domElements.aiAssistantModal.classList.add("show");
    domElements.aiSolutionContent.innerHTML = ''; // Clear previous content
    domElements.aiLoadingIndicator.classList.remove('hidden'); // Show loading indicator
  }
}

/**
 * Closes the AI Assistant modal.
 */
function closeAIAssistantModal() {
  if (domElements.aiAssistantModal) {
    domElements.aiAssistantModal.classList.remove("show");
    domElements.aiAssistantModal.classList.add("hidden");
    displayProblem(); // Display next problem after closing AI modal
  }
}

/**
 * Generates a step-by-step solution for the given problem using the Gemini API.
 * @param {object} problem - The problem object containing question and answer.
 * @returns {Promise<string>} A promise that resolves to the LaTeX formatted solution.
 */
async function generateAISolution(problem) {
  const prompt = `Provide a step-by-step solution for the following calculus problem.
  The problem is: ${problem.question}
  The correct answer is: ${problem.answer}
  Please format the solution using LaTeX. Use $$ for display math and $ for inline math.`;

  let chatHistory = [];
  chatHistory.push({ role: "user", parts: [{ text: prompt }] });
  const payload = { contents: chatHistory };
  const apiKey = ""; // Leave as-is, Canvas will provide it at runtime.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        // Log the full response status and text for debugging
        const errorText = await response.text();
        console.error(`AI solution generation failed: HTTP Status ${response.status} - ${response.statusText}`, errorText);
        return `$$Error: API call failed. Status: ${response.status} ${response.statusText}. Please check your console for details and ensure your API key is valid.$$`;
    }

    const result = await response.json();
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error("AI solution generation failed: Unexpected response structure", result);
      return "$$Error: Could not generate solution. Unexpected API response. Please try again.$$";
    }
  } catch (error) {
    console.error("Error calling Gemini API for solution:", error);
    return `$$Error: Failed to connect to AI assistant. Check your network or API key. Details: ${error.message}$$`;
  }
}


/**
 * Updates the navigation links based on authentication status.
 */
function initializeAuthLinks() {
  if (domElements.authLinks) {
    const user = auth.currentUser;
    if (user) {
      domElements.authLinks.innerHTML = `
        <li><a href="profile.html">Profile</a></li>
        <li><a href="#" id="logoutButtonNav">Logout</a></li>
      `;
      const logoutBtnNav = document.getElementById('logoutButtonNav');
      if (logoutBtnNav) {
        logoutBtnNav.addEventListener('click', handleLogout);
      }
    } else {
      domElements.authLinks.innerHTML = `
        <li><a href="login.html">Login</a></li>
        <li><a href="signup.html">Sign Up</a></li>
      `;
    }
  }
}

/**
 * Handles user login with email and password.
 */
async function validateLoginForm() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!emailInput || !passwordInput) {
      console.error("Login form elements not found.");
      return false;
  }

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user.uid);
      window.location.href = 'profile.html'; // Redirect on successful login
  } catch (error) {
      console.error("Error logging in:", error.message);
      showPurchaseNotification(`Login failed: ${error.message}`, 'error');
  }
  return false; // Prevent default form submission
}

/**
 * Handles user signup with email, password, and username.
 */
async function validateSignupForm() {
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!usernameInput || !emailInput || !passwordInput) {
      console.error("Signup form elements not found.");
      return false;
  }

  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      console.log("User signed up:", userId);

      // Save initial user profile data to Firestore
      const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
      await setDoc(userDocRef, {
          username: username,
          email: email,
          highScore: 0,
          galacticCoins: 0,
          powerUps: { skip: 0, doubleScore: 0, extraTime: 0 },
          stats: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 },
          achievements: [],
          dailyStreak: 0,
          lastPlayed: null,
      });
      console.log("Initial user profile created in Firestore.");

      window.location.href = 'login.html'; // Redirect to login after signup
  } catch (error) {
      console.error("Error signing up:", error.message);
      showPurchaseNotification(`Signup failed: ${error.message}`, 'error');
  }
  return false; // Prevent default form submission
}

/**
 * Handles social sign-in with a given Firebase Auth provider.
 * @param {firebase.auth.AuthProvider} provider - The Firebase Auth provider (e.g., GoogleAuthProvider).
 */
async function handleSocialSignIn(provider) {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Social sign-in successful:", user.uid, user.displayName, user.email);

    // Check if user data already exists in Firestore for this user
    const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      // If new user, create a profile in Firestore
      await setDoc(userDocRef, {
        username: user.displayName || user.email.split('@')[0] || "NewUser",
        email: user.email,
        highScore: 0,
        galacticCoins: 0,
        powerUps: { skip: 0, doubleScore: 0, extraTime: 0 },
        stats: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 },
        achievements: [],
        dailyStreak: 0,
        lastPlayed: null,
      });
      console.log("New user profile created in Firestore for social login.");
    }

    window.location.href = 'profile.html'; // Redirect to profile page
  } catch (error) {
    console.error("Social sign-in failed:", error.code, error.message);
    showPurchaseNotification(`Social login failed: ${error.message}`, 'error');
  }
}

// Social Login functions - exposed globally for HTML onclick
window.signInWithGoogle = () => handleSocialSignIn(googleProvider);
window.signInWithApple = () => handleSocialSignIn(appleProvider);
window.signInWithGitHub = () => handleSocialSignIn(githubProvider);
window.signInWithMicrosoft = () => handleSocialSignIn(microsoftProvider);


/**
 * Handles user logout.
 */
async function handleLogout() {
  try {
      await signOut(auth);
      console.log("User logged out successfully.");
      window.location.href = 'index.html'; // Redirect to index page after logout
  } catch (error) {
      console.error("Error logging out:", error.message);
      showPurchaseNotification(`Logout failed: ${error.message}`, 'error');
  }
}

/**
 * Updates the profile display on the profile.html page.
 */
function updateProfileDisplay(username, email, highScore, gamesPlayed, userId) {
  if (domElements.profileUsername) domElements.profileUsername.textContent = username;
  if (domElements.profileEmail) domElements.profileEmail.textContent = email;
  if (domElements.profileHighScore) domElements.profileHighScore.textContent = highScore;
  if (domElements.profileGamesPlayed) domElements.profileGamesPlayed.textContent = gamesPlayed;
  if (domElements.profileUserId) domElements.profileUserId.textContent = userId; // Display the user ID
}

// Event Listeners for Game Page
if (domElements.submitButton) {
  domElements.submitButton.addEventListener("click", validateAnswer);
}
if (domElements.skipButton) {
  domElements.skipButton.addEventListener("click", useSkip);
}
if (domElements.doubleScoreButton) {
  domElements.doubleScoreButton.addEventListener("click", useDoubleScore);
}
if (domElements.extraTimeButton) {
  domElements.extraTimeButton.addEventListener("click", useExtraTime);
}
if (domElements.shopButton) {
  domElements.shopButton.addEventListener("click", openShopModal);
}
if (domElements.shopModal) {
  const closeShopBtn = domElements.shopModal.querySelector('.close-button');
  if (closeShopBtn) {
    closeShopBtn.addEventListener('click', closeShopModal);
  }
}
if (domElements.aiAssistantModal) { // New: AI Assistant modal close button
  const closeAIAssistantBtn = domElements.aiAssistantModal.querySelector('.close-button');
  if (closeAIAssistantBtn) {
    closeAIAssistantBtn.addEventListener('click', closeAIAssistantModal);
  }
}

// Event listener for the "Restart Game" button in the Game Over modal
if (domElements.gameOverModal) {
    const restartBtn = domElements.gameOverModal.querySelector('.btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
    }
}

// Event listeners for login/signup/profile pages
if (domElements.loginForm) {
  domElements.loginForm.addEventListener('submit', validateLoginForm);
}
if (domElements.signupForm) {
  domElements.signupForm.addEventListener('submit', validateSignupForm);
}
if (domElements.logoutButton) {
  domElements.logoutButton.addEventListener('click', handleLogout);
}

// Initial calls for profile page (if on profile.html)
if (window.location.pathname.includes('profile.html')) {
  // This will be handled by onAuthStateChanged which calls loadUserData
  // and then updateProfileDisplay with actual user data.
  // We simply ensure the DOM elements are ready.
}
