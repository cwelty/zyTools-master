'use strict';

/* eslint-disable no-magic-numbers */

/* exported runExpressionParserTests */
/* global ExpressionParser, QUnit, TextualCodeParser, builtInFunctions, parserGeneratedVariableName */

/**
    Test the class name, variable name, variable value, and number of children.
    @method testVariableSymbol
    @param {Object} assert Dictionary of assert functions.
    @param {VariableSymbol} symbol The symbol to test.
    @param {String} name The expected name of the variable.
    @param {Number} [value=0] The expected value of the variable.
    @return {void}
*/
function testVariableSymbol(assert, symbol, name, value = 0) {
    assert.equal(symbol.getClassName(), 'VariableSymbol');
    assert.equal(symbol.variable.name, name);
    assert.equal(symbol.children.length, 0);

    if (!symbol.variable.isArray()) {
        assert.equal(symbol.variable.getValue(), value);
    }
}

/**
    Test the class name, operation, and number of children.
    @method testOperatorSymbol
    @param {Object} assert Dictionary of assert functions.
    @param {OperatorSymbol} symbol The symbol to test.
    @param {String} operation The expected operation.
    @param {Number} [children=2] The expected number of children.
    @param {String} [symbolName=''] The symbol name to use.
    @return {void}
*/
function testOperatorSymbol(assert, symbol, operation, children = 2, symbolName = '') {
    const symbolNameToUse = symbolName || (children === 2 ? 'BinaryOperatorSymbol' : 'UnaryOperatorSymbol');

    assert.equal(symbol.getClassName(), symbolNameToUse);
    assert.equal(symbol.operator, operation);
    assert.equal(symbol.children.length, children);
}

/**
    Test the class name, operation, and number of children.
    @method testFunctionCallSymbol
    @param {Object} assert Dictionary of assert functions.
    @param {OperatorSymbol} symbol The symbol to test.
    @param {String} name The expected name of the function.
    @param {Number} children The expected number of children.
    @param {Number} startIndexToHighlight The first index of the function in the line for highlighting purposes.
    @param {Number} endIndexToHighlight The last index of the function in the line for highlighting purposes.
    @return {void}
*/
function testFunctionCallSymbol(assert, symbol, name, children, startIndexToHighlight, endIndexToHighlight) { // eslint-disable-line max-params
    assert.equal(symbol.getClassName(), 'FunctionCallSymbol');
    assert.equal(symbol.function.name, name);
    assert.equal(symbol.children.length, children);
    assert.equal(symbol.startIndexToHighlight, startIndexToHighlight);
    assert.equal(symbol.endIndexToHighlight, endIndexToHighlight);
}

/**
    Run the expression parser tests.
    @method runExpressionParserTests
    @return {void}
*/
function runExpressionParserTests() {
    const parser = new ExpressionParser();

    QUnit.test('Expression parsing', assert => {

        const code = `Function Main() returns nothing
   integer v
   integer w
   integer x
   integer y
   integer z
   integer array(5) nums
   x = GetUserInput()
   PrintStars(x)

Function GetUserInput() returns integer numStars
   Put "Enter number of stars to print: " to output
   numStars = Get next input

Function PrintStars(integer numStars) returns nothing
   integer counter
   counter = 0
   while counter < numStars
      counter = counter + 1
      Put "*" to output
Function PrintThreeStars(integer numStars1, integer numStars2, integer numStars3) returns nothing
   PrintStars(numStars1)
   Put "\\n" to output
   PrintStars(numStars2)
   Put "\\n" to output
   PrintStars(numStars3)`;
        const program = (new TextualCodeParser()).parse(code);
        const mainFunction = program.functions[0];
        const arrayOfVariables = [ mainFunction.parameters, mainFunction.locals, mainFunction.return ];
        const functions = program.functions.concat(builtInFunctions);

        // Test a single symbol expression.
        {
            const expression = '4';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const fourVariable = tree.root;

            testVariableSymbol(assert, fourVariable, parserGeneratedVariableName, 4);
        }

        // Test arithmetic operation with two numbers.
        {
            const expression = `4
 +
 5  `;
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const addOperation = tree.root;
            const fourVariable = addOperation.children[0];
            const fiveVariable = addOperation.children[1];

            testOperatorSymbol(assert, addOperation, '+');
            testVariableSymbol(assert, fourVariable, parserGeneratedVariableName, 4);
            testVariableSymbol(assert, fiveVariable, parserGeneratedVariableName, 5);
        }

        // Test arithmetic operation with two variables.
        {
            const expression = 'x + y';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const addOperation = tree.root;
            const xVariable = addOperation.children[0];
            const yVariable = addOperation.children[1];

            testOperatorSymbol(assert, addOperation, '+');
            testVariableSymbol(assert, xVariable, 'x');
            testVariableSymbol(assert, yVariable, 'y');
        }

        // Test precedence.
        {
            const expression = 'v * w + x * y';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const addOperation = tree.root;
            const multiplyOperation1 = addOperation.children[0];
            const multiplyOperation2 = addOperation.children[1];
            const vVariable = multiplyOperation1.children[0];
            const wVariable = multiplyOperation1.children[1];
            const xVariable = multiplyOperation2.children[0];
            const yVariable = multiplyOperation2.children[1];

            testOperatorSymbol(assert, addOperation, '+');
            testOperatorSymbol(assert, multiplyOperation1, '*');
            testOperatorSymbol(assert, multiplyOperation2, '*');
            testVariableSymbol(assert, vVariable, 'v');
            testVariableSymbol(assert, wVariable, 'w');
            testVariableSymbol(assert, xVariable, 'x');
            testVariableSymbol(assert, yVariable, 'y');
        }

        // Test expression with parens.
        {
            const expression = '(x + y) * z';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const multiplyOperation = tree.root;
            const addOperation = multiplyOperation.children[0];
            const zVariable = multiplyOperation.children[1];
            const xVariable = addOperation.children[0];
            const yVariable = addOperation.children[1];

            testOperatorSymbol(assert, multiplyOperation, '*');
            testOperatorSymbol(assert, addOperation, '+');
            testVariableSymbol(assert, xVariable, 'x');
            testVariableSymbol(assert, yVariable, 'y');
            testVariableSymbol(assert, zVariable, 'z');
        }

        // Test not operator.
        {
            const expression = 'not(x > y)';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const notOperation = tree.root;
            const greaterThanOperation = notOperation.children[0];
            const xVariable = greaterThanOperation.children[0];
            const yVariable = greaterThanOperation.children[1];

            testOperatorSymbol(assert, notOperation, 'not', 1);
            testOperatorSymbol(assert, greaterThanOperation, '>');
            testVariableSymbol(assert, xVariable, 'x');
            testVariableSymbol(assert, yVariable, 'y');
        }

        // Test complex conditional expression.
        {
            const expression = '(x > (y + 1)) or not(z < 3)';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const orOperation = tree.root;
            const greaterThanOperation = orOperation.children[0];
            const notOperation = orOperation.children[1];
            const xVariable = greaterThanOperation.children[0];
            const addOperation = greaterThanOperation.children[1];
            const yVariable = addOperation.children[0];
            const oneVariable = addOperation.children[1];
            const lessThanOperation = notOperation.children[0];
            const zVariable = lessThanOperation.children[0];
            const threeVariable = lessThanOperation.children[1];

            testOperatorSymbol(assert, orOperation, 'or');
            testOperatorSymbol(assert, greaterThanOperation, '>');
            testOperatorSymbol(assert, notOperation, 'not', 1);
            testOperatorSymbol(assert, addOperation, '+');
            testOperatorSymbol(assert, lessThanOperation, '<');
            testVariableSymbol(assert, xVariable, 'x');
            testVariableSymbol(assert, yVariable, 'y');
            testVariableSymbol(assert, zVariable, 'z');
            testVariableSymbol(assert, oneVariable, parserGeneratedVariableName, 1);
            testVariableSymbol(assert, threeVariable, parserGeneratedVariableName, 3);
        }

        // Test function call without parameters.
        {
            const expression = 'GetUserInput()';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const functionCall = tree.root;

            testFunctionCallSymbol(assert, functionCall, 'GetUserInput', 0, 0, 13);
        }

        // Test function call with one parameter.
        {
            const expression = 'PrintStars(x)';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const functionCall = tree.root;
            const xVariable = functionCall.children[0];

            testFunctionCallSymbol(assert, functionCall, 'PrintStars', 1, 0, 12);
            testVariableSymbol(assert, xVariable, 'x');
        }

        // Test expression that includes multiple function calls.
        {
            const expression = 'PrintStars(GetUserInput() + GetUserInput())';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const printCall = tree.root;
            const addOperation = printCall.children[0];
            const getCall1 = addOperation.children[0];
            const getCall2 = addOperation.children[1];

            testFunctionCallSymbol(assert, printCall, 'PrintStars', 1, 0, 42);
            testOperatorSymbol(assert, addOperation, '+');
            testFunctionCallSymbol(assert, getCall1, 'GetUserInput', 0, 11, 24);
            testFunctionCallSymbol(assert, getCall2, 'GetUserInput', 0, 28, 41);
        }

        // Test function call with multiple parameters, including a complex parameter and function call parameter.
        {
            const expression = 'PrintThreeStars(GetUserInput() + 3, (x - 4) * GetUserInput(), y)';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const printCall = tree.root;
            const addOperation = printCall.children[0];
            const getCall1 = addOperation.children[0];
            const threeVariable = addOperation.children[1];
            const multiplyOperation = printCall.children[1];
            const subtractOperation = multiplyOperation.children[0];
            const xVariable = subtractOperation.children[0];
            const fourVariable = subtractOperation.children[1];
            const getCall2 = multiplyOperation.children[1];
            const yVariable = printCall.children[2];

            testFunctionCallSymbol(assert, printCall, 'PrintThreeStars', 3, 0, 63);
            testOperatorSymbol(assert, addOperation, '+');
            testFunctionCallSymbol(assert, getCall1, 'GetUserInput', 0, 16, 29);
            testVariableSymbol(assert, threeVariable, parserGeneratedVariableName, 3);
            testOperatorSymbol(assert, multiplyOperation, '*');
            testOperatorSymbol(assert, subtractOperation, '-');
            testVariableSymbol(assert, xVariable, 'x');
            testVariableSymbol(assert, fourVariable, parserGeneratedVariableName, 4);
            testFunctionCallSymbol(assert, getCall2, 'GetUserInput', 0, 46, 59);
            testVariableSymbol(assert, yVariable, 'y');
        }

        // Test expression using subscript operator.
        {
            const expression = 'nums[4 + 5]';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const subscriptOperation = tree.root;
            const numsVariable = subscriptOperation.children[0];
            const addOperation = subscriptOperation.children[1];
            const fourVariable = addOperation.children[0];
            const fiveVariable = addOperation.children[1];

            testOperatorSymbol(assert, subscriptOperation, '[]', 2, 'SubscriptOperatorSymbol');
            testVariableSymbol(assert, numsVariable, 'nums');
            testOperatorSymbol(assert, addOperation, '+');
            testVariableSymbol(assert, fourVariable, parserGeneratedVariableName, 4);
            testVariableSymbol(assert, fiveVariable, parserGeneratedVariableName, 5);
        }

        // Test expression using member access operator.
        {
            const expression = 'nums[nums.size - 1]';
            const tree = parser.parse(expression, arrayOfVariables, functions).tree;
            const subscriptOperation = tree.root;
            const numsVariable = subscriptOperation.children[0];
            const subtractOperation = subscriptOperation.children[1];
            const numsSizeCell = subtractOperation.children[0];
            const oneVariable = subtractOperation.children[1];

            testOperatorSymbol(assert, subscriptOperation, '[]', 2, 'SubscriptOperatorSymbol');
            testVariableSymbol(assert, numsVariable, 'nums');
            testOperatorSymbol(assert, subtractOperation, '-');
            testVariableSymbol(assert, oneVariable, parserGeneratedVariableName, 1);

            // Test memory cell.
            assert.equal(numsSizeCell.getClassName(), 'MemoryCellSymbol');
            assert.equal(numsSizeCell.children.length, 0);
            assert.equal(numsSizeCell.memoryCell.name, 'nums.size');
        }

        // Test malformed expression generates correct error.
        {
            const expressionAndExpectedErrors = [
                { expression: '1 ++', error: 'Error parsing expression starting at +' },
                { expression: '1 2', error: 'Error parsing expression starting at 2' },
                { expression: '1 2 +', error: 'Error parsing expression starting at 2' },
                { expression: '+ 1 2', error: 'Error parsing expression starting at 2' },
                { expression: '1 + 2 -', error: 'Error parsing expression starting at -' },
                { expression: '2(1 + 2)', error: 'Error parsing expression starting at (' },
                { expression: 'v w', error: 'Error parsing expression starting at w' },
                { expression: 'nums[x] nums', error: 'Error parsing expression starting at nums' },
                { expression: '(1 + 2) (2 + 3)', error: 'Error parsing expression starting at (' },
                { expression: '(2 + 3) nums [1]', error: 'Error parsing expression starting at nums' },
                { expression: '1 PrintStars(2)', error: 'Error parsing expression starting at PrintStars' },
                { expression: '', error: 'Expected expression' },
            ];

            expressionAndExpectedErrors.forEach(item => {
                let generatedError = '';

                try {
                    parser.parse(item.expression, arrayOfVariables, functions);
                }
                catch (error) {
                    generatedError = error.error;
                }

                assert.equal(generatedError, item.error);
            });
        }
    });
}
