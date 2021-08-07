/*
    ComplementsQuestion inherits CountingPossibilitiesQuestion.
    See CountingPossibilitiesQuestion for details.
*/
function ComplementsQuestion(expectedAnswer, explanationTemplate, display, bigNumberMath) {
    CountingPossibilitiesQuestion.prototype.constructor.call(this, expectedAnswer, explanationTemplate, display, bigNumberMath);

    this.helperInstructions = 'Write combination as: C(n, k)';
    this.instructions = '';
    this.placeholderText = 'Ex: 26 * C(36, 12)';
}

/*
    Build the prototype for |ComplementsQuestion|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForComplementsQuestion() {
    ComplementsQuestion.prototype = new CountingPossibilitiesQuestion();
    ComplementsQuestion.prototype.constructor = ComplementsQuestion;
}
