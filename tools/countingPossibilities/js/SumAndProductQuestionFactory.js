/*
    SumAndProductQuestionFactory inherits CountingPossibilitiesQuestionFactory.
    See CountingPossibilitiesQuestionFactory for details.
*/
function SumAndProductQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath) {
    CountingPossibilitiesQuestionFactory.prototype.constructor.call(this, utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);

    this.helperInstructions = 'Write a<sup>b</sup> as: a^b';
    this.instructions = 'Each character in a password is either a digit [0-9] or '
                            + 'lowercase letter [a-z]. How many valid passwords are there with '
                            + 'the given restriction(s)?';
    this.numberOfQuestions = 5;
    this.placeholderText = 'Ex: 26 * 36^21';
}

/*
    Build the prototype for |SumAndProductQuestionFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForSumAndProductQuestionFactory() {
    SumAndProductQuestionFactory.prototype = new CountingPossibilitiesQuestionFactory();
    SumAndProductQuestionFactory.prototype.constructor = SumAndProductQuestionFactory;

    /*
        Return a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    SumAndProductQuestionFactory.prototype.make = function(currentQuestionNumber) {
        // Pick two password lengths between 8 and 20. The password lengths are not be the same.
        var passwordLength1 = this.utilities.pickNumberInRange(8, 20);
        var passwordLength2 = this.utilities.pickNumberInRange(8, 20, [ passwordLength1 ]);

        var display = '';
        var expectedAnswer = [];
        var explanation = '';
        switch (currentQuestionNumber) {
            case 0:
                display = 'Length is ' + passwordLength1 + '.';
                expectedAnswer = '36^' + passwordLength1;
                explanation = 'Each character has 36 possibilities: ' + expectedAnswer;
                break;
            case 1:
                display = 'Length is ' + passwordLength1 + ' or ' + passwordLength2 + '.';
                expectedAnswer = '36^' + passwordLength1 + ' + 36^' + passwordLength2;
                explanation = 'Each character has 36 possibilities: A<sub>' + passwordLength1
                               + '</sub> U A<sub>' + passwordLength2 + '</sub> = ' + expectedAnswer;
                break;
            case 2:
                display = 'Length is ' + passwordLength1 + ' and cannot start with a digit.';
                expectedAnswer = '26 * 36^' + (passwordLength1 - 1);
                explanation = 'The first character only has 26 possibilities: ' + expectedAnswer;
                break;
            case 3:
                display = 'Length is ' + passwordLength1 + ' and cannot start nor end with a digit.';
                expectedAnswer = '26^2 * 36^' + (passwordLength1 - 2);
                explanation = 'The start and end characters only have 26 possibilities: ' + expectedAnswer;
                break;
            case 4:
                display = 'Length is ' + passwordLength1 + ' or ' + passwordLength2
                               + ', and must start with a digit.';
                expectedAnswer = '10 * (36^' + (passwordLength1 - 1) + ' + 36^' + (passwordLength2 - 1) + ')';
                explanation = 'The first character has 10 possibilities: ' + expectedAnswer;
                break;
        }

        explanation += this.userAndExpectedAnswerDiffExplanation(expectedAnswer);

        return new SumAndProductQuestion(expectedAnswer, explanation, display, this.bigNumberMath);
    };
}
