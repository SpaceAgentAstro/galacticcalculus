// Learning Content Database for Galactic Calculus
// Structured curriculum with lessons, explanations, and practice problems

window.learningContent = {
    // --- Kindergarten Curriculum ---
    kindergarten: {
        'numbers-counting': {
            lessons: [
                {
                    id: 'counting-1-10',
                    title: 'Counting to 10',
                    description: 'Learn to count and recognize numbers from 1 to 10.',
                    content: {
                        explanation: [
                            'Counting is saying numbers in order, like 1, 2, 3!',
                            'Each number tells us "how many" of something there are.',
                            'Number recognition means knowing what a number looks like.'
                        ],
                        example: {
                            problem: 'Count the stars: ⭐️⭐️⭐️⭐️⭐️',
                            solution: [
                                'Step 1: Point to each star as you count.',
                                '1 (first star), 2 (second star), 3 (third star), 4 (fourth star), 5 (fifth star).',
                                'There are 5 stars!'
                            ]
                        },
                        practice: [
                            {
                                question: "Count the apples: 🍎🍎�",
                                equation: "",
                                type: "input",
                                correctAnswer: "3",
                                explanation: "There are 3 apples.",
                                hint: "Touch each apple as you count."
                            },
                            {
                                question: "Which number is seven?",
                                equation: "",
                                type: "multiple-choice",
                                options: ["5", "7", "9", "2"],
                                correctAnswer: "7",
                                explanation: "The number 7 looks like this: 7.",
                                hint: "Look for the number seven."
                            }
                        ]
                    }
                },
                {
                    id: 'basic-addition-5',
                    title: 'Basic Addition up to 5',
                    description: 'Introduce the concept of addition by combining small groups of objects.',
                    content: {
                        explanation: [
                            'Addition means putting things together to find the total amount.',
                            'The plus sign (+) means "and" or "put together".',
                            'The equals sign (=) means "is the same as".'
                        ],
                        example: {
                            problem: 'You have 2 red apples and 1 green apple. How many apples do you have in total?',
                            solution: [
                                'Step 1: Count the red apples: 🍎🍎 (2 apples)',
                                'Step 2: Count the green apples: 🍏 (1 apple)',
                                'Step 3: Put them together and count all of them: 🍎🍎🍏 (3 apples)',
                                'So, 2 + 1 = 3.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is 3 + 2?",
                                equation: "",
                                type: "input",
                                correctAnswer: "5",
                                explanation: "Count 3 fingers, then 2 more fingers. That's 5 fingers!",
                                hint: "Use your fingers or small toys to count."
                            },
                            {
                                question: "If you have 4 cookies and get 1 more, how many do you have?",
                                equation: "",
                                type: "input",
                                correctAnswer: "5",
                                explanation: "4 cookies + 1 cookie = 5 cookies.",
                                hint: "Start at 4 and count one more."
                            }
                        ]
                    }
                }
            ]
        },
        'basic-shapes': {
            lessons: [
                {
                    id: 'intro-shapes',
                    title: 'Circles, Squares, and Triangles',
                    description: 'Identify and describe basic 2D shapes.',
                    content: {
                        explanation: [
                            'Shapes are everywhere around us!',
                            'A **circle** is round, like a ball.',
                            'A **square** has four sides that are all the same length, like a cracker.',
                            'A **triangle** has three sides, like a slice of pizza.'
                        ],
                        example: {
                            problem: 'What shape is this? (Image of a square)',
                            solution: [
                                'This shape has four equal sides and four corners.',
                                'It is a square!'
                            ]
                        },
                        practice: [
                            {
                                question: "Which shape is a circle?",
                                equation: "",
                                type: "multiple-choice",
                                options: ["⚪", "◼️", "▲"],
                                correctAnswer: "⚪",
                                explanation: "The circle is round.",
                                hint: "Look for the round shape."
                            }
                        ]
                    }
                }
            ]
        }
    },

    // --- Elementary Math Curriculum (Grades 1-5) ---
    'elementary-math': {
        'grade1-addition-subtraction': {
            lessons: [
                {
                    id: 'addition-to-20',
                    title: 'Addition Up to 20',
                    description: 'Master basic addition facts with sums up to 20.',
                    content: {
                        explanation: [
                            'Addition means putting groups together to find the total.',
                            'The symbol for addition is "+".',
                            'You can use your fingers, drawings, or count on a number line.'
                        ],
                        example: {
                            problem: '5 + 3 = ?',
                            solution: [
                                'Step 1: Start with 5.',
                                'Step 2: Count up 3 more: 6, 7, 8.',
                                'So, 5 + 3 = 8.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is 7 + 4?",
                                equation: "",
                                type: "input",
                                correctAnswer: "11",
                                explanation: "7 + 4 = 11.",
                                hint: "Count up from 7, four times."
                            }
                        ]
                    }
                },
                {
                    id: 'subtraction-to-20',
                    title: 'Subtraction Up to 20',
                    description: 'Understand subtraction as taking away or finding the difference.',
                    content: {
                        explanation: [
                            'Subtraction means taking away part of a group.',
                            'The symbol for subtraction is "-".',
                            'You can count back or use objects to help.'
                        ],
                        example: {
                            problem: '10 - 4 = ?',
                            solution: [
                                'Step 1: Start with 10 items.',
                                'Step 2: Take away 4 items.',
                                'You are left with 6 items. So, 10 - 4 = 6.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is 15 - 6?",
                                equation: "",
                                type: "input",
                                correctAnswer: "9",
                                explanation: "15 - 6 = 9.",
                                hint: "Count back 6 from 15."
                            }
                        ]
                    }
                },
                {
                    id: 'making-tens',
                    title: 'Making Tens Strategy',
                    description: 'Learn to use the "making tens" strategy for easier addition.',
                    content: {
                        explanation: [
                            'Making tens is a strategy where you break apart one number to make the other number a ten.',
                            'This makes addition easier because adding to ten is simple.',
                            'Example: $8 + 5$. Think: $8 + 2 = 10$. We took 2 from 5, so $5 - 2 = 3$. Now add $10 + 3 = 13$.'
                        ],
                        example: {
                            problem: 'Solve $7 + 6$ using the making tens strategy.',
                            solution: [
                                'Step 1: We want to make 7 into 10. We need 3 more ($7 + 3 = 10$).',
                                'Step 2: Take 3 from 6. So, $6 - 3 = 3$.',
                                'Step 3: Now add $10 + 3 = 13$.',
                                'So, $7 + 6 = 13$.'
                            ]
                        },
                        practice: [
                            {
                                question: "Use making tens to solve: 9 + 4",
                                equation: "",
                                type: "input",
                                correctAnswer: "13",
                                explanation: "9 + 1 = 10. 4 - 1 = 3. 10 + 3 = 13.",
                                hint: "How much do you need to add to 9 to get 10?"
                            }
                        ]
                    }
                }
            ]
        },
        'grade3-fractions': {
            lessons: [
                {
                    id: 'intro-fractions',
                    title: 'Introduction to Fractions',
                    description: 'Understand fractions as parts of a whole.',
                    content: {
                        explanation: [
                            'A **fraction** is a way to show parts of a whole thing.',
                            'The top number is the **numerator** (how many parts we have).',
                            'The bottom number is the **denominator** (how many equal parts the whole is divided into).',
                            'Example: $\\frac{1}{2}$ means 1 out of 2 equal parts.'
                        ],
                        example: {
                            problem: 'What fraction of the pizza is left if 1 slice out of 4 was eaten?',
                            solution: [
                                'Step 1: The whole pizza had 4 slices (denominator).',
                                'Step 2: 1 slice was eaten, so 3 slices are left (numerator).',
                                'The fraction is $\\frac{3}{4}$.'
                            ]
                        },
                        practice: [
                            {
                                question: "What fraction is shaded?",
                                equation: "",
                                type: "input",
                                correctAnswer: "1/3",
                                explanation: "One out of three equal parts is shaded.",
                                hint: "Think: 'part over whole'."
                            }
                        ]
                    }
                },
                {
                    id: 'equivalent-fractions',
                    title: 'Equivalent Fractions',
                    description: 'Learn that different fractions can represent the same amount.',
                    content: {
                        explanation: [
                            '**Equivalent fractions** are fractions that look different but have the same value.',
                            'You can find equivalent fractions by multiplying or dividing both the numerator and the denominator by the same non-zero number.',
                            'Example: $\\frac{1}{2}$ is equivalent to $\\frac{2}{4}$ (multiply top and bottom by 2).'
                        ],
                        example: {
                            problem: 'Is $\\frac{1}{3}$ equivalent to $\\frac{2}{6}$?',
                            solution: [
                                'Step 1: Can we multiply 1 by a number to get 2? Yes, $1 \\times 2 = 2$.',
                                'Step 2: Can we multiply 3 by the same number (2) to get 6? Yes, $3 \\times 2 = 6$.',
                                'Since we multiplied both top and bottom by 2, they are equivalent fractions.'
                            ]
                        },
                        practice: [
                            {
                                question: "Which fraction is equivalent to $\\frac{1}{2}$?",
                                equation: "",
                                type: "multiple-choice",
                                options: ["$\\frac{2}{3}$", "$\\frac{3}{6}$", "$\\frac{1}{4}$", "$\\frac{4}{6}$"],
                                correctAnswer: "3/6",
                                explanation: "If you multiply the numerator (1) and denominator (2) of $\\frac{1}{2}$ by 3, you get $\\frac{3}{6}$.",
                                hint: "Try multiplying the top and bottom of $\\frac{1}{2}$ by 2, 3, or 4."
                            }
                        ]
                    }
                }
            ]
        },
        'grade4-multiplication-division': {
            lessons: [
                {
                    id: 'multiplication-facts',
                    title: 'Multiplication Facts',
                    description: 'Memorize and apply multiplication facts up to 12x12.',
                    content: {
                        explanation: [
                            'Multiplication is a faster way to add the same number many times.',
                            'The symbol for multiplication is "×".',
                            'Example: $3 \\times 4$ means 3 groups of 4, or $4 + 4 + 4 = 12$.'
                        ],
                        example: {
                            problem: 'What is $6 \\times 7$?',
                            solution: [
                                'Think of 6 groups of 7, or 7 groups of 6.',
                                'Using facts, $6 \\times 7 = 42$.'
                            ]
                        },
                        practice: [
                            {
                                question: "Calculate:",
                                equation: "$8 \\times 5 = ?$",
                                type: "input",
                                correctAnswer: "40",
                                explanation: "$8 \\times 5 = 40$.",
                                hint: "Think of 8 groups of 5."
                            }
                        ]
                    }
                },
                {
                    id: 'division-basics',
                    title: 'Basic Division',
                    description: 'Understand division as sharing or grouping, and relate it to multiplication.',
                    content: {
                        explanation: [
                            '**Division** is splitting a total into equal groups, or finding how many groups of a certain size fit into a total.',
                            'The symbol for division can be $\\div$ or $/$.',
                            'It\'s the opposite of multiplication. If $3 \\times 4 = 12$, then $12 \\div 4 = 3$ and $12 \\div 3 = 4$.'
                        ],
                        example: {
                            problem: 'You have 12 cookies and want to share them equally among 3 friends. How many cookies does each friend get?',
                            solution: [
                                'Step 1: Divide the total cookies (12) by the number of friends (3).',
                                'Step 2: Think: $3 \\times \\text{what number} = 12$? The answer is 4.',
                                'So, $12 \\div 3 = 4$. Each friend gets 4 cookies.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is $20 \\div 5$?",
                                equation: "",
                                type: "input",
                                correctAnswer: "4",
                                explanation: "Think: 5 times what number equals 20? $5 \\times 4 = 20$.",
                                hint: "How many groups of 5 can you make from 20?"
                            }
                        ]
                    }
                }
            ]
        },
        'grade5-decimals-volume': {
            lessons: [
                {
                    id: 'intro-decimals',
                    title: 'Introduction to Decimals',
                    description: 'Understand decimals as a way to represent parts of a whole using tens, hundreds, etc.',
                    content: {
                        explanation: [
                            'Decimals are like fractions, but they use place value based on powers of 10.',
                            'The decimal point separates the whole number from the fractional part.',
                            'Example: $0.5$ is the same as $\\frac{5}{10}$ or $\\frac{1}{2}$.'
                        ],
                        example: {
                            problem: 'Write "three tenths" as a decimal.',
                            solution: [
                                'Step 1: "Tenths" means one place after the decimal point.',
                                'Step 2: The number is 3.',
                                'So, three tenths is $0.3$.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is the decimal for $\\frac{7}{10}$?",
                                equation: "",
                                type: "input",
                                correctAnswer: "0.7",
                                explanation: "$\\frac{7}{10}$ is $0.7$.",
                                hint: "Place the 7 in the tenths place."
                            }
                        ]
                    }
                },
                {
                    id: 'decimal-operations',
                    title: 'Adding and Subtracting Decimals',
                    description: 'Perform addition and subtraction with decimal numbers.',
                    content: {
                        explanation: [
                            'To add or subtract decimals, you must **line up the decimal points**.',
                            'Then, add or subtract as you would with whole numbers, carrying or borrowing as needed.',
                            'Place the decimal point in the answer directly below the decimal points in the problem.'
                        ],
                        example: {
                            problem: 'Calculate: $3.45 + 1.2$',
                            solution: [
                                'Step 1: Line up the decimal points, adding a zero to 1.2 to make it 1.20:',
                                '  3.45',
                                '+ 1.20',
                                '------',
                                'Step 2: Add from right to left:',
                                '  3.45',
                                '+ 1.20',
                                '------',
                                '  4.65',
                                'The sum is 4.65.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is $5.7 - 2.3$?",
                                equation: "",
                                type: "input",
                                correctAnswer: "3.4",
                                explanation: "Line up decimals: $5.7 - 2.3 = 3.4$.",
                                hint: "Remember to line up the decimal points."
                            }
                        ]
                    }
                }
            ]
        }
    },

    // --- Middle School Math Curriculum (Grades 6-8) ---
    'middle-school-math': {
        'pre-algebra': {
            lessons: [
                {
                    id: 'integers-operations',
                    title: 'Integers and Operations',
                    description: 'Perform operations with positive and negative integers.',
                    content: {
                        explanation: [
                            '**Integers** are whole numbers and their opposites (positive, negative, and zero).',
                            'Adding positive: move right on number line.',
                            'Adding negative: move left on number line.',
                            'Subtracting negative: same as adding a positive (e.g., $5 - (-3) = 5 + 3 = 8$).',
                            'Multiplying/Dividing: Same signs give positive, different signs give negative.'
                        ],
                        example: {
                            problem: 'Calculate: $-5 + 8$ and $-3 \\times 4$',
                            solution: [
                                'For $-5 + 8$: Start at -5 on a number line, move 8 units right. You land on 3. So, $-5 + 8 = 3$.',
                                'For $-3 \\times 4$: Different signs, so the answer is negative. $3 \\times 4 = 12$. So, $-3 \\times 4 = -12$.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is $-10 + 3$?",
                                equation: "",
                                type: "input",
                                correctAnswer: "-7",
                                explanation: "Start at -10, move 3 to the right, you get -7.",
                                hint: "Think about a number line."
                            },
                            {
                                question: "Calculate: $-6 \\div -2$",
                                equation: "",
                                type: "input",
                                correctAnswer: "3",
                                explanation: "Same signs ($--$), so positive result. $6 \\div 2 = 3$.",
                                hint: "Remember the rules for multiplying/dividing with negative numbers."
                            }
                        ]
                    }
                },
                {
                    id: 'ratios-proportions',
                    title: 'Ratios and Proportions',
                    description: 'Understand ratios and solve problems using proportions.',
                    content: {
                        explanation: [
                            'A **ratio** compares two quantities (e.g., $3:2$ or $\\frac{3}{2}$).',
                            'A **proportion** states that two ratios are equal (e.g., $\\frac{a}{b} = \\frac{c}{d}$).',
                            'You can solve proportions by cross-multiplication: $ad = bc$.'
                        ],
                        example: {
                            problem: 'If 2 apples cost $1.50, how much do 6 apples cost?',
                            solution: [
                                'Step 1: Set up a proportion: $\\frac{2 \\text{ apples}}{\\$1.50} = \\frac{6 \\text{ apples}}{x \\text{ dollars}}$',
                                'Step 2: Cross-multiply: $2x = 1.50 \\times 6$',
                                '$2x = 9$',
                                '$x = 4.50$',
                                'So, 6 apples cost $4.50.'
                            ]
                        },
                        practice: [
                            {
                                question: "Solve for x:",
                                equation: "$\\frac{x}{4} = \\frac{9}{12}$",
                                type: "input",
                                correctAnswer: "3",
                                explanation: "$12x = 4 \\times 9 \\implies 12x = 36 \\implies x = 3$.",
                                hint: "Cross-multiply."
                            }
                        ]
                    }
                },
                {
                    id: 'percentages-basics',
                    title: 'Introduction to Percentages',
                    description: 'Define percentages and convert between percentages, fractions, and decimals.',
                    content: {
                        explanation: [
                            'A **percentage** means "out of one hundred" or "per 100". The symbol is %.',
                            'To convert a percentage to a decimal, divide by 100 (move decimal point two places left). E.g., $50\\% = 0.50$.',
                            'To convert a decimal to a percentage, multiply by 100 (move decimal point two places right). E.g., $0.75 = 75\\%$.',
                            'To convert a percentage to a fraction, write it over 100 and simplify. E.g., $25\\% = \\frac{25}{100} = \\frac{1}{4}$.'
                        ],
                        example: {
                            problem: 'Convert $60\\%$ to a decimal and a fraction.',
                            solution: [
                                'Step 1: To decimal: $60 \\div 100 = 0.60$.',
                                'Step 2: To fraction: $\\frac{60}{100}$. Simplify by dividing top and bottom by 20: $\\frac{60 \\div 20}{100 \\div 20} = \\frac{3}{5}$.',
                                'So, $60\\% = 0.6 = \\frac{3}{5}$.'
                            ]
                        },
                        practice: [
                            {
                                question: "Convert 0.4 to a percentage.",
                                equation: "",
                                type: "input",
                                correctAnswer: "40%",
                                explanation: "$0.4 \\times 100 = 40$. Add the percent sign: $40\\%$.",
                                hint: "Multiply by 100."
                            },
                            {
                                question: "Write $\\frac{3}{4}$ as a percentage.",
                                equation: "",
                                type: "input",
                                correctAnswer: "75%",
                                explanation: "$\\frac{3}{4} = 0.75$. As a percentage, it's $75\\%$.",
                                hint: "Convert the fraction to a decimal first."
                            }
                        ]
                    }
                }
            ]
        },
        'algebra-i-foundations': {
            lessons: [
                {
                    id: 'order-of-operations',
                    title: 'Order of Operations (PEMDAS/BODMAS)',
                    description: 'Learn the correct sequence for solving mathematical expressions.',
                    content: {
                        explanation: [
                            '**PEMDAS** helps us remember the order: **P**arentheses, **E**xponents, **M**ultiplication and **D**ivision (left to right), **A**ddition and **S**ubtraction (left to right).',
                            'This ensures everyone gets the same answer for an expression.'
                        ],
                        example: {
                            problem: 'Solve: $5 + 2 \\times (3 - 1)^2$',
                            solution: [
                                'Step 1: Parentheses: $3 - 1 = 2$',
                                'Expression becomes: $5 + 2 \\times (2)^2$',
                                'Step 2: Exponents: $2^2 = 4$',
                                'Expression becomes: $5 + 2 \\times 4$',
                                'Step 3: Multiplication: $2 \\times 4 = 8$',
                                'Expression becomes: $5 + 8$',
                                'Step 4: Addition: $5 + 8 = 13$',
                                'Final answer: 13'
                            ]
                        },
                        practice: [
                            {
                                question: "Calculate:",
                                equation: "$10 - 2 \\times 3 + 4$",
                                type: "input",
                                correctAnswer: "8",
                                explanation: "$10 - 6 + 4 = 4 + 4 = 8$.",
                                hint: "Multiply before adding or subtracting."
                            }
                        ]
                    }
                },
                {
                    id: 'solving-one-step-equations',
                    title: 'Solving One-Step Equations',
                    description: 'Solve simple linear equations involving one operation.',
                    content: {
                        explanation: [
                            'An equation says that two things are equal. We want to find the value of the unknown (variable).',
                            'To solve, do the **inverse operation** to both sides of the equation.',
                            'If it\'s addition, subtract. If it\'s subtraction, add. If it\'s multiplication, divide. If it\'s division, multiply.'
                        ],
                        example: {
                            problem: 'Solve for $x$: $x + 7 = 15$',
                            solution: [
                                'Step 1: The operation is addition (+7). The inverse is subtraction (-7).',
                                'Step 2: Subtract 7 from both sides:',
                                '$x + 7 - 7 = 15 - 7$',
                                '$x = 8$',
                                'Check: $8 + 7 = 15$. Correct!'
                            ]
                        },
                        practice: [
                            {
                                question: "Solve for y:",
                                equation: "$y - 4 = 10$",
                                type: "input",
                                correctAnswer: "14",
                                explanation: "Add 4 to both sides: $y = 10 + 4 = 14$.",
                                hint: "What is the opposite of subtracting 4?"
                            },
                            {
                                question: "Solve for z:",
                                equation: "$3z = 21$",
                                type: "input",
                                correctAnswer: "7",
                                explanation: "Divide both sides by 3: $z = 21 / 3 = 7$.",
                                hint: "What is the opposite of multiplying by 3?"
                            }
                        ]
                    }
                }
            ]
        }
    },

    // --- High School Math Curriculum ---
    'high-school-math': {
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
                                'The general form is: $ax + b = c$, where a, b, and c are constants.',
                                'To solve, we isolate the variable by performing the same operations on both sides.'
                            ],
                            example: {
                                problem: '2x + 5 = 13',
                                solution: [
                                    'Step 1: Subtract 5 from both sides',
                                    '2x + 5 - 5 = 13 - 5',
                                    '2x = 8',
                                    'Step 2: Divide both sides by 2',
                                    '2x \\div 2 = 8 \\div 2',
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
                                    '$(3x + 5x - 2x) + (8 - 3)$',
                                    'Step 2: Combine x terms',
                                    '$3x + 5x - 2x = 6x$',
                                    'Step 3: Combine constants',
                                    '$8 - 3 = 5$',
                                    'Final answer: $6x + 5$'
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
                                'The distributive property states: $a(b + c) = ab + ac$',
                                'Multiply the term outside the parentheses by each term inside.',
                                'This is also called "expanding" or "distributing".'
                            ],
                            example: {
                                problem: '3(x + 4)',
                                solution: [
                                    'Step 1: Multiply 3 by each term in parentheses',
                                    '$3 \\times x = 3x$',
                                    '$3 \\times 4 = 12$',
                                    'Step 2: Write the result',
                                    '$3(x + 4) = 3x + 12$'
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
                                'A quadratic equation has the form $ax^2 + bx + c = 0$, where $a \\ne 0$.',
                                'The highest power of the variable is 2.',
                                'Quadratic equations can have 0, 1, or 2 real solutions.'
                            ],
                            example: {
                                problem: '$x^2 - 5x + 6 = 0$',
                                solution: [
                                    'Step 1: Try to factor',
                                    'Look for two numbers that multiply to 6 and add to -5',
                                    'Those numbers are -2 and -3',
                                    'Step 2: Factor',
                                    '$(x - 2)(x - 3) = 0$',
                                    'Step 3: Solve',
                                    '$x - 2 = 0$ or $x - 3 = 0$',
                                    '$x = 2$ or $x = 3$'
                                ]
                            },
                            practice: [
                                {
                                    question: "Solve by factoring:",
                                    equation: "$x^2 - 7x + 12 = 0$",
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
                                    '$(2x + y) + (x - y) = 7 + 2$',
                                    '$3x = 9$',
                                    '$x = 3$',
                                    'Step 2: Substitute back',
                                    '$3 - y = 2$',
                                    '$y = 1$',
                                    'Solution: $(3, 1)$'
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
                                'The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
                                'Works for any quadratic equation $ax^2 + bx + c = 0$',
                                'The discriminant $b^2 - 4ac$ tells us about the solutions.'
                            ],
                            example: {
                                problem: '$2x^2 + 3x - 5 = 0$',
                                solution: [
                                    'Step 1: Identify $a = 2, b = 3, c = -5$',
                                    'Step 2: Calculate the discriminant',
                                    '$b^2 - 4ac = 3^2 - 4(2)(-5) = 9 + 40 = 49$',
                                    'Step 3: Apply the formula',
                                    '$x = \\frac{-3 \\pm \\sqrt{49}}{2 \\times 2} = \\frac{-3 \\pm 7}{4}$',
                                    'Step 4: Find both solutions',
                                    '$x = \\frac{-3 + 7}{4} = 1$ or $x = \\frac{-3 - 7}{4} = -2.5$'
                                ]
                            },
                            practice: [
                                {
                                    question: "Use the quadratic formula:",
                                    equation: "$x^2 - 4x + 3 = 0$",
                                    type: "multiple-choice",
                                    options: ["x = 1, 3", "x = -1, -3", "x = 2, 2", "x = 0, 4"],
                                    correctAnswer: "x = 1, 3",
                                    explanation: "$x = \\frac{4 \\pm \\sqrt{16-12}}{2} = \\frac{4 \\pm 2}{2} = 3 \\text{ or } 1$",
                                    hint: "$a = 1, b = -4, c = 3$"
                                }
                            ]
                        }
                    }
                ]
            },
            'algebra-ii': {
                lessons: [
                    {
                        id: 'solving-inequalities',
                        title: 'Solving Linear Inequalities',
                        description: 'Solve inequalities and represent solutions on a number line.',
                        content: {
                            explanation: [
                                'An **inequality** compares two expressions using symbols like < (less than), > (greater than), ≤ (less than or equal to), ≥ (greater than or equal to).',
                                'Solving inequalities is similar to solving equations, but if you multiply or divide by a negative number, you **must** flip the inequality sign.'
                            ],
                            example: {
                                problem: 'Solve for x: $3x - 2 < 10$',
                                solution: [
                                    'Step 1: Add 2 to both sides: $3x < 12$',
                                    'Step 2: Divide by 3: $x < 4$',
                                    'The solution is all numbers less than 4.'
                                ]
                            },
                            practice: [
                                {
                                    question: "Solve for x:",
                                    equation: "$-2x + 5 \\ge 11$",
                                    type: "input",
                                    correctAnswer: "x <= -3",
                                    explanation: "$-2x \\ge 6 \\implies x \\le -3$ (remember to flip sign).",
                                    hint: "Be careful when dividing by a negative number."
                                }
                            ]
                        }
                    },
                    {
                        id: 'polynomial-operations',
                        title: 'Operations with Polynomials',
                        description: 'Add, subtract, multiply, and divide polynomials.',
                        content: {
                            explanation: [
                                'A **polynomial** is an expression consisting of variables and coefficients, involving only the operations of addition, subtraction, multiplication, and non-negative integer exponents.',
                                'Adding/Subtracting: Combine like terms.',
                                'Multiplying: Use the distributive property (FOIL for binomials).',
                                'Dividing: Use long division or synthetic division.'
                            ],
                            example: {
                                problem: 'Multiply: $(x + 3)(x - 2)$',
                                solution: [
                                    'Step 1: Use FOIL (First, Outer, Inner, Last)',
                                    'First: $x \\times x = x^2$',
                                    'Outer: $x \\times -2 = -2x$',
                                    'Inner: $3 \\times x = 3x$',
                                    'Last: $3 \\times -2 = -6$',
                                    'Step 2: Combine like terms:',
                                    '$x^2 - 2x + 3x - 6 = x^2 + x - 6$',
                                    'Result: $x^2 + x - 6$'
                                ]
                            },
                            practice: [
                                {
                                    question: "Expand and simplify:",
                                    equation: "$(2x + 1)(x + 4)$",
                                    type: "input",
                                    correctAnswer: "2x^2 + 9x + 4",
                                    explanation: "$2x^2 + 8x + x + 4 = 2x^2 + 9x + 4$.",
                                    hint: "Use FOIL method."
                                }
                            ]
                        }
                    },
                    {
                        id: 'factoring-quadratics',
                        title: 'Factoring Quadratic Expressions',
                        description: 'Factor quadratic expressions into binomials.',
                        content: {
                            explanation: [
                                'Factoring a quadratic expression (like $ax^2 + bx + c$) means writing it as a product of two linear expressions (binomials).',
                                'For $x^2 + bx + c$, look for two numbers that multiply to $c$ and add to $b$.',
                                'For $ax^2 + bx + c$ where $a \\ne 1$, use grouping or the "ac method".'
                            ],
                            example: {
                                problem: 'Factor: $x^2 + 7x + 10$',
                                solution: [
                                    'Step 1: Find two numbers that multiply to 10 and add to 7.',
                                    'The numbers are 2 and 5 ($2 \\times 5 = 10$, $2 + 5 = 7$).',
                                    'Step 2: Write the factored form:',
                                    '$(x + 2)(x + 5)$',
                                    'Result: $(x + 2)(x + 5)$'
                                ]
                            },
                            practice: [
                                {
                                    question: "Factor:",
                                    equation: "$x^2 - x - 6$",
                                    type: "input",
                                    correctAnswer: "(x-3)(x+2)",
                                    explanation: "Numbers that multiply to -6 and add to -1 are -3 and 2.",
                                    hint: "Think about pairs of factors for -6 that add up to -1."
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
                                    '$P = 2(\\text{length} + \\text{width}) = 2(8 + 5) = 26$',
                                    'Step 2: Calculate area',
                                    '$A = \\text{length} \\times \\text{width} = 8 \\times 5 = 40$',
                                    'Perimeter = 26 units, Area = 40 square units'
                                ]
                            },
                            practice: [
                                {
                                    question: "Find the area of a triangle:",
                                    equation: "base = 6, height = 4",
                                    type: "input",
                                    correctAnswer: "12",
                                    explanation: "Area = $(1/2) \\times \\text{base} \\times \\text{height} = (1/2) \\times 6 \\times 4 = 12$",
                                    hint: "Use $A = \\frac{1}{2}bh$"
                                }
                            ]
                        }
                    }
                ]
            },
            'geometry-hs': {
                lessons: [
                    {
                        id: 'pythagorean-theorem',
                        title: 'Pythagorean Theorem',
                        description: 'Apply the Pythagorean theorem to solve for sides of right triangles.',
                        content: {
                            explanation: [
                                'The **Pythagorean Theorem** states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides.',
                                'Formula: $a^2 + b^2 = c^2$, where $c$ is the hypotenuse.'
                            ],
                            example: {
                                problem: 'A right triangle has legs of length 3 and 4. Find the length of the hypotenuse.',
                                solution: [
                                    'Step 1: Identify a=3, b=4.',
                                    'Step 2: Apply the formula: $3^2 + 4^2 = c^2$',
                                    '$9 + 16 = c^2$',
                                    '$25 = c^2$',
                                    'Step 3: Take the square root: $c = \\sqrt{25} = 5$',
                                    'The hypotenuse is 5.'
                                ]
                            },
                            practice: [
                                {
                                    question: "Find the missing side of a right triangle:",
                                    equation: "leg a = 5, hypotenuse c = 13",
                                    type: "input",
                                    correctAnswer: "12",
                                    explanation: "$5^2 + b^2 = 13^2 \\implies 25 + b^2 = 169 \\implies b^2 = 144 \\implies b = 12$.",
                                    hint: "Remember the formula: $a^2 + b^2 = c^2$."
                                }
                            ]
                        }
                    },
                    {
                        id: '3d-shapes-volume-surface-area',
                        title: 'Volume and Surface Area of 3D Shapes',
                        description: 'Calculate volume and surface area for prisms, cylinders, pyramids, cones, and spheres.',
                        content: {
                            explanation: [
                                '**Volume** is the amount of space a 3D object occupies.',
                                '**Surface area** is the total area of all the surfaces of a 3D object.',
                                'Formulas vary by shape (e.g., Cylinder Volume: $V = \\pi r^2 h$).'
                            ],
                            example: {
                                problem: 'Find the volume of a rectangular prism with length 5, width 3, and height 4.',
                                solution: [
                                    'Step 1: Formula for rectangular prism volume: $V = \\text{length} \\times \\text{width} \\times \\text{height}$',
                                    'Step 2: Substitute values: $V = 5 \\times 3 \\times 4$',
                                    '$V = 15 \\times 4$',
                                    '$V = 60$',
                                    'The volume is 60 cubic units.'
                                ]
                            },
                            practice: [
                                {
                                    question: "Find the volume of a cylinder:",
                                    equation: "radius = 2, height = 5",
                                    type: "input",
                                    correctAnswer: "20π",
                                    explanation: "$V = \\pi r^2 h = \\pi (2^2)(5) = 20\\pi$.",
                                    hint: "Remember the formula $V = \\pi r^2 h$."
                                }
                            ]
                        }
                    },
                    {
                        id: 'angles-parallel-lines',
                        title: 'Angles and Parallel Lines',
                        description: 'Identify and apply properties of angles formed by parallel lines and transversals.',
                        content: {
                            explanation: [
                                'A **transversal** is a line that intersects two or more other lines.',
                                'When a transversal intersects parallel lines, special angle pairs are formed:',
                                '* **Alternate Interior Angles** are equal.',
                                '* **Corresponding Angles** are equal.',
                                '* **Consecutive Interior Angles** are supplementary (add up to 180°).'
                            ],
                            example: {
                                problem: 'If two parallel lines are cut by a transversal, and one corresponding angle is 70°, what is the measure of the other corresponding angle?',
                                solution: [
                                    'Step 1: Identify the relationship: corresponding angles.',
                                    'Step 2: Corresponding angles formed by parallel lines are equal.',
                                    'So, the other corresponding angle is also 70°.'
                                ]
                            },
                            practice: [
                                {
                                    question: "If two parallel lines are cut by a transversal, and an alternate interior angle is 110°, what is the measure of its corresponding angle?",
                                    equation: "",
                                    type: "input",
                                    correctAnswer: "110",
                                    explanation: "Alternate interior angles are equal, and corresponding angles are equal. So if an alternate interior angle is 110, its corresponding angle will also be 110.",
                                    hint: "Recall the relationships between angles formed by parallel lines."
                                }
                            ]
                        }
                    }
                ]
            }
        },
        trigonometry: {
            lessons: [
                {
                    id: 'right-triangle-trig',
                    title: 'Right Triangle Trigonometry (SOH CAH TOA)',
                    description: 'Use sine, cosine, and tangent to find unknown sides and angles in right triangles.',
                    content: {
                        explanation: [
                            '**SOH CAH TOA** is a mnemonic for the trigonometric ratios in a right triangle:',
                            '**SOH**: $\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$',
                            '**CAH**: $\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$',
                            '**TOA**: $\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}}$'
                        ],
                        example: {
                            problem: 'In a right triangle, the angle is 30°, the opposite side is 5. Find the hypotenuse.',
                            solution: [
                                'Step 1: We know the opposite and need the hypotenuse, so use Sine (SOH).',
                                '$\\sin(30°) = \\frac{5}{\\text{hypotenuse}}$',
                                'Step 2: Solve for hypotenuse:',
                                'hypotenuse $= \\frac{5}{\\sin(30°)}$',
                                'hypotenuse $= \\frac{5}{0.5} = 10$',
                                'The hypotenuse is 10.'
                            ]
                        },
                        practice: [
                            {
                                question: "In a right triangle, adjacent = 6, angle = 45°. Find the opposite side.",
                                equation: "",
                                type: "input",
                                correctAnswer: "6",
                                explanation: "$\\tan(45°) = \\frac{\\text{opposite}}{6} \\implies 1 = \\frac{\\text{opposite}}{6} \\implies \\text{opposite} = 6$.",
                                hint: "Use TOA (Tangent)."
                            }
                        ]
                    }
                },
                {
                    id: 'unit-circle-intro',
                    title: 'Introduction to the Unit Circle',
                    description: 'Understand the unit circle and its role in defining trigonometric functions for any angle.',
                    content: {
                        explanation: [
                            'The **unit circle** is a circle with a radius of 1 centered at the origin (0,0) on a coordinate plane.',
                            'It allows us to define sine and cosine for any angle, not just acute angles in a right triangle.',
                            'For any point $(x, y)$ on the unit circle, $\\cos(\\theta) = x$ and $\\sin(\\theta) = y$.'
                        ],
                        example: {
                            problem: 'Find $\\sin(90°)$ using the unit circle.',
                            solution: [
                                'Step 1: Locate 90° on the unit circle (the positive y-axis).',
                                'Step 2: The coordinates at 90° are $(0, 1)$.',
                                'Step 3: Since $\\sin(\\theta) = y$, $\\sin(90°) = 1$.'
                            ]
                        },
                        practice: [
                            {
                                question: "What is $\\cos(180°)$ using the unit circle?",
                                equation: "",
                                type: "input",
                                correctAnswer: "-1",
                                explanation: "At 180° (negative x-axis), the coordinates are $(-1, 0)$. Since $\\cos(\\theta) = x$, $\\cos(180°) = -1$.",
                                hint: "Remember that cosine is the x-coordinate on the unit circle."
                            }
                        ]
                    }
                },
                {
                    id: 'law-of-sines',
                    title: 'Law of Sines',
                    description: 'Use the Law of Sines to solve non-right triangles (AAS, ASA, SSA cases).',
                    content: {
                        explanation: [
                            'The **Law of Sines** relates the ratios of the sides of a triangle to the sines of its opposite angles.',
                            'Formula: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$',
                            'Used when you have an angle and its opposite side, plus one more piece of information (Angle-Angle-Side, Angle-Side-Angle, or Side-Side-Angle).'
                        ],
                        example: {
                            problem: 'In a triangle, $A=30°$, $B=70°$, and $a=6$. Find side $b$.',
                            solution: [
                                'Step 1: Set up the Law of Sines equation:',
                                '$\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$',
                                '$\\frac{6}{\\sin 30°} = \\frac{b}{\\sin 70°}$',
                                'Step 2: Solve for $b$:',
                                '$b = \\frac{6 \\times \\sin 70°}{\\sin 30°}$',
                                '$b \\approx \\frac{6 \\times 0.9397}{0.5} \\approx \\frac{5.6382}{0.5} \\approx 11.276$',
                                'Side $b$ is approximately 11.28.'
                            ]
                        },
                        practice: [
                            {
                                question: "In a triangle, $B=45°$, $C=60°$, and $b=10$. Find side $c$.",
                                equation: "",
                                type: "input",
                                correctAnswer: "12.25", // Approx 10 * sin(60)/sin(45)
                                explanation: "$\\frac{10}{\\sin 45°} = \\frac{c}{\\sin 60°} \\implies c = \\frac{10 \\sin 60°}{\\sin 45°} \\approx 12.25$.",
                                hint: "Set up the proportion using the Law of Sines."
                            }
                        ]
                    }
                }
            ]
        },
        'pre-calculus': {
            lessons: [
                {
                    id: 'exponential-logarithmic-functions',
                    title: 'Exponential and Logarithmic Functions',
                    description: 'Explore the properties, graphs, and applications of exponential and logarithmic functions.',
                    content: {
                        explanation: [
                            '**Exponential functions** have the form $y = a^x$ where the variable is in the exponent (e.g., compound interest, population growth).',
                            '**Logarithmic functions** are the inverse of exponential functions. If $b^y = x$, then $\\log_b x = y$.',
                            'Logarithms help us solve for exponents.'
                        ],
                        example: {
                            problem: 'Convert $2^3 = 8$ to logarithmic form.',
                            solution: [
                                'Step 1: Identify the base ($b=2$), exponent ($y=3$), and result ($x=8$).',
                                'Step 2: Apply the definition: $\\log_b x = y$',
                                'Result: $\\log_2 8 = 3$'
                            ]
                        },
                        practice: [
                            {
                                question: "Convert $\\log_{10} 100 = 2$ to exponential form.",
                                equation: "",
                                type: "input",
                                correctAnswer: "10^2 = 100",
                                explanation: "Base is 10, exponent is 2, result is 100.",
                                hint: "Remember: $\\log_b x = y \\iff b^y = x$."
                            }
                        ]
                    }
                },
                {
                    id: 'function-transformations',
                    title: 'Function Transformations',
                    description: 'Understand how transformations (shifts, reflections, stretches, compressions) affect graphs of functions.',
                    content: {
                        explanation: [
                            '**Vertical Shift**: $f(x) + c$ (up $c$), $f(x) - c$ (down $c$).',
                            '**Horizontal Shift**: $f(x + c)$ (left $c$), $f(x - c)$ (right $c$).',
                            '**Reflections**: $-f(x)$ (over x-axis), $f(-x)$ (over y-axis).',
                            '**Vertical Stretch/Compression**: $c \\cdot f(x)$ ($|c|>1$ stretch, $0<|c|<1$ compression).',
                            '**Horizontal Stretch/Compression**: $f(cx)$ ($|c|>1$ compression, $0<|c|<1$ stretch).'
                        ],
                        example: {
                            problem: 'Describe the transformation from $f(x) = x^2$ to $g(x) = (x - 3)^2 + 1$.',
                            solution: [
                                'Step 1: $(x - 3)^2$ means a horizontal shift of 3 units to the right.',
                                'Step 2: $+ 1$ means a vertical shift of 1 unit up.',
                                'Transformation: Shift 3 units right and 1 unit up.'
                            ]
                        },
                        practice: [
                            {
                                question: "Describe the transformation from $f(x) = |x|$ to $g(x) = -2|x| + 5$.",
                                equation: "",
                                type: "input",
                                correctAnswer: "Vertical stretch by 2, reflection over x-axis, shift up 5",
                                explanation: "The -2 means a vertical stretch by 2 and a reflection over the x-axis. The +5 means a vertical shift up by 5.",
                                hint: "Consider the order of operations for transformations."
                            }
                        ]
                    }
                }
            ]
        }
    },

    // --- Calculus Curriculum ---
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
                            'Written as: $\\lim_{x \\to a} f(x) = L$',
                            'The function may not actually reach this value, but gets arbitrarily close.'
                        ],
                        example: {
                            problem: '$\\lim_{x \\to 2} (x + 1)$',
                            solution: [
                                'Step 1: Since this is a simple polynomial, substitute directly',
                                '$\\lim_{x \\to 2} (x + 1) = 2 + 1 = 3$',
                                'The limit exists and equals 3'
                            ]
                        },
                        practice: [
                            {
                                question: "Find the limit:",
                                equation: "$\\lim_{x \\to 3} (2x - 1)$",
                                type: "input",
                                correctAnswer: "5",
                                explanation: "Direct substitution: $2(3) - 1 = 5$",
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
                            'Power rule: $\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}$',
                            'The derivative of a constant is 0.'
                        ],
                        example: {
                            problem: '$f(x) = 3x^2 + 2x - 5$',
                            solution: [
                                'Step 1: Apply power rule to each term',
                                '$\\frac{d}{dx}[3x^2] = 3 \\cdot 2x^1 = 6x$',
                                '$\\frac{d}{dx}[2x] = 2 \\cdot 1x^0 = 2$',
                                '$\\frac{d}{dx}[-5] = 0$',
                                'Step 2: Combine results',
                                "$f'(x) = 6x + 2$"
                            ]
                        },
                        practice: [
                            {
                                question: "Find the derivative:",
                                equation: "$f(x) = x^3 + 4x$",
                                type: "input",
                                correctAnswer: "3x^2 + 4",
                                explanation: "$\\frac{d}{dx}[x^3] = 3x^2$, $\\frac{d}{dx}[4x] = 4$",
                                hint: "Use the power rule for each term"
                            }
                        ]
                    }
                }
            ]
        },
        intermediate: {
            lessons: [
                {
                    id: 'limits-advanced',
                    title: 'Advanced Limit Techniques',
                    description: 'Explore indeterminate forms, limits involving infinity, and L\'Hopital\'s Rule.',
                    content: {
                        explanation: [
                            'Limits involving indeterminate forms like $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$ require special techniques.',
                            "**L'Hôpital's Rule** can be applied to these forms: $\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f'(x)}{g'(x)}$ (if conditions met).",
                            'Limits at infinity describe the end behavior of a function.'
                        ],
                        example: {
                            problem: 'Evaluate $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$',
                            solution: [
                                'Step 1: Direct substitution gives $\\frac{0}{0}$ (indeterminate form).',
                                'Step 2: Apply L\'Hôpital\'s Rule: Take derivatives of numerator and denominator.',
                                'Derivative of $\\sin(x)$ is $\\cos(x)$.',
                                'Derivative of $x$ is $1$.',
                                'So, $\\lim_{x \\to 0} \\frac{\\cos(x)}{1}$',
                                'Step 3: Substitute $x=0$: $\\frac{\\cos(0)}{1} = \\frac{1}{1} = 1$',
                                'The limit is 1.'
                            ]
                        },
                        practice: [
                            {
                                question: "Evaluate the limit:",
                                equation: "$\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}$",
                                type: "input",
                                correctAnswer: "2",
                                explanation: "Factor: $\\frac{(x-1)(x+1)}{x-1} = x+1$. Substitute $x=1$: $1+1=2$. (Can also use L'Hopital's: $\\frac{2x}{1} = 2(1) = 2$).",
                                hint: "Try factoring the numerator or applying L'Hôpital's Rule."
                            }
                        ]
                    }
                },
                {
                    id: 'derivative-rules',
                    title: 'Product, Quotient, and Chain Rule',
                    description: 'Master advanced differentiation rules for complex functions.',
                    content: {
                        explanation: [
                            '**Product Rule**: $\\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)$',
                            '**Quotient Rule**: $\\frac{d}{dx}[\\frac{f(x)}{g(x)}] = \\frac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^2}$',
                            '**Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$ (Derivative of outer function times derivative of inner function).'
                        ],
                        example: {
                            problem: 'Find the derivative of $y = (3x^2 + 1)^4$ using the Chain Rule.',
                            solution: [
                                'Step 1: Identify outer function $f(u) = u^4$ and inner function $g(x) = 3x^2 + 1$.',
                                'Step 2: Find derivatives: $f'(u) = 4u^3$ and $g'(x) = 6x$.',
                                'Step 3: Apply Chain Rule: $y' = f'(g(x)) \\cdot g'(x) = 4(3x^2 + 1)^3 \\cdot (6x)$',
                                'Result: $y' = 24x(3x^2 + 1)^3$'
                            ]
                        },
                        practice: [
                            {
                                question: "Find the derivative:",
                                equation: "$f(x) = x \\sin(x)$",
                                type: "input",
                                correctAnswer: "sin(x) + x cos(x)",
                                explanation: "Use Product Rule: $f'(x) = (1)\\sin(x) + x(\\cos(x)) = \\sin(x) + x\\cos(x)$.",
                                hint: "This requires the Product Rule."
                            }
                        ]
                    }
                },
                {
                    id: 'applications-derivatives',
                    title: 'Applications of Derivatives (Optimization, Related Rates)',
                    description: 'Apply derivatives to solve real-world problems involving rates of change, maximums, and minimums.',
                    content: {
                        explanation: [
                            '**Optimization** problems involve finding the maximum or minimum value of a quantity (e.g., maximizing profit, minimizing cost). This typically involves finding critical points where the derivative is zero or undefined.',
                            '**Related Rates** problems involve finding the rate at which a quantity changes by relating it to other quantities whose rates of change are known.'
                        ],
                        example: {
                            problem: 'Find the dimensions of a rectangle with perimeter 20 meters that has the maximum area.',
                            solution: [
                                'Step 1: Define variables. Let length be $L$ and width be $W$. Perimeter $2L + 2W = 20 \\implies L + W = 10 \\implies W = 10 - L$. Area $A = L \\times W = L(10 - L) = 10L - L^2$.',
                                'Step 2: Find the derivative of the area with respect to $L$: $\\frac{dA}{dL} = 10 - 2L$.',
                                'Step 3: Set the derivative to zero and solve for $L$: $10 - 2L = 0 \\implies 2L = 10 \\implies L = 5$.',
                                'Step 4: Find $W$: $W = 10 - 5 = 5$.',
                                'The rectangle with maximum area is a square with side length 5 meters.'
                            ]
                        },
                        practice: [
                            {
                                question: "A spherical balloon is being inflated. If its radius is increasing at a rate of 2 cm/s, how fast is its volume increasing when the radius is 3 cm? (Volume of sphere: $V = \\frac{4}{3}\\pi r^3$)",
                                equation: "",
                                type: "input",
                                correctAnswer: "72π cm^3/s",
                                explanation: "$\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}$. Given $r=3$, $\\frac{dr}{dt}=2$. So, $\\frac{dV}{dt} = 4\\pi (3^2)(2) = 4\\pi (9)(2) = 72\\pi$.",
                                hint: "Use implicit differentiation with respect to time ($t$)."
                            }
                        ]
                    }
                }
            ]
        },
        advanced: {
            lessons: [
                {
                    id: 'integral-basics',
                    title: 'Introduction to Integration',
                    description: 'Understand antiderivatives, indefinite and definite integrals, and the Fundamental Theorem of Calculus.',
                    content: {
                        explanation: [
                            '**Integration** is the reverse process of differentiation (finding the antiderivative).',
                            'An **indefinite integral** $\\int f(x) dx = F(x) + C$ gives a family of functions whose derivative is $f(x)$. $C$ is the constant of integration.',
                            'A **definite integral** $\\int_a^b f(x) dx = F(b) - F(a)$ calculates the net area under a curve between two points $a$ and $b$.',
                            'The **Fundamental Theorem of Calculus** connects differentiation and integration.'
                        ],
                        example: {
                            problem: 'Find the indefinite integral of $f(x) = 2x$.',
                            solution: [
                                'Step 1: Think: what function, when differentiated, gives $2x$?',
                                'We know $\\frac{d}{dx}[x^2] = 2x$.',
                                'Step 2: Add the constant of integration.',
                                'Result: $\\int 2x dx = x^2 + C$'
                            ]
                        },
                        practice: [
                            {
                                question: "Find the indefinite integral:",
                                equation: "$\\int 3x^2 dx$",
                                type: "input",
                                correctAnswer: "x^3 + C",
                                explanation: "Using the power rule for integration $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$, we get $\\frac{3x^{2+1}}{2+1} = \\frac{3x^3}{3} + C = x^3 + C$.",
                                hint: "Increase the power by 1 and divide by the new power."
                            }
                        ]
                    }
                },
                {
                    id: 'u-substitution',
                    title: 'Integration by U-Substitution',
                    description: 'Learn a technique for integrating composite functions by changing the variable of integration.',
                    content: {
                        explanation: [
                            '**U-substitution** is a method for simplifying integrals that involve a composite function and the derivative of its inner function.',
                            'Steps: 1. Choose $u$ (often the "inner" function). 2. Find $du = u\' dx$. 3. Substitute $u$ and $du$ into the integral. 4. Integrate with respect to $u$. 5. Substitute back to express the answer in terms of the original variable.'
                        ],
                        example: {
                            problem: 'Evaluate $\\int (2x + 1)^3 dx$',
                            solution: [
                                'Step 1: Let $u = 2x + 1$.',
                                'Step 2: Find $du$: $\\frac{du}{dx} = 2 \\implies du = 2 dx \\implies dx = \\frac{1}{2} du$.',
                                'Step 3: Substitute: $\\int u^3 \\cdot \\frac{1}{2} du = \\frac{1}{2} \\int u^3 du$.',
                                'Step 4: Integrate with respect to $u$: $\\frac{1}{2} \\cdot \\frac{u^4}{4} + C = \\frac{u^4}{8} + C$.',
                                'Step 5: Substitute back $u = 2x + 1$: $\\frac{(2x + 1)^4}{8} + C$.'
                            ]
                        },
                        practice: [
                            {
                                question: "Evaluate the integral: $\\int x \\cos(x^2) dx$",
                                equation: "",
                                type: "input",
                                correctAnswer: "1/2 sin(x^2) + C",
                                explanation: "Let $u = x^2$, so $du = 2x dx$. Then $x dx = \\frac{1}{2} du$. Integral becomes $\\int \\frac{1}{2} \\cos(u) du = \\frac{1}{2} \\sin(u) + C = \\frac{1}{2} \\sin(x^2) + C$.",
                                hint: "Let $u$ be the argument of the cosine function."
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
    // Kindergarten
    {
        topic: 'kindergarten',
        difficulty: 'easy',
        question: "How many apples? 🍎🍎🍎🍎",
        equation: "",
        type: "input",
        correctAnswer: "4",
        points: 1
    },
    {
        topic: 'kindergarten',
        difficulty: 'easy',
        question: "Which one is a square?",
        equation: "",
        type: "multiple-choice",
        options: ["⚪", "◼️", "▲"],
        correctAnswer: "◼️",
        points: 1
    },
    {
        topic: 'kindergarten',
        difficulty: 'easy',
        question: "What is 2 + 3?",
        equation: "",
        type: "input",
        correctAnswer: "5",
        points: 1
    },
    // Elementary Math
    {
        topic: 'elementary-math',
        difficulty: 'easy',
        question: "What is 6 + 5?",
        equation: "",
        type: "input",
        correctAnswer: "11",
        points: 1
    },
    {
        topic: 'elementary-math',
        difficulty: 'easy',
        question: "What is 12 - 7?",
        equation: "",
        type: "input",
        correctAnswer: "5",
        points: 1
    },
    {
        topic: 'elementary-math',
        difficulty: 'medium',
        question: "What is $7 \\times 8$?",
        equation: "",
        type: "input",
        correctAnswer: "56",
        points: 2
    },
    {
        topic: 'elementary-math',
        difficulty: 'medium',
        question: "What fraction is $\\frac{1}{2} + \\frac{1}{4}$?",
        equation: "",
        type: "input",
        correctAnswer: "3/4",
        points: 2
    },
    {
        topic: 'elementary-math',
        difficulty: 'medium',
        question: "Write 0.25 as a fraction.",
        equation: "",
        type: "input",
        correctAnswer: "1/4",
        points: 2
    },
    {
        topic: 'elementary-math',
        difficulty: 'medium',
        question: "Is $\\frac{1}{4}$ equivalent to $\\frac{3}{12}$?",
        equation: "",
        type: "multiple-choice",
        options: ["Yes", "No"],
        correctAnswer: "Yes",
        points: 2
    },
    {
        topic: 'elementary-math',
        difficulty: 'medium',
        question: "What is 8.5 - 2.1?",
        equation: "",
        type: "input",
        correctAnswer: "6.4",
        points: 2
    },
    // Middle School Math
    {
        topic: 'middle-school-math',
        difficulty: 'medium',
        question: "Calculate: $-3 + (-5)$",
        equation: "",
        type: "input",
        correctAnswer: "-8",
        points: 2
    },
    {
        topic: 'middle-school-math',
        difficulty: 'medium',
        question: "Solve for x: $\\frac{x}{5} = \\frac{6}{15}$",
        equation: "",
        type: "input",
        correctAnswer: "2",
        points: 2
    },
    {
        topic: 'middle-school-math',
        difficulty: 'hard',
        question: "Calculate: $4 \\times (6 - 2)^2 \\div 8$",
        equation: "",
        type: "input",
        correctAnswer: "8",
        points: 3
    },
    {
        topic: 'middle-school-math',
        difficulty: 'medium',
        question: "What is 25% of 80?",
        equation: "",
        type: "input",
        correctAnswer: "20",
        points: 2
    },
    {
        topic: 'middle-school-math',
        difficulty: 'medium',
        question: "Solve for $p$: $p + 12 = 30$",
        equation: "",
        type: "input",
        correctAnswer: "18",
        points: 2
    },
    // High School Math - Algebra
    {
        topic: 'algebra',
        difficulty: 'easy',
        question: "Solve for x:",
        equation: "$x + 3 = 8$",
        type: "input",
        correctAnswer: "5",
        points: 1
    },
    {
        topic: 'algebra',
        difficulty: 'easy',
        question: "Simplify:",
        equation: "$2x + 3x$",
        type: "multiple-choice",
        options: ["5x", "6x", "2x", "x"],
        correctAnswer: "5x",
        points: 1
    },
    {
        topic: 'algebra',
        difficulty: 'medium',
        question: "Solve for x:",
        equation: "$2x + 5 = 13$",
        type: "input",
        correctAnswer: "4",
        points: 2
    },
    {
        topic: 'algebra',
        difficulty: 'medium',
        question: "Factor:",
        equation: "$x^2 - 5x + 6$",
        type: "multiple-choice",
        options: ["(x-2)(x-3)", "(x-1)(x-6)", "(x+2)(x+3)", "(x-5)(x-1)"],
        correctAnswer: "(x-2)(x-3)",
        points: 2
    },
    {
        topic: 'algebra',
        difficulty: 'hard',
        question: "Use the quadratic formula to solve:",
        equation: "$x^2 - 4x + 3 = 0$",
        type: "multiple-choice",
        options: ["x = 1, 3", "x = -1, -3", "x = 2, 2", "x = 0, 4"],
        correctAnswer: "x = 1, 3",
        points: 3
    },
    {
        topic: 'algebra',
        difficulty: 'hard',
        question: "Solve for x:",
        equation: "$-3x - 4 > 5$",
        type: "input",
        correctAnswer: "x < -3",
        points: 3
    },
    {
        topic: 'algebra',
        difficulty: 'hard',
        question: "Expand and simplify:",
        equation: "$(x - 5)(x + 3)$",
        type: "input",
        correctAnswer: "x^2 - 2x - 15",
        points: 3
    },
    {
        topic: 'algebra',
        difficulty: 'hard',
        question: "Factor $x^2 + 2x - 8$.",
        equation: "",
        type: "input",
        correctAnswer: "(x+4)(x-2)",
        points: 3
    },
    // High School Math - Geometry
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
    {
        topic: 'geometry',
        difficulty: 'hard',
        question: "A right triangle has legs 6 and 8. What is the hypotenuse?",
        equation: "",
        type: "input",
        correctAnswer: "10",
        points: 3
    },
    {
        topic: 'geometry',
        difficulty: 'hard',
        question: "Find the volume of a rectangular prism with length 2, width 3, height 4.",
        equation: "",
        type: "input",
        correctAnswer: "24",
        points: 3
    },
    {
        topic: 'geometry',
        difficulty: 'hard',
        question: "If two parallel lines are cut by a transversal and a corresponding angle is 120°, what is the measure of its alternate interior angle?",
        equation: "",
        type: "input",
        correctAnswer: "120",
        points: 3
    },
    // High School Math - Trigonometry
    {
        topic: 'trigonometry',
        difficulty: 'easy',
        question: "What is $\\sin(30°)$?",
        equation: "$\\sin(30°) = ?$",
        type: "multiple-choice",
        options: ["1/2", "√3/2", "1", "√2/2"],
        correctAnswer: "1/2",
        points: 1
    },
    {
        topic: 'trigonometry',
        difficulty: 'medium',
        question: "Find the hypotenuse of a right triangle with angle 45°, opposite side 7.",
        equation: "",
        type: "input",
        correctAnswer: "7√2", // or approx 9.899
        points: 2
    },
    {
        topic: 'trigonometry',
        difficulty: 'hard',
        question: "What are the coordinates on the unit circle for an angle of 270°?",
        equation: "",
        type: "input",
        correctAnswer: "(0, -1)",
        points: 3
    },
    {
        topic: 'trigonometry',
        difficulty: 'hard',
        question: "In a triangle, $A=40°$, $B=80°$, $a=10$. Find $b$ using Law of Sines.",
        equation: "",
        type: "input",
        correctAnswer: "15.32", // approx 10 * sin(80)/sin(40)
        points: 3
    },
    // High School Math - Pre-Calculus
    {
        topic: 'pre-calculus',
        difficulty: 'medium',
        question: "Convert $3^4 = 81$ to logarithmic form.",
        equation: "",
        type: "input",
        correctAnswer: "log_3 81 = 4",
        points: 2
    },
    {
        topic: 'pre-calculus',
        difficulty: 'hard',
        question: "Evaluate $\\log_2 16$",
        equation: "",
        type: "input",
        correctAnswer: "4",
        points: 3
    },
    {
        topic: 'pre-calculus',
        difficulty: 'hard',
        question: "Describe the transformation from $f(x) = x^3$ to $g(x) = (x + 1)^3 - 4$.",
        equation: "",
        type: "input",
        correctAnswer: "Shift left 1, shift down 4",
        points: 3
    },
    // Calculus
    {
        topic: 'calculus',
        difficulty: 'easy',
        question: "Find the derivative:",
        equation: "$f(x) = x^2$",
        type: "input",
        correctAnswer: "2x",
        points: 1
    },
    {
        topic: 'calculus',
        difficulty: 'medium',
        question: "Find the derivative:",
        equation: "$f(x) = 3x^2 + 2x - 1$",
        type: "input",
        correctAnswer: "6x + 2",
        points: 2
    },
    {
        topic: 'calculus',
        difficulty: 'medium',
        question: "Evaluate the limit:",
        equation: "$\\lim_{x \\to 2} (x + 3)$",
        type: "input",
        correctAnswer: "5",
        points: 2
    },
    {
        topic: 'calculus',
        difficulty: 'hard',
        question: "Find the derivative of $f(x) = (2x - 3)^3$.",
        equation: "",
        type: "input",
        correctAnswer: "6(2x - 3)^2",
        points: 3
    },
    {
        topic: 'calculus',
        difficulty: 'hard',
        question: "Evaluate $\\lim_{x \\to 0} \\frac{e^x - 1}{x}$.",
        equation: "",
        type: "input",
        correctAnswer: "1",
        points: 3
    },
    {
        topic: 'calculus',
        difficulty: 'hard',
        question: "Find the indefinite integral of $f(x) = 4x^3$.",
        equation: "",
        type: "input",
        correctAnswer: "x^4 + C",
        points: 3
    },
    {
        topic: 'calculus',
        difficulty: 'hard',
        question: "Evaluate $\\int 2x(x^2 + 5)^4 dx$.",
        equation: "",
        type: "input",
        correctAnswer: "1/5 (x^2 + 5)^5 + C",
        points: 3
    }
];

console.log('Learning content loaded successfully with',
    Object.keys(window.learningContent).length, 'top-level topics and',
    window.placementTest.length, 'placement test questions');
�
