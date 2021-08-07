/**
    Structure to store an expected answer.
    @class ExpectedAnswer
    @constructor
    @param {Array} of {String} expectedSet The expected set of elements for the answer.
    @param {String} explanation The explanation for this answer.
*/
function ExpectedAnswer(expectedSet, explanation) {
    this.expectedSet = expectedSet;
    this.explanation = explanation;
}
