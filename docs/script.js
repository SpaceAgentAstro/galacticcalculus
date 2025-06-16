class GalacticCalculus {
    constructor() {
        this.currentQuestionIndex = 0;
        this.currentQuestions = [];
        this.selectedDifficulty = 'medium';
        this.selectedTopic = 'algebra';
        this.selectedMode = 'classic';
        this.selectedMainMode = 'learning'; // learning or quiz
        this.questionCount = 10;
        this.score = 0;
        this.correctAnswers = 0;
        this.timer = null;
        this.timeLeft = 30;
        this.quizStartTime = null;
        this.hintsUsed = 0;
        this.userData = this.loadUserData();
        
        // Mode-specific properties
        this.lives = 3;
        this.streak = 0;
        this.maxStreak = 0;
        this.timeAttackDuration = 120; // 2 minutes
        this.accuracyTarget = 90; // 90% accuracy target
        this.questionsAnswered = 0;
        
        // Learning mode properties
        this.placementTestActive = false;
        this.placementResults = null;
        this.currentLesson = null;
        this.lessonStep = 0;
        this.learningPath = [];
        
        this.init();
    }

    init() {
        this.showLoadingScreen();
        this.setupEventListeners();
        this.updateStatsDisplay();
        
        // Simulate loading time
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showScreen('home-screen');
        }, 3000);
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    setupEventListeners() {
        // Main mode selection (Learning vs Quiz)
        document.querySelectorAll('[data-main-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-main-mode]').forEach(b => 
                    b.classList.remove('selected-main-mode'));
                e.target.classList.add('selected-main-mode');
                this.selectedMainMode = e.target.dataset.mainMode;
                this.updateMainModeUI();
            });
        });

        // Quiz mode selection
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-mode]').forEach(b => 
                    b.classList.remove('selected-mode'));
                e.target.classList.add('selected-mode');
                this.selectedMode = e.target.dataset.mode;
                this.updateModeDescription();
            });
        });

        // Difficulty selection
        document.querySelectorAll('[data-difficulty]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-difficulty]').forEach(b => 
                    b.classList.remove('selected-difficulty'));
                e.target.classList.add('selected-difficulty');
                this.selectedDifficulty = e.target.dataset.difficulty;
            });
        });

        // Topic selection
        document.getElementById('topic-select').addEventListener('change', (e) => {
            this.selectedTopic = e.target.value;
        });

        // Question count selection
        document.getElementById('question-count').addEventListener('change', (e) => {
            this.questionCount = parseInt(e.target.value);
        });

        // Navigation buttons
        document.getElementById('start-learning').addEventListener('click', () => this.startLearningMode());
        document.getElementById('start-quiz').addEventListener('click', () => this.startQuiz());
        document.getElementById('view-stats').addEventListener('click', () => this.showStats());
        document.getElementById('back-to-home').addEventListener('click', () => this.showScreen('home-screen'));
        document.getElementById('play-again').addEventListener('click', () => this.startQuiz());
        document.getElementById('change-settings').addEventListener('click', () => this.showScreen('home-screen'));
        document.getElementById('view-detailed-stats').addEventListener('click', () => this.showStats());

        // Quiz controls
        document.getElementById('submit-answer').addEventListener('click', () => this.submitAnswer());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('quit-quiz').addEventListener('click', () => this.quitQuiz());

        // Placement test controls
        document.getElementById('placement-submit-answer').addEventListener('click', () => this.submitPlacementAnswer());
        document.getElementById('placement-skip-btn').addEventListener('click', () => this.skipPlacementQuestion());
        document.getElementById('placement-quit').addEventListener('click', () => this.quitPlacement());

        // Learning controls
        document.getElementById('learning-next').addEventListener('click', () => this.nextLearningStep());
        document.getElementById('learning-back').addEventListener('click', () => this.previousLearningStep());
        document.getElementById('learning-hint').addEventListener('click', () => this.showLearningHint());
        document.getElementById('learning-home').addEventListener('click', () => this.showScreen('home-screen'));
        document.getElementById('practice-submit-answer').addEventListener('click', () => this.submitPracticeAnswer());

        // Roadmap controls
        document.getElementById('start-roadmap').addEventListener('click', () => this.startRoadmap());
        document.getElementById('retake-placement').addEventListener('click', () => this.startPlacementTest());
        document.getElementById('roadmap-to-home').addEventListener('click', () => this.showScreen('home-screen'));

        // Answer input
        document.getElementById('answer-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        document.getElementById('placement-answer-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitPlacementAnswer();
            }
        });

        document.getElementById('practice-answer-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitPracticeAnswer();
            }
        });

        // Reset stats
        document.getElementById('reset-stats').addEventListener('click', () => this.resetStats());
    }

    updateMainModeUI() {
        const quizSection = document.querySelector('.quiz-mode-section');
        const modeInfo = document.getElementById('mode-info');
        const startLearningBtn = document.getElementById('start-learning');
        const startQuizBtn = document.getElementById('start-quiz');
        const roadmapStatus = document.getElementById('roadmap-status');
        
        if (this.selectedMainMode === 'learning') {
            // Show learning mode
            quizSection.style.display = 'none';
            startLearningBtn.style.display = 'block';
            startQuizBtn.style.display = 'none';
            
            modeInfo.querySelector('h4').textContent = 'Learning Roadmap';
            modeInfo.querySelector('p').textContent = 'Take a placement test to assess your skills, then follow a personalized learning path with lessons and practice.';
            
            // Check if user has already taken placement test
            if (this.userData.placementResults) {
                document.getElementById('learning-btn-text').textContent = 'Continue Learning';
                roadmapStatus.style.display = 'block';
                this.updateRoadmapStatus();
            } else {
                document.getElementById('learning-btn-text').textContent = 'Take Placement Test';
                roadmapStatus.style.display = 'none';
            }
        } else {
            // Show quiz mode
            quizSection.style.display = 'block';
            startLearningBtn.style.display = 'none';
            startQuizBtn.style.display = 'block';
            roadmapStatus.style.display = 'none';
            this.updateModeDescription();
        }
    }

    updateModeDescription() {
        const modeInfo = document.getElementById('mode-info');
        const classicSettings = document.querySelector('.classic-settings');
        
        const descriptions = {
            classic: {
                title: 'Classic Quiz',
                description: 'Traditional quiz mode with a set number of questions. Perfect for learning and practice.'
            },
            survival: {
                title: 'Survival Mode',
                description: 'Answer questions correctly to stay alive! You have 3 lives. One wrong answer = one life lost. How long can you survive?'
            },
            'time-attack': {
                title: 'Time Attack',
                description: 'Race against time! Answer as many questions as possible in 2 minutes. Speed and accuracy both matter.'
            },
            accuracy: {
                title: 'Accuracy Challenge',
                description: 'Maintain 90% accuracy or higher! Answer 20 questions while keeping your accuracy above the target.'
            }
        };

        const mode = descriptions[this.selectedMode];
        modeInfo.querySelector('h4').textContent = mode.title;
        modeInfo.querySelector('p').textContent = mode.description;

        // Show/hide classic settings
        if (this.selectedMode === 'classic') {
            classicSettings.classList.remove('hidden');
        } else {
            classicSettings.classList.add('hidden');
        }
    }

    updateRoadmapStatus() {
        if (!this.userData.learningProgress) return;
        
        const currentTopic = document.getElementById('current-topic');
        const currentLevel = document.getElementById('current-level');
        const roadmapProgress = document.getElementById('roadmap-progress');
        const progressText = document.getElementById('roadmap-progress-text');
        
        const progress = this.userData.learningProgress;
        currentTopic.textContent = this.formatTopicName(progress.currentTopic);
        currentLevel.textContent = this.capitalizeFirst(progress.currentLevel);
        
        const completedLessons = progress.completedLessons || 0;
        const totalLessons = progress.totalLessons || 10;
        const progressPercent = (completedLessons / totalLessons) * 100;
        
        roadmapProgress.style.width = `${progressPercent}%`;
        progressText.textContent = `${completedLessons}/${totalLessons} lessons completed`;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Learning Mode Methods
    startLearningMode() {
        if (this.userData.placementResults) {
            // User has already taken placement test, continue with roadmap
            this.showRoadmap();
        } else {
            // Start placement test
            this.startPlacementTest();
        }
    }

    startPlacementTest() {
        this.placementTestActive = true;
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.currentQuestions = [...window.placementTest];
        this.placementResults = {
            scores: {},
            totalScore: 0,
            maxScore: this.currentQuestions.reduce((sum, q) => sum + q.points, 0)
        };
        
        this.showScreen('placement-screen');
        this.displayPlacementQuestion();
    }

    displayPlacementQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
        document.getElementById('placement-progress-fill').style.width = `${progress}%`;
        document.getElementById('placement-progress-text').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;
        document.getElementById('placement-question-number').textContent = 
            `Question ${this.currentQuestionIndex + 1}`;
        
        // Display question
        document.getElementById('placement-question-text').textContent = question.question;
        
        // Render math equation if present
        const equationElement = document.getElementById('placement-question-equation');
        if (question.equation) {
            equationElement.innerHTML = question.equation;
            if (window.katex) {
                try {
                    katex.render(question.equation, equationElement, {
                        throwOnError: false,
                        displayMode: true
                    });
                } catch (e) {
                    console.error('KaTeX rendering error:', e);
                    equationElement.textContent = question.equation;
                }
            }
        } else {
            equationElement.innerHTML = '';
        }
        
        // Display answer options
        this.displayPlacementAnswerOptions(question);
    }

    displayPlacementAnswerOptions(question) {
        const optionsContainer = document.getElementById('placement-answer-options');
        const inputContainer = document.getElementById('placement-answer-input');
        
        if (question.type === 'multiple-choice') {
            optionsContainer.style.display = 'grid';
            inputContainer.style.display = 'none';
            
            optionsContainer.innerHTML = '';
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'answer-option';
                optionElement.textContent = option;
                optionElement.dataset.index = index;
                
                optionElement.addEventListener('click', () => {
                    document.querySelectorAll('#placement-answer-options .answer-option').forEach(opt => 
                        opt.classList.remove('selected'));
                    optionElement.classList.add('selected');
                });
                
                optionsContainer.appendChild(optionElement);
            });
        } else {
            optionsContainer.style.display = 'none';
            inputContainer.style.display = 'flex';
            document.getElementById('placement-answer-field').value = '';
            document.getElementById('placement-answer-field').focus();
        }
    }

    submitPlacementAnswer() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        let userAnswer;
        let isCorrect = false;
        
        if (question.type === 'multiple-choice') {
            const selectedOption = document.querySelector('#placement-answer-options .answer-option.selected');
            if (!selectedOption) {
                this.showErrorMessage('Please select an answer');
                return;
            }
            userAnswer = selectedOption.textContent;
            isCorrect = userAnswer === question.correctAnswer;
        } else {
            userAnswer = document.getElementById('placement-answer-field').value.trim();
            if (!userAnswer) {
                this.showErrorMessage('Please enter an answer');
                return;
            }
            
            const normalizedUser = this.normalizeAnswer(userAnswer);
            const normalizedCorrect = this.normalizeAnswer(question.correctAnswer);
            isCorrect = normalizedUser === normalizedCorrect;
        }
        
        // Record result
        if (isCorrect) {
            this.correctAnswers++;
            this.placementResults.totalScore += question.points;
            
            if (!this.placementResults.scores[question.topic]) {
                this.placementResults.scores[question.topic] = { correct: 0, total: 0 };
            }
            this.placementResults.scores[question.topic].correct += question.points;
        }
        
        if (!this.placementResults.scores[question.topic]) {
            this.placementResults.scores[question.topic] = { correct: 0, total: 0 };
        }
        this.placementResults.scores[question.topic].total += question.points;
        
        // Move to next question
        setTimeout(() => this.nextPlacementQuestion(), 1000);
    }

    skipPlacementQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        
        // Record as incorrect
        if (!this.placementResults.scores[question.topic]) {
            this.placementResults.scores[question.topic] = { correct: 0, total: 0 };
        }
        this.placementResults.scores[question.topic].total += question.points;
        
        this.nextPlacementQuestion();
    }

    nextPlacementQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.finishPlacementTest();
        } else {
            this.displayPlacementQuestion();
        }
    }

    finishPlacementTest() {
        // Calculate skill levels based on scores
        const skillLevels = {};
        
        Object.keys(this.placementResults.scores).forEach(topic => {
            const score = this.placementResults.scores[topic];
            const percentage = score.total > 0 ? (score.correct / score.total) * 100 : 0;
            
            if (percentage >= 70) {
                skillLevels[topic] = 'advanced';
            } else if (percentage >= 40) {
                skillLevels[topic] = 'intermediate';
            } else {
                skillLevels[topic] = 'beginner';
            }
        });
        
        // Save results
        this.userData.placementResults = {
            ...this.placementResults,
            skillLevels: skillLevels,
            completedAt: Date.now()
        };
        
        // Generate learning path
        this.generateLearningPath();
        
        this.saveUserData();
        this.showRoadmap();
    }

    generateLearningPath() {
        const path = [];
        const topics = ['algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'number-theory'];
        
        topics.forEach((topic, index) => {
            const level = this.userData.placementResults.skillLevels[topic] || 'beginner';
            const lessons = window.learningContent[topic]?.[level]?.lessons || [];
            
            lessons.forEach((lesson, lessonIndex) => {
                path.push({
                    id: `${topic}-${level}-${lesson.id}`,
                    topic: topic,
                    level: level,
                    lesson: lesson,
                    stepNumber: path.length + 1,
                    completed: false,
                    current: path.length === 0 // First lesson is current
                });
            });
        });
        
        this.userData.learningPath = path;
        this.userData.learningProgress = {
            currentTopic: topics[0],
            currentLevel: this.userData.placementResults.skillLevels[topics[0]] || 'beginner',
            completedLessons: 0,
            totalLessons: path.length
        };
    }

    showRoadmap() {
        const skillLevels = document.getElementById('skill-levels');
        const learningPath = document.getElementById('learning-path');
        
        // Display skill assessment results
        skillLevels.innerHTML = '';
        if (this.userData.placementResults) {
            Object.keys(this.userData.placementResults.skillLevels).forEach(topic => {
                const level = this.userData.placementResults.skillLevels[topic];
                const card = document.createElement('div');
                card.className = 'skill-level-card';
                card.innerHTML = `
                    <h4>${this.formatTopicName(topic)}</h4>
                    <span class="skill-level ${level}">${this.capitalizeFirst(level)}</span>
                    <p>${this.getSkillDescription(level)}</p>
                `;
                skillLevels.appendChild(card);
            });
        }
        
        // Display learning path
        learningPath.innerHTML = '<h3>Your Learning Journey</h3>';
        if (this.userData.learningPath) {
            this.userData.learningPath.slice(0, 10).forEach(step => { // Show first 10 steps
                const stepElement = document.createElement('div');
                stepElement.className = `path-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`;
                stepElement.innerHTML = `
                    <div class="step-number">${step.stepNumber}</div>
                    <div class="step-content">
                        <div class="step-title">${step.lesson.title}</div>
                        <div class="step-description">${this.formatTopicName(step.topic)} - ${this.capitalizeFirst(step.level)}</div>
                    </div>
                `;
                learningPath.appendChild(stepElement);
            });
        }
        
        this.showScreen('roadmap-screen');
    }

    getSkillDescription(level) {
        const descriptions = {
            beginner: 'Start with fundamentals and basic concepts',
            intermediate: 'Build on existing knowledge with practice',
            advanced: 'Challenge yourself with complex problems'
        };
        return descriptions[level] || '';
    }

    startRoadmap() {
        if (this.userData.learningPath && this.userData.learningPath.length > 0) {
            // Find current lesson
            const currentStep = this.userData.learningPath.find(step => step.current && !step.completed);
            if (currentStep) {
                this.startLesson(currentStep);
            }
        }
    }

    startLesson(stepData) {
        this.currentLesson = stepData;
        this.lessonStep = 0;
        
        this.showScreen('learning-screen');
        this.displayLessonContent();
    }

    displayLessonContent() {
        const lesson = this.currentLesson.lesson;
        const content = lesson.content;
        
        // Update breadcrumb
        document.getElementById('learning-breadcrumb').textContent = 
            `${this.formatTopicName(this.currentLesson.topic)} > ${this.capitalizeFirst(this.currentLesson.level)} > ${lesson.title}`;
        
        // Update progress
        const totalSteps = 3 + (content.practice ? content.practice.length : 0);
        const progress = (this.lessonStep / totalSteps) * 100;
        document.getElementById('lesson-progress-fill').style.width = `${progress}%`;
        document.getElementById('lesson-progress-text').textContent = `Step ${this.lessonStep + 1} of ${totalSteps}`;
        
        // Update lesson content
        document.getElementById('lesson-title').textContent = lesson.title;
        
        const practiceElement = document.getElementById('practice-problem');
        const lessonContent = document.getElementById('lesson-content');
        
        if (this.lessonStep === 0) {
            // Show explanation
            lessonContent.style.display = 'block';
            practiceElement.style.display = 'none';
            
            const explanationDiv = document.getElementById('lesson-explanation');
            explanationDiv.innerHTML = content.explanation.map(p => `<p>${p}</p>`).join('');
            
            document.getElementById('lesson-example').style.display = 'none';
        } else if (this.lessonStep === 1) {
            // Show example
            lessonContent.style.display = 'block';
            practiceElement.style.display = 'none';
            
            document.getElementById('lesson-explanation').innerHTML = '';
            
            const exampleDiv = document.getElementById('lesson-example');
            exampleDiv.style.display = 'block';
            
            if (content.example) {
                const equationDisplay = exampleDiv.querySelector('.equation-display');
                equationDisplay.textContent = content.example.problem;
                
                const solutionHTML = content.example.solution.map(step => `<p>${step}</p>`).join('');
                exampleDiv.querySelector('p').innerHTML = solutionHTML;
            }
        } else {
            // Show practice problems
            lessonContent.style.display = 'none';
            practiceElement.style.display = 'block';
            
            const practiceIndex = this.lessonStep - 2;
            if (content.practice && content.practice[practiceIndex]) {
                this.displayPracticeProblem(content.practice[practiceIndex]);
            }
        }
        
        // Update navigation buttons
        document.getElementById('learning-back').style.display = this.lessonStep > 0 ? 'block' : 'none';
        
        const nextBtn = document.getElementById('learning-next');
        if (this.lessonStep >= totalSteps - 1) {
            nextBtn.textContent = 'Complete Lesson';
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Complete Lesson';
        } else {
            nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next';
        }
    }

    displayPracticeProblem(problem) {
        document.getElementById('practice-question-text').textContent = problem.question;
        
        // Render equation if present
        const equationElement = document.getElementById('practice-question-equation');
        if (problem.equation) {
            equationElement.innerHTML = problem.equation;
            if (window.katex) {
                try {
                    katex.render(problem.equation, equationElement, {
                        throwOnError: false,
                        displayMode: true
                    });
                } catch (e) {
                    console.error('KaTeX rendering error:', e);
                    equationElement.textContent = problem.equation;
                }
            }
        } else {
            equationElement.innerHTML = '';
        }
        
        // Display answer options
        const optionsContainer = document.getElementById('practice-answer-options');
        const inputContainer = document.getElementById('practice-answer-input');
        
        if (problem.type === 'multiple-choice') {
            optionsContainer.style.display = 'grid';
            inputContainer.style.display = 'none';
            
            optionsContainer.innerHTML = '';
            problem.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'answer-option';
                optionElement.textContent = option;
                optionElement.dataset.index = index;
                
                optionElement.addEventListener('click', () => {
                    document.querySelectorAll('#practice-answer-options .answer-option').forEach(opt => 
                        opt.classList.remove('selected'));
                    optionElement.classList.add('selected');
                });
                
                optionsContainer.appendChild(optionElement);
            });
        } else {
            optionsContainer.style.display = 'none';
            inputContainer.style.display = 'flex';
            document.getElementById('practice-answer-field').value = '';
            document.getElementById('practice-answer-field').focus();
        }
        
        // Show hint button if available
        const hintBtn = document.getElementById('learning-hint');
        hintBtn.style.display = problem.hint ? 'block' : 'none';
    }

    submitPracticeAnswer() {
        const lesson = this.currentLesson.lesson;
        const practiceIndex = this.lessonStep - 2;
        const problem = lesson.content.practice[practiceIndex];
        
        let userAnswer;
        let isCorrect = false;
        
        if (problem.type === 'multiple-choice') {
            const selectedOption = document.querySelector('#practice-answer-options .answer-option.selected');
            if (!selectedOption) {
                this.showErrorMessage('Please select an answer');
                return;
            }
            userAnswer = selectedOption.textContent;
            isCorrect = userAnswer === problem.correctAnswer;
        } else {
            userAnswer = document.getElementById('practice-answer-field').value.trim();
            if (!userAnswer) {
                this.showErrorMessage('Please enter an answer');
                return;
            }
            
            const normalizedUser = this.normalizeAnswer(userAnswer);
            const normalizedCorrect = this.normalizeAnswer(problem.correctAnswer);
            isCorrect = normalizedUser === normalizedCorrect;
        }
        
        // Show feedback
        if (isCorrect) {
            this.showFeedback(true, 'Correct!', problem.explanation || 'Well done!');
        } else {
            this.showFeedback(false, 'Incorrect', 
                `The correct answer was: ${problem.correctAnswer}\n${problem.explanation || ''}`);
        }
        
        // Auto-advance after showing feedback
        setTimeout(() => this.nextLearningStep(), 3000);
    }

    showLearningHint() {
        const lesson = this.currentLesson.lesson;
        const practiceIndex = this.lessonStep - 2;
        const problem = lesson.content.practice[practiceIndex];
        
        if (problem.hint) {
            this.showFeedback(false, 'Hint', problem.hint);
        }
    }

    nextLearningStep() {
        const lesson = this.currentLesson.lesson;
        const totalSteps = 3 + (lesson.content.practice ? lesson.content.practice.length : 0);
        
        if (this.lessonStep >= totalSteps - 1) {
            // Complete lesson
            this.completeLesson();
        } else {
            this.lessonStep++;
            this.displayLessonContent();
        }
    }

    previousLearningStep() {
        if (this.lessonStep > 0) {
            this.lessonStep--;
            this.displayLessonContent();
        }
    }

    completeLesson() {
        // Mark current lesson as completed
        const currentStep = this.userData.learningPath.find(step => step.current && !step.completed);
        if (currentStep) {
            currentStep.completed = true;
            currentStep.current = false;
            
            // Move to next lesson
            const nextIndex = this.userData.learningPath.findIndex(step => step.id === currentStep.id) + 1;
            if (nextIndex < this.userData.learningPath.length) {
                this.userData.learningPath[nextIndex].current = true;
            }
            
            // Update progress
            this.userData.learningProgress.completedLessons++;
            
            // Award XP
            const xpGained = 50;
            this.userData.totalXP += xpGained;
            this.userData.level = Math.floor(this.userData.totalXP / 1000) + 1;
            
            this.saveUserData();
            
            // Show completion message
            this.showFeedback(true, `Lesson Complete! +${xpGained} XP`, 
                'Great job! You can continue to the next lesson or return to your roadmap.');
            
            setTimeout(() => this.showRoadmap(), 3000);
        }
    }

    quitPlacement() {
        if (confirm('Are you sure you want to exit the placement test? Your progress will be lost.')) {
            this.showScreen('home-screen');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.hintsUsed = 0;
        this.questionsAnswered = 0;
        this.quizStartTime = Date.now();
        
        // Reset mode-specific properties
        this.lives = 3;
        this.streak = 0;
        this.maxStreak = 0;
        
        // Configure quiz based on mode
        this.configureQuizMode();
        
        // Generate questions based on selected criteria
        this.currentQuestions = this.generateQuestions();
        
        this.showScreen('quiz-screen');
        this.setupQuizUI();
        this.displayQuestion();
        this.startTimer();
    }

    configureQuizMode() {
        const livesElement = document.getElementById('quiz-lives');
        const streakElement = document.getElementById('quiz-streak');
        const progressElement = document.querySelector('.quiz-progress');
        
        // Hide all mode-specific UI elements first
        livesElement.style.display = 'none';
        streakElement.style.display = 'none';
        
        switch (this.selectedMode) {
            case 'classic':
                // Standard quiz with set number of questions
                break;
            case 'survival':
                // Show lives, hide progress bar for infinite questions
                livesElement.style.display = 'flex';
                progressElement.style.display = 'none';
                this.questionCount = Infinity;
                break;
            case 'time-attack':
                // Show streak, set timer to 2 minutes
                streakElement.style.display = 'flex';
                this.timeLeft = this.timeAttackDuration;
                this.questionCount = Infinity;
                break;
            case 'accuracy':
                // Show streak, set to 20 questions
                streakElement.style.display = 'flex';
                this.questionCount = 20;
                break;
        }
    }

    setupQuizUI() {
        // Update UI elements based on mode
        document.getElementById('lives-count').textContent = this.lives;
        document.getElementById('streak-count').textContent = this.streak;
        
        // Update progress text based on mode
        if (this.selectedMode === 'survival') {
            document.getElementById('progress-text').textContent = `Question ${this.currentQuestionIndex + 1}`;
        } else if (this.selectedMode === 'time-attack') {
            document.getElementById('progress-text').textContent = `Questions Answered: ${this.questionsAnswered}`;
        } else if (this.selectedMode === 'accuracy') {
            const accuracy = this.questionsAnswered > 0 ? Math.round((this.correctAnswers / this.questionsAnswered) * 100) : 100;
            document.getElementById('progress-text').textContent = `Accuracy: ${accuracy}% (Target: ${this.accuracyTarget}%)`;
        }
    }

    generateQuestions() {
        const questionPool = window.questionBank[this.selectedTopic][this.selectedDifficulty];
        const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
        
        // For infinite modes, return a larger pool that can be cycled through
        if (this.questionCount === Infinity) {
            return shuffled.concat(shuffled, shuffled); // Triple the pool for variety
        }
        
        return shuffled.slice(0, this.questionCount);
    }

    displayQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.questionCount) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.questionCount}`;
        document.getElementById('question-number').textContent = 
            `Question ${this.currentQuestionIndex + 1}`;
        
        // Display question
        document.getElementById('question-text').textContent = question.question;
        
        // Render math equation if present
        const equationElement = document.getElementById('question-equation');
        if (question.equation) {
            equationElement.innerHTML = question.equation;
            // Render KaTeX
            if (window.katex) {
                try {
                    katex.render(question.equation, equationElement, {
                        throwOnError: false,
                        displayMode: true
                    });
                } catch (e) {
                    console.error('KaTeX rendering error:', e);
                    equationElement.textContent = question.equation;
                }
            }
        } else {
            equationElement.innerHTML = '';
        }
        
        // Display answer options
        this.displayAnswerOptions(question);
        
        // Reset timer
        this.timeLeft = 30;
        this.startTimer();
        
        // Update score display
        document.getElementById('current-score').textContent = this.score;
    }

    displayAnswerOptions(question) {
        const optionsContainer = document.getElementById('answer-options');
        const inputContainer = document.getElementById('answer-input');
        
        if (question.type === 'multiple-choice') {
            optionsContainer.style.display = 'grid';
            inputContainer.style.display = 'none';
            
            optionsContainer.innerHTML = '';
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'answer-option';
                optionElement.textContent = option;
                optionElement.dataset.index = index;
                
                optionElement.addEventListener('click', () => {
                    document.querySelectorAll('.answer-option').forEach(opt => 
                        opt.classList.remove('selected'));
                    optionElement.classList.add('selected');
                });
                
                optionsContainer.appendChild(optionElement);
            });
        } else {
            optionsContainer.style.display = 'none';
            inputContainer.style.display = 'flex';
            document.getElementById('answer-field').value = '';
            document.getElementById('answer-field').focus();
        }
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Different timer behavior for time attack mode
        if (this.selectedMode === 'time-attack') {
            this.timer = setInterval(() => {
                this.timeLeft--;
                document.getElementById('timer').textContent = this.timeLeft;
                
                if (this.timeLeft <= 30) {
                    document.getElementById('timer').style.color = 'var(--color-error)';
                } else if (this.timeLeft <= 60) {
                    document.getElementById('timer').style.color = 'var(--color-warning)';
                } else {
                    document.getElementById('timer').style.color = 'var(--color-primary-light)';
                }
                
                if (this.timeLeft <= 0) {
                    this.endQuiz();
                }
            }, 1000);
        } else {
            // Standard per-question timer
            this.timeLeft = 30;
            this.timer = setInterval(() => {
                this.timeLeft--;
                document.getElementById('timer').textContent = this.timeLeft;
                
                if (this.timeLeft <= 10) {
                    document.getElementById('timer').style.color = 'var(--color-error)';
                } else {
                    document.getElementById('timer').style.color = 'var(--color-warning)';
                }
                
                if (this.timeLeft <= 0) {
                    this.timeUp();
                }
            }, 1000);
        }
    }

    timeUp() {
        clearInterval(this.timer);
        this.showFeedback(false, "Time's up!", "The correct answer was: " + 
            this.getCurrentQuestion().correctAnswer);
        setTimeout(() => this.nextQuestion(), 2000);
    }

    submitAnswer() {
        const question = this.getCurrentQuestion();
        let userAnswer;
        let isCorrect = false;
        
        if (question.type === 'multiple-choice') {
            const selectedOption = document.querySelector('.answer-option.selected');
            if (!selectedOption) {
                this.showErrorMessage('Please select an answer');
                return;
            }
            userAnswer = selectedOption.textContent;
            isCorrect = userAnswer === question.correctAnswer;
        } else {
            userAnswer = document.getElementById('answer-field').value.trim();
            if (!userAnswer) {
                this.showErrorMessage('Please enter an answer');
                return;
            }
            
            // Normalize answer for comparison
            const normalizedUser = this.normalizeAnswer(userAnswer);
            const normalizedCorrect = this.normalizeAnswer(question.correctAnswer);
            isCorrect = normalizedUser === normalizedCorrect;
        }
        
        this.processAnswer(isCorrect, userAnswer);
    }

    normalizeAnswer(answer) {
        return answer.toString().toLowerCase().replace(/\s+/g, '');
    }

    processAnswer(isCorrect, userAnswer) {
        clearInterval(this.timer);
        this.questionsAnswered++;
        
        const question = this.getCurrentQuestion();
        
        if (isCorrect) {
            this.correctAnswers++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            
            const timeBonus = Math.max(0, this.timeLeft * 2);
            const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[this.selectedDifficulty];
            const streakBonus = this.streak >= 5 ? this.streak * 10 : 0;
            const points = Math.round((100 + timeBonus + streakBonus) * difficultyMultiplier);
            this.score += points;
            
            let message = `Correct! +${points} XP`;
            if (streakBonus > 0) {
                message += ` (Streak Bonus: +${streakBonus})`;
            }
            
            this.showFeedback(true, message, question.explanation || 'Well done!');
            this.playSound('correct');
        } else {
            this.streak = 0; // Reset streak on wrong answer
            
            // Handle mode-specific logic for wrong answers
            if (this.selectedMode === 'survival') {
                this.lives--;
                document.getElementById('lives-count').textContent = this.lives;
                
                if (this.lives <= 0) {
                    this.showFeedback(false, 'Game Over!', 
                        `You answered ${this.questionsAnswered} questions correctly!`);
                    setTimeout(() => this.endQuiz(), 3000);
                    return;
                }
            } else if (this.selectedMode === 'accuracy') {
                const currentAccuracy = Math.round((this.correctAnswers / this.questionsAnswered) * 100);
                if (currentAccuracy < this.accuracyTarget && this.questionsAnswered >= 5) {
                    this.showFeedback(false, 'Challenge Failed!', 
                        `Accuracy dropped below ${this.accuracyTarget}%. Final accuracy: ${currentAccuracy}%`);
                    setTimeout(() => this.endQuiz(), 3000);
                    return;
                }
            }
            
            this.showFeedback(false, 'Incorrect', 
                `The correct answer was: ${question.correctAnswer}\n${question.explanation || ''}`);
            this.playSound('incorrect');
        }
        
        // Update streak display
        document.getElementById('streak-count').textContent = this.streak;
        
        // Update visual feedback for multiple choice
        if (question.type === 'multiple-choice') {
            document.querySelectorAll('.answer-option').forEach(option => {
                if (option.textContent === question.correctAnswer) {
                    option.classList.add('correct');
                } else if (option.classList.contains('selected')) {
                    option.classList.add('incorrect');
                }
            });
        }
        
        setTimeout(() => this.nextQuestion(), 3000);
    }

    showFeedback(isCorrect, message, explanation) {
        const panel = document.getElementById('feedback-panel');
        const icon = document.getElementById('feedback-icon');
        const messageEl = document.getElementById('feedback-message');
        const explanationEl = document.getElementById('feedback-explanation');
        
        icon.innerHTML = isCorrect ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>';
        icon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
        messageEl.textContent = message;
        explanationEl.textContent = explanation;
        
        panel.style.display = 'block';
        
        setTimeout(() => {
            panel.style.display = 'none';
        }, 3000);
    }

    showErrorMessage(message) {
        const panel = document.getElementById('feedback-panel');
        const icon = document.getElementById('feedback-icon');
        const messageEl = document.getElementById('feedback-message');
        const explanationEl = document.getElementById('feedback-explanation');
        
        icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        icon.className = 'feedback-icon';
        messageEl.textContent = message;
        explanationEl.textContent = '';
        
        panel.style.display = 'block';
        
        setTimeout(() => {
            panel.style.display = 'none';
        }, 2000);
    }

    showHint() {
        const question = this.getCurrentQuestion();
        if (question.hint && this.score >= 10) {
            this.score -= 10;
            this.hintsUsed++;
            this.showFeedback(false, 'Hint', question.hint);
            document.getElementById('current-score').textContent = this.score;
        } else if (this.score < 10) {
            this.showErrorMessage('You need at least 10 XP to use a hint');
        } else {
            this.showErrorMessage('No hint available for this question');
        }
    }

    skipQuestion() {
        clearInterval(this.timer);
        const question = this.getCurrentQuestion();
        this.showFeedback(false, 'Question Skipped', 
            `The correct answer was: ${question.correctAnswer}`);
        setTimeout(() => this.nextQuestion(), 2000);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        // Check end conditions based on mode
        if (this.selectedMode === 'classic' && this.currentQuestionIndex >= this.questionCount) {
            this.endQuiz();
        } else if (this.selectedMode === 'accuracy' && this.questionsAnswered >= this.questionCount) {
            // Accuracy challenge completed successfully
            this.endQuiz();
        } else if (this.currentQuestionIndex >= this.currentQuestions.length) {
            // For infinite modes, cycle back to start with shuffled questions
            this.currentQuestionIndex = 0;
            this.currentQuestions = this.generateQuestions();
            this.displayQuestion();
        } else {
            this.displayQuestion();
        }
        
        // Update UI for different modes
        this.setupQuizUI();
    }

    endQuiz() {
        clearInterval(this.timer);
        
        const totalTime = Date.now() - this.quizStartTime;
        const accuracy = Math.round((this.correctAnswers / this.questionCount) * 100);
        
        // Update user data
        this.userData.totalXP += this.score;
        this.userData.totalQuizzes++;
        this.userData.totalCorrectAnswers += this.correctAnswers;
        this.userData.totalQuestionsAnswered += this.questionCount;
        this.userData.totalTimeSpent += totalTime;
        
        if (this.score > this.userData.highScore) {
            this.userData.highScore = this.score;
        }
        
        // Update topic performance
        if (!this.userData.topicPerformance[this.selectedTopic]) {
            this.userData.topicPerformance[this.selectedTopic] = {
                correct: 0,
                total: 0
            };
        }
        this.userData.topicPerformance[this.selectedTopic].correct += this.correctAnswers;
        this.userData.topicPerformance[this.selectedTopic].total += this.questionsAnswered;
        
        // Calculate level
        this.userData.level = Math.floor(this.userData.totalXP / 1000) + 1;
        
        this.saveUserData();
        this.showResults(totalTime, accuracy);
    }

    showResults(totalTime, accuracy) {
        // Update results display based on mode
        document.getElementById('final-score').textContent = this.score;
        
        if (this.selectedMode === 'survival' || this.selectedMode === 'time-attack') {
            document.getElementById('correct-answers').textContent = `${this.correctAnswers}`;
        } else {
            document.getElementById('correct-answers').textContent = `${this.correctAnswers}/${this.questionsAnswered}`;
        }
        
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('time-taken').textContent = this.formatTime(totalTime);
        document.getElementById('xp-gained').textContent = `+${this.score} XP`;
        
        // Update level progress
        const currentLevelXP = (this.userData.level - 1) * 1000;
        const nextLevelXP = this.userData.level * 1000;
        const progress = ((this.userData.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        
        document.getElementById('level-fill').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('level-text').textContent = `Level ${this.userData.level}`;
        
        // Show results title based on mode and performance
        const title = document.getElementById('results-title');
        
        if (this.selectedMode === 'survival') {
            if (this.questionsAnswered >= 50) {
                title.textContent = 'Survival Legend!';
            } else if (this.questionsAnswered >= 25) {
                title.textContent = 'Survival Expert!';
            } else if (this.questionsAnswered >= 10) {
                title.textContent = 'Good Survival!';
            } else {
                title.textContent = 'Keep Surviving!';
            }
        } else if (this.selectedMode === 'time-attack') {
            if (this.questionsAnswered >= 30) {
                title.textContent = 'Speed Demon!';
            } else if (this.questionsAnswered >= 20) {
                title.textContent = 'Quick Thinker!';
            } else if (this.questionsAnswered >= 10) {
                title.textContent = 'Good Speed!';
            } else {
                title.textContent = 'Need More Speed!';
            }
        } else if (this.selectedMode === 'accuracy') {
            if (accuracy >= this.accuracyTarget) {
                title.textContent = 'Perfect Precision!';
            } else {
                title.textContent = 'Almost There!';
            }
        } else {
            // Classic mode
            if (accuracy >= 90) {
                title.textContent = 'Outstanding!';
            } else if (accuracy >= 70) {
                title.textContent = 'Great Job!';
            } else if (accuracy >= 50) {
                title.textContent = 'Good Effort!';
            } else {
                title.textContent = 'Keep Practicing!';
            }
        }
        
        this.updateStatsDisplay();
        this.showScreen('results-screen');
    }

    quitQuiz() {
        if (confirm('Are you sure you want to quit the quiz? Your progress will be lost.')) {
            clearInterval(this.timer);
            this.showScreen('home-screen');
        }
    }

    showStats() {
        this.updateDetailedStats();
        this.showScreen('stats-screen');
    }

    updateStatsDisplay() {
        document.getElementById('total-xp').textContent = this.userData.totalXP;
        document.getElementById('high-score').textContent = this.userData.highScore;
        document.getElementById('level').textContent = this.userData.level;
    }

    updateDetailedStats() {
        document.getElementById('total-quizzes').textContent = this.userData.totalQuizzes;
        
        const avgAccuracy = this.userData.totalQuestionsAnswered > 0 ? 
            Math.round((this.userData.totalCorrectAnswers / this.userData.totalQuestionsAnswered) * 100) : 0;
        document.getElementById('avg-accuracy').textContent = `${avgAccuracy}%`;
        
        document.getElementById('total-time').textContent = this.formatTotalTime(this.userData.totalTimeSpent);
        
        // Update topic performance
        const topicContainer = document.getElementById('topic-performance');
        topicContainer.innerHTML = '';
        
        Object.entries(this.userData.topicPerformance).forEach(([topic, data]) => {
            const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            
            const topicEl = document.createElement('div');
            topicEl.className = 'topic-stat';
            topicEl.innerHTML = `
                <span class="topic-name">${this.formatTopicName(topic)}</span>
                <span class="topic-accuracy">${accuracy}%</span>
            `;
            topicContainer.appendChild(topicEl);
        });
    }

    formatTopicName(topic) {
        return topic.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatTotalTime(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    getCurrentQuestion() {
        return this.currentQuestions[this.currentQuestionIndex];
    }

    playSound(type) {
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all your statistics? This action cannot be undone.')) {
            this.userData = {
                totalXP: 0,
                highScore: 0,
                level: 1,
                totalQuizzes: 0,
                totalCorrectAnswers: 0,
                totalQuestionsAnswered: 0,
                totalTimeSpent: 0,
                topicPerformance: {}
            };
            this.saveUserData();
            this.updateStatsDisplay();
            this.updateDetailedStats();
            this.showScreen('home-screen');
        }
    }

    loadUserData() {
        const defaultData = {
            totalXP: 0,
            highScore: 0,
            level: 1,
            totalQuizzes: 0,
            totalCorrectAnswers: 0,
            totalQuestionsAnswered: 0,
            totalTimeSpent: 0,
            topicPerformance: {}
        };
        
        try {
            const saved = localStorage.getItem('galacticCalculusData');
            return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
        } catch (e) {
            console.error('Error loading user data:', e);
            return defaultData;
        }
    }

    saveUserData() {
        try {
            localStorage.setItem('galacticCalculusData', JSON.stringify(this.userData));
        } catch (e) {
            console.error('Error saving user data:', e);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize KaTeX auto-render if available
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ]
        });
    }
    
    // Start the application
    new GalacticCalculus();
});
