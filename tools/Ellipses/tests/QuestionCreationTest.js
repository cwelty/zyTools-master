/* global Question */
'use strict';

$(document).ready(() => {

    // Create a progression tool instance.
    const question = new Question({ expectedAnswer: 'Expected Answer',
                                    explanation: 'Explanation',
                                    placeholder: 'Placeholder',
                                    prompt: 'Prompt' });

    // Test if tool properties exist.
    const properties = [
        'expectedAnswer',
        'explanation',
        'inputPostfix',
        'inputPrefix',
        'placeholder',
        'prompt',
        'validAnswerExplanation',
    ];

    QUnit.test('Question Tool Creation', assert => {
        properties.forEach(testProperty => assert.ok((testProperty in question), `Question has property ${testProperty}`));
    });
});
