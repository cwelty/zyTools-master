/* global Question, QuestionFactory */
/* eslint linebreak-style:0 */
'use strict';

$(document).ready(function QuestionFactoryCreationTests() {

    // Test if tool properties exist.
    var properties = [ 'numberOfQuestions', 'make' ];

    var questionFactory = new QuestionFactory();

    QUnit.test('QuestionFactory creation', function(assert) {
        properties.forEach(function(testProperty) {
            assert.ok((testProperty in questionFactory));
        });
    });

    // Test make function for each supported question number.
    QUnit.test('QuestionFactory make', function(assert) {
        for (var index = 0; index < questionFactory.numberOfQuestions; ++index) {
            var question = questionFactory.make(index);

            assert.ok(question instanceof Question);
        }
    });
});
