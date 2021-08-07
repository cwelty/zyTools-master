'use strict';

/* global Circle */

$(document).ready(() => {
    const numRows = 4;
    const numCols = 4;
    const $container = $('<div>');
    const circle1 = new Circle([ 0, 1 ], 'green', numRows, numCols, $container);
    const circleProperties = [ 'cellIndices', 'color', 'numRows', 'numCols', 'totalCells', '$container', 'minterm',
                               'drawCircle', 'addAuxCircle' ];

    // Test all the LevelTemplate properties are present
    QUnit.test('Circle properties.', assert => {
        circleProperties.forEach(property => assert.ok(property in circle1));

        assert.strictEqual(typeof circle1.drawCircle, 'function');
        assert.strictEqual(typeof circle1.addAuxCircle, 'function');
        assert.equal(circle1.totalCells, numRows * numCols);
    });
});
