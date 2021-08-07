/*
    CountingPossibilitiesQuestionFactory inherits QuestionFactory.
    |utilities| is required and the utilities zyTool.
    |userAndExpectedAnswerDiffTemplate| is required and a function.
    |bigNumberMath| is required and a math library.
*/
function CountingPossibilitiesQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath) {
    this.numberOfQuestions = 1;
    this.userAndExpectedAnswerDiffTemplate = userAndExpectedAnswerDiffTemplate;
    this.utilities = utilities;
    this.bigNumberMath = bigNumberMath;
}

/*
    Build the prototype for |CountingPossibilitiesQuestionFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
    |printValue| is a required function.
*/
function buildPrototypeForCountingPossibilitiesQuestionFactory(printValue) {
    CountingPossibilitiesQuestionFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    CountingPossibilitiesQuestionFactory.prototype.constructor = CountingPossibilitiesQuestionFactory;
    CountingPossibilitiesQuestionFactory.prototype.printValue = printValue;

    /*
        Return the user answer and |expectedAnswer| diff to be appended to the explanation.
        |expectedAnswer| is required and a string.
    */
    CountingPossibilitiesQuestionFactory.prototype.userAndExpectedAnswerDiffExplanation = function(expectedAnswer) {
        var expectedAnswerEvaluated = this.printValue(this.bigNumberMath.eval(expectedAnswer));
        return this.userAndExpectedAnswerDiffTemplate({
            expectedAnswer: expectedAnswerEvaluated
        });
    };
}
