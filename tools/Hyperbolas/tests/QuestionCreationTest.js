/* global Question */
'use strict';

$(document).ready(() => {

    // Create a progression tool instance.
    const question = new Question({ expectedAnswer: 'Test expected answer.',
                                    explanation: 'Test explanation.',
                                    placeholder: 'Test placeholder.',
                                    prompt: 'Test prompt.' });

    // Test if tool properties exist.
    const properties = [
        'expectedAnswer',
        'explanation',
        'inputPostfix',
        'inputPrefix',
        'needScratchPad',
        'placeholder',
        'prompt',
        'validAnswerExplanation',
    ];

    QUnit.test('Question Tool Creation', assert => {
        properties.forEach(testProperty => assert.ok((testProperty in question), `Question has property ${testProperty}`));
    });
});
