'use strict';

/* global ProgressionTool, toType */

$(document).ready(() => {

    // Create a progression tool instance.
    const progressionToolCreationTest = new ProgressionTool();

    // Test if tool properties exist.
    const progressionToolProperties = [ 'init', 'reset', 'check' ];

    QUnit.test('Progression Tool Creation', assert => {
        progressionToolProperties.forEach(testProperty => {
            assert.ok(progressionToolCreationTest.hasOwnProperty(testProperty), `Progression tool has property ${testProperty}`);
            assert.equal(
                toType(progressionToolCreationTest[testProperty]),
                'function',
                `Progression tool property ${testProperty} is a function`
            );
        });
    });
});
