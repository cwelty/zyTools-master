/* global Question */
'use strict';

$(document).ready(() => {

    // Create a progression tool instance.
    const question = new Question();

    // Test if tool properties exist.
    const properties = [
        'expectedAnswer',
        'explanation',
        'placeholder',
        'prompt',
        'validAnswerExplanation',
    ];

    QUnit.test('Question Tool Creation', assert => {
        properties.forEach(testProperty => assert.ok((testProperty in question), `Question has property ${testProperty}`));
    });
});
