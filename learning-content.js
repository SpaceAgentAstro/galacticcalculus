// Learning Content Database for Galactic Calculus
// Structured curriculum with lessons, explanations, and practice problems

window.learningContent = {
    algebra: {
        beginner: {
            lessons: [
                {
                    id: 'basic-equations',
                    title: 'Basic Linear Equations',
                    description: 'Learn to solve simple equations with one variable',
                    content: {
                        explanation: [
                            'A linear equation is an equation where the highest power of the variable is 1.',
                            'The general form is: ax + b = c, where a, b, and c are constants.',
                            'To solve, we isolate the variable by performing the same operations on both sides.'
                        ],
                        example: {
                            problem: '2x + 5 = 13',
                            solution: [
                                'Step 1: Subtract 5 from both sides',
                                '2x + 5 - 5 = 13 - 5',
                                '2x = 8',
                                'Step 2: Divide both sides by 2',
                                '2x ÷ 2 = 8 ÷ 2',
                                'x = 4'
                            ]
                        },
                        practice: [
                            {
                                question: "Solve for x:",
                                equation: "3x + 7 = 22",
                                type: "input",
                                correctAnswer: "5",
                                explanation: "Subtract 7: 3x = 15, then divide by 3: x = 5",
                                hint: "First subtract 7 from both sides"
                            },
                            {
                                question: "What is the value of y?",
                                equation: "2y - 4 = 10",
                                type: "multiple-choice",
                                options: ["6", "7", "8", "9"],
                                correctAnswer: "7",
                                explanation: "Add 4: 2y = 14, then divide by 2: y = 7",
                                hint: "Add 4 to both sides first"
                            }
                        ]
                    }
                },
                {
                    id: 'combining-terms',
                    title: 'Combining Like Terms',
                    description: 'Simplify expressions by combining similar terms',
                    content: {
                        explanation: [
                            'Like terms are terms that have the same variable raised to the same power.',
                            'To combine like terms, add or subtract their coefficients.',
                            'Constants (numbers without variables) can also be combined.'
                        ],
                        example: {
                            problem: '3x + 5x - 2x + 8 - 3',
                            solution: [
                                'Step 1: Group like terms',
                                '(3x + 5x - 2x) + (8 - 3)',
                                'Step 2: Combine x terms',
                                '3x + 5x - 2x = 6x',
                                'Step 3: Combine constants',
                                '8 - 3 = 5',
                                'Final answer: 6x + 5'
                            ]
                        },
                        practice: [
                            {
                                question: "Simplify:",
                                equation: "4x + 3x - x",
                                type: "input",
                                correctAnswer: "6x",
                                explanation: "4x + 3x - x = (4 + 3 - 1)x = 6x",
                                hint: "Add the coefficients: 4 + 3 - 1"
                            }
                        ]
                    }
                },
                {
                    id: 'distributive-property',
                    title: 'Distributive Property',
                    description: 'Learn to expand expressions using distribution',
                    content: {
                        explanation: [
                            'The distributive property states: a(b + c) = ab + ac',
                            'Multiply the term outside the parentheses by each term inside.',
                            'This is also called "expanding" or "distributing".'
                        ],
                        example: {
                            problem: '3(x + 4)',
                            solution: [
                                'Step 1: Multiply 3 by each term in parentheses',
                                '3 × x = 3x',
                                '3 × 4 = 12',
                                'Step 2: Write the result',
                                '3(x + 4) = 3x + 12'
                            ]
                        },
                        practice: [
                            {
                                question: "Expand:",
                                equation: "2(x + 5)",
                                type: "input",
                                correctAnswer: "2x + 10",
                                explanation: "2(x + 5) = 2x + 2(5) = 2x + 10",
                                hint: "Multiply 2 by both x and 5"
                            }
                        ]
                    }
                }
            ]
        },
        intermediate: {
            lessons: [
                {
                    id: 'quadratic-basics',
                    title: 'Introduction to Quadratic Equations',
                    description: 'Understanding quadratic equations and their properties',
                    content: {
                        explanation: [
                            'A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0.',
                            'The highest power of the variable is 2.',
                            'Quadratic equations can have 0, 1, or 2 real solutions.'
                        ],
                        example: {
                            problem: 'x² - 5x + 6 = 0',
                            solution: [
                                'Step 1: Try to factor',
                                'Look for two numbers that multiply to 6 and add to -5',
                                'Those numbers are -2 and -3',
                                'Step 2: Factor',
                                '(x - 2)(x - 3) = 0',
                                'Step 3: Solve',
                                'x - 2 = 0 or x - 3 = 0',
                                'x = 2 or x = 3'
                            ]
                        },
                        practice: [
                            {
                                question: "Solve by factoring:",
                                equation: "x² - 7x + 12 = 0",
                                type: "multiple-choice",
                                options: ["x = 3, 4", "x = 2, 6", "x = 1, 12", "x = -3, -4"],
                                correctAnswer: "x = 3, 4",
                                explanation: "Factor: (x - 3)(x - 4) = 0, so x = 3 or x = 4",
                                hint: "Find two numbers that multiply to 12 and add to -7"
                            }
                        ]
                    }
                },
                {
                    id: 'systems-equations',
                    title: 'Systems of Linear Equations',
                    description: 'Solving multiple equations simultaneously',
                    content: {
                        explanation: [
                            'A system of equations is a set of equations with the same variables.',
                            'The solution is the point where all equations are satisfied.',
                            'Methods include substitution, elimination, and graphing.'
                        ],
                        example: {
                            problem: '2x + y = 7 and x - y = 2',
                            solution: [
                                'Method: Elimination',
                                'Step 1: Add the equations to eliminate y',
                                '(2x + y) + (x - y) = 7 + 2',
                                '3x = 9',
                                'x = 3',
                                'Step 2: Substitute back',
                                '3 - y = 2',
                                'y = 1',
                                'Solution: (3, 1)'
                            ]
                        },
                        practice: [
                            {
                                question: "Solve the system:",
                                equation: "x + y = 5\\\\x - y = 1",
                                type: "multiple-choice",
                                options: ["(3, 2)", "(2, 3)", "(4, 1)", "(1, 4)"],
                                correctAnswer: "(3, 2)",
                                explanation: "Adding equations: 2x = 6, so x = 3. Then y = 2.",
                                hint: "Try adding the equations to eliminate y"
                            }
                        ]
                    }
                }
            ]
        },
        advanced: {
            lessons: [
                {
                    id: 'quadratic-formula',
                    title: 'The Quadratic Formula',
                    description: 'Master the quadratic formula for any quadratic equation',
                    content: {
                        explanation: [
                            'The quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)',
                            'Works for any quadratic equation ax² + bx + c = 0',
                            'The discriminant b² - 4ac tells us about the solutions.'
                        ],
                        example: {
                            problem: '2x² + 3x - 5 = 0',
                            solution: [
                                'Step 1: Identify a = 2, b = 3, c = -5',
                                'Step 2: Calculate the discriminant',
                                'b² - 4ac = 9 - 4(2)(-5) = 9 + 40 = 49',
                                'Step 3: Apply the formula',
                                'x = (-3 ± √49) / (2×2) = (-3 ± 7) / 4',
                                'Step 4: Find both solutions',
                                'x = (-3 + 7)/4 = 1 or x = (-3 - 7)/4 = -2.5'
                            ]
                        },
                        practice: [
                            {
                                question: "Use the quadratic formula:",
                                equation: "x² - 4x + 3 = 0",
                                type: "multiple-choice",
                                options: ["x = 1, 3", "x = -1, -3", "x = 2, 2", "x = 0, 4"],
                                correctAnswer: "x = 1, 3",
                                explanation: "x = (4 ± √(16-12))/2 = (4 ± 2)/2 = 3 or 1",
                                hint: "a = 1, b = -4, c = 3"
                            }
                        ]
                    }
                }
            ]
        }
    },
    calculus: {
        beginner: {
            lessons: [
                {
                    id: 'limits-intro',
                    title: 'Introduction to Limits',
                    description: 'Understanding the concept of limits',
                    content: {
                        explanation: [
                            'A limit describes the value a function approaches as the input approaches a certain value.',
                            'Written as: lim(x→a) f(x) = L',
                            'The function may not actually reach this value, but gets arbitrarily close.'
                        ],
                        example: {
                            problem: 'lim(x→2) (x + 1)',
                            solution: [
                                'Step 1: Since this is a simple polynomial, substitute directly',
                                'lim(x→2) (x + 1) = 2 + 1 = 3',
                                'The limit exists and equals 3'
                            ]
                        },
                        practice: [
                            {
                                question: "Find the limit:",
                                equation: "\\lim_{x \\to 3} (2x - 1)",
                                type: "input",
                                correctAnswer: "5",
                                explanation: "Direct substitution: 2(3) - 1 = 5",
                                hint: "For polynomials, you can substitute directly"
                            }
                        ]
                    }
                },
                {
                    id: 'derivative-basics',
                    title: 'Basic Derivatives',
                    description: 'Learn the power rule and basic differentiation',
                    content: {
                        explanation: [
                            'The derivative measures the rate of change of a function.',
                            'Power rule: d/dx[xⁿ] = n·xⁿ⁻¹',
                            'The derivative of a constant is 0.'
                        ],
                        example: {
                            problem: 'f(x) = 3x² + 2x - 5',
                            solution: [
                                'Step 1: Apply power rule to each term',
                                'd/dx[3x²] = 3 · 2x¹ = 6x',
                                'd/dx[2x] = 2 · 1x⁰ = 2',
                                'd/dx[-5] = 0',
                                'Step 2: Combine results',
                                "f'(x) = 6x + 2"
                            ]
                        },
                        practice: [
                            {
                                question: "Find the derivative:",
                                equation: "f(x) = x³ + 4x",
                                type: "input",
                                correctAnswer: "3x^2 + 4",
                                explanation: "d/dx[x³] = 3x², d/dx[4x] = 4",
                                hint: "Use the power rule for each term"
                            }
                        ]
                    }
                }
            ]
        }
    },
    geometry: {
        beginner: {
            lessons: [
                {
                    id: 'area-perimeter',
                    title: 'Area and Perimeter',
                    description: 'Calculate area and perimeter of basic shapes',
                    content: {
                        explanation: [
                            'Perimeter is the distance around a shape.',
                            'Area is the space inside a shape.',
                            'Different shapes have different formulas.'
                        ],
                        example: {
                            problem: 'Rectangle with length 8 and width 5',
                            solution: [
                                'Step 1: Calculate perimeter',
                                'P = 2(length + width) = 2(8 + 5) = 26',
                                'Step 2: Calculate area',
                                'A = length × width = 8 × 5 = 40',
                                'Perimeter = 26 units, Area = 40 square units'
                            ]
                        },
                        practice: [
                            {
                                question: "Find the area of a triangle:",
                                equation: "base = 6, height = 4",
                                type: "input",
                                correctAnswer: "12",
                                explanation: "Area = (1/2) × base × height = (1/2) × 6 × 4 = 12",
                                hint: "Use A = (1/2)bh"
                            }
                        ]
                    }
                }
            ]
        }
    }
};

// Placement test questions covering multiple topics and difficulties
window.placementTest = [
    // Basic Algebra
    {
        topic: 'algebra',
        difficulty: 'easy',
        question: "Solve for x:",
        equation: "x + 3 = 8",
        type: "input",
        correctAnswer: "5",
        points: 1
    },
    {
        topic: 'algebra',
        difficulty: 'easy',
        question: "Simplify:",
        equation: "2x + 3x",
        type: "multiple-choice",
        options: ["5x", "6x", "2x", "x"],
        correctAnswer: "5x",
        points: 1
    },
    {
        topic: 'algebra',
        difficulty: 'medium',
        question: "Solve for x:",
        equation: "2x + 5 = 13",
        type: "input",
        correctAnswer: "4",
        points: 2
    },
    {
        topic: 'algebra',
        difficulty: 'medium',
        question: "Factor:",
        equation: "x^2 - 5x + 6",
        type: "multiple-choice",
        options: ["(x-2)(x-3)", "(x-1)(x-6)", "(x+2)(x+3)", "(x-5)(x-1)"],
        correctAnswer: "(x-2)(x-3)",
        points: 2
    },
    {
        topic: 'algebra',
        difficulty: 'hard',
        question: "Use the quadratic formula to solve:",
        equation: "x^2 - 4x + 3 = 0",
        type: "multiple-choice",
        options: ["x = 1, 3", "x = -1, -3", "x = 2, 2", "x = 0, 4"],
        correctAnswer: "x = 1, 3",
        points: 3
    },
    // Basic Geometry
    {
        topic: 'geometry',
        difficulty: 'easy',
        question: "Find the area of a rectangle:",
        equation: "length = 6, width = 4",
        type: "input",
        correctAnswer: "24",
        points: 1
    },
    {
        topic: 'geometry',
        difficulty: 'medium',
        question: "Find the area of a circle:",
        equation: "radius = 3",
        type: "multiple-choice",
        options: ["9π", "6π", "3π", "12π"],
        correctAnswer: "9π",
        points: 2
    },
    // Basic Calculus
    {
        topic: 'calculus',
        difficulty: 'easy',
        question: "Find the derivative:",
        equation: "f(x) = x^2",
        type: "input",
        correctAnswer: "2x",
        points: 1
    },
    {
        topic: 'calculus',
        difficulty: 'medium',
        question: "Find the derivative:",
        equation: "f(x) = 3x^2 + 2x - 1",
        type: "input",
        correctAnswer: "6x + 2",
        points: 2
    },
    {
        topic: 'calculus',
        difficulty: 'medium',
        question: "Evaluate the limit:",
        equation: "\\lim_{x \\to 2} (x + 3)",
        type: "input",
        correctAnswer: "5",
        points: 2
    },
    // Trigonometry basics
    {
        topic: 'trigonometry',
        difficulty: 'easy',
        question: "What is sin(30°)?",
        equation: "\\sin(30°) = ?",
        type: "multiple-choice",
        options: ["1/2", "√3/2", "1", "√2/2"],
        correctAnswer: "1/2",
        points: 1
    },
    {
        topic: 'trigonometry',
        difficulty: 'medium',
        question: "Find the hypotenuse:",
        equation: "legs: 3 and 4",
        type: "input",
        correctAnswer: "5",
        points: 2
    },
    // Statistics basics
    {
        topic: 'statistics',
        difficulty: 'easy',
        question: "Find the mean:",
        equation: "2, 4, 6, 8",
        type: "input",
        correctAnswer: "5",
        points: 1
    },
    {
        topic: 'statistics',
        difficulty: 'medium',
        question: "Find the median:",
        equation: "1, 3, 5, 7, 9",
        type: "input",
        correctAnswer: "5",
        points: 2
    },
    // Number theory
    {
        topic: 'number-theory',
        difficulty: 'easy',
        question: "Is 17 prime?",
        equation: "",
        type: "multiple-choice",
        options: ["Yes", "No"],
        correctAnswer: "Yes",
        points: 1
    }
];

console.log('Learning content loaded successfully with', 
    Object.keys(window.learningContent).length, 'topics and', 
    window.placementTest.length, 'placement test questions');