'use strict';

/* exported MIPSTokenTypes, ARMTokenTypes */
/* global TokenType */

const labelTokenType = new TokenType('label', /^\w+:/);
const spaceTokenType = new TokenType('space', /^\s+/);
const commaTokenType = new TokenType('comma', /^,/);

/*
    List of {TokenTypes} for tokenizing MIPS code.

    Regular expressions and {TokenType} ordering based on:
    https://github.com/morriswmz/SimpleMIPS.js/blob/master/src/simpleMIPS.js#L1964
*/
const MIPSTokenTypes = [
    new TokenType('comment', /^#.*$/),
    labelTokenType,
    spaceTokenType,
    commaTokenType,
    new TokenType('register', /^\$(zero|\w{1,2})/),
    new TokenType('numberThenRegister', /^-?\d+\(\$(\w{1,2}|zero)\)/),
    new TokenType('number', /^(0x[\da-f]+|-*\d+|'([^'\\]|\\*)')/),
    new TokenType('word', /^\w+/),
];

const ARMTokenTypes = [
    new TokenType('comment', /^\/\/.*$/),
    labelTokenType,
    spaceTokenType,
    commaTokenType,
    new TokenType('register', /^X(\d{1,2}|ZR)/),
    new TokenType('openBracket', /^\[/),
    new TokenType('closeBracket', /^\]/),
    new TokenType('#', /^#/),
    new TokenType('number', /^-?\d+/),
    new TokenType('word', /^(\w|\.)+/),
];
