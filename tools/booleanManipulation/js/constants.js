// Define direction enums used to specify which direction a property is being applied
var PROPERTY_DIRECTIONS = {
    FORWARD: 0,
    REVERSE: 1,
    UNDEFINED: 2
};

// Define error type enums used when attempting to manipulate the equation to specify what kind of error occured
var ERROR_TYPE = {
    NO_ERROR: 0,
    WRONG_ORDER: 1,
    WRONG_INPUT: 2
};

// Define difficulty enums used to choose what kind of problems to generate
var DIFFICULTIES = {
    BASIC: 0,
    INTERMEDIATE: 1,
    ADVANCED: 2
};

// Define symbols in discrete math
var DISCRETE_SYMBOLS = {
    OR: '∨',
    AND: '∧',
    NOT: '¬',
    TRUE: 'T',
    FALSE: 'F',
    IMPLIES: '→'
};
DISCRETE_SYMBOLS.VARIABLES = [ 'p', 'q', 'r', DISCRETE_SYMBOLS.TRUE, DISCRETE_SYMBOLS.FALSE ];

// Define symbols in digital design
var SYMBOLS = {
    OR: '+',
    AND: '·',
    NOT: '\'',
    TRUE: '1',
    FALSE: '0',
    LEFT_PAREN: '(',
    RIGHT_PAREN: ')'
};
SYMBOLS.LITERAL = SYMBOLS.FALSE + SYMBOLS.NOT + '*' + '|' + SYMBOLS.TRUE + SYMBOLS.NOT + '*' + '|[a-zA-Z]' + SYMBOLS.NOT + '*';
VARIABLES = [ 'x', 'y', 'z', SYMBOLS.TRUE, SYMBOLS.FALSE ];
SYMBOLS.VARIABLES = VARIABLES;

// Define enums for the different types of tokens
var TERMINALS = {
    LITERAL: 0,
    OR: 1,
    AND: 2,
    LEFT_PAREN: 3,
    RIGHT_PAREN: 4,
    IMPLIES: 5,
    EPSILON: 6,
    UNKNOWN: 7
};

// Define regex for the different types of tokens
var TERMINAL_REGEX = [
    SYMBOLS.LITERAL,
    '\\' + SYMBOLS.OR,
    SYMBOLS.AND,
    '\\' + SYMBOLS.LEFT_PAREN,
    '\\' + SYMBOLS.RIGHT_PAREN,
    DISCRETE_SYMBOLS.IMPLIES,
    ''
];
