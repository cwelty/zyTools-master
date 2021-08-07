/*
    SubsetsQuestion inherits CountingPossibilitiesQuestion.
    See CountingPossibilitiesQuestion for details.
    |utilities| is required and the utilities zyTool.
*/
function SubsetsQuestion(expectedAnswer, explanationTemplate, display, bigNumberMath, utilities) {
    CountingPossibilitiesQuestion.prototype.constructor.call(this, expectedAnswer, explanationTemplate, display, bigNumberMath);

    this.utilities = utilities;
    this.helperInstructions = 'Write a<sup>b</sup> as: a^b' + this.utilities.getNewline()
                                + 'Write combination as: C(n, k)';
    this.helperInstructionClass = 'two-liner';
    this.instructions = 'A bit string contains 1\'s and 0\'s. How many different bit '
                                + 'strings can be constructed given the restriction(s)?';
    this.placeholderText = 'Ex: 2^40 or 26 * C(36, 12)';
}

/*
    Build the prototype for |SubsetsQuestion|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForSubsetsQuestion() {
    SubsetsQuestion.prototype = new CountingPossibilitiesQuestion();
    SubsetsQuestion.prototype.constructor = SubsetsQuestion;
}
