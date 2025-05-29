console.log("Script loaded.");

// Ensure DOM is fully loaded before initializing the game
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. Initializing game...");
  initializeGame();
  // Initialize auth links on all pages that use the navbar
  initializeAuthLinks();
});

/**
 * Global game state object.
 * Manages all dynamic data related to the game session,
 * including scores, lives, timer, current problem, user settings,
 * achievements, leaderboard, power-ups, and game statistics.
 */
const gameState = {
  score: 0,
  highScore: parseInt(localStorage.getItem("highScore")) || 0, // Load high score from local storage
  lives: 10,
  timer: 120, // Default game timer in seconds
  timerInterval: null, // Stores the interval ID for the game timer
  isPaused: false, // Flag to indicate if the game is paused
  currentProblem: null, // Stores the current math problem object
  achievements: JSON.parse(localStorage.getItem("achievements")) || [], // User achievements
  dailyStreak: parseInt(localStorage.getItem("dailyStreak")) || 0, // Daily login streak
  lastPlayed: localStorage.getItem("lastPlayed") || null, // Last played date for streak calculation
  galacticCoins: parseInt(localStorage.getItem("galacticCoins")) || 0, // New: In-game currency
  settings:
    JSON.parse(localStorage.getItem("gameSettings")) || {
      difficulty: 2, // Numeric difficulty (1: easy, 2: medium, 3: hard, etc.)
      questionTypes: ["diff", "antiderivative"], // Types of questions to generate
      timer: 120, // Initial timer setting
    },
  leaderboard: JSON.parse(localStorage.getItem("leaderboard")) || [], // Top scores
  powerUps: { skip: 0, doubleScore: 0, extraTime: 0 }, // Available power-ups
  stats: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 }, // In-game statistics
  milestones: {
    scoreMilestones: { 50: "skip", 100: "doubleScore", 200: "extraTime" }, // Score thresholds for power-ups
    streakMilestones: { 5: "doubleScore", 10: "extraTime", 15: "skip" }, // Streak thresholds for power-ups
  },
  milestoneHistory: [], // Tracks unlocked milestones during the current session
  shopItems: { // Define shop items and their costs
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
  galacticCoins: document.getElementById("galactic-coins-value"), // New: Galactic Coins display
  question: document.getElementById("equation"), // Element to display the math problem
  answerInput: document.getElementById("answer"), // Input field for user's answer
  submitButton: document.getElementById("submit"), // Button to submit answer
  gameOverModal: document.getElementById("gameOverModal"), // Game Over modal
  finalScoreDisplay: document.getElementById("final-score-display"), // Display final score in modal
  navbar: document.getElementById("navbar-brand"), // Navbar brand link (though not directly used for updates here)
  leaderboard: document.getElementById("leaderboard"), // Leaderboard display area
  skipButton: document.getElementById("skip-button"), // Skip power-up button
  doubleScoreButton: document.getElementById("double-score-button"), // Double Score power-up button
  extraTimeButton: document.getElementById("extra-time-button"), // Extra Time power-up button
  stats: document.getElementById("stats"), // Detailed game stats display area
  milestoneHistory: document.getElementById("milestone-history"), // Milestone history display area
  shopButton: document.getElementById("shop-button"), // New: Shop button
  shopModal: document.getElementById("shopModal"), // New: Shop modal
  shopItemsContainer: document.getElementById("shop-items-container"), // New: Container for shop items
  // Auth related elements (placeholders for now)
  authLinks: document.getElementById("auth-links"),
  loginForm: document.getElementById("login-form"),
  signupForm: document.getElementById("signup-form"),
  logoutButton: document.getElementById("logout"),
  profileUsername: document.getElementById("profile-username"),
  profileEmail: document.getElementById("profile-email"),
  profileHighScore: document.getElementById("profile-high-score"),
  profileGamesPlayed: document.getElementById("profile-games-played"),
};

// Audio for feedback (ensure these paths are correct or provide placeholder sounds)
// These would typically be loaded from a 'sounds' directory.
const correctSound = new Audio("sounds/correct.mp3"); // Placeholder for correct answer sound
const wrongSound = new Audio("sounds/wrong.mp3");   // Placeholder for wrong answer sound
const coinSound = new Audio("sounds/coin.mp3"); // New: Coin sound
const purchaseSound = new Audio("sounds/purchase.mp3"); // New: Purchase sound

/**
 * Updates the displayed score, high score, lives, and galactic coins in the UI.
 * Also checks if the current score exceeds the high score and updates it in local storage.
 */
function updateScoreDisplay() {
  const { score, highScore, lives, galacticCoins } = gameState;
  domElements.score.textContent = `Score: ${score}`;
  domElements.lives.textContent = `Lives: ${lives}`;
  domElements.galacticCoins.textContent = `Coins: ${galacticCoins}`; // Update coins display
  if (score > highScore) {
    gameState.highScore = score;
    localStorage.setItem("highScore", score); // Persist high score
  }
  domElements.highScore.textContent = `High Score: ${gameState.highScore}`;
  checkMilestones(); // Check for any unlocked milestones after score update
}

/**
 * Updates the text content of power-up buttons to reflect current counts.
 */
function updatePowerUpsDisplay() {
  domElements.skipButton.textContent = `Skip (${gameState.powerUps.skip})`;
  domElements.doubleScoreButton.textContent = `Double Score (${gameState.powerUps.doubleScore})`;
  domElements.extraTimeButton.textContent = `Extra Time (${gameState.powerUps.extraTime})`;
}

/**
 * Updates the detailed game statistics display in the UI.
 */
function updateStatsDisplay() {
  const { totalQuestions, correctAnswers, incorrectAnswers } = gameState.stats;
  domElements.stats.innerHTML = `
    <h3 class="text-2xl font-semibold text-blue-300 mb-4">Game Statistics</h3>
    <p><strong>Total Questions:</strong> ${totalQuestions}</p>
    <p><strong>Correct Answers:</strong> ${correctAnswers}</p>
    <p><strong>Incorrect Answers:</strong> ${incorrectAnswers}</p>
  `;
}

/**
 * Helper function to update the game score.
 * @param {number} value - The amount to add to the current score.
 */
function updateScore(value) {
  gameState.score += value;
  domElements.score.textContent = `Score: ${gameState.score}`;
  checkMilestones(); // Check for milestones after score change
}

/**
 * Checks if any score or streak milestones have been reached.
 * If a milestone is reached, it unlocks the associated power-up and removes the milestone
 * from the active list to prevent re-triggering.
 */
function checkMilestones() {
  // Score-based milestones
  Object.keys(gameState.milestones.scoreMilestones).forEach((milestone) => {
    const milestoneValue = parseInt(milestone);
    if (gameState.score >= milestoneValue && gameState.milestones.scoreMilestones[milestone]) {
      const powerUp = gameState.milestones.scoreMilestones[milestone];
      unlockMilestone(milestoneValue, powerUp, "score");
      delete gameState.milestones.scoreMilestones[milestone];
    }
  });

  // Streak-based milestones (currently tied to correctAnswers, could be a separate streak counter)
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
 * @param {number} value - The milestone value (score or streak).
 * @param {string} powerUp - The type of power-up unlocked (e.g., "skip", "doubleScore").
 * @param {string} type - The type of milestone ("score" or "streak").
 */
function unlockMilestone(value, powerUp, type) {
  gameState.powerUps[powerUp]++;
  gameState.milestoneHistory.push({ type, value, powerUp, timestamp: new Date().toISOString() });
  showMilestoneNotification(powerUp, type, value);
  updateMilestoneHistoryDisplay();
  updatePowerUpsDisplay();
}

/**
 * Displays a temporary notification for an unlocked milestone.
 * @param {string} powerUp - The type of power-up gained.
 * @param {string} type - The type of milestone (score/streak).
 * @param {number} value - The milestone value.
 */
function showMilestoneNotification(powerUp, type, value) {
  const notification = document.createElement("div");
  notification.classList.add('fixed', 'top-10', 'left-1/2', '-translate-x-1/2', 'bg-green-600', 'text-white', 'p-4', 'rounded-lg', 'shadow-xl', 'z-50', 'text-center', 'animate-fadeInOut');
  notification.innerHTML = `
      <strong class="text-xl">Milestone Reached!</strong><br>
      ${type.charAt(0).toUpperCase() + type.slice(1)} Milestone (${value})<br>
      Gained 1 <em class="font-semibold">${powerUp.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}</em> power-up!`;
  document.body.appendChild(notification);

  const styleSheet = document.createElement("style");
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

  setTimeout(() => notification.remove(), 3000);
}

/**
 * Updates the display of the milestone history section.
 */
function updateMilestoneHistoryDisplay() {
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

/**
 * Handles the usage of a power-up.
 * Decrements the power-up count and applies its effect.
 * @param {string} type - The type of power-up to use ("skip", "doubleScore", "extraTime").
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
      gameState.score += 20; // Example: adds a flat 20 points
      updateScoreDisplay();
    }
    updatePowerUpsDisplay();
    // Persist power-up changes if needed, though usually handled by game end/save
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
    domElements.timer.textContent = `Time: ${gameState.timer}`;
    if (gameState.timer <= 0) {
      endGame();
    }
  }, 1000);
}

/**
 * Generates a random math problem based on selected question types and difficulty.
 * This is a placeholder and should be expanded with more complex problem generation logic.
 * @param {string} [type] - Specific type of problem to generate ("diff" or "antiderivative").
 * @returns {object} - An object containing the question (LaTeX string) and its answer.
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

  const problemSetForDifficulty = problemsByType[selectedType][currentDifficulty];

  if (!problemSetForDifficulty || problemSetForDifficulty.length === 0) {
    console.error(`No problems found for type: ${selectedType} and difficulty: ${currentDifficulty}. Generating a fallback problem.`);
    return { question: "$$\\frac{d}{dx}(x)$$", answer: "$$1$$" };
  }

  return problemSetForDifficulty[Math.floor(Math.random() * problemSetForDifficulty.length)];
}


/**
 * Creates a new problem and displays it in the UI using MathLive.
 * Clears the answer input field.
 * @returns {object} The newly generated problem.
 */
function newProblem() {
  const problem = generateProblem();
  const mathField = document.createElement("math-field");
  mathField.value = problem.question;
  mathField.readOnly = true;
  mathField.virtualKeyboardMode = "off";
  mathField.showMenu = false;
  domElements.question.innerHTML = "";
  domElements.question.appendChild(mathField);
  console.log("New Problem:", problem.question);
  domElements.answerInput.value = "";
  // Removed direct class manipulation here, as styles.css handles focus/error states
  domElements.answerInput.classList.remove("correct-answer-feedback", "incorrect-answer-feedback");
  return problem;
}

/**
 * Displays a new problem, increments total questions, and updates stats.
 */
function displayProblem() {
  gameState.currentProblem = newProblem();
  gameState.stats.totalQuestions++;
  updateStatsDisplay();
  updateTimer();
}

/**
 * Validates the user's answer against the current problem's answer.
 * Triggers appropriate handlers for correct or incorrect answers.
 */
function validateAnswer() {
  const userAnswer = domElements.answerInput.value.trim();
  const correctAnswer = gameState.currentProblem.answer.trim().replace(/\\, \+ C/g, '').replace(/\s/g, '');
  const cleanedUserAnswer = userAnswer.replace(/\\, \+ C/g, '').replace(/\s/g, '');

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
  gameState.galacticCoins += 5; // Award 5 coins per correct answer
  gameState.timer += 10;
  correctSound.play();
  coinSound.play(); // Play coin sound
  gameState.stats.correctAnswers++;
  domElements.answerInput.classList.add("correct-answer-feedback"); // Add class for visual feedback
  setTimeout(() => {
    domElements.answerInput.classList.remove("correct-answer-feedback");
    updateScoreDisplay();
    displayProblem();
  }, 500); // Short delay for feedback
}

/**
 * Handles an incorrect answer: decrements lives, plays sound,
 * updates stats, and checks for game over.
 */
function handleIncorrectAnswer() {
  gameState.lives--;
  wrongSound.play();
  gameState.stats.incorrectAnswers++;
  domElements.answerInput.classList.add("incorrect-answer-feedback"); // Add class for visual feedback
  setTimeout(() => {
    domElements.answerInput.classList.remove("incorrect-answer-feedback");
    updateScoreDisplay();
    if (gameState.lives <= 0) {
      endGame();
    }
  }, 500); // Short delay for feedback
}

/**
 * Adjusts game difficulty based on the numeric slider value from settings.
 * Modifies initial timer and lives accordingly.
 * @param {number} difficultyValue - The difficulty level (1-5).
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
  domElements.timer.textContent = `Time: ${gameState.timer}`;
  domElements.lives.textContent = `Lives: ${gameState.lives}`;
}

/**
 * Updates the timer display. Called by setInterval in startTimer.
 */
function updateTimer() {
  domElements.timer.textContent = `Time: ${gameState.timer}`;
  if (gameState.timer <= 0) {
    endGame();
  }
}

/**
 * Ends the game: clears timer, displays final score, shows game over modal,
 * and updates the leaderboard.
 */
function endGame() {
  clearInterval(gameState.timerInterval);
  const finalScore = gameState.score;
  domElements.finalScoreDisplay.querySelector('span').textContent = finalScore;
  domElements.gameOverModal.classList.remove("hidden");
  domElements.gameOverModal.classList.add("show");
  updateLeaderboard(finalScore);
  // Save game state to local storage when game ends
  saveGameState();
}

/**
 * Saves relevant game state data to local storage.
 */
function saveGameState() {
  localStorage.setItem("highScore", gameState.highScore);
  localStorage.setItem("galacticCoins", gameState.galacticCoins);
  localStorage.setItem("achievements", JSON.stringify(gameState.achievements));
  localStorage.setItem("dailyStreak", gameState.dailyStreak);
  localStorage.setItem("lastPlayed", gameState.lastPlayed);
  localStorage.setItem("leaderboard", JSON.stringify(gameState.leaderboard));
  // You might want to save power-up counts if they persist across games
  localStorage.setItem("powerUps", JSON.stringify(gameState.powerUps));
}

/**
 * Loads relevant game state data from local storage.
 */
function loadGameState() {
  gameState.highScore = parseInt(localStorage.getItem("highScore")) || 0;
  gameState.galacticCoins = parseInt(localStorage.getItem("galacticCoins")) || 0;
  gameState.achievements = JSON.parse(localStorage.getItem("achievements")) || [];
  gameState.dailyStreak = parseInt(localStorage.getItem("dailyStreak")) || 0;
  gameState.lastPlayed = localStorage.getItem("lastPlayed") || null;
  gameState.leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  gameState.powerUps = JSON.parse(localStorage.getItem("powerUps")) || { skip: 0, doubleScore: 0, extraTime: 0 };
}


/**
 * Adds the current game score to the leaderboard and persists it.
 * Sorts the leaderboard and keeps only the top 10 entries.
 * @param {number} score - The final score to add to the leaderboard.
 */
function updateLeaderboard(score) {
  const newEntry = { score, timestamp: new Date().toISOString() };
  gameState.leaderboard.push(newEntry);
  gameState.leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(gameState.leaderboard.slice(0, 10)));
  displayLeaderboard();
}

/**
 * Displays the current top 10 scores in the leaderboard section.
 */
function displayLeaderboard() {
  domElements.leaderboard.innerHTML = '<h3 class="text-2xl font-semibold text-blue-300 mb-4">Leaderboard</h3>';
  const topScores = gameState.leaderboard.slice(0, 10);
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
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200">${entry.score}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${formattedTimestamp}</td>
    `;
  });
  domElements.leaderboard.appendChild(table);
}

/**
 * Initializes the game state and UI elements when the page loads.
 * Loads settings, updates displays, starts timer, and displays the first problem.
 */
function initializeGame() {
  console.log("Initializing game state...");

  loadGameState(); // Load existing game state

  const savedSettings = JSON.parse(localStorage.getItem("gameSettings"));
  if (savedSettings) {
    gameState.settings = {
      ...gameState.settings,
      ...savedSettings,
    };
  }

  adjustGameDifficulty(gameState.settings.difficulty);

  updateScoreDisplay();
  updatePowerUpsDisplay();
  updateStatsDisplay();
  updateMilestoneHistoryDisplay();
  displayLeaderboard();
  checkDailyLogin(); // Check for daily login reward

  // Only start timer and display problem if on the game page
  if (window.location.pathname.includes('game.html')) {
    startTimer();
    displayProblem();
  }

  console.log("Game initialized with settings:", gameState.settings);
}


// --- Problem Generation Helper Functions ---

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

// --- Daily Login Reward System ---

/**
 * Checks if the user has logged in today and awards a daily bonus if applicable.
 */
function checkDailyLogin() {
  const today = new Date().toDateString();
  if (gameState.lastPlayed !== today) {
    gameState.dailyStreak++;
    gameState.lastPlayed = today;
    gameState.galacticCoins += 10; // Daily bonus coins
    showDailyRewardNotification(gameState.dailyStreak, 10);
    saveGameState(); // Persist streak and coins
  } else {
    console.log("Already received daily reward for today.");
  }
}

/**
 * Displays a notification for the daily login reward.
 * @param {number} streak - Current daily streak.
 * @param {number} coinsEarned - Coins earned today.
 */
function showDailyRewardNotification(streak, coinsEarned) {
  const notification = document.createElement("div");
  notification.classList.add('fixed', 'top-10', 'left-1/2', '-translate-x-1/2', 'bg-blue-600', 'text-white', 'p-4', 'rounded-lg', 'shadow-xl', 'z-50', 'text-center', 'animate-fadeInOut');
  notification.innerHTML = `
      <strong class="text-xl">Daily Login Bonus!</strong><br>
      Streak: ${streak} days!<br>
      You earned <em class="font-semibold">${coinsEarned} Galactic Coins!</em>`;
  document.body.appendChild(notification);
  coinSound.play(); // Play coin sound for daily reward

  const styleSheet = document.createElement("style");
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

  setTimeout(() => notification.remove(), 3000);
}

// --- Shop Functions ---

/**
 * Opens the shop modal and populates it with available items.
 */
function openShopModal() {
  if (domElements.shopModal) {
    domElements.shopModal.classList.add("show");
    domElements.shopModal.classList.remove("hidden");
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

  domElements.shopItemsContainer.innerHTML = ''; // Clear previous items

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

  // Add event listeners to buy buttons
  domElements.shopItemsContainer.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const itemToBuy = event.target.dataset.item;
      purchasePowerUp(itemToBuy);
    });
  });
}

/**
 * Handles the purchase of a power-up from the shop.
 * @param {string} itemKey - The key of the item to purchase (e.g., "skip").
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
    purchaseSound.play(); // Play purchase sound
    showPurchaseNotification(`Purchased ${itemKey.replace(/([A-Z])/g, ' $1').trim()}!`, 'success');
    updateScoreDisplay(); // Update coins display
    updatePowerUpsDisplay(); // Update power-ups display
    saveGameState(); // Persist changes
    populateShopItems(); // Re-populate shop to reflect coin change
  } else {
    showPurchaseNotification("Not enough coins!", 'error');
    console.log("Not enough coins to buy", itemKey);
  }
}

/**
 * Displays a temporary notification for a purchase.
 * @param {string} message - The message to display.
 * @param {string} type - "success" or "error".
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

  const styleSheet = document.createElement("style");
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

  setTimeout(() => notification.remove(), 3000);
}


// --- Authentication Related Functions (PLACEHOLDERS) ---
// These functions would typically interact with a backend authentication service (e.g., Firebase Auth)

function initializeAuthLinks() {
  // This function would check if a user is logged in
  // and update the #auth-links ul accordingly.
  // For now, it just ensures the links are visible.
  if (domElements.authLinks) {
    // Example: If user is logged in, show 'Profile' and 'Logout'
    // Else, show 'Login' and 'Sign Up'
    // This logic would be replaced with actual auth state checking
    const isLoggedIn = false; // Placeholder
    if (isLoggedIn) {
      domElements.authLinks.innerHTML = `
        <li><a href="profile.html">Profile</a></li>
        <li><a href="#" id="logoutButtonNav">Logout</a></li>
      `;
      // Add event listener to dynamically created logout button
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

function validateLoginForm() {
  // Placeholder for login form validation and submission
  console.log("Login form submitted (placeholder)");
  // In a real app, you'd send data to a server and handle response
  // For now, just prevent default submission and simulate success
  // window.location.href = 'profile.html'; // Redirect on successful login
  return false; // Prevent default form submission
}

function validateSignupForm() {
  // Placeholder for signup form validation and submission
  console.log("Signup form submitted (placeholder)");
  // In a real app, you'd send data to a server and handle response
  // For now, just prevent default submission and simulate success
  // window.location.href = 'login.html'; // Redirect to login after signup
  return false; // Prevent default form submission
}

function handleLogout() {
  // Placeholder for logout logic
  console.log("User logged out (placeholder)");
  // Clear user session, update auth links, redirect to index
  // window.location.href = 'index.html';
}

function updateProfileDisplay(username, email, highScore, gamesPlayed) {
  if (domElements.profileUsername) domElements.profileUsername.textContent = username;
  if (domElements.profileEmail) domElements.profileEmail.textContent = email;
  if (domElements.profileHighScore) domElements.profileHighScore.textContent = highScore;
  if (domElements.profileGamesPlayed) domElements.profileGamesPlayed.textContent = gamesPlayed;
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
if (domElements.shopButton) { // New: Shop button event listener
  domElements.shopButton.addEventListener("click", openShopModal);
}
if (domElements.shopModal) { // New: Close shop modal button
  const closeShopBtn = domElements.shopModal.querySelector('.close-button');
  if (closeShopBtn) {
    closeShopBtn.addEventListener('click', closeShopModal);
  }
}


// Event listener for the "Restart Game" button in the Game Over modal
if (domElements.gameOverModal) {
    const restartBtn = domElements.gameOverModal.querySelector('.btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            location.reload(); // Reload the page to restart the game
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
// This would be replaced with actual user data fetching
if (window.location.pathname.includes('profile.html')) {
  // Simulate fetching user data
  const currentUser = {
    username: "SpaceExplorer",
    email: "user@galactic.com",
    highScore: gameState.highScore, // Use actual high score from game state
    gamesPlayed: gameState.stats.totalQuestions // Use total questions as games played (simple)
  };
  updateProfileDisplay(currentUser.username, currentUser.email, currentUser.highScore, currentUser.gamesPlayed);
}
