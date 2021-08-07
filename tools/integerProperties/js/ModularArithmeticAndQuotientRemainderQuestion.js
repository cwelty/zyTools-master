/*
    ModularArithmeticAndQuotientRemainderQuestion inherits Question.
    |expectedAnswer|, |explanationTemplate|, |display| are required strings.
    |utilities| is required and the utilities zyTool.
*/
function ModularArithmeticAndQuotientRemainderQuestion(expectedAnswer, explanationTemplate, display, utilities) {
    this.display = display;
    this.expectedAnswer = expectedAnswer;
    this.explanationTemplate = explanationTemplate;
    this.inputWidthSize = 'small';
    this.instructions = 'Compute the value of:';
    this.placeholderText = 'Ex: 4';
    this.utilities = utilities;
    this.validAnswerExplanation = 'A valid answer contains only numbers. Ex: 4';
}

/*
    Build the prototype for |ModularArithmeticAndQuotientRemainderQuestion|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForModularArithmeticAndQuotientRemainderQuestion() {
    ModularArithmeticAndQuotientRemainderQuestion.prototype = require('singleInputQuestionProgressionTool').getNewQuestion();
    ModularArithmeticAndQuotientRemainderQuestion.prototype.constructor = ModularArithmeticAndQuotientRemainderQuestion;

    /*
        Return whether the |userAnswer| contains only numbers.
        |userAnswer| is required and a string.
    */
    ModularArithmeticAndQuotientRemainderQuestion.prototype.isInputFormatValid = function(userAnswer) {
        return /^-?\d+$/.test(userAnswer);
    };
}
