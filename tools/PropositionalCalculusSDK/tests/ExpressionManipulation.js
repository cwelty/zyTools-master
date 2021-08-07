'use strict';

/* global ExpressionManipulation, PropositionExpression, Variable, OPERATOR_SYMBOLS, CONSTANT_SYMBOLS, Operator, Constant */

/* exported expressionManipulationTests */

/**
    Convert each {MathSymbol} to a {PropositionExpression}.
    @method convertSymbolsToPropositionExpressions
    @param {Array} symbols Array of {MathSymbol}. The symbols to convert to {PropositionExpression}.
    @return {Array} of {PropositionExpression} The converted symbols.
*/
function convertSymbolsToPropositionExpressions(symbols) {
    return symbols.map(symbol => new PropositionExpression(symbol));
}

/**
    Return whether an error occurs during manipulation.
    @method errorOccursDuringManipulation
    @param {Function} manipulationFunctionName The name of the manipulation function to use.
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Operator}. The sub-expressions from which to perform the manipulation.
    @return {Boolean} Whether an error occurred during manipulation.
*/
function errorOccursDuringManipulation(manipulationFunctionName, expression, subExpressions) {
    const convertedSubExpressions = convertSymbolsToPropositionExpressions(subExpressions);
    const manipulation = new ExpressionManipulation();

    try {
        manipulation[manipulationFunctionName](expression, convertedSubExpressions);
    }
    catch (error) {
        return true;
    }
    return false;
}

/**
    Test the ExpressionManipulation object.
    @method expressionManipulationTests
    @return {void}
*/
function expressionManipulationTests() {
    const manipulation = new ExpressionManipulation();
    const discreteMathUtilities = require('discreteMathUtilities');

    QUnit.test('Double negation', assert => {

        // (NOT NOT a) becomes a.
        const aVariable = new Variable('a');
        const notA = new Operator(OPERATOR_SYMBOLS.NOT, [ aVariable ]);
        const notNotA = new Operator(OPERATOR_SYMBOLS.NOT, [ notA ]);
        let notNotAExpression = new PropositionExpression(notNotA);

        manipulation.doubleNegation(notNotAExpression, [ notNotAExpression ]);
        assert.strictEqual(notNotAExpression.print(), 'a');

        // (NOT NOT NOT a) becomes (NOT a)
        const notNotNotA = new Operator(OPERATOR_SYMBOLS.NOT, [ notNotA ]);

        notNotAExpression = new PropositionExpression(notNotA);

        const notNotNotAExpression = new PropositionExpression(notNotNotA);

        manipulation.doubleNegation(notNotNotAExpression, [ notNotAExpression ]);
        assert.strictEqual(notNotNotAExpression.print(), `${discreteMathUtilities.notSymbol}a`);

        // Invalid double negations.
        const aExpression = new PropositionExpression(aVariable);
        const notAExpression = new PropositionExpression(notA);

        assert.ok(errorOccursDuringManipulation('doubleNegation', notNotAExpression, [ aExpression ]));
        assert.ok(errorOccursDuringManipulation('doubleNegation', notNotAExpression, [ notAExpression ]));
        assert.ok(errorOccursDuringManipulation('doubleNegation', notNotAExpression, [ notNotAExpression, notNotAExpression ]));
    });

    QUnit.test('Reverse and distribution', assert => {

        // a AND (b OR c)
        const aAndBOrCString = `a${discreteMathUtilities.andSymbol}(b${discreteMathUtilities.orSymbol}c)`;

        /*
            Convert ((a AND b) OR (a AND c)) to (a AND (b OR c)).
            Common variable is first in both sub-expressions.
        */
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const cVariable = new Variable('c');
        let aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndC = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, cVariable ]);
        const aAndBOrAAndC = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, aAndC ]);
        const aAndBOrAAndCExpression = new PropositionExpression(aAndBOrAAndC);

        manipulation.reverseAndDistribution(aAndBOrAAndCExpression, convertSymbolsToPropositionExpressions([ aAndB, aAndC ]));
        assert.strictEqual(aAndBOrAAndCExpression.print(), aAndBOrCString);

        /*
            Convert ((b AND a) OR (c AND a)) to (a AND (b OR c))
            Common variable is last in both sub-expressions. Error: Must use commutative first.
        */
        const bAndA = new Operator(OPERATOR_SYMBOLS.AND, [ bVariable, aVariable ]);
        const cAndA = new Operator(OPERATOR_SYMBOLS.AND, [ cVariable, aVariable ]);
        const bAndAORCAndA = new Operator(OPERATOR_SYMBOLS.OR, [ bAndA, cAndA ]);
        const bAndAORCAndAExpression = new PropositionExpression(bAndAORCAndA);

        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', bAndAORCAndAExpression, [ bAndA, cAndA ]));

        /*
            Convert ((a AND b) OR (c AND a)) to (a AND (b OR c))
            Common variable is first then last in sub-expressions. Error: Must use commutative first.
        */
        const aAndBOrCAndA = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, cAndA ]);
        const aAndBOrCAndAExpression = new PropositionExpression(aAndBOrCAndA);
        let propositionExpressions = convertSymbolsToPropositionExpressions([ aAndB, cAndA ]);

        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', aAndBOrCAndAExpression, propositionExpressions));

        /*
            Convert ((b AND a) OR (a AND c)) to (a AND (b OR c))
            Common variable is last then first in sub-expressions. Error: Must use commutative first.
        */
        const bAndAOrAAndC = new Operator(OPERATOR_SYMBOLS.OR, [ bAndA, aAndC ]);
        const bAndAOrAAndCExpression = new PropositionExpression(bAndAOrAAndC);

        propositionExpressions = convertSymbolsToPropositionExpressions([ bAndA, aAndC ]);
        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', bAndAOrAAndCExpression, propositionExpressions));

        /*
            Test that a multi-symbol sub-expression is factored, namely: NOT(a OR b)
            Note that two instances of NOT(a OR b) are used, instead of the same instance used twice, which
            requires a deep equality checking, rather than just a pointer comparison.
            Convert ((NOT(a OR b) AND b) OR (NOT(a OR b) and c)) to (NOT(a OR b) and (b OR c))
        */
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const notAOrB = new Operator(OPERATOR_SYMBOLS.NOT, [ aOrB ]);
        const aOrB2 = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const notAOrB2 = new Operator(OPERATOR_SYMBOLS.NOT, [ aOrB2 ]);
        const notAOrBAndB = new Operator(OPERATOR_SYMBOLS.AND, [ notAOrB, bVariable ]);
        const notAOrBAndC = new Operator(OPERATOR_SYMBOLS.AND, [ notAOrB2, cVariable ]);
        const notAOrBAndBOrNotAOrBAndC = new Operator(OPERATOR_SYMBOLS.OR, [ notAOrBAndB, notAOrBAndC ]);
        const notAOrBAndBOrNotAOrBAndCExpresion = new PropositionExpression(notAOrBAndBOrNotAOrBAndC);

        manipulation.reverseAndDistribution(
            notAOrBAndBOrNotAOrBAndCExpresion,
            convertSymbolsToPropositionExpressions([ notAOrBAndB, notAOrBAndC ])
        );
        assert.strictEqual(
            notAOrBAndBOrNotAOrBAndCExpresion.print(),
            `${discreteMathUtilities.notSymbol}(a${discreteMathUtilities.orSymbol}` +
            `b)${discreteMathUtilities.andSymbol}(b${discreteMathUtilities.orSymbol}c)`
        );

        // Convert NOT((a AND b) OR (a AND c)) to NOT(a AND (b OR c))
        const notAAndBOrAAndC = new Operator(OPERATOR_SYMBOLS.NOT, [ aAndBOrAAndC ]);
        const notAAndBOrAAndCExpression = new PropositionExpression(notAAndBOrAAndC);

        manipulation.reverseAndDistribution(notAAndBOrAAndCExpression, convertSymbolsToPropositionExpressions([ aAndB, aAndC ]));
        assert.strictEqual(notAAndBOrAAndCExpression.print(), `${discreteMathUtilities.notSymbol}(${aAndBOrCString})`);

        // Convert ((a AND b) OR (a AND b)) to (a AND (b OR b))
        const aAndB2 = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndBOrAAndB = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, aAndB2 ]);
        let aAndBOrAAndBExpression = new PropositionExpression(aAndBOrAAndB);

        manipulation.reverseAndDistribution(aAndBOrAAndBExpression, convertSymbolsToPropositionExpressions([ aAndB, aAndB2 ]));
        assert.strictEqual(aAndBOrAAndBExpression.print(), `a${discreteMathUtilities.andSymbol}(b${discreteMathUtilities.orSymbol}b)`);

        // Should have 2 sub-expressions.
        aAndBOrAAndBExpression = new PropositionExpression(aAndBOrAAndB);
        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', aAndBOrAAndBExpression, [ aAndB ]));

        // Invalid to have OR in sub-expression.
        const aAndBOrAOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, aOrB ]);
        const aAndBOrAOrBExpression = new PropositionExpression(aAndBOrAOrB);

        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', aAndBOrAOrBExpression, [ aAndB, aOrB ]));

        // Invalid for sub-expressions to have different parent.
        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', aAndBOrAAndBExpression, [ aAndB, aVariable ]));

        // Invalid for sub-expressions' parent to not be OR.
        const aAndBAndAAndC = new Operator(OPERATOR_SYMBOLS.AND, [ aAndB, aAndC ]);
        const aAndBAndAAndCExpression = new PropositionExpression(aAndBAndAAndC);

        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', aAndBAndAAndCExpression, [ aAndB, aAndC ]));

        // Invalid to have no common variable between each sub-expression.
        const dVariable = new Variable('d');
        const cAndD = new Operator(OPERATOR_SYMBOLS.AND, [ cVariable, dVariable ]);
        const aAndBOrCAndD = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, cAndD ]);
        const aAndBOrCAndDExpression = new PropositionExpression(aAndBOrCAndD);

        aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        assert.ok(errorOccursDuringManipulation('reverseAndDistribution', aAndBOrCAndDExpression, [ aAndB, cAndD ]));
    });

    QUnit.test('Reverse or distribution', assert => {

        // a OR (b AND c)
        const aOrBAndCString = `a${discreteMathUtilities.orSymbol}(b${discreteMathUtilities.andSymbol}c)`;

        /*
            Convert ((a OR b) AND (a OR c)) to (a OR (b AND c)).
            Common variable is first in both sub-expressions.
        */
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const cVariable = new Variable('c');
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const aOrC = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, cVariable ]);
        const aOrBAndAOrC = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, aOrC ]);
        const aOrBAndAOrCExpression = new PropositionExpression(aOrBAndAOrC);

        manipulation.reverseOrDistribution(aOrBAndAOrCExpression, convertSymbolsToPropositionExpressions([ aOrB, aOrC ]));
        assert.strictEqual(aOrBAndAOrCExpression.print(), aOrBAndCString);

        /*
            Convert ((b OR a) AND (c OR a)) to (a OR (b AND c))
            Common variable is last in both sub-expressions. Error: Must use commutative first.
        */
        const bOrA = new Operator(OPERATOR_SYMBOLS.OR, [ bVariable, aVariable ]);
        const cOrA = new Operator(OPERATOR_SYMBOLS.OR, [ cVariable, aVariable ]);
        const bOrAAndCOrA = new Operator(OPERATOR_SYMBOLS.AND, [ bOrA, cOrA ]);
        const bOrAAndCOrAExpression = new PropositionExpression(bOrAAndCOrA);
        let propositionExpressions = convertSymbolsToPropositionExpressions([ bOrA, cOrA ]);

        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', bOrAAndCOrAExpression, propositionExpressions));

        /*
            Convert ((a OR b) AND (c OR a)) to (a OR (b AND c))
            Common variable is first then last in sub-expressions. Error: Must use commutative first.
        */
        const aOrBAndCOrA = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, cOrA ]);
        const aOrBAndCOrAExpression = new PropositionExpression(aOrBAndCOrA);

        propositionExpressions = convertSymbolsToPropositionExpressions([ aOrB, cOrA ]);
        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', aOrBAndCOrAExpression, propositionExpressions));

        /*
            Convert ((b OR a) AND (a OR c)) to (a OR (b AND c))
            Common variable is last then first in sub-expressions. Error: Must use commutative first.
        */
        const bOrAAndAOrC = new Operator(OPERATOR_SYMBOLS.AND, [ bOrA, aOrC ]);
        const bOrAAndAOrCExpression = new PropositionExpression(bOrAAndAOrC);

        propositionExpressions = convertSymbolsToPropositionExpressions([ bOrA, aOrC ]);
        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', bOrAAndAOrCExpression, propositionExpressions));

        // Convert NOT((a OR b) AND (a OR c)) to NOT(a OR (b AND c))
        const notAOrBAndAOrC = new Operator(OPERATOR_SYMBOLS.NOT, [ aOrBAndAOrC ]);
        const notAOrBAndAOrCExpression = new PropositionExpression(notAOrBAndAOrC);

        manipulation.reverseOrDistribution(notAOrBAndAOrCExpression, convertSymbolsToPropositionExpressions([ aOrB, aOrC ]));
        assert.strictEqual(notAOrBAndAOrCExpression.print(), `${discreteMathUtilities.notSymbol}(${aOrBAndCString})`);

        // Convert ((a OR b) AND (a OR b)) to (a OR (b AND b))
        const aOrB2 = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const aOrBAndAOrB = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, aOrB2 ]);
        let aOrBAndAOrBExpression = new PropositionExpression(aOrBAndAOrB);

        manipulation.reverseOrDistribution(aOrBAndAOrBExpression, convertSymbolsToPropositionExpressions([ aOrB, aOrB2 ]));
        assert.strictEqual(aOrBAndAOrBExpression.print(), `a${discreteMathUtilities.orSymbol}(b${discreteMathUtilities.andSymbol}b)`);

        // Should have 2 sub-expressions.
        aOrBAndAOrBExpression = new PropositionExpression(aOrBAndAOrB);
        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', aOrBAndAOrBExpression, [ aOrB ]));

        // Invalid to have AND in sub-expression.
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aOrBAndAAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, aAndB ]);
        const aOrBAndAAndBExpression = new PropositionExpression(aOrBAndAAndB);

        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', aOrBAndAAndBExpression, [ aOrB, aAndB ]));

        // Invalid for sub-expressions to have different parent.
        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', aOrBAndAOrBExpression, [ aOrB, bVariable ]));

        // Invalid for sub-expressions' parent to not be AND.
        const aOrBOrAOrC = new Operator(OPERATOR_SYMBOLS.OR, [ aOrB, aOrC ]);
        const aOrBOrAOrCExpression = new PropositionExpression(aOrBOrAOrC);

        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', aOrBOrAOrCExpression, [ aOrB, aOrC ]));

        // Invalid to have no common variable between each sub-expression.
        const dVariable = new Variable('d');
        const cOrD = new Operator(OPERATOR_SYMBOLS.OR, [ cVariable, dVariable ]);
        const aOrBAndCOrD = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, cOrD ]);
        const aOrBAndCOrDExpression = new PropositionExpression(aOrBAndCOrD);

        assert.ok(errorOccursDuringManipulation('reverseOrDistribution', aOrBAndCOrDExpression, [ aOrB, cOrD ]));
    });

    QUnit.test('Commutative or', assert => {
        const andSymbol = discreteMathUtilities.andSymbol;
        const orSymbol = discreteMathUtilities.orSymbol;

        // a OR b
        const bOrAString = `b${orSymbol}a`;

        // Convert (a OR b) to (b OR a).
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);

        const aOrBExpression = new PropositionExpression(aOrB);

        manipulation.commutativeOr(aOrBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(aOrBExpression.print(), bOrAString);

        // Convert ((b AND a) OR (c OR a)) to ((c OR a) OR (b AND a))
        const cOrAORBandAString = `(c${orSymbol}a)${orSymbol}(b${andSymbol}a)`;
        const cVariable = new Variable('c');
        const bAndA = new Operator(OPERATOR_SYMBOLS.AND, [ bVariable, aVariable ]);
        const cOrA = new Operator(OPERATOR_SYMBOLS.OR, [ cVariable, aVariable ]);
        const bAndAOrCOrA = new Operator(OPERATOR_SYMBOLS.OR, [ bAndA, cOrA ]);
        const bOrAAndCOrAExpression = new PropositionExpression(bAndAOrCOrA);

        manipulation.commutativeOr(bOrAAndCOrAExpression, convertSymbolsToPropositionExpressions([ bAndA, cOrA ]));
        assert.strictEqual(bOrAAndCOrAExpression.print(), cOrAORBandAString);

        // Convert ((c OR a) OR (b AND a)) to ((a OR c) OR (b AND a))
        const aOrCOrBAndAString = `(a${orSymbol}c)${orSymbol}(b${andSymbol}a)`;

        manipulation.commutativeOr(bOrAAndCOrAExpression, convertSymbolsToPropositionExpressions([ cVariable, aVariable ]));
        assert.strictEqual(bOrAAndCOrAExpression.print(), aOrCOrBAndAString);
    });

    QUnit.test('Commutative and', assert => {
        const andSymbol = discreteMathUtilities.andSymbol;
        const orSymbol = discreteMathUtilities.orSymbol;

        // a AND b
        const bAndAString = `b${andSymbol}a`;

        // Convert (a OR b) to (b OR a).
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);

        const aAndBExpression = new PropositionExpression(aAndB);

        manipulation.commutativeAnd(aAndBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(aAndBExpression.print(), bAndAString);

        // Convert ((b OR a) AND (c AND a)) to ((c AND a) AND (b AND a))
        const cOrAORBandAString = `(c${andSymbol}a)${andSymbol}(b${orSymbol}a)`;
        const cVariable = new Variable('c');
        const bAndA = new Operator(OPERATOR_SYMBOLS.OR, [ bVariable, aVariable ]);
        const cAndA = new Operator(OPERATOR_SYMBOLS.AND, [ cVariable, aVariable ]);
        const bOrAAndCAndA = new Operator(OPERATOR_SYMBOLS.AND, [ bAndA, cAndA ]);
        const bOrAAndCAndAExpression = new PropositionExpression(bOrAAndCAndA);

        manipulation.commutativeAnd(bOrAAndCAndAExpression, convertSymbolsToPropositionExpressions([ bAndA, cAndA ]));
        assert.strictEqual(bOrAAndCAndAExpression.print(), cOrAORBandAString);

        // Convert ((c AND a) AND (b OR a)) to ((a OR c) AND (b OR a))
        const aAndCAndBOrAString = `(a${andSymbol}c)${andSymbol}(b${orSymbol}a)`;

        manipulation.commutativeAnd(bOrAAndCAndAExpression, convertSymbolsToPropositionExpressions([ cVariable, aVariable ]));
        assert.strictEqual(bOrAAndCAndAExpression.print(), aAndCAndBOrAString);
    });

    QUnit.test('Complement or', assert => {
        const trueString = (new PropositionExpression(new Constant(CONSTANT_SYMBOLS.TRUE))).print();

        // Convert (a OR (NOT a)) to T.
        const aVariable = new Variable('a');
        const notA = new Operator(OPERATOR_SYMBOLS.NOT, [ aVariable ]);
        const aOrNotA = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, notA ]);
        let aOrNotAExpression = new PropositionExpression(aOrNotA);

        manipulation.complementOr(aOrNotAExpression, convertSymbolsToPropositionExpressions([ aVariable, notA ]));
        assert.strictEqual(aOrNotAExpression.print(), trueString);

        // Convert ((NOT a) OR a) to T. Error: Must use commutative first.
        const notAOrA = new Operator(OPERATOR_SYMBOLS.OR, [ notA, aVariable ]);
        const notAOrAExpression = new PropositionExpression(notAOrA);
        const propositionExpressions = convertSymbolsToPropositionExpressions([ notA, aVariable ]);

        assert.ok(errorOccursDuringManipulation('complementOr', notAOrAExpression, propositionExpressions));

        /*
            Use a multi-symbol sub-expression child, namely: a AND b
            Note that two instances of a AND b are used, instead of the same instance used twice, which
            requires a deep equality checking, rather than just a pointer comparison.
            Convert ((a AND b) OR (NOT(a AND b))) to T.
        */
        const bVariable = new Variable('b');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndB2 = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const notAAndB = new Operator(OPERATOR_SYMBOLS.NOT, [ aAndB ]);
        const aAndBOrNotAAndB = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB2, notAAndB ]);
        let aAndBOrNotAAndBExpression = new PropositionExpression(aAndBOrNotAAndB);

        manipulation.complementOr(aAndBOrNotAAndBExpression, convertSymbolsToPropositionExpressions([ aAndB2, notAAndB ]));
        assert.strictEqual(aAndBOrNotAAndBExpression.print(), trueString);

        // Should have 2 sub-expressions.
        aOrNotAExpression = new PropositionExpression(aOrNotA);
        assert.ok(errorOccursDuringManipulation('complementOr', aOrNotAExpression, [ aVariable ]));

        // Sub-expressions should have same parent.
        aAndBOrNotAAndBExpression = new PropositionExpression(aAndBOrNotAAndB);
        assert.ok(errorOccursDuringManipulation('complementOr', aAndBOrNotAAndBExpression, [ aVariable, aAndB ]));

        // Sub-expressions' parent should be OR.
        const aAndNotA = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, notA ]);
        const aAndNotAExpression = new PropositionExpression(aAndNotA);

        assert.ok(errorOccursDuringManipulation('complementOr', aAndNotAExpression, [ aVariable, notA ]));

        // One sub-expression should start with NOT.
        const aOrA = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, aVariable ]);
        const aOrAExpression = new PropositionExpression(aOrA);

        assert.ok(errorOccursDuringManipulation('complementOr', aOrAExpression, [ aVariable, aVariable ]));

        /*
            There should be a common 'a' in each sub-expression.
            Ex: a OR (NOT a), where a can be an expression.
        */
        const notB = new Operator(OPERATOR_SYMBOLS.NOT, [ bVariable ]);
        const aOrNotB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, notB ]);
        const aOrNotBExpression = new PropositionExpression(aOrNotB);

        assert.ok(errorOccursDuringManipulation('complementOr', aOrNotBExpression, [ aVariable, notB ]));
    });

    QUnit.test('Reverse or complement', assert => {
        const trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);
        const trueConstantExpression = new PropositionExpression(trueConstant);
        const options = { variableName: 'a' };

        // Convert T to (a OR (NOT a)).
        const aVariable = new Variable('a');
        const notA = new Operator(OPERATOR_SYMBOLS.NOT, [ aVariable ]);
        const aOrNotA = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, notA ]);
        const aOrNotAString = new PropositionExpression(aOrNotA).print();
        let trueExpression = new PropositionExpression(trueConstant);

        manipulation.reverseOrComplement(trueExpression, [ trueConstantExpression ], options);
        assert.strictEqual(trueExpression.print(), aOrNotAString);

        // Convert T to (x OR (NOT x)).
        trueExpression = new PropositionExpression(trueConstant);
        options.variableName = 'x';
        const xVariable = new Variable('x');
        const notX = new Operator(OPERATOR_SYMBOLS.NOT, [ xVariable ]);
        const xOrNotX = new Operator(OPERATOR_SYMBOLS.OR, [ xVariable, notX ]);
        const notXOrXString = new PropositionExpression(xOrNotX).print();

        manipulation.reverseOrComplement(trueExpression, [ trueConstantExpression ], options);
        assert.strictEqual(trueExpression.print(), notXOrXString);

        // Insert in an expression. Convert (a AND b) OR T to (a AND b) OR (x AND NOT x)
        const bVariable = new Variable('b');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndBOrTrue = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, trueConstant ]);
        let aAndBOrTrueExpression = new PropositionExpression(aAndBOrTrue);
        const aAndBOrXOrNotX = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB,
            new Operator(OPERATOR_SYMBOLS.OR, [ xVariable, notX ]),
        ]);
        const aAndBOrXOrNotXString = new PropositionExpression(aAndBOrXOrNotX).print();

        manipulation.reverseOrComplement(aAndBOrTrueExpression, [ trueConstantExpression ], options);
        assert.strictEqual(aAndBOrTrueExpression.print(), aAndBOrXOrNotXString);

        // Sub-expression should be TRUE constant.
        aAndBOrTrueExpression = new PropositionExpression(aAndBOrTrue);
        assert.ok(errorOccursDuringManipulation('reverseOrComplement', aAndBOrTrueExpression, [ bVariable ]));

        // Should only have 1 sub-expression.
        aAndBOrTrueExpression = new PropositionExpression(aAndBOrTrue);
        assert.ok(errorOccursDuringManipulation('reverseOrComplement', aAndBOrTrueExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('Complement and', assert => {
        const falseString = (new PropositionExpression(new Constant(CONSTANT_SYMBOLS.FALSE))).print();

        // Convert (a AND (NOT a)) to F.
        const aVariable = new Variable('a');
        const notA = new Operator(OPERATOR_SYMBOLS.NOT, [ aVariable ]);
        const aAndNotA = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, notA ]);
        let aAndNotAExpression = new PropositionExpression(aAndNotA);

        manipulation.complementAnd(aAndNotAExpression, convertSymbolsToPropositionExpressions([ aVariable, notA ]));
        assert.strictEqual(aAndNotAExpression.print(), falseString);

        // Convert ((NOT a) AND a) to F. Error: Must use commutative first.
        const notAAndA = new Operator(OPERATOR_SYMBOLS.AND, [ notA, aVariable ]);
        const notAAndAExpression = new PropositionExpression(notAAndA);
        const propositionExpressions = convertSymbolsToPropositionExpressions([ notA, aVariable ]);

        assert.ok(errorOccursDuringManipulation('complementAnd', notAAndAExpression, propositionExpressions));

        // Convert ((a AND b) AND (NOT(a AND b))) to F.
        const bVariable = new Variable('b');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const notAAndB = new Operator(OPERATOR_SYMBOLS.NOT, [ aAndB ]);
        const aAndBAndNotAAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aAndB, notAAndB ]);
        let aAndBAndNotAAndBExpression = new PropositionExpression(aAndBAndNotAAndB);

        manipulation.complementAnd(aAndBAndNotAAndBExpression, convertSymbolsToPropositionExpressions([ aAndB, notAAndB ]));
        assert.strictEqual(aAndBAndNotAAndBExpression.print(), falseString);

        // Should have 2 sub-expressions.
        aAndNotAExpression = new PropositionExpression(aAndNotA);
        assert.ok(errorOccursDuringManipulation('complementAnd', aAndNotAExpression, [ aVariable ]));

        // Sub-expressions should have same parent.
        aAndBAndNotAAndBExpression = new PropositionExpression(aAndBAndNotAAndB);
        assert.ok(errorOccursDuringManipulation('complementAnd', aAndBAndNotAAndBExpression, [ aVariable, aAndB ]));

        // Sub-expressions' parent should be AND.
        const aOrNotA = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, notA ]);
        const aOrNotAExpression = new PropositionExpression(aOrNotA);

        assert.ok(errorOccursDuringManipulation('complementAnd', aOrNotAExpression, [ aVariable, notA ]));

        // One sub-expression should start with NOT.
        const aAndA = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, aVariable ]);
        const aAndAExpression = new PropositionExpression(aAndA);

        assert.ok(errorOccursDuringManipulation('complementAnd', aAndAExpression, [ aVariable, aVariable ]));

        /*
            There should be a common 'a' in each sub-expression.
            Ex: a OR (NOT a), where a can be an expression.
        */
        const notB = new Operator(OPERATOR_SYMBOLS.NOT, [ bVariable ]);
        const aAndNotB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, notB ]);
        const aAndNotBExpression = new PropositionExpression(aAndNotB);

        assert.ok(errorOccursDuringManipulation('complementAnd', aAndNotBExpression, [ aVariable, notB ]));
    });

    QUnit.test('Identity and true', assert => {

        // Convert (a AND T) to a.
        const aVariable = new Variable('a');
        const trueSymbol = new Constant(CONSTANT_SYMBOLS.TRUE);
        const aAndT = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, trueSymbol ]);
        let aAndTExpression = new PropositionExpression(aAndT);

        manipulation.identityAndTrue(aAndTExpression, convertSymbolsToPropositionExpressions([ aVariable, trueSymbol ]));
        assert.strictEqual(aAndTExpression.print(), 'a');

        // Convert (T AND a) to a. Error: Must use commutative first.
        const tAndA = new Operator(OPERATOR_SYMBOLS.AND, [ trueSymbol, aVariable ]);
        const tAndAExpression = new PropositionExpression(tAndA);
        const propositionExpressions = convertSymbolsToPropositionExpressions([ trueSymbol, aVariable ]);

        assert.ok(errorOccursDuringManipulation('identityAndTrue', tAndAExpression, propositionExpressions));

        // Convert (T AND T) to T.
        const trueSymbol2 = new Constant(CONSTANT_SYMBOLS.TRUE);
        const tandT = new Operator(OPERATOR_SYMBOLS.AND, [ trueSymbol, trueSymbol2 ]);
        const tandTExpression = new PropositionExpression(tandT);

        manipulation.identityAndTrue(tandTExpression, convertSymbolsToPropositionExpressions([ trueSymbol, trueSymbol2 ]));
        assert.strictEqual(tandTExpression.print(), 'T');

        // Convert ((a OR b) AND T) to (a OR b).
        const bVariable = new Variable('b');
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const AOrBAndT = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, trueSymbol ]);
        let AOrBAndTExpression = new PropositionExpression(AOrBAndT);

        manipulation.identityAndTrue(AOrBAndTExpression, convertSymbolsToPropositionExpressions([ aOrB, trueSymbol ]));
        assert.strictEqual(AOrBAndTExpression.print(), `a${discreteMathUtilities.orSymbol}b`);

        // Should have 2 sub-expressions.
        aAndTExpression = new PropositionExpression(aAndT);
        assert.ok(errorOccursDuringManipulation('identityAndTrue', aAndTExpression, [ aVariable ]));

        // Sub-expressions should have same parent.
        AOrBAndTExpression = new PropositionExpression(AOrBAndT);
        assert.ok(errorOccursDuringManipulation('identityAndTrue', AOrBAndTExpression, [ trueSymbol, aVariable ]));

        // Sub-expressions' parent should be AND.
        const aOrT = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, trueSymbol ]);
        const aOrTExpression = new PropositionExpression(aOrT);

        assert.ok(errorOccursDuringManipulation('identityAndTrue', aOrTExpression, [ aVariable, trueSymbol ]));

        // At least one sub-expression should be TRUE.
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndBExpression = new PropositionExpression(aAndB);

        assert.ok(errorOccursDuringManipulation('identityAndTrue', aAndBExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('Reverse identity and true', assert => {

        // Convert a to (a AND T).
        const aVariable = new Variable('a');
        const trueSymbol = new Constant(CONSTANT_SYMBOLS.TRUE);
        const aAndTString = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, trueSymbol ])).print();
        const aExpression = new PropositionExpression(aVariable);

        manipulation.reverseIdentityAndTrue(aExpression, convertSymbolsToPropositionExpressions([ aVariable ]));
        assert.strictEqual(aExpression.print(), aAndTString);

        // Convert T to (T AND T).
        const trueSymbol2 = new Constant(CONSTANT_SYMBOLS.TRUE);
        const tandTString = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.AND, [ trueSymbol, trueSymbol2 ])).print();
        const tExpression = new PropositionExpression(trueSymbol);

        manipulation.reverseIdentityAndTrue(tExpression, convertSymbolsToPropositionExpressions([ trueSymbol ]));
        assert.strictEqual(tExpression.print(), tandTString);

        // Convert (a OR b) to ((a OR b) AND T).
        const bVariable = new Variable('b');
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const aOrBAndTString = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, trueSymbol ])).print();
        let aOrBExpression = new PropositionExpression(aOrB);

        manipulation.reverseIdentityAndTrue(aOrBExpression, convertSymbolsToPropositionExpressions([ aOrB ]));
        assert.strictEqual(aOrBExpression.print(), aOrBAndTString);

        // Should have 1 sub-expressions.
        aOrBExpression = new PropositionExpression(aOrB);
        assert.ok(errorOccursDuringManipulation('reverseIdentityAndTrue', aOrBExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('Identity or false', assert => {

        // Convert (a OR F) to a.
        const aVariable = new Variable('a');
        const falseSymbol = new Constant(CONSTANT_SYMBOLS.FALSE);
        const aOrF = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, falseSymbol ]);
        let aOrFExpression = new PropositionExpression(aOrF);

        manipulation.identityOrFalse(aOrFExpression, convertSymbolsToPropositionExpressions([ aVariable, falseSymbol ]));
        assert.strictEqual(aOrFExpression.print(), 'a');

        // Convert (F OR a) to a. Error: Must use commutative first.
        const fOrA = new Operator(OPERATOR_SYMBOLS.OR, [ falseSymbol, aVariable ]);
        const fOrAExpression = new PropositionExpression(fOrA);
        const propositionExpressions = convertSymbolsToPropositionExpressions([ falseSymbol, aVariable ]);

        assert.ok(errorOccursDuringManipulation('identityOrFalse', fOrAExpression, propositionExpressions));

        // Convert (F OR F) to F.
        const falseSymbol2 = new Constant(CONSTANT_SYMBOLS.FALSE);
        const fOrF = new Operator(OPERATOR_SYMBOLS.OR, [ falseSymbol, falseSymbol2 ]);
        const fOrFExpression = new PropositionExpression(fOrF);

        manipulation.identityOrFalse(fOrFExpression, convertSymbolsToPropositionExpressions([ falseSymbol, falseSymbol2 ]));
        assert.strictEqual(fOrFExpression.print(), 'F');

        // Convert ((a AND b) OR F) to (a AND b).
        const bVariable = new Variable('b');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const AAndOrFB = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, falseSymbol ]);
        let AAndBOrFExpression = new PropositionExpression(AAndOrFB);

        manipulation.identityOrFalse(AAndBOrFExpression, convertSymbolsToPropositionExpressions([ aAndB, falseSymbol ]));
        assert.strictEqual(AAndBOrFExpression.print(), `a${discreteMathUtilities.andSymbol}b`);

        // Should have 2 sub-expressions.
        aOrFExpression = new PropositionExpression(aOrF);
        assert.ok(errorOccursDuringManipulation('identityOrFalse', aOrFExpression, [ aVariable ]));

        // Sub-expressions should have same parent.
        AAndBOrFExpression = new PropositionExpression(AAndOrFB);
        assert.ok(errorOccursDuringManipulation('identityOrFalse', AAndBOrFExpression, [ falseSymbol, aVariable ]));

        // Sub-expressions' parent should be OR.
        const aAndT = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, falseSymbol ]);
        const aAndTExpression = new PropositionExpression(aAndT);

        assert.ok(errorOccursDuringManipulation('identityOrFalse', aAndTExpression, [ aVariable, falseSymbol ]));

        // At least one sub-expression should be FALSE.
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const aOrBExpression = new PropositionExpression(aOrB);

        assert.ok(errorOccursDuringManipulation('identityOrFalse', aOrBExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('Reverse identity or false', assert => {

        // Convert a to (a or F).
        const aVariable = new Variable('a');
        const falseSymbol = new Constant(CONSTANT_SYMBOLS.FALSE);
        const aAndFString = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, falseSymbol ])).print();
        const aExpression = new PropositionExpression(aVariable);

        manipulation.reverseIdentityOrFalse(aExpression, convertSymbolsToPropositionExpressions([ aVariable ]));
        assert.strictEqual(aExpression.print(), aAndFString);

        // Convert F to (F OR F).
        const falseSymbol2 = new Constant(CONSTANT_SYMBOLS.FALSE);
        const fandFString = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.OR, [ falseSymbol, falseSymbol2 ])).print();
        const fExpression = new PropositionExpression(falseSymbol);

        manipulation.reverseIdentityOrFalse(fExpression, convertSymbolsToPropositionExpressions([ falseSymbol ]));
        assert.strictEqual(fExpression.print(), fandFString);

        // Convert (a AND b) to ((a AND b) OR F).
        const bVariable = new Variable('b');
        const aOrB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aOrBAndFString = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.OR, [ aOrB, falseSymbol ])).print();
        let aOrBExpression = new PropositionExpression(aOrB);

        manipulation.reverseIdentityOrFalse(aOrBExpression, convertSymbolsToPropositionExpressions([ aOrB ]));
        assert.strictEqual(aOrBExpression.print(), aOrBAndFString);

        // Should have 1 sub-expressions.
        aOrBExpression = new PropositionExpression(aOrB);
        assert.ok(errorOccursDuringManipulation('reverseIdentityOrFalse', aOrBExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('Or null elements', assert => {
        const trueSymbol = new Constant(CONSTANT_SYMBOLS.TRUE);
        const tString = new PropositionExpression(trueSymbol).print();

        // Convert (a OR T) to T.
        const aVariable = new Variable('a');
        const aOrT = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, trueSymbol ]);
        const aOrTExpression = new PropositionExpression(aOrT);

        manipulation.orNullElements(aOrTExpression, convertSymbolsToPropositionExpressions([ aVariable, trueSymbol ]));
        assert.strictEqual(aOrTExpression.print(), tString);

        // Convert (T OR T) to T.
        const trueSymbol2 = new Constant(CONSTANT_SYMBOLS.TRUE);
        const tOrTExpression = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.OR, [ trueSymbol, trueSymbol2 ]));

        manipulation.orNullElements(tOrTExpression, convertSymbolsToPropositionExpressions([ trueSymbol, trueSymbol2 ]));
        assert.strictEqual(tOrTExpression.print(), tString);

        // Convert (a AND b) OR T to T.
        const bVariable = new Variable('b');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndBOrT = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, trueSymbol ]);
        let aAndBOrTExpression = new PropositionExpression(aAndBOrT);

        manipulation.orNullElements(aAndBOrTExpression, convertSymbolsToPropositionExpressions([ aAndB, trueSymbol ]));
        assert.strictEqual(aAndBOrTExpression.print(), tString);

        // Should have 2 sub-expressions.
        aAndBOrTExpression = new PropositionExpression(aAndBOrT);
        assert.ok(errorOccursDuringManipulation('orNullElements', aAndBOrTExpression, [ aVariable ]));

        // One sub-expression should be True.
        aAndBOrTExpression = new PropositionExpression(aAndBOrT);
        assert.ok(errorOccursDuringManipulation('orNullElements', aAndBOrTExpression, [ aVariable, bVariable ]));

        // Sub-expressions should be connected with an OR.
        const aAndBAndT = new Operator(OPERATOR_SYMBOLS.AND, [ aAndB, trueSymbol ]);
        const aAndBAndTExpression = new PropositionExpression(aAndBAndT);

        assert.ok(errorOccursDuringManipulation('orNullElements', aAndBAndTExpression, [ aAndB, trueSymbol ]));
    });

    QUnit.test('And null elements', assert => {
        const falseSymbol = new Constant(CONSTANT_SYMBOLS.FALSE);
        const fString = new PropositionExpression(falseSymbol).print();

        // Convert (a AND F) to F.
        const aVariable = new Variable('a');
        const aAndF = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, falseSymbol ]);
        const aAndFExpression = new PropositionExpression(aAndF);

        manipulation.andNullElements(aAndFExpression, convertSymbolsToPropositionExpressions([ aVariable, falseSymbol ]));
        assert.strictEqual(aAndFExpression.print(), fString);

        // Convert (F AND F) to F.
        const falseSymbol2 = new Constant(CONSTANT_SYMBOLS.FALSE);
        const fAndFExpression = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.AND, [ falseSymbol, falseSymbol2 ]));

        manipulation.andNullElements(fAndFExpression, convertSymbolsToPropositionExpressions([ falseSymbol, falseSymbol2 ]));
        assert.strictEqual(fAndFExpression.print(), fString);

        // Convert (a OR b) AND F to F.
        const bVariable = new Variable('b');
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const aOrBAndF = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, falseSymbol ]);
        let aOrBAndFExpression = new PropositionExpression(aOrBAndF);

        manipulation.andNullElements(aOrBAndFExpression, convertSymbolsToPropositionExpressions([ aOrB, falseSymbol ]));
        assert.strictEqual(aOrBAndFExpression.print(), fString);

        // Should have 2 sub-expressions.
        aOrBAndFExpression = new PropositionExpression(aOrBAndF);
        assert.ok(errorOccursDuringManipulation('andNullElements', aOrBAndFExpression, [ aVariable ]));

        // One sub-expression should be False.
        aOrBAndFExpression = new PropositionExpression(aOrBAndF);
        assert.ok(errorOccursDuringManipulation('andNullElements', aOrBAndFExpression, [ aVariable, bVariable ]));

        // Sub-expressions should be connected with an AND.
        const aOrBOrF = new Operator(OPERATOR_SYMBOLS.OR, [ aOrB, falseSymbol ]);
        const aOrBOrTExpression = new PropositionExpression(aOrBOrF);

        assert.ok(errorOccursDuringManipulation('andNullElements', aOrBOrTExpression, [ aOrB, falseSymbol ]));
    });

    QUnit.test('Or idempotence', assert => {

        // Convert (a OR a) to a.
        const aVariable = new Variable('a');
        const aVariable2 = aVariable.clone();
        const aOrA = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, aVariable2 ]);
        let aOrAExpression = new PropositionExpression(aOrA);

        manipulation.orIdempotence(aOrAExpression, convertSymbolsToPropositionExpressions([ aVariable, aVariable2 ]));
        assert.strictEqual(aOrAExpression.print(), 'a');

        // Convert (a AND b) OR (a AND b) to (a AND b).
        const bVariable = new Variable('b');
        const bVariable2 = bVariable.clone();
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndBExpression = new PropositionExpression(aAndB);
        const a2AndB2 = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable2, bVariable2 ]);
        const aAndBORA2AndB2 = new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, a2AndB2 ]);
        const aAndBORA2AndB2Expression = new PropositionExpression(aAndBORA2AndB2);

        manipulation.orIdempotence(aAndBORA2AndB2Expression, convertSymbolsToPropositionExpressions([ aAndB, a2AndB2 ]));
        assert.strictEqual(aAndBORA2AndB2Expression.print(), aAndBExpression.print());

        // Should have 2 sub-expressions.
        aOrAExpression = new PropositionExpression(aOrA);
        assert.ok(errorOccursDuringManipulation('orIdempotence', aOrAExpression, [ aVariable ]));

        // Sub-expressions should match.
        const aOrBExpression = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]));

        assert.ok(errorOccursDuringManipulation('orIdempotence', aOrBExpression, [ aVariable, bVariable ]));

        // Sub-expressions should be connected with an OR.
        const aAndAExpression = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, aVariable2 ]));

        assert.ok(errorOccursDuringManipulation('orIdempotence', aAndAExpression, [ aVariable, aVariable2 ]));
    });

    QUnit.test('And idempotence', assert => {

        // Convert (a AND a) to a.
        const aVariable = new Variable('a');
        const aVariable2 = aVariable.clone();
        const aAndA = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, aVariable2 ]);
        let aAndAExpression = new PropositionExpression(aAndA);

        manipulation.andIdempotence(aAndAExpression, convertSymbolsToPropositionExpressions([ aVariable, aVariable2 ]));
        assert.strictEqual(aAndAExpression.print(), 'a');

        // Convert (a OR b) AND (a OR b) to (a OR b).
        const bVariable = new Variable('b');
        const bVariable2 = bVariable.clone();
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const aOrBExpression = new PropositionExpression(aOrB);
        const a2OrB2 = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable2, bVariable2 ]);
        const aOrBAndA2OrB2 = new Operator(OPERATOR_SYMBOLS.AND, [ aOrB, a2OrB2 ]);
        const aOrBAndA2OrB2Expression = new PropositionExpression(aOrBAndA2OrB2);

        manipulation.andIdempotence(aOrBAndA2OrB2Expression, convertSymbolsToPropositionExpressions([ aOrB, a2OrB2 ]));
        assert.strictEqual(aOrBAndA2OrB2Expression.print(), aOrBExpression.print());

        // Should have 2 sub-expressions.
        aAndAExpression = new PropositionExpression(aAndA);
        assert.ok(errorOccursDuringManipulation('andIdempotence', aAndAExpression, [ aVariable ]));

        // Sub-expressions should match.
        const aAndBExpression = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]));

        assert.ok(errorOccursDuringManipulation('andIdempotence', aAndBExpression, [ aVariable, bVariable ]));

        // Sub-expressions should be connected with an AND.
        const aOrAExpression = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, aVariable2 ]));

        assert.ok(errorOccursDuringManipulation('andIdempotence', aOrAExpression, [ aVariable, aVariable2 ]));
    });

    QUnit.test('Conditional ->', assert => {

        // Convert (a -> b) to ((NOT a) OR b)
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const aConditionB = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aVariable, bVariable ]);
        const aConditionBExpression = new PropositionExpression(aConditionB);

        manipulation.conditional(aConditionBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(aConditionBExpression.print(), `${discreteMathUtilities.notSymbol}a${discreteMathUtilities.orSymbol}b`);

        // Convert ((a AND b) -> (c OR d)) to (NOT(a AND b) OR (c OR d))
        const cVariable = new Variable('c');
        const dVariable = new Variable('d');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const cOrD = new Operator(OPERATOR_SYMBOLS.OR, [ cVariable, dVariable ]);
        const aAndBConditionCOrD = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aAndB, cOrD ]);
        let aAndBConditionCOrDExpression = new PropositionExpression(aAndBConditionCOrD);

        manipulation.conditional(aAndBConditionCOrDExpression, convertSymbolsToPropositionExpressions([ aAndB, cOrD ]));
        assert.strictEqual(
            aAndBConditionCOrDExpression.print(),
            `${discreteMathUtilities.notSymbol}(a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.orSymbol}` +
            `(c${discreteMathUtilities.orSymbol}d)`
        );

        // Must have two sub-expressions
        aAndBConditionCOrDExpression = new PropositionExpression(aAndBConditionCOrD);
        assert.ok(errorOccursDuringManipulation('conditional', aAndBConditionCOrDExpression, [ aVariable ]));

        // Sub-expressions should be connected
        assert.ok(errorOccursDuringManipulation('conditional', aAndBConditionCOrDExpression, [ aVariable, dVariable ]));

        // Sub-expressions should be connected by CONDITIONAL
        assert.ok(errorOccursDuringManipulation('conditional', aAndBConditionCOrDExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('Reverse conditional ->', assert => {

        // Convert ((NOT a) OR b) to (a -> b)
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const notAVariable = new Operator(OPERATOR_SYMBOLS.NOT, [ aVariable ]);
        const notAVariableOrB = new Operator(OPERATOR_SYMBOLS.OR, [ notAVariable, bVariable ]);
        const notAVariableOrBExpression = new PropositionExpression(notAVariableOrB);
        const aConditionB = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aVariable, bVariable ]);
        const aConditionBString = new PropositionExpression(aConditionB).print();

        manipulation.reverseConditional(notAVariableOrBExpression, convertSymbolsToPropositionExpressions([ notAVariable, bVariable ]));
        assert.strictEqual(notAVariableOrBExpression.print(), aConditionBString);

        // Convert (NOT(a AND b) OR (c OR d)) to ((a AND b) -> (c OR d))
        const cVariable = new Variable('c');
        const dVariable = new Variable('d');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const cOrD = new Operator(OPERATOR_SYMBOLS.OR, [ cVariable, dVariable ]);
        const notAAndB = new Operator(OPERATOR_SYMBOLS.NOT, [ aAndB ]);
        const notAAndBOrCOrD = new Operator(OPERATOR_SYMBOLS.OR, [ notAAndB, cOrD ]);
        let notAAndBOrCOrDExpression = new PropositionExpression(notAAndBOrCOrD);
        const aAndBConditionCOrDString = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aAndB, cOrD ])).print();

        manipulation.reverseConditional(notAAndBOrCOrDExpression, convertSymbolsToPropositionExpressions([ notAAndB, cOrD ]));
        assert.strictEqual(notAAndBOrCOrDExpression.print(), aAndBConditionCOrDString);

        // Must have two sub-expressions
        notAAndBOrCOrDExpression = new PropositionExpression(notAAndBOrCOrD);
        assert.ok(errorOccursDuringManipulation('reverseConditional', notAAndBOrCOrDExpression, [ aVariable ]));

        // Sub-expressions should be connected by OR
        assert.ok(errorOccursDuringManipulation('reverseConditional', notAAndBOrCOrDExpression, [ aVariable, bVariable ]));

        const aAndBOrCOrD = new PropositionExpression(new Operator(OPERATOR_SYMBOLS.OR, [ aAndB, cOrD ]));

        // First sub-expression should be negated.
        assert.ok(errorOccursDuringManipulation('reverseConditional', aAndBOrCOrD, [ aAndB, cOrD ]));
    });

    QUnit.test('Biconditional <->', assert => {

        // Convert (a <-> b) to ((a -> b) AND (b -> a))
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const aBiconditionB = new Operator(OPERATOR_SYMBOLS.BICONDITIONAL, [ aVariable, bVariable ]);
        const aBiconditionBExpression = new PropositionExpression(aBiconditionB);

        manipulation.biconditional(aBiconditionBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(
            aBiconditionBExpression.print(),
            `(a${discreteMathUtilities.conditionalSymbol}b)${discreteMathUtilities.andSymbol}` +
            `(b${discreteMathUtilities.conditionalSymbol}a)`
        );

        // Convert ((a AND b) <-> (c OR d)) to (((a AND b) -> (c OR d)) AND ((c OR d) -> (a AND b)))
        const cVariable = new Variable('c');
        const dVariable = new Variable('d');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const cOrD = new Operator(OPERATOR_SYMBOLS.OR, [ cVariable, dVariable ]);
        const aAndBBiconditionCOrD = new Operator(OPERATOR_SYMBOLS.BICONDITIONAL, [ aAndB, cOrD ]);
        let aAndBBiconditionCOrDExpression = new PropositionExpression(aAndBBiconditionCOrD);

        manipulation.biconditional(aAndBBiconditionCOrDExpression, convertSymbolsToPropositionExpressions([ aAndB, cOrD ]));
        assert.strictEqual(
            aAndBBiconditionCOrDExpression.print(),
            `((a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.conditionalSymbol}` +
            `(c${discreteMathUtilities.orSymbol}d))${discreteMathUtilities.andSymbol}` +
            `((c${discreteMathUtilities.orSymbol}d)${discreteMathUtilities.conditionalSymbol}` +
            `(a${discreteMathUtilities.andSymbol}b))`
        );

        // Must have two sub-expressions
        aAndBBiconditionCOrDExpression = new PropositionExpression(aAndBBiconditionCOrD);
        assert.ok(errorOccursDuringManipulation('biconditional', aAndBBiconditionCOrDExpression, [ aVariable ]));

        // Sub-expressions should be connected
        assert.ok(errorOccursDuringManipulation('biconditional', aAndBBiconditionCOrDExpression, [ aVariable, dVariable ]));

        // Sub-expressions should be connected by BICONDITIONAL
        assert.ok(errorOccursDuringManipulation('biconditional', aAndBBiconditionCOrDExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('Reverse biconditional <->', assert => {

        // Convert ((a -> b) AND (b -> a)) to (a <-> b)
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const aConditionalB = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aVariable.clone(), bVariable.clone() ]);
        const bConditionalA = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ bVariable.clone(), aVariable.clone() ]);

        const aConditionalBAndBConditionalA = new Operator(OPERATOR_SYMBOLS.AND, [ aConditionalB, bConditionalA ]);
        let aConditionalBAndBConditionalAExpression = new PropositionExpression(aConditionalBAndBConditionalA);

        manipulation.reverseBiconditional(aConditionalBAndBConditionalAExpression, convertSymbolsToPropositionExpressions([
            aConditionalB,
            bConditionalA,
        ]));
        assert.strictEqual(aConditionalBAndBConditionalAExpression.print(), `a${discreteMathUtilities.biconditionalSymbol}b`);

        // Convert (((a AND b) -> (c OR d)) AND ((c OR d) -> (a AND b))) to ((a AND b) <-> (c OR d))
        const cVariable = new Variable('c');
        const dVariable = new Variable('d');
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const cOrD = new Operator(OPERATOR_SYMBOLS.OR, [ cVariable, dVariable ]);
        const aAndBConditionalCOrD = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aAndB.clone(), cOrD.clone() ]);
        const cOrDConditionalAAndB = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ cOrD.clone(), aAndB.clone() ]);
        const aAndBConditionalCOrDAndCOrDConditionalAAndB = new Operator(OPERATOR_SYMBOLS.AND, [
            aAndBConditionalCOrD,
            cOrDConditionalAAndB,
        ]);
        const aAndBConditionalCOrDAndCOrDConditionalAAndBExpr = new PropositionExpression(aAndBConditionalCOrDAndCOrDConditionalAAndB);

        manipulation.reverseBiconditional(
            aAndBConditionalCOrDAndCOrDConditionalAAndBExpr,
            convertSymbolsToPropositionExpressions([ aAndBConditionalCOrD, cOrDConditionalAAndB ])
        );
        assert.strictEqual(
            aAndBConditionalCOrDAndCOrDConditionalAAndBExpr.print(),
            `(a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.biconditionalSymbol}` +
            `(c${discreteMathUtilities.orSymbol}d)`
        );

        // Must have two sub-expressions
        aConditionalBAndBConditionalAExpression = new PropositionExpression(aConditionalBAndBConditionalA);
        assert.ok(errorOccursDuringManipulation('reverseBiconditional', aConditionalBAndBConditionalAExpression, [ aConditionalB ]));

        // Both sub-expressions should have CONDITIONAL as root {MathSymbol}
        const aAndBAndAConditionalB = new Operator(OPERATOR_SYMBOLS.AND, [ aAndB, aConditionalB ]);
        const aAndBAndAConditionalBExpression = new PropositionExpression(aAndBAndAConditionalB);

        assert.ok(errorOccursDuringManipulation('reverseBiconditional', aAndBAndAConditionalBExpression, [ aAndB, aConditionalB ]));
        assert.ok(errorOccursDuringManipulation('reverseBiconditional', aAndBAndAConditionalBExpression, [ aConditionalB, aAndB ]));

        // Sub-expressions should have a common parent
        const aConditionalBConditionalC = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [ aConditionalB, cVariable ]);
        const aConditionalBConditionalCExpression = new PropositionExpression(aConditionalBConditionalC);

        assert.ok(errorOccursDuringManipulation('reverseBiconditional', aConditionalBConditionalCExpression, [ aConditionalB, cVariable ]));

        // Sub-expressions' common parent should be AND operator
        const aAndBConditionalCOrDOrCOrDConditionalAAndB = new Operator(OPERATOR_SYMBOLS.OR, [
            aAndBConditionalCOrD,
            cOrDConditionalAAndB,
        ]);
        const aAndBConditionalCOrDOrCOrDConditionalAAndBExpression = new PropositionExpression(aAndBConditionalCOrDOrCOrDConditionalAAndB);

        assert.ok(errorOccursDuringManipulation('reverseBiconditional', aAndBConditionalCOrDOrCOrDConditionalAAndBExpression,
            [ aAndBConditionalCOrD, cOrDConditionalAAndB ]
        ));
    });

    QUnit.test('de Morgan AND', assert => {

        // Convert NOT(a AND b) to ((NOT a) OR (NOT b))
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const notAAndB = new Operator(OPERATOR_SYMBOLS.NOT, [
            new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]),
        ]);
        const notAAndBExpression = new PropositionExpression(notAAndB);

        manipulation.deMorganAnd(notAAndBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(
            notAAndBExpression.print(),
            `${discreteMathUtilities.notSymbol}a${discreteMathUtilities.orSymbol}${discreteMathUtilities.notSymbol}b`
        );

        // Convert (NOT NOT(a AND b)) to (NOT((NOT a) OR (NOT b)))
        const notNotAAndB = new Operator(OPERATOR_SYMBOLS.NOT, [ notAAndB ]);
        let notNotAAndBExpression = new PropositionExpression(notNotAAndB);

        manipulation.deMorganAnd(notNotAAndBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(
            notNotAAndBExpression.print(),
            `${discreteMathUtilities.notSymbol}(${discreteMathUtilities.notSymbol}a${discreteMathUtilities.orSymbol}` +
            `${discreteMathUtilities.notSymbol}b)`
        );

        // Must have two sub-expressions
        notNotAAndBExpression = new PropositionExpression(notNotAAndB);
        assert.ok(errorOccursDuringManipulation('deMorganAnd', notNotAAndBExpression, [ aVariable ]));

        // Sub-expressions should be connected
        const cVariable = new Variable('c');
        const notAAndBAndC = new Operator(OPERATOR_SYMBOLS.AND, [
            notAAndB,
            cVariable,
        ]);
        const notAAndBAndCExpression = new PropositionExpression(notAAndBAndC);

        assert.ok(errorOccursDuringManipulation('deMorganAnd', notAAndBAndCExpression, [ aVariable, cVariable ]));

        // Sub-expressions should be connected by an AND operator whose parent is a NOT operator
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bVariable ]);
        const aAndBExpression = new PropositionExpression(aAndB);

        assert.ok(errorOccursDuringManipulation('deMorganAnd', aAndBExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('de Morgan OR', assert => {

        // Convert NOT(a OR b) to ((NOT a) AND (NOT b))
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const notAOrB = new Operator(OPERATOR_SYMBOLS.NOT, [
            new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]),
        ]);
        const notAOrBExpression = new PropositionExpression(notAOrB);

        manipulation.deMorganOr(notAOrBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(
            notAOrBExpression.print(),
            `${discreteMathUtilities.notSymbol}a${discreteMathUtilities.andSymbol}${discreteMathUtilities.notSymbol}b`
        );

        // Convert NOT(NOT(a OR b)) to NOT((NOT a) AND (NOT b))
        const notNotAOrB = new Operator(OPERATOR_SYMBOLS.NOT, [ notAOrB ]);
        let notNotAOrBExpression = new PropositionExpression(notNotAOrB);

        manipulation.deMorganOr(notNotAOrBExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable ]));
        assert.strictEqual(
            notNotAOrBExpression.print(),
            `${discreteMathUtilities.notSymbol}(${discreteMathUtilities.notSymbol}a${discreteMathUtilities.andSymbol}` +
            `${discreteMathUtilities.notSymbol}b)`
        );

        // Must have two sub-expressions
        notNotAOrBExpression = new PropositionExpression(notNotAOrB);
        assert.ok(errorOccursDuringManipulation('deMorganOr', notNotAOrBExpression, [ aVariable ]));

        // Sub-expressions should be connected
        const cVariable = new Variable('c');
        const notAOrBOrC = new Operator(OPERATOR_SYMBOLS.OR, [
            notAOrB,
            cVariable,
        ]);
        const notAOrBOrCExpression = new PropositionExpression(notAOrBOrC);

        assert.ok(errorOccursDuringManipulation('deMorganOr', notAOrBOrCExpression, [ aVariable, cVariable ]));

        // Sub-expressions should be connected by an OR operator whose parent is a NOT operator
        const aOrB = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bVariable ]);
        const aOrBExpression = new PropositionExpression(aOrB);

        assert.ok(errorOccursDuringManipulation('deMorganOr', aOrBExpression, [ aVariable, bVariable ]));
    });

    QUnit.test('AND distribution', assert => {

        // Convert (a AND (b OR c)) to ((a AND b) OR (a AND c))
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const cVariable = new Variable('c');
        const bOrC = new Operator(OPERATOR_SYMBOLS.OR, [ bVariable, cVariable ]);
        const aAndBOrC = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bOrC ]);
        let aAndBOrCExpression = new PropositionExpression(aAndBOrC);

        manipulation.andDistribution(aAndBOrCExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable, cVariable ]));
        assert.strictEqual(
            aAndBOrCExpression.print(),
            `(a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.orSymbol}(a${discreteMathUtilities.andSymbol}c)`
        );

        // Different term order: b, a, c
        aAndBOrCExpression = new PropositionExpression(aAndBOrC);
        manipulation.andDistribution(aAndBOrCExpression, convertSymbolsToPropositionExpressions([ bVariable, aVariable, cVariable ]));
        assert.strictEqual(
            aAndBOrCExpression.print(),
            `(a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.orSymbol}(a${discreteMathUtilities.andSymbol}c)`
        );

        // Different term order: c, a, b
        aAndBOrCExpression = new PropositionExpression(aAndBOrC);
        manipulation.andDistribution(aAndBOrCExpression, convertSymbolsToPropositionExpressions([ cVariable, aVariable, bVariable ]));
        assert.strictEqual(
            aAndBOrCExpression.print(),
            `(a${discreteMathUtilities.andSymbol}c)${discreteMathUtilities.orSymbol}(a${discreteMathUtilities.andSymbol}b)`
        );

        // Convert NOT(a AND (b OR c)) to NOT((a AND b) OR (a AND c))
        const notAAndBOrC = new Operator(OPERATOR_SYMBOLS.NOT, [ aAndBOrC ]);
        let notAAndBOrCExpression = new PropositionExpression(notAAndBOrC);

        manipulation.andDistribution(notAAndBOrCExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable, cVariable ]));
        assert.strictEqual(
            notAAndBOrCExpression.print(),
            `${discreteMathUtilities.notSymbol}((a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.orSymbol}` +
            `(a${discreteMathUtilities.andSymbol}c))`
        );

        // Must have three sub-expressions
        aAndBOrCExpression = new PropositionExpression(aAndBOrC);
        assert.ok(errorOccursDuringManipulation('andDistribution', aAndBOrCExpression, [ aVariable ]));
        assert.ok(errorOccursDuringManipulation('andDistribution', aAndBOrCExpression, [ aVariable, bVariable ]));

        // Two sub-expressions should be connected
        notAAndBOrCExpression = new PropositionExpression(notAAndBOrC);
        assert.ok(errorOccursDuringManipulation('andDistribution', notAAndBOrCExpression, [ aVariable, bVariable, aAndBOrC ]));

        // Two sub-expressions should be connected by an OR operator.
        const bAndC = new Operator(OPERATOR_SYMBOLS.AND, [ bVariable, cVariable ]);
        const aAndBAndC = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bAndC ]);
        const aAndBAndCExpression = new PropositionExpression(aAndBAndC);

        assert.ok(errorOccursDuringManipulation('andDistribution', aAndBAndCExpression, [ aVariable, bVariable, cVariable ]));

        // Two sub-expressions connected by OR operator should have grandparent AND operator.
        const aAOrBOrC = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bOrC ]);
        const aAOrBOrCExpression = new PropositionExpression(aAOrBOrC);

        assert.ok(errorOccursDuringManipulation('andDistribution', aAOrBOrCExpression, [ aVariable, bVariable, cVariable ]));
    });

    QUnit.test('OR distribution', assert => {

        // Convert (a OR (b AND c)) to ((a OR b) AND (a OR c))
        const aVariable = new Variable('a');
        const bVariable = new Variable('b');
        const cVariable = new Variable('c');
        const bAndC = new Operator(OPERATOR_SYMBOLS.AND, [ bVariable, cVariable ]);
        const aOrBAndC = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bAndC ]);
        let aOrBAndCExpression = new PropositionExpression(aOrBAndC);

        manipulation.orDistribution(aOrBAndCExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable, cVariable ]));
        assert.strictEqual(
            aOrBAndCExpression.print(),
            `(a${discreteMathUtilities.orSymbol}b)${discreteMathUtilities.andSymbol}(a${discreteMathUtilities.orSymbol}c)`
        );

        // Different term order: b, a, c
        aOrBAndCExpression = new PropositionExpression(aOrBAndC);
        manipulation.orDistribution(aOrBAndCExpression, convertSymbolsToPropositionExpressions([ bVariable, aVariable, cVariable ]));
        assert.strictEqual(
            aOrBAndCExpression.print(),
            `(a${discreteMathUtilities.orSymbol}b)${discreteMathUtilities.andSymbol}(a${discreteMathUtilities.orSymbol}c)`
        );

        // Different term order: c, a, b
        aOrBAndCExpression = new PropositionExpression(aOrBAndC);
        manipulation.orDistribution(aOrBAndCExpression, convertSymbolsToPropositionExpressions([ cVariable, aVariable, bVariable ]));
        assert.strictEqual(
            aOrBAndCExpression.print(),
            `(a${discreteMathUtilities.orSymbol}c)${discreteMathUtilities.andSymbol}(a${discreteMathUtilities.orSymbol}b)`
        );

        // Convert NOT(a OR (b AND c)) to NOT((a OR b) AND (a OR c))
        const notAOrBAndC = new Operator(OPERATOR_SYMBOLS.NOT, [ aOrBAndC ]);
        let notAOrBAndCExpression = new PropositionExpression(notAOrBAndC);

        manipulation.orDistribution(notAOrBAndCExpression, convertSymbolsToPropositionExpressions([ aVariable, bVariable, cVariable ]));
        assert.strictEqual(
            notAOrBAndCExpression.print(),
            `${discreteMathUtilities.notSymbol}((a${discreteMathUtilities.orSymbol}b)${discreteMathUtilities.andSymbol}` +
            `(a${discreteMathUtilities.orSymbol}c))`
        );

        // Must have three sub-expressions
        aOrBAndCExpression = new PropositionExpression(aOrBAndC);
        assert.ok(errorOccursDuringManipulation('orDistribution', aOrBAndCExpression, [ aVariable ]));
        assert.ok(errorOccursDuringManipulation('orDistribution', aOrBAndCExpression, [ aVariable, bVariable ]));

        // Two sub-expressions should be connected
        notAOrBAndCExpression = new PropositionExpression(notAOrBAndC);
        assert.ok(errorOccursDuringManipulation('orDistribution', notAOrBAndCExpression, [ aVariable, bVariable, aOrBAndC ]));

        // Two sub-expressions should be connected by an AND operator.
        const bOrC = new Operator(OPERATOR_SYMBOLS.OR, [ bVariable, cVariable ]);
        const aOrBOrC = new Operator(OPERATOR_SYMBOLS.OR, [ aVariable, bOrC ]);
        const aOrBOrCExpression = new PropositionExpression(aOrBOrC);

        assert.ok(errorOccursDuringManipulation('orDistribution', aOrBOrCExpression, [ aVariable, bVariable, cVariable ]));

        // Two sub-expressions connected by AND operator should have grandparent OR operator.
        const aAndBAndC = new Operator(OPERATOR_SYMBOLS.AND, [ aVariable, bAndC ]);
        const aAndBAndCExpression = new PropositionExpression(aAndBAndC);

        assert.ok(errorOccursDuringManipulation('orDistribution', aAndBAndCExpression, [ aVariable, bVariable, cVariable ]));
    });

    QUnit.test('Complement TRUE', assert => {

        // Convert (NOT T) to F
        let notT = new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.TRUE) ]);
        const notTExpression = new PropositionExpression(notT);

        manipulation.complementTrue(notTExpression, convertSymbolsToPropositionExpressions([ notT ]));
        assert.strictEqual(notTExpression.print(), 'F');

        // Convert ((a AND b) OR (a AND NOT T)) to ((a AND b) OR (a AND F))
        notT = new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.TRUE) ]);
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ new Variable('a'), new Variable('b') ]);
        const aAndBOrAAndNotTrue = new Operator(OPERATOR_SYMBOLS.OR, [
            aAndB,
            new Operator(OPERATOR_SYMBOLS.AND, [ new Variable('a'), notT ]),
        ]);
        let aAndBOrAAndNotTrueExpression = new PropositionExpression(aAndBOrAAndNotTrue);

        manipulation.complementTrue(aAndBOrAAndNotTrueExpression, convertSymbolsToPropositionExpressions([ notT ]));
        assert.strictEqual(
            aAndBOrAAndNotTrueExpression.print(),
            `(a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.orSymbol}(a${discreteMathUtilities.andSymbol}F)`
        );

        // Must have 1 sub-expression
        aAndBOrAAndNotTrueExpression = new PropositionExpression(aAndBOrAAndNotTrue);
        assert.ok(errorOccursDuringManipulation('complementTrue', aAndBOrAAndNotTrueExpression, [ notT, aAndB ]));

        // Sub-expression must start with NOT operator
        const trueSymbol = new Constant(CONSTANT_SYMBOLS.TRUE);
        const trueSymbolExpression = new PropositionExpression(trueSymbol);

        assert.ok(errorOccursDuringManipulation('complementTrue', trueSymbolExpression, [ trueSymbol ]));
        assert.ok(errorOccursDuringManipulation('complementTrue', aAndBOrAAndNotTrueExpression, [ aAndB ]));

        // Sub-expression's NOT operator must be followed by a TRUE symbol.
        const notF = new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.FALSE) ]);
        const notFExpression = new PropositionExpression(notF);

        assert.ok(errorOccursDuringManipulation('complementTrue', notFExpression, [ notF ]));

        const notA = new Operator(OPERATOR_SYMBOLS.NOT, [ new Variable('a') ]);
        const notAExpression = new PropositionExpression(notA);

        assert.ok(errorOccursDuringManipulation('complementTrue', notAExpression, [ notA ]));
    });

    QUnit.test('Complement FALSE', assert => {

        // Convert (NOT F) to T
        let notF = new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.FALSE) ]);
        const notFExpression = new PropositionExpression(notF);

        manipulation.complementFalse(notFExpression, convertSymbolsToPropositionExpressions([ notF ]));
        assert.strictEqual(notFExpression.print(), 'T');

        // Convert ((a AND b) OR (a AND NOT F)) to ((a AND b) OR (a AND T))
        notF = new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.FALSE) ]);
        const aAndB = new Operator(OPERATOR_SYMBOLS.AND, [ new Variable('a'), new Variable('b') ]);
        const aAndBOrAAndNotFalse = new Operator(OPERATOR_SYMBOLS.OR, [
            aAndB,
            new Operator(OPERATOR_SYMBOLS.AND, [ new Variable('a'), notF ]),
        ]);
        let aAndBOrAAndNotFalseExpression = new PropositionExpression(aAndBOrAAndNotFalse);

        manipulation.complementFalse(aAndBOrAAndNotFalseExpression, convertSymbolsToPropositionExpressions([ notF ]));
        assert.strictEqual(
            aAndBOrAAndNotFalseExpression.print(),
            `(a${discreteMathUtilities.andSymbol}b)${discreteMathUtilities.orSymbol}(a${discreteMathUtilities.andSymbol}T)`
        );

        // Must have 1 sub-expression
        aAndBOrAAndNotFalseExpression = new PropositionExpression(aAndBOrAAndNotFalse);
        assert.ok(errorOccursDuringManipulation('complementFalse', aAndBOrAAndNotFalseExpression, [ notF, aAndB ]));

        // Sub-expression must start with NOT operator
        const falseSymbol = new Constant(CONSTANT_SYMBOLS.FALSE);
        const falseSymbolExpression = new PropositionExpression(falseSymbol);

        assert.ok(errorOccursDuringManipulation('complementFalse', falseSymbolExpression, [ falseSymbol ]));
        assert.ok(errorOccursDuringManipulation('complementFalse', aAndBOrAAndNotFalseExpression, [ aAndB ]));

        // Sub-expression's NOT operator must be followed by a FALSE symbol.
        const notT = new Operator(OPERATOR_SYMBOLS.NOT, [ new Constant(CONSTANT_SYMBOLS.TRUE) ]);
        const notTExpression = new PropositionExpression(notT);

        assert.ok(errorOccursDuringManipulation('complementFalse', notTExpression, [ notT ]));

        const notA = new Operator(OPERATOR_SYMBOLS.NOT, [ new Variable('a') ]);
        const notAExpression = new PropositionExpression(notA);

        assert.ok(errorOccursDuringManipulation('complementFalse', notAExpression, [ notA ]));
    });
}
