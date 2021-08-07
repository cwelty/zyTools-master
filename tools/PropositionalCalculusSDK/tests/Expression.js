'use strict';

/* global Operator, DigitalExpression, PropositionExpression, Variable, Constant, OPERATOR_SYMBOLS, CONSTANT_SYMBOLS */

/* exported expressionTest */

/**
    Verify the given expression has the expected properties.
    @method verifyExpressionProperties
    @param {Object} assert QUnit object with functions for testing.
    @param {Expression} expression The expression to test.s
    @return {void}
*/
function verifyExpressionProperties(assert, expression) {
    var expectedProperties = [ 'clone', 'print', 'parentOf', 'parentOfHelper', 'addOpeningEnclosure',
    'addClosingEnclosure', 'printConstantSymbol', 'printNotOperator', 'printAndOperator',
    'printOrOperator', 'printConditionalOperator', 'shouldPrintParens', 'operatorNameToFunction', 'toParts' ];

    expectedProperties.forEach(function(property) {
        assert.equal(typeof expression[property], 'function');
    });
}

/**
    Test the Expression object and objects that inherit Expression.
    @method expressionTest
    @return {void}
*/
function expressionTest() {
    var expressionClasses = {
        DigitalExpression: DigitalExpression,
        PropositionExpression: PropositionExpression,
    };

    var discreteMathUtilities = require('discreteMathUtilities');

    Object.keys(expressionClasses).forEach(function(expressionClassName) {
        var ExpressionClass = expressionClasses[expressionClassName];

        QUnit.test(expressionClassName, function(assert) {
            var xVariable = new Variable('x');
            var expression = new ExpressionClass(xVariable);

            verifyExpressionProperties(assert, expression);
            assert.ok(expression.root instanceof Variable);
            assert.equal(expression.print(), 'x');
            assert.equal(expression.print(), expression.clone().print());

            var notX = new Operator(OPERATOR_SYMBOLS.NOT, [ xVariable ]);
            var expectedPrint = {
                DigitalExpression: 'x\'',
                PropositionExpression: discreteMathUtilities.notSymbol + 'x',
            };

            expression = new ExpressionClass(notX);
            assert.ok(expression.root instanceof Operator);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);
            assert.strictEqual(expression.parentOf(xVariable), notX);
            assert.equal(expression.print(), expression.clone().print());

            var yVariable = new Variable('y');
            var xAndY = new Operator(OPERATOR_SYMBOLS.AND, [ xVariable, yVariable ]);

            expectedPrint = {
                DigitalExpression: 'xy',
                PropositionExpression: 'x' + discreteMathUtilities.andSymbol + 'y',
            };
            expression = new ExpressionClass(xAndY);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);
            assert.equal(expression.print(), expression.clone().print());

            var notXAndY = new Operator(OPERATOR_SYMBOLS.NOT, [ xAndY ]);

            expectedPrint = {
                DigitalExpression: '(xy)\'',
                PropositionExpression: discreteMathUtilities.notSymbol + '(x' +
                    discreteMathUtilities.andSymbol + 'y)',
            };
            expression = new ExpressionClass(notXAndY);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);

            var zVariable = new Variable('z');
            var xAndYOrZ = new Operator(OPERATOR_SYMBOLS.OR, [ xAndY, zVariable ]);

            expectedPrint = {
                DigitalExpression: 'xy+z',
                PropositionExpression: '(x' + discreteMathUtilities.andSymbol + 'y)' +
                    discreteMathUtilities.orSymbol + 'z',
            };
            expression = new ExpressionClass(xAndYOrZ);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);

            var notA = new Operator(OPERATOR_SYMBOLS.NOT, [ new Variable('a') ]);
            var xAndYOrZAndNotA = new Operator(OPERATOR_SYMBOLS.AND, [ xAndYOrZ, notA ]);

            expectedPrint = {
                DigitalExpression: '(xy+z)a\'',
                PropositionExpression: '((x' + discreteMathUtilities.andSymbol + 'y)' +
                    discreteMathUtilities.orSymbol + 'z)' + discreteMathUtilities.andSymbol +
                    discreteMathUtilities.notSymbol + 'a',
            };
            expression = new ExpressionClass(xAndYOrZAndNotA);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);

            var notXAndYOrZAndNotA = new Operator(OPERATOR_SYMBOLS.NOT, [ xAndYOrZAndNotA ]);

            expectedPrint = {
                DigitalExpression: '((xy+z)a\')\'',
                PropositionExpression: discreteMathUtilities.notSymbol + '(((x' +
                    discreteMathUtilities.andSymbol + 'y)' + discreteMathUtilities.orSymbol +
                    'z)' + discreteMathUtilities.andSymbol + discreteMathUtilities.notSymbol + 'a)',
            };
            expression = new ExpressionClass(notXAndYOrZAndNotA);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);
            assert.equal(expression.print(), expression.clone().print());

            var trueValue = new Constant(CONSTANT_SYMBOLS.TRUE);
            var xAndYOrTrue = new Operator(OPERATOR_SYMBOLS.OR, [ xAndY, trueValue ]);

            expectedPrint = {
                DigitalExpression: 'xy+1',
                PropositionExpression: '(x' + discreteMathUtilities.andSymbol +
                    'y)' + discreteMathUtilities.orSymbol + 'T',
            };
            expression = new ExpressionClass(xAndYOrTrue);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);

            var xAndTrue = new Operator(OPERATOR_SYMBOLS.AND, [ xVariable, trueValue ]);
            var utilities = require('utilities');

            expectedPrint = {
                DigitalExpression: 'x' + utilities.multiplicationSymbol + '1',
                PropositionExpression: 'x' + discreteMathUtilities.andSymbol + 'T',
            };
            expression = new ExpressionClass(xAndTrue);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);

            var notXAndTrue = new Operator(OPERATOR_SYMBOLS.NOT, [ xAndTrue ]);

            expectedPrint = {
                DigitalExpression: '(x' + utilities.multiplicationSymbol + '1)\'',
                PropositionExpression: discreteMathUtilities.notSymbol + '(x' +
                    discreteMathUtilities.andSymbol + 'T)',
            };
            expression = new ExpressionClass(notXAndTrue);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);

            var xAndTrueAndY = new Operator(OPERATOR_SYMBOLS.AND, [ xAndTrue, yVariable ]);

            expectedPrint = {
                DigitalExpression: '(x' + utilities.multiplicationSymbol + '1)y',
                PropositionExpression: '(x' + discreteMathUtilities.andSymbol + 'T)' +
                discreteMathUtilities.andSymbol + 'y',
            };
            expression = new ExpressionClass(xAndTrueAndY);
            assert.strictEqual(expression.print(), expectedPrint[expressionClassName]);
        });
    });

    QUnit.test('PropositionExpression specific tests', function(assert) {
        var aVariable = new Variable('a');
        var bVariable = new Variable('b');

        // Print using conditional operator
        var aConditionalB = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aVariable, bVariable ]);
        var aConditionalBExpression = new PropositionExpression(aConditionalB);

        assert.strictEqual(aConditionalBExpression.print(), 'a' + discreteMathUtilities.conditionalSymbol + 'b');

        // Print using biconditional operator
        var aBiconditionalB = new Operator(OPERATOR_SYMBOLS.BICONDITIONAL, [ aVariable, bVariable ]);
        var aBiconditionalBExpression = new PropositionExpression(aBiconditionalB);

        assert.strictEqual(aBiconditionalBExpression.print(), 'a' + discreteMathUtilities.biconditionalSymbol + 'b');
    });
}
