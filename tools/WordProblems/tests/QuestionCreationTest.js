$(document).ready(function QuestionCreationTests() {
    // Create a progression tool instance.
    var question = new Question();

    // Test if tool properties exist.
    var properties = [
        'prompt',
        'expectedAnswer',
        'explanation',
        'validAnswerExplanation',
        'placeholder',
        'answerIsNumber',
        'inputPrefix',
        'inputPostfix',
        'isInputFormatValid',
        'isCorrect',
        'getExplanation'
    ];

    QUnit.test( 'Question Tool Creation', function(assert) {
        properties.forEach(function(testProperty) {
            assert.ok((testProperty in question), 'Question has property ' + testProperty);
        });
    });
});
