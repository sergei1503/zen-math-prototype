// Challenge Library - All challenge definitions for Zen Math
// Each challenge defines a goal-oriented task within a specific mode
// Challenges progress from simple discovery to deeper mathematical understanding

const CHALLENGE_LIBRARY = [
    // =============================================================
    // FREE EXPLORE - Grouping and counting fundamentals
    // =============================================================
    {
        id: 'explore-001',
        mode: 'free-explore',
        title: 'Two Groups',
        hint: 'Gently gather the stones into two separate clusters',
        difficulty: 1,
        concepts: ['grouping', 'counting'],
        goals: [
            { type: 'group-count', count: 2 }
        ]
    },
    {
        id: 'explore-002',
        mode: 'free-explore',
        title: 'Equal Halves',
        hint: 'Create two groups with the same number of stones in each',
        difficulty: 2,
        concepts: ['equality', 'grouping', 'division'],
        goals: [
            { type: 'group-count', count: 2 },
            { type: 'equal-groups' }
        ]
    },
    {
        id: 'explore-003',
        mode: 'free-explore',
        title: 'A Gathering of Five',
        hint: 'Bring exactly five stones together into one group',
        difficulty: 2,
        concepts: ['counting', 'grouping'],
        goals: [
            { type: 'group-size', size: 5 }
        ]
    },

    // =============================================================
    // NUMBER STRUCTURES - Building number sense through arrangement
    // =============================================================
    {
        id: 'struct-001',
        mode: 'number-structures',
        title: 'Form a Five',
        hint: 'Arrange stones to reveal the shape of five',
        difficulty: 1,
        concepts: ['number-formation', 'subitizing'],
        goals: [
            { type: 'structure-formed', value: 5 }
        ]
    },
    {
        id: 'struct-002',
        mode: 'number-structures',
        title: 'A Perfect Ten',
        hint: 'Build a structure that holds the number ten',
        difficulty: 2,
        concepts: ['number-formation', 'ten-frame'],
        goals: [
            { type: 'structure-formed', value: 10 }
        ]
    },
    {
        id: 'struct-003',
        mode: 'number-structures',
        title: 'Three and Four Together',
        hint: 'Form a three and a four, then see what they become',
        difficulty: 2,
        concepts: ['addition', 'combining'],
        goals: [
            { type: 'structure-formed', value: 3 },
            { type: 'structure-formed', value: 4 }
        ]
    },
    {
        id: 'struct-004',
        mode: 'number-structures',
        title: 'Break Apart Eight',
        hint: 'Start with eight and split it into two parts that still add up',
        difficulty: 3,
        concepts: ['decomposition', 'part-whole'],
        goals: [
            { type: 'structure-count', minCount: 2 },
            { type: 'structures-sum-to', targetSum: 8 }
        ],
        initialConfig: {
            structures: [{ value: 8, offsetX: 0, offsetY: 0 }]
        }
    },
    {
        id: 'struct-005',
        mode: 'number-structures',
        title: 'Split the Eight',
        hint: 'Start with 8, make a 5 and a 3',
        difficulty: 3,
        concepts: ['decomposition', 'part-whole'],
        goals: [
            { type: 'structure-formed', value: 5 },
            { type: 'structure-formed', value: 3 }
        ],
        initialConfig: {
            structures: [{ value: 8, offsetX: 0, offsetY: 0 }]
        }
    },
    {
        id: 'struct-006',
        mode: 'number-structures',
        title: 'Perfect Halves',
        hint: 'Start with 10, split into two equal fives',
        difficulty: 3,
        concepts: ['decomposition', 'halving', 'equality'],
        goals: [
            { type: 'structure-formed', value: 5 },
            { type: 'structure-count', minCount: 2 }
        ],
        initialConfig: {
            structures: [{ value: 10, offsetX: 0, offsetY: 0 }]
        }
    },
    {
        id: 'struct-007',
        mode: 'number-structures',
        title: 'Three Ways',
        hint: 'Break 8 into three different structures',
        difficulty: 4,
        concepts: ['decomposition', 'multiple-representations'],
        goals: [
            { type: 'structure-count', minCount: 3 },
            { type: 'structures-sum-to', targetSum: 8 }
        ],
        initialConfig: {
            structures: [{ value: 8, offsetX: 0, offsetY: 0 }]
        }
    },

    // =============================================================
    // BALANCE SCALE - Equality and comparison through weight
    // =============================================================
    {
        id: 'balance-001',
        mode: 'balance-scale',
        title: 'Perfect Balance',
        hint: 'Place stones until both sides rest in harmony',
        difficulty: 1,
        concepts: ['equality', 'balance'],
        goals: [
            { type: 'scale-balanced', tolerance: 0.1 }
        ]
    },
    {
        id: 'balance-002',
        mode: 'balance-scale',
        title: 'Use Every Stone',
        hint: 'Place all stones on the scale and find balance',
        difficulty: 2,
        concepts: ['equality', 'distribution'],
        goals: [
            { type: 'scale-balanced', tolerance: 0.1 },
            { type: 'all-stones-used' }
        ]
    },
    {
        id: 'balance-003',
        mode: 'balance-scale',
        title: 'Three and Three',
        hint: 'Place exactly three stones on each side',
        difficulty: 2,
        concepts: ['counting', 'equality', 'constraint'],
        goals: [
            { type: 'stone-count-per-side', left: 3, right: 3 },
            { type: 'scale-balanced', tolerance: 0.1 }
        ]
    },
    {
        id: 'balance-004',
        mode: 'balance-scale',
        title: 'One Heavy, Many Light',
        hint: 'Balance one heavy stone against several lighter ones',
        difficulty: 3,
        concepts: ['inequality', 'mass', 'multiplication'],
        goals: [
            { type: 'stone-count-per-side', left: 1, right: 3 },
            { type: 'scale-balanced', tolerance: 0.2 }
        ]
    },

    // =============================================================
    // STACK BALANCE - Spatial reasoning and stability
    // =============================================================
    {
        id: 'stack-001',
        mode: 'stack-balance',
        title: 'Tower of Three',
        hint: 'Stack three stones and keep them standing',
        difficulty: 1,
        concepts: ['spatial', 'stability', 'counting'],
        goals: [
            { type: 'stack-height', minHeight: 3 }
        ]
    },
    {
        id: 'stack-002',
        mode: 'stack-balance',
        title: 'Rising Five',
        hint: 'Build a tower five stones tall without it toppling',
        difficulty: 2,
        concepts: ['spatial', 'stability', 'patience'],
        goals: [
            { type: 'stack-height', minHeight: 5 }
        ]
    },
    {
        id: 'stack-003',
        mode: 'stack-balance',
        title: 'The Great Seven',
        hint: 'Reach seven stones high - steady hands, steady mind',
        difficulty: 3,
        concepts: ['spatial', 'stability', 'perseverance'],
        goals: [
            { type: 'stack-height', minHeight: 7 }
        ]
    },
    {
        id: 'stack-004',
        mode: 'stack-balance',
        title: 'Strong Foundation',
        hint: 'Place the largest stones at the bottom, then build upward',
        difficulty: 2,
        concepts: ['spatial', 'ordering', 'size-comparison'],
        goals: [
            { type: 'stack-height', minHeight: 4 },
            { type: 'all-stones-used' }
        ]
    },
    {
        id: 'stack-005',
        mode: 'stack-balance',
        title: 'Perfectly Centered',
        hint: 'Stack 5 stones with the center of mass right above the platform center',
        difficulty: 3,
        concepts: ['spatial', 'center-of-mass', 'symmetry'],
        goals: [
            { type: 'stack-height', minHeight: 5 },
            { type: 'stack-centered', tolerance: 20 }
        ]
    },
    {
        id: 'stack-006',
        mode: 'stack-balance',
        title: 'Color Tower',
        hint: 'Stack stones so every stone touches a same-color neighbor',
        difficulty: 3,
        concepts: ['spatial', 'color-matching', 'planning'],
        goals: [
            { type: 'stack-height', minHeight: 4 },
            { type: 'stack-matching-neighbors' }
        ]
    },
    {
        id: 'stack-007',
        mode: 'stack-balance',
        title: 'Warm Tower',
        hint: 'Build a tower using only red, orange, and yellow stones',
        difficulty: 3,
        concepts: ['spatial', 'color-categories', 'selection'],
        goals: [
            { type: 'stack-height', minHeight: 3 },
            { type: 'stack-all-warm' }
        ]
    }
];
