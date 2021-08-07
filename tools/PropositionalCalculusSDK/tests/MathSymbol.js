'use strict';

/* global MathSymbol, Variable, Constant, Operator, CONSTANT_SYMBOLS, OPERATOR_SYMBOLS */
/* exported symbolTests */

/**
    Verify the given symbol has the expected properties.
    @method verifySymbolProperties
    @param {Object} assert QUnit object with functions for testing.
    @param {MathSymbol} symbol The symbol to test.
    @return {void}
*/
function verifySymbolProperties(assert, symbol) {
    var expectedProperties = {
        addMark: 'function',
        addMarkRecursive: 'function',
        clone: 'function',
        deepEquals: 'function',
        descendantHasSpecificMarkOrIsUnmarked: 'function',
        findAncestors: 'function',
        findCommonAncestor: 'function',
        findOperatorPaths: 'function',
        hasMark: 'function',
        hasSpecificMarkOrIsUnmarked: 'function',
        is: 'function',
        isOperator: 'function',
        isUnmarked: 'function',
        name: 'string',
        removeAllMarks: 'function',
        removeMark: 'function',
        removeMarkRecursive: 'function',
        findRootOfMark: 'function',
    };

    Object.keys(expectedProperties).forEach(function(key) {
        assert.equal(typeof symbol[key], expectedProperties[key]);
    });
}

/**
    Test the MathSymbol object and objects that inherit Symbol.
    @method symbolTests
    @return {void}
*/
function symbolTests() {
    QUnit.test('MathSymbol, Variable, and Constant', function(assert) {
        var xSymbol = new MathSymbol('x');

        assert.equal(typeof xSymbol.name, 'string');
        verifySymbolProperties(assert, xSymbol);
        assert.ok(xSymbol.findAncestors(xSymbol)[0].is(xSymbol));
        assert.ok(xSymbol.findCommonAncestor(xSymbol, xSymbol).is(xSymbol));

        var x2 = xSymbol;

        assert.ok(x2.is(xSymbol));

        var x3 = new MathSymbol('x');

        assert.ok(!x3.is(xSymbol));
        assert.ok(!x3.isOperator());

        // Test marking and unmarking of symbol.
        assert.ok(x3.hasSpecificMarkOrIsUnmarked());
        x3.addMark('t');
        assert.ok(x3.hasMark('t'));
        assert.ok(x3.hasSpecificMarkOrIsUnmarked('t'));
        assert.ok(!x3.hasSpecificMarkOrIsUnmarked('s'));
        assert.equal(x3.findRootOfMark('t'), x3);
        assert.equal(x3.findRootOfMark('s'), null);
        x3.removeMark('t');
        assert.ok(x3.hasSpecificMarkOrIsUnmarked());
        x3.addMarkRecursive('t');
        x3.removeMarkRecursive('t');
        assert.ok(x3.hasSpecificMarkOrIsUnmarked());

        xSymbol = new Variable('x');
        assert.equal(typeof xSymbol.name, 'string');
        verifySymbolProperties(assert, xSymbol);
        assert.ok(xSymbol.deepEquals(xSymbol.clone()));
        assert.ok(!xSymbol.findOperatorPaths());

        x2 = new Variable('x');
        assert.ok(x2.deepEquals(xSymbol));

        var trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);

        assert.equal(typeof trueConstant.name, 'string');
        verifySymbolProperties(assert, trueConstant);
    });

    QUnit.test('Operator test', function(assert) {

        // NOT a
        var aVariable = new Variable('a');
        var notA = new Operator(OPERATOR_SYMBOLS.NOT, [ aVariable ]);

        assert.strictEqual(notA.name, OPERATOR_SYMBOLS.NOT);
        assert.ok(notA.children[0] instanceof Variable);
        verifySymbolProperties(assert, notA);

        var paths = notA.findOperatorPaths();

        assert.equal(paths.length, 1);
        assert.equal(paths[0].length, 1);
        assert.equal(paths[0][0], notA);

        var aVariableAncestors = notA.findAncestors(aVariable);

        assert.ok(aVariableAncestors[0].is(notA));
        assert.ok(aVariableAncestors[1].is(aVariable));

        var notAAncestors = notA.findAncestors(notA);

        assert.ok(notAAncestors[0].is(notA));
        assert.ok(notA.findCommonAncestor(notA, aVariable).is(notA));

        // NOT false
        var falseValue = new Constant(CONSTANT_SYMBOLS.FALSE);
        var notFalse = new Operator(OPERATOR_SYMBOLS.NOT, [ falseValue ]);

        assert.strictEqual(notFalse.name, OPERATOR_SYMBOLS.NOT);
        assert.ok(notFalse.children[0] instanceof Constant);
        assert.ok(notFalse.isOperator());

        // x AND y
        var xVariable = new Variable('x');
        var yVariable = new Variable('y');
        var xAndY = new Operator(OPERATOR_SYMBOLS.AND, [ xVariable, yVariable ]);

        assert.strictEqual(xAndY.name, OPERATOR_SYMBOLS.AND);
        assert.ok(xAndY.children[0] instanceof Variable);
        assert.ok(xAndY.children[1] instanceof Variable);

        paths = xAndY.findOperatorPaths();
        assert.equal(paths.length, 1);
        assert.equal(paths[0].length, 1);
        assert.equal(paths[0][0], xAndY);

        // (x AND y) OR z
        var zVariable = new Variable('z');
        var xAndYOrZ = new Operator(OPERATOR_SYMBOLS.OR, [ xAndY, zVariable ]);

        assert.strictEqual(xAndYOrZ.name, OPERATOR_SYMBOLS.OR);
        assert.ok(xAndYOrZ.children[0] instanceof Operator);
        assert.ok(xAndYOrZ.children[1] instanceof Variable);

        paths = xAndYOrZ.findOperatorPaths();
        assert.equal(paths.length, 1);
        assert.equal(paths[0].length, 2); // eslint-disable-line no-magic-numbers
        assert.equal(paths[0][0], xAndYOrZ);
        assert.equal(paths[0][1], xAndY);

        // ((x AND y) OR z) AND (NOT a)
        var xAndYOrZAndNotA = new Operator(OPERATOR_SYMBOLS.AND, [ xAndYOrZ, notA ]);

        notAAncestors = xAndYOrZAndNotA.findAncestors(notA);
        assert.ok(xAndYOrZAndNotA.deepEquals(xAndYOrZAndNotA.clone()));

        assert.ok(notAAncestors[0].is(xAndYOrZAndNotA));
        assert.ok(notAAncestors[1].is(notA));
        assert.ok(xAndYOrZAndNotA.findCommonAncestor(notA, aVariable).is(notA));
        assert.ok(xAndYOrZAndNotA.isOperator());

        paths = xAndYOrZAndNotA.findOperatorPaths();
        assert.equal(paths.length, 2); // eslint-disable-line no-magic-numbers
        assert.equal(paths[0].length, 3); // eslint-disable-line no-magic-numbers
        assert.equal(paths[0][0], xAndYOrZAndNotA);
        assert.equal(paths[0][1], xAndYOrZ);
        assert.equal(paths[0][2], xAndY);
        assert.equal(paths[1].length, 2); // eslint-disable-line no-magic-numbers
        assert.equal(paths[1][0], xAndYOrZAndNotA);
        assert.equal(paths[1][1], notA);

        var yVariableAncestors = xAndYOrZAndNotA.findAncestors(yVariable);

        var expectedAncestors = [ xAndYOrZAndNotA, xAndYOrZ, xAndY, yVariable ];

        assert.equal(yVariableAncestors.length, expectedAncestors.length);
        expectedAncestors.forEach(function(expectedAncestor, index) {
            assert.ok(yVariableAncestors[index].is(expectedAncestor));
        });

        assert.ok(xAndYOrZAndNotA.findCommonAncestor(yVariable, aVariable).is(xAndYOrZAndNotA));
        assert.ok(xAndYOrZAndNotA.findCommonAncestor(yVariable, xVariable).is(xAndY));

        assert.strictEqual(xAndYOrZAndNotA.name, OPERATOR_SYMBOLS.AND);
        assert.ok(xAndYOrZAndNotA.children[0] instanceof Operator);
        assert.ok(xAndYOrZAndNotA.children[1] instanceof Operator);

        // Mark different parts of xAndYOrZAndNotA and test that marking reached children.
        assert.ok(xAndYOrZ.hasSpecificMarkOrIsUnmarked('1'));
        assert.ok(xAndYOrZ.descendantHasSpecificMarkOrIsUnmarked('1'));
        xAndYOrZ.addMarkRecursive('1');
        assert.equal(xAndYOrZAndNotA.findRootOfMark('1'), xAndYOrZ);
        assert.equal(xAndYOrZAndNotA.findRootOfMark('2'), null);
        notA.addMarkRecursive('2');
        assert.ok(!xAndY.hasSpecificMarkOrIsUnmarked('t'));
        assert.ok(!aVariable.hasSpecificMarkOrIsUnmarked('t'));
        assert.ok(!xAndYOrZAndNotA.descendantHasSpecificMarkOrIsUnmarked('1'));
        assert.equal(xAndYOrZAndNotA.findRootOfMark('2'), notA);
        xAndYOrZAndNotA.removeAllMarks();
        assert.ok(xAndY.hasSpecificMarkOrIsUnmarked('1'));
        assert.ok(aVariable.hasSpecificMarkOrIsUnmarked('1'));

        xAndYOrZAndNotA.addMarkRecursive('1');
        xAndYOrZ.removeMarkRecursive('1');
        assert.ok(!xAndYOrZ.hasMark('1'));
        assert.ok(xAndYOrZAndNotA.hasMark('1'));
        assert.ok(notA.hasMark('1'));
    });
}
