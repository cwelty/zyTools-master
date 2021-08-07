/*
    PrimeFactorizationQuestion inherits Question.
    |expectedAnswer|, |explanationTemplate|, |display| are required strings.
    |utilities| is required and the utilities zyTool.
*/
function PrimeFactorizationQuestion(expectedAnswer, explanationTemplate, display, utilities) {
    this.display = display;
    this.expectedAnswer = expectedAnswer;
    this.explanationTemplate = explanationTemplate;
    this.inputWidthSize = 'medium';
    this.instructions = 'Compute the prime factorization of:';
    this.placeholderText = 'Ex: 2^3 * 3';
    this.utilities = utilities;
    this.validAnswerExplanation = 'A valid answer contains factors. Ex: 2^3 * 3';
}

/*
    Build the prototype for |PrimeFactorizationQuestion|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForPrimeFactorizationQuestion() {
    PrimeFactorizationQuestion.prototype = require('singleInputQuestionProgressionTool').getNewQuestion();
    PrimeFactorizationQuestion.prototype.constructor = PrimeFactorizationQuestion;

    /*
        Return whether |userAnswer| matches the |expectedAnswer|.
        A user answer may be either a number or a factor expression, such as: 3^2 * 5.
        |userAnswer| is required and a string.
    */
    PrimeFactorizationQuestion.prototype.isCorrect = function(userAnswer) {
        // Convert |userAnswer| into Factors. Ex: 7^3 * 3^2.
        var factorStrings = userAnswer.split('*');
        var bases = [];
        var exponents = [];
        factorStrings.forEach(function(factorString) {
            // |factorString| has a base and exponenent. Ex: 7^3
            if ((/^.*\^.*$/).test(factorString)) {
                var splitFactorString = factorString.split('^');
                bases.push(parseInt(splitFactorString[0]));
                exponents.push(parseInt(splitFactorString[1]));
            }
            // |factorString| is just a base. Ex: 7. So the exponent is 1.
            else {
                bases.push(parseInt(factorString));
                exponents.push(1);
            }
        });

        var factors = new Factors(bases, exponents, this.utilities);
        return (String(factors.getValue()) === this.expectedAnswer);
    };

    /*
        Return whether the |userAnswer| contains a product of factors. Ex: 4^2 * 5^4 * 7
        |userAnswer| is required and a string.
    */
    PrimeFactorizationQuestion.prototype.isInputFormatValid = function(userAnswer) {
        // Each factor is separated by a *.
        var factorStrings = userAnswer.split('*');

        /*
            A factor starts with a number and an optional exponent. Ex:
                * Without exponent (ex: 4) is: \d+
                * With exponent (ex: 4^2) is: \d+\^\d+

            Since the exponent is optional, the regex is: \d+(\^\d+)?
        */
        var factorRegEx = /^\d+(\^\d+)?$/;

        // Returns true if every factorString matches our criteria.
        return factorStrings.every(function(factorString) {
            return factorRegEx.test(factorString);
        });
    };
}
