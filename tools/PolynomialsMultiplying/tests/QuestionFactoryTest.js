/* global Question, QuestionFactory */
'use strict';

$(document).ready(() => {

    // Test if tool properties exist.
    const properties = [ 'numberOfQuestions', 'make' ];

    const questionFactory = new QuestionFactory();

    QUnit.test('QuestionFactory creation', assert => {
        properties.forEach(testProperty => assert.ok(testProperty in questionFactory));
    });

    // Test make function for each supported question number.
    QUnit.test('QuestionFactory make', assert => {
        for (let index = 0; index < questionFactory.numberOfQuestions; ++index) {
            const question = questionFactory.make(index);

            assert.ok(question instanceof Question);
        }
    });
});
