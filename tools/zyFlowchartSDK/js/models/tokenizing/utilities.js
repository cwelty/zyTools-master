'use strict';

/* exported tokenTypes, arithmeticOperatorExpression, conditionalOperatorExpression */
/* global TokenType */

const arithmeticOperatorExpression = /^[+\-*/%]/;
const conditionalOperatorExpression = /^(>=|<=|>|<|==|!=|not|and|or)/;

const tokenTypes = [
    new TokenType('comment', /^\/\/.*$/),

    // The data types: float, integer, float array, and integer array.
    new TokenType('dataType', /^(float\s+array|integer\s+array|float|integer|nothing)(?!\w+)/),

    // Arithmetic operators: +, -, *, /
    new TokenType('arithmeticOperator', arithmeticOperatorExpression),

    // Conditional operators: >, <, >=, <=, ==, !=, &&, and ||.
    new TokenType('conditionalOperator', conditionalOperatorExpression),

    // Float and integer numbers.
    new TokenType('floatNumber', /^\d+\.\d+/),
    new TokenType('integerNumber', /^\d+/),

    // A string may contain an escaped string.
    new TokenType('string', /^"[^"\\]*(\\.[^"\\]*)*"/),

    // Assortment of miscellaneous tokens.
    new TokenType('questionMark', /^\?/),
    new TokenType('assignment', /^=/),
    new TokenType('openingParens', /^\(/),
    new TokenType('closingParens', /^\)/),
    new TokenType('openingBracket', /^\[/),
    new TokenType('closingBracket', /^\]/),
    new TokenType('comma', /^,/),
    new TokenType('period', /^\./),
    new TokenType('semicolon', /^\;/),
    new TokenType('spaces', /^\s+/),
    new TokenType('word', /^\w+/),
];
