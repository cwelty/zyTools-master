/*
    PermutationsQuestion inherits CountingPossibilitiesQuestion.
    See CountingPossibilitiesQuestion for details.
*/
function PermutationsQuestion(expectedAnswer, explanationTemplate, display, bigNumberMath) {
    CountingPossibilitiesQuestion.prototype.constructor.call(this, expectedAnswer, explanationTemplate, display, bigNumberMath);

    this.helperInstructions = 'Write permutations as: P(n, k)';
    this.instructions = 'Each character in a password is either a digit [0-9] or '
                            + 'lowercase letter [a-z]. How many valid passwords are there with '
                            + 'the given restriction(s)?';
    this.placeholderText = 'Ex: P(11, 4) * P(4, 3)';
}

/*
    Build the prototype for |PermutationsQuestion|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForPermutationsQuestion() {
    PermutationsQuestion.prototype = new CountingPossibilitiesQuestion();
    PermutationsQuestion.prototype.constructor = PermutationsQuestion;
}
