'use strict';

/* global KMapSimulator */

$(document).ready(() => {
    const kMap = new KMapSimulator();
    const kMapProperties = [ 'templates', 'css', 'id', '$tool', 'parentResource', 'listOfColors', 'utilities', 'numRows', 'numCols',
        'numberOfVariables', 'activeCells', 'variables', 'circles', 'cellsInCircles', '$circleContainer', '$deselectButton',
        'init', 'cellClicked', 'updateCirclesDrawn', 'areGivenCellsActive', 'checkVariableCombination' ];

    // Test all the LevelTemplate properties are present
    QUnit.test('KMapSimulator properties.', assert => {
        kMapProperties.forEach(property => assert.ok(property in kMap, `${property} is a KMapSimulator property.`));

        assert.strictEqual(typeof kMap.init, 'function');
        assert.strictEqual(typeof kMap.cellClicked, 'function');
        assert.strictEqual(typeof kMap.updateCirclesDrawn, 'function');
        assert.strictEqual(typeof kMap.areGivenCellsActive, 'function');
        assert.strictEqual(typeof kMap.checkVariableCombination, 'function');
    });

    const invalidOptions = { numberOfVariables: 2 };
    const invalidOptions2 = { numberOfVariables: 5 };

    QUnit.test('Small or big number of variables throw errors', assert => {
        assert.throws(() => new KMapSimulator().init(0, null, invalidOptions));
        assert.throws(() => new KMapSimulator().init(0, null, invalidOptions2));
    });

    const defaultNumberOfVariables = 3;

    QUnit.test('3 variable k-map', assert => {
        const kMap3Variable = new KMapSimulator();

        kMap3Variable.init(0, null, {});

        assert.equal(kMap3Variable.numberOfVariables, defaultNumberOfVariables);
        assert.equal(kMap3Variable.numCols, 4); // eslint-disable-line no-magic-numbers
        assert.equal(kMap3Variable.numRows, 2); // eslint-disable-line no-magic-numbers
        assert.deepEqual(kMap3Variable.activeCells, require('utilities').createArrayOfSizeN(8).map(() => false)); // eslint-disable-line no-magic-numbers

        const expectedVariables = [ 'a', 'b', 'c' ];

        kMap3Variable.variables.forEach((variable, index) => {
            assert.equal(variable.variable, expectedVariables[index]);
        });
    });

    const fourVariableOptions = { numberOfVariables: 4 };

    QUnit.test('4 variable k-map', assert => {
        const kMap4Variable = new KMapSimulator();

        kMap4Variable.init(0, null, fourVariableOptions);

        assert.equal(kMap4Variable.numberOfVariables, 4); // eslint-disable-line no-magic-numbers
        assert.equal(kMap4Variable.numCols, 4); // eslint-disable-line no-magic-numbers
        assert.equal(kMap4Variable.numRows, 4); // eslint-disable-line no-magic-numbers
        assert.deepEqual(kMap4Variable.activeCells, require('utilities').createArrayOfSizeN(16).map(() => false)); // eslint-disable-line no-magic-numbers

        const expectedVariables = [ 'a', 'b', 'c', 'd' ];

        kMap4Variable.variables.forEach((variable, index) => {
            assert.equal(variable.variable, expectedVariables[index]);
        });
    });
});
