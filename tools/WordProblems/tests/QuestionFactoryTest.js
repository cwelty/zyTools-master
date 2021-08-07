$(document).ready(function QuestionFactoryCreationTests() {
    // Question factories
    var questionFactoryClassNames = [ 'ConversionQuestionFactory', 'MotionQuestionFactory' ];

    // Test if tool properties exist.
    var properties = [ 'numberOfQuestions', 'make' ];

    questionFactoryClassNames.forEach(function(questionFactoryClassName) {
        var questionFactoryClass = eval(questionFactoryClassName);
        var questionFactory = new questionFactoryClass(
            function() { return ''; }, // Pseudo-getResourceURL function.
            function() { return ''; }  // Pseudo-HBS template function.
        );

        QUnit.test(questionFactoryClassName + ' creation', function(assert) {
            properties.forEach(function(testProperty) {
                assert.ok((testProperty in questionFactory));
            });
        });

        // Test make function for each supported question number.
        QUnit.test(questionFactoryClassName + ' make', function(assert) {
            for (var i = 0; i < questionFactory.numberOfQuestions; ++i) {
                var question = questionFactory.make(i);
                assert.ok(question instanceof Question);
            }
        });
    });
});
