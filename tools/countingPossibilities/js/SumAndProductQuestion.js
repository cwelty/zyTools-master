/*
    SumAndProductQuestion inherits CountingPossibilitiesQuestion.
    See CountingPossibilitiesQuestion for details.
*/
function SumAndProductQuestion(expectedAnswer, explanationTemplate, display, bigNumberMath) {
    CountingPossibilitiesQuestion.prototype.constructor.call(this, expectedAnswer, explanationTemplate, display, bigNumberMath);

    this.helperInstructions = 'Write a<sup>b</sup> as: a^b';
    this.instructions = 'Each character in a password is either a digit [0-9] or '
                            + 'lowercase letter [a-z]. How many valid passwords are there with '
                            + 'the given restriction(s)?';
    this.placeholderText = 'Ex: 26 * 36^21';
}

/*
    Build the prototype for |SumAndProductQuestion|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForSumAndProductQuestion() {
    SumAndProductQuestion.prototype = new CountingPossibilitiesQuestion();
    SumAndProductQuestion.prototype.constructor = SumAndProductQuestion;
}
