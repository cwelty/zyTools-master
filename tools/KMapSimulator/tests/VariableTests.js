'use strict';

/* global Variable, NotVariable */

$(document).ready(() => {
    const aVariable = new Variable('a');
    const variableProperties = [ 'variable', 'trueCells', 'falseCells', 'initializeCells', 'trueCellsIntersection' ];

    // Test all the LevelTemplate properties are present
    QUnit.test('Variable properties.', assert => {
        variableProperties.forEach(property => assert.ok(property in aVariable));

        assert.strictEqual(typeof aVariable.initializeCells, 'function');
        assert.strictEqual(typeof aVariable.trueCellsIntersection, 'function');
    });

    const possibleNumberOfVariables = [ 3, 4 ]; // eslint-disable-line no-magic-numbers
    const possibleVariableIndex = [ 0, 1, 2, 3 ]; // eslint-disable-line no-magic-numbers

    QUnit.test('Number of |trueCells| and |falseCells| in |Variable| is correct.', assert => {
        possibleNumberOfVariables.forEach(numberOfVariables => {
            possibleVariableIndex.forEach(variableIndex => {
                if (numberOfVariables === 3 && variableIndex === 3) { // eslint-disable-line no-magic-numbers
                    return;
                }
                aVariable.initializeCells(variableIndex, numberOfVariables);
                const numberOfCellsForVariable = Math.pow(2, numberOfVariables) / 2; // eslint-disable-line no-magic-numbers

                assert.strictEqual(aVariable.trueCells.length, numberOfCellsForVariable);
                assert.strictEqual(aVariable.falseCells.length, numberOfCellsForVariable);
            });
        });
    });

    // Test NotVariable.
    const notAVariable = new NotVariable(aVariable);
    const notVariableProperties = [ 'variable', 'trueCells', 'falseCells', 'trueCellsIntersection' ];

    // Test all the LevelTemplate properties are present
    QUnit.test('Variable properties.', assert => {
        notVariableProperties.forEach(property => assert.ok(property in aVariable));

        assert.strictEqual(typeof aVariable.trueCellsIntersection, 'function');
    });

    QUnit.test('|trueCells| and |falseCells| in |NotVariable| are the inverse of |Variable|.', assert => {
        assert.deepEqual(notAVariable.trueCells, aVariable.falseCells);
        assert.deepEqual(notAVariable.falseCells, aVariable.trueCells);
    });
});
