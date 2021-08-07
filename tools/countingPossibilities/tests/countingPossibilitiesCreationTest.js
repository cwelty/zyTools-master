$(document).ready(function countingPossibilitiesCreationTests() {

    // Create a progression tool instance.
    var countingPossibilitiesCreationTest = new CountingPossibilitiesQuestion();

    // Test if tool properties exist.
    var countingPossibilitiesProperties = [ 'display', 'expectedAnswer', 'explanationTemplate', 'helperInstructions',
                                           'helperInstructionClass', 'instructions', 'placeholderText' ];
    QUnit.test( 'Counting Possibilities Tool Creation', function(assert) {
        countingPossibilitiesProperties.forEach(function(testProperty) {
            assert.ok(countingPossibilitiesCreationTest.hasOwnProperty(testProperty), 'Counting Possibilities tool has property ' + testProperty);
        });
    });
});
