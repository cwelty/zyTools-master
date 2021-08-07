'use strict';

/* eslint-disable no-magic-numbers */

/* exported runTokenizerTests */
/* global Tokenizer, QUnit */

/**
    Test the given actual tokens compare to the expected.
    @method testTokens
    @param {Array} expected Array of {Object}. The expected token values.
    @param {Array} actual Array of {Token}. The actual lines.
    @param {Object} assert Reference to QUnit test functions.
    @return {void}
*/
function testTokens(expected, actual, assert) {
    expected.forEach((expectedToken, index) => {
        const token = actual[index];

        assert.equal(token.name, expectedToken.name);
        assert.equal(token.value, expectedToken.value);
        assert.equal(token.startIndexInTheLine, expectedToken.startIndexInTheLine);
    });
}

/**
    Run the tokenizer tests.
    @method runTokenizerTests
    @return {void}
*/
function runTokenizerTests() {
    const tokenizer = new Tokenizer();

    QUnit.test('Tokenizer tokenizing', assert => {

        // Test integer declaration.
        {
            const code = 'integer x';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 3);

            const expectedTokens = [
                { name: 'dataType', value: 'integer', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'word', value: 'x', startIndexInTheLine: 8 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }

        // Test float declaration.
        {
            const code = 'float y';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 3);

            const expectedTokens = [
                { name: 'dataType', value: 'float', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'word', value: 'y', startIndexInTheLine: 6 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }

        {
            const code = `integer array(4) x
float  array  (  5   ) y
integer array(?) z`;
            const lines = tokenizer.tokenize(code);
            const expectedTokenCounts = [ 6, 9, 6 ];

            assert.equal(lines.length, 3);
            lines.forEach((line, index) => assert.equal(line.tokens.length, expectedTokenCounts[index]));

            // Test integer array declaration.
            const expectedTokens1 = [
                { name: 'dataType', value: 'integer array', startIndexInTheLine: 0 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 13 },
                { name: 'integerNumber', value: '4', startIndexInTheLine: 14 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 15 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 16 },
                { name: 'word', value: 'x', startIndexInTheLine: 17 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            // Test float array declaration.
            const expectedTokens2 = [
                { name: 'dataType', value: 'float  array', startIndexInTheLine: 0 },
                { name: 'spaces', value: '  ', startIndexInTheLine: 12 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 14 },
                { name: 'spaces', value: '  ', startIndexInTheLine: 15 },
                { name: 'integerNumber', value: '5', startIndexInTheLine: 17 },
                { name: 'spaces', value: '   ', startIndexInTheLine: 18 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 21 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 22 },
                { name: 'word', value: 'y', startIndexInTheLine: 23 },
            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);

            // Test unknown size array declaration.
            const expectedTokens3 = [
                { name: 'dataType', value: 'integer array', startIndexInTheLine: 0 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 13 },
                { name: 'questionMark', value: '?', startIndexInTheLine: 14 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 15 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 16 },
                { name: 'word', value: 'z', startIndexInTheLine: 17 },
            ];

            testTokens(expectedTokens3, lines[2].tokens, assert);
        }

        {
            const code = `a   =    4
b = -100
c = 5.574
d = -1002.41`;
            const lines = tokenizer.tokenize(code);
            const expectedTokenCounts = [ 5, 6, 5, 6 ];

            lines.forEach((line, index) => assert.equal(line.tokens.length, expectedTokenCounts[index]));

            // Test variable assignment with integer number.
            const expectedTokens1 = [
                { name: 'word', value: 'a', startIndexInTheLine: 0 },
                { name: 'spaces', value: '   ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 4 },
                { name: 'spaces', value: '    ', startIndexInTheLine: 5 },
                { name: 'integerNumber', value: '4', startIndexInTheLine: 9 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            const expectedTokens2 = [
                { name: 'word', value: 'b', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'arithmeticOperator', value: '-', startIndexInTheLine: 4 },
                { name: 'integerNumber', value: '100', startIndexInTheLine: 5 },
            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);

            // Test variable assignment with float number.
            const expectedTokens3 = [
                { name: 'word', value: 'c', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'floatNumber', value: '5.574', startIndexInTheLine: 4 },
            ];

            testTokens(expectedTokens3, lines[2].tokens, assert);

            const expectedTokens4 = [
                { name: 'word', value: 'd', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'arithmeticOperator', value: '-', startIndexInTheLine: 4 },
                { name: 'floatNumber', value: '1002.41', startIndexInTheLine: 5 },
            ];

            testTokens(expectedTokens4, lines[3].tokens, assert);
        }

        // Test arithmetic operations, variables, and numbers.
        {
            const code = `x = x + y
x = 4 * 3
x = y / 4
x = y--5.2
x = (y / 2) % z`;
            const lines = tokenizer.tokenize(code);
            const expectedTokenCounts = [ 9, 9, 9, 8, 15 ];

            assert.equal(lines.length, 5);
            lines.forEach((line, index) => assert.equal(line.tokens.length, expectedTokenCounts[index]));

            // x = x + y
            const expectedTokens1 = [
                { name: 'word', value: 'x', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'word', value: 'x', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'arithmeticOperator', value: '+', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'word', value: 'y', startIndexInTheLine: 8 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            // x = 4 * 3
            const expectedTokens2 = [
                { name: 'word', value: 'x', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'integerNumber', value: '4', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'arithmeticOperator', value: '*', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'integerNumber', value: '3', startIndexInTheLine: 8 },
            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);

            // x = y / 4
            const expectedTokens3 = [
                { name: 'word', value: 'x', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'word', value: 'y', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'arithmeticOperator', value: '/', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'integerNumber', value: '4', startIndexInTheLine: 8 },
            ];

            testTokens(expectedTokens3, lines[2].tokens, assert);

            // x = y--5.2
            const expectedTokens4 = [
                { name: 'word', value: 'x', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'word', value: 'y', startIndexInTheLine: 4 },
                { name: 'arithmeticOperator', value: '-', startIndexInTheLine: 5 },
                { name: 'arithmeticOperator', value: '-', startIndexInTheLine: 6 },
                { name: 'floatNumber', value: '5.2', startIndexInTheLine: 7 },
            ];

            testTokens(expectedTokens4, lines[3].tokens, assert);

            // x = (y / 2) % z
            const expectedTokens5 = [
                { name: 'word', value: 'x', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 4 },
                { name: 'word', value: 'y', startIndexInTheLine: 5 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 6 },
                { name: 'arithmeticOperator', value: '/', startIndexInTheLine: 7 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 8 },
                { name: 'integerNumber', value: '2', startIndexInTheLine: 9 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 10 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 11 },
                { name: 'arithmeticOperator', value: '%', startIndexInTheLine: 12 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 13 },
                { name: 'word', value: 'z', startIndexInTheLine: 14 },
            ];

            testTokens(expectedTokens5, lines[4].tokens, assert);
        }

        {
            const code = `x = Get next input
Put x to output
Put "Sum is: " to output
Put "Test\\n\\"this\\"" to output`;
            const lines = tokenizer.tokenize(code);
            const expectedTokenCounts = [ 9, 7, 7, 7 ];

            assert.equal(lines.length, 4);
            lines.forEach((line, index) => assert.equal(line.tokens.length, expectedTokenCounts[index]));

            // Test variable assignment from input.
            const expectedTokens1 = [
                { name: 'word', value: 'x', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 1 },
                { name: 'assignment', value: '=', startIndexInTheLine: 2 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'word', value: 'Get', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'word', value: 'next', startIndexInTheLine: 8 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 12 },
                { name: 'word', value: 'input', startIndexInTheLine: 13 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            // Test variable output.
            const expectedTokens2 = [
                { name: 'word', value: 'Put', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'word', value: 'x', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'word', value: 'to', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 8 },
                { name: 'word', value: 'output', startIndexInTheLine: 9 },
            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);

            // Test variable output with a string.
            const expectedTokens3 = [
                { name: 'word', value: 'Put', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'string', value: '"Sum is: "', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 14 },
                { name: 'word', value: 'to', startIndexInTheLine: 15 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 17 },
                { name: 'word', value: 'output', startIndexInTheLine: 18 },
            ];

            testTokens(expectedTokens3, lines[2].tokens, assert);

            // Test variable output with a string containing a newline and escaped double-quote.
            const expectedTokens4 = [
                { name: 'word', value: 'Put', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'string', value: '"Test\\n\\"this\\""', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 20 },
                { name: 'word', value: 'to', startIndexInTheLine: 21 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 23 },
                { name: 'word', value: 'output', startIndexInTheLine: 24 },
            ];

            testTokens(expectedTokens4, lines[3].tokens, assert);
        }

        {
            const code = `if x > 5
    y = 3
else
    Put x to output`;
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 4);
            assert.equal(lines[0].tokens.length, 7);
            assert.equal(lines[1].tokens.length, 6);
            assert.equal(lines[2].tokens.length, 1);
            assert.equal(lines[3].tokens.length, 8);

            // Test if statement.
            const expectedTokens1 = [
                { name: 'word', value: 'if', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 2 },
                { name: 'word', value: 'x', startIndexInTheLine: 3 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 4 },
                { name: 'conditionalOperator', value: '>', startIndexInTheLine: 5 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 6 },
                { name: 'integerNumber', value: '5', startIndexInTheLine: 7 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            // Test indented assignment.
            const expectedTokens2 = [
                { name: 'indent', value: '    ', startIndexInTheLine: 0 },
                { name: 'word', value: 'y', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'assignment', value: '=', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'integerNumber', value: '3', startIndexInTheLine: 8 },
            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);

            // Test else statement.
            const expectedTokens3 = [
                { name: 'word', value: 'else', startIndexInTheLine: 0 },
            ];

            testTokens(expectedTokens3, lines[2].tokens, assert);

            // Test indented output.
            const expectedTokens4 = [
                { name: 'indent', value: '    ', startIndexInTheLine: 0 },
                { name: 'word', value: 'Put', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'word', value: 'x', startIndexInTheLine: 8 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 9 },
                { name: 'word', value: 'to', startIndexInTheLine: 10 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 12 },
                { name: 'word', value: 'output', startIndexInTheLine: 13 },
            ];

            testTokens(expectedTokens4, lines[3].tokens, assert);
        }

        // Test while statement.
        {
            const code = `while z < 5
    z = z+1`;
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 2);
            assert.equal(lines[0].tokens.length, 7);
            assert.equal(lines[1].tokens.length, 8);

            const expectedTokens1 = [
                { name: 'word', value: 'while', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'word', value: 'z', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'conditionalOperator', value: '<', startIndexInTheLine: 8 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 9 },
                { name: 'integerNumber', value: '5', startIndexInTheLine: 10 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            const expectedTokens2 = [
                { name: 'indent', value: '    ', startIndexInTheLine: 0 },
                { name: 'word', value: 'z', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'assignment', value: '=', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'word', value: 'z', startIndexInTheLine: 8 },
                { name: 'arithmeticOperator', value: '+', startIndexInTheLine: 9 },
                { name: 'integerNumber', value: '1', startIndexInTheLine: 10 },
            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);
        }

        // Test conditional operators: >, <, >=, <=, ==, !=, not, and, or
        {
            const code = 'if not(x > 4) and y < z or z >= y and x <= y or y == z or z != a';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 50);

            const expectedTokens1 = [

                // if not(x > 4)
                { name: 'word', value: 'if', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 2 },
                { name: 'conditionalOperator', value: 'not', startIndexInTheLine: 3 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 6 },
                { name: 'word', value: 'x', startIndexInTheLine: 7 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 8 },
                { name: 'conditionalOperator', value: '>', startIndexInTheLine: 9 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 10 },
                { name: 'integerNumber', value: '4', startIndexInTheLine: 11 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 12 },

                // and y < z
                { name: 'spaces', value: ' ', startIndexInTheLine: 13 },
                { name: 'conditionalOperator', value: 'and', startIndexInTheLine: 14 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 17 },
                { name: 'word', value: 'y', startIndexInTheLine: 18 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 19 },
                { name: 'conditionalOperator', value: '<', startIndexInTheLine: 20 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 21 },
                { name: 'word', value: 'z', startIndexInTheLine: 22 },

                // or z >= y
                { name: 'spaces', value: ' ', startIndexInTheLine: 23 },
                { name: 'conditionalOperator', value: 'or', startIndexInTheLine: 24 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 26 },
                { name: 'word', value: 'z', startIndexInTheLine: 27 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 28 },
                { name: 'conditionalOperator', value: '>=', startIndexInTheLine: 29 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 31 },
                { name: 'word', value: 'y', startIndexInTheLine: 32 },

                // and x <= y
                { name: 'spaces', value: ' ', startIndexInTheLine: 33 },
                { name: 'conditionalOperator', value: 'and', startIndexInTheLine: 34 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 37 },
                { name: 'word', value: 'x', startIndexInTheLine: 38 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 39 },
                { name: 'conditionalOperator', value: '<=', startIndexInTheLine: 40 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 42 },
                { name: 'word', value: 'y', startIndexInTheLine: 43 },

                // or y == z
                { name: 'spaces', value: ' ', startIndexInTheLine: 44 },
                { name: 'conditionalOperator', value: 'or', startIndexInTheLine: 45 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 47 },
                { name: 'word', value: 'y', startIndexInTheLine: 48 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 49 },
                { name: 'conditionalOperator', value: '==', startIndexInTheLine: 50 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 52 },
                { name: 'word', value: 'z', startIndexInTheLine: 53 },

                // or z != a
                { name: 'spaces', value: ' ', startIndexInTheLine: 54 },
                { name: 'conditionalOperator', value: 'or', startIndexInTheLine: 55 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 57 },
                { name: 'word', value: 'z', startIndexInTheLine: 58 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 59 },
                { name: 'conditionalOperator', value: '!=', startIndexInTheLine: 60 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 62 },
                { name: 'word', value: 'a', startIndexInTheLine: 63 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);
        }

        // Test comments.
        {
            const code = `// A comment
    //////////////`;
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 2);
            assert.equal(lines[0].tokens.length, 1);
            assert.equal(lines[1].tokens.length, 2);

            const expectedTokens1 = [
                { name: 'comment', value: '// A comment', startIndexInTheLine: 0 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            const expectedTokens2 = [
                { name: 'indent', value: '    ', startIndexInTheLine: 0 },
                { name: 'comment', value: '//////////////', startIndexInTheLine: 4 },

            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);
        }

        // Test function declarations.
        {
            const code = `Function Main() returns nothing
Function ScaleAndConvert(integer scaler, float array(3) oldList) returns integer array(4) newList`;
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 2);
            assert.equal(lines[0].tokens.length, 9);
            assert.equal(lines[1].tokens.length, 25);

            const expectedTokens1 = [
                { name: 'word', value: 'Function',
                startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ',
                startIndexInTheLine: 8 },
                { name: 'word', value: 'Main',
                startIndexInTheLine: 9 },
                { name: 'openingParens', value: '(',
                startIndexInTheLine: 13 },
                { name: 'closingParens', value: ')',
                startIndexInTheLine: 14 },
                { name: 'spaces', value: ' ',
                startIndexInTheLine: 15 },
                { name: 'word', value: 'returns',
                startIndexInTheLine: 16 },
                { name: 'spaces', value: ' ',
                startIndexInTheLine: 23 },
                { name: 'dataType', value: 'nothing',
                startIndexInTheLine: 24 },
            ];

            testTokens(expectedTokens1, lines[0].tokens, assert);

            const expectedTokens2 = [
                { name: 'word', value: 'Function', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 8 },
                { name: 'word', value: 'ScaleAndConvert', startIndexInTheLine: 9 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 24 },
                { name: 'dataType', value: 'integer', startIndexInTheLine: 25 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 32 },
                { name: 'word', value: 'scaler', startIndexInTheLine: 33 },
                { name: 'comma', value: ',', startIndexInTheLine: 39 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 40 },
                { name: 'dataType', value: 'float array', startIndexInTheLine: 41 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 52 },
                { name: 'integerNumber', value: '3', startIndexInTheLine: 53 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 54 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 55 },
                { name: 'word', value: 'oldList', startIndexInTheLine: 56 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 63 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 64 },
                { name: 'word', value: 'returns', startIndexInTheLine: 65 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 72 },
                { name: 'dataType', value: 'integer array', startIndexInTheLine: 73 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 86 },
                { name: 'integerNumber', value: '4', startIndexInTheLine: 87 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 88 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 89 },
                { name: 'word', value: 'newList', startIndexInTheLine: 90 },
            ];

            testTokens(expectedTokens2, lines[1].tokens, assert);
        }

        // Test function call.
        {
            const code = 'result = SquareRoot(4)';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 8);

            const expectedTokens = [
                { name: 'word', value: 'result', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 6 },
                { name: 'assignment', value: '=', startIndexInTheLine: 7 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 8 },
                { name: 'word', value: 'SquareRoot', startIndexInTheLine: 9 },
                { name: 'openingParens', value: '(', startIndexInTheLine: 19 },
                { name: 'integerNumber', value: '4', startIndexInTheLine: 20 },
                { name: 'closingParens', value: ')', startIndexInTheLine: 21 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }

        // Test array access and assignment.
        {
            const code = 'newList[index + 1] = oldList[index]';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 15);

            const expectedTokens = [
                { name: 'word', value: 'newList', startIndexInTheLine: 0 },
                { name: 'openingBracket', value: '[', startIndexInTheLine: 7 },
                { name: 'word', value: 'index', startIndexInTheLine: 8 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 13 },
                { name: 'arithmeticOperator', value: '+', startIndexInTheLine: 14 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 15 },
                { name: 'integerNumber', value: '1', startIndexInTheLine: 16 },
                { name: 'closingBracket', value: ']', startIndexInTheLine: 17 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 18 },
                { name: 'assignment', value: '=', startIndexInTheLine: 19 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 20 },
                { name: 'word', value: 'oldList', startIndexInTheLine: 21 },
                { name: 'openingBracket', value: '[', startIndexInTheLine: 28 },
                { name: 'word', value: 'index', startIndexInTheLine: 29 },
                { name: 'closingBracket', value: ']', startIndexInTheLine: 34 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }

        // Test array size access.
        {
            const code = 'newArray.size = oldArray.size';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 9);

            const expectedTokens = [
                { name: 'word', value: 'newArray', startIndexInTheLine: 0 },
                { name: 'period', value: '.', startIndexInTheLine: 8 },
                { name: 'word', value: 'size', startIndexInTheLine: 9 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 13 },
                { name: 'assignment', value: '=', startIndexInTheLine: 14 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 15 },
                { name: 'word', value: 'oldArray', startIndexInTheLine: 16 },
                { name: 'period', value: '.', startIndexInTheLine: 24 },
                { name: 'word', value: 'size', startIndexInTheLine: 25 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }

        // Test for-loop notation.
        {
            const code = 'for i = 0; i < 3; i = i + 1';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 25);

            const expectedTokens = [
                { name: 'word', value: 'for', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'word', value: 'i', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 5 },
                { name: 'assignment', value: '=', startIndexInTheLine: 6 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'integerNumber', value: '0', startIndexInTheLine: 8 },
                { name: 'semicolon', value: ';', startIndexInTheLine: 9 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 10 },
                { name: 'word', value: 'i', startIndexInTheLine: 11 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 12 },
                { name: 'conditionalOperator', value: '<', startIndexInTheLine: 13 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 14 },
                { name: 'integerNumber', value: '3', startIndexInTheLine: 15 },
                { name: 'semicolon', value: ';', startIndexInTheLine: 16 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 17 },
                { name: 'word', value: 'i', startIndexInTheLine: 18 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 19 },
                { name: 'assignment', value: '=', startIndexInTheLine: 20 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 21 },
                { name: 'word', value: 'i', startIndexInTheLine: 22 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 23 },
                { name: 'arithmeticOperator', value: '+', startIndexInTheLine: 24 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 25 },
                { name: 'integerNumber', value: '1', startIndexInTheLine: 26 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }

        // Test for-loop with multiple strings.
        {
            const code = 'for Put "Test" to output; Put "Test" to output; Put "Test" to output';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 27);

            const expectedTokens = [
                { name: 'word', value: 'for', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 3 },
                { name: 'word', value: 'Put', startIndexInTheLine: 4 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 7 },
                { name: 'string', value: '"Test"', startIndexInTheLine: 8 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 14 },
                { name: 'word', value: 'to', startIndexInTheLine: 15 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 17 },
                { name: 'word', value: 'output', startIndexInTheLine: 18 },
                { name: 'semicolon', value: ';', startIndexInTheLine: 24 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 25 },
                { name: 'word', value: 'Put', startIndexInTheLine: 26 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 29 },
                { name: 'string', value: '"Test"', startIndexInTheLine: 30 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 36 },
                { name: 'word', value: 'to', startIndexInTheLine: 37 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 39 },
                { name: 'word', value: 'output', startIndexInTheLine: 40 },
                { name: 'semicolon', value: ';', startIndexInTheLine: 46 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 47 },
                { name: 'word', value: 'Put', startIndexInTheLine: 48 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 51 },
                { name: 'string', value: '"Test"', startIndexInTheLine: 52 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 58 },
                { name: 'word', value: 'to', startIndexInTheLine: 59 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 61 },
                { name: 'word', value: 'output', startIndexInTheLine: 62 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }

        // Test elseif.
        {
            const code = 'elseif x > 5';
            const lines = tokenizer.tokenize(code);

            assert.equal(lines.length, 1);
            assert.equal(lines[0].tokens.length, 7);

            const expectedTokens = [
                { name: 'word', value: 'elseif', startIndexInTheLine: 0 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 6 },
                { name: 'word', value: 'x', startIndexInTheLine: 7 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 8 },
                { name: 'conditionalOperator', value: '>', startIndexInTheLine: 9 },
                { name: 'spaces', value: ' ', startIndexInTheLine: 10 },
                { name: 'integerNumber', value: '5', startIndexInTheLine: 11 },
            ];

            testTokens(expectedTokens, lines[0].tokens, assert);
        }
    });
}
