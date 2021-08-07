/*
    CountingPossibilitiesQuestion inherits Question.
    |expectedAnswer|, |explanationTemplate|, |display| are required strings.
    |bigNumberMath| is required and a math library.
*/
function CountingPossibilitiesQuestion(expectedAnswer, explanationTemplate, display, bigNumberMath) {
    this.bigNumberMath = bigNumberMath;
    this.display = display;
    this.expectedAnswer = expectedAnswer;
    this.explanationTemplate = explanationTemplate;
    this.helperInstructions = '';
    this.helperInstructionClass = 'one-liner';
    this.instructions = '';
    this.placeholderText = '';
}

/*
    Build the prototype for |CountingPossibilitiesQuestion|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
    |printValue| is a required function.
*/
function buildPrototypeForCountingPossibilitiesQuestion(printValue) {
    CountingPossibilitiesQuestion.prototype = require('singleInputQuestionProgressionTool').getNewQuestion();
    CountingPossibilitiesQuestion.prototype.constructor = CountingPossibilitiesQuestion;
    CountingPossibilitiesQuestion.prototype.printValue = printValue;

    /*
        Return whether the |userAnswer| successfully evaluates.
        |userAnswer| is required and a string.
    */
    CountingPossibilitiesQuestion.prototype.isInputFormatValid = function(userAnswer) {
        try {
            var userAnswerEvaluated = this.bigNumberMath.eval(userAnswer);

            // A valid user's answer evaluates to a number of type BigNumber.
            if ((typeof userAnswerEvaluated === 'object') && !!userAnswerEvaluated.isNaN && !userAnswerEvaluated.isNaN()) {
                return true;
            }
            else {
                this.validAnswerExplanation = 'Your answer does not evaluate to a numerical value';
                return false;
            }
        }
        catch (error) {
            switch (error.message) {
                /*
                    Error message for C(n, k) when first value is negative.
                    Notice the spelling error: enpected
                */
                case 'Positive integer value enpected in function combinations':
                    this.validAnswerExplanation = 'Positive integer value expected in function combinations';
                    break;
                // Error message for C(n, k)
                case 'k must be less than or equal to n':
                    this.validAnswerExplanation = 'For C(n, k), ' + error.message;
                    break;

                // Error message for P(n, k)
                case 'second argument k must be less than or equal to first argument n':
                    this.validAnswerExplanation = 'For P(n, k), k must be less than or equal to n';
                    break;

                default:
                    /*
                        Some errors specify a character location where the error is.
                        Ex: The input 2^^3 generates: Value expected (char 3)
                        We can improve that message by converting the (char 3) to: at character 3
                    */
                    var errorMessage = error.message.replace(/\(char (\d+)\)/, 'at character $1');

                    this.validAnswerExplanation = errorMessage;
                    break;
            }

            return false;
        }
    };

    /*
        Return whether |userAnswer| and |expectedAnswer| have equivalent math values.
        |userAnswer| is required and a string.
    */
    CountingPossibilitiesQuestion.prototype.isCorrect = function(userAnswer) {
        var userAnswerEvaluated = this.bigNumberMath.eval(userAnswer);
        var expectedAnswerEvaluated = this.bigNumberMath.eval(this.expectedAnswer);
        return this.bigNumberMath.equal(userAnswerEvaluated, expectedAnswerEvaluated);
    };

    /*
        Return an explanation replacing instances of USER_ANSWER in |explanationTemplate| with |userAnswer|.
        |userAnswer| is required and a string.
    */
    CountingPossibilitiesQuestion.prototype.getExplanation = function(userAnswer) {
        /*
            Evaluate |userAnswer| to a number.
            If evaluation is positive/negative infinity, then say the value is too large to display.
        */
        var userAnswerEvaluated = this.bigNumberMath.eval(userAnswer);
        if ((userAnswerEvaluated === Number.POSITIVE_INFINITY) || (userAnswerEvaluated === Number.NEGATIVE_INFINITY)) {
            userAnswerEvaluated = 'Too large to display';
        }
        else {
            userAnswerEvaluated = this.printValue(userAnswerEvaluated);
        }

        return this.explanationTemplate.replace(/USER_ANSWER/g, userAnswerEvaluated);
    };
}
