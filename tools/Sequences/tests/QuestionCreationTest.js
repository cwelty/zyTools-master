/* global Question */
/* eslint linebreak-style:0 */
'use strict';

$(document).ready(function QuestionCreationTests() {

    // Create a progression tool instance.
    var question = new Question();

    // Test if tool properties exist.
    var properties = [
        'expectedAnswer',
        'explanation',
        'placeholder',
        'prompt',
    ];

    QUnit.test('Question Tool Creation', function(assert) {
        properties.forEach(function(testProperty) {
            assert.ok((testProperty in question), 'Question has property ' + testProperty);
        });
    });
});
