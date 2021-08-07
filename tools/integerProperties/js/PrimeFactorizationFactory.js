/*
    PrimeFactorizationFactory inherits Questions with expressions like: gcd(147, 315)
    |utilities| is required and the utilities zyTool.
    |expressionTemplate| and |explanationTemplate| are required and a functions.
*/
function PrimeFactorizationFactory(utilities, expressionTemplate, explanationTemplate) {
    this.explanationTemplate = explanationTemplate;
    this.expressionTemplate = expressionTemplate;
    this.numberOfQuestions = 4;
    this.utilities = utilities;
}

/*
    Build the prototype for |PrimeFactorizationFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForPrimeFactorizationFactory() {
    PrimeFactorizationFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    PrimeFactorizationFactory.prototype.constructor = PrimeFactorizationFactory;

    /*
        Return a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    PrimeFactorizationFactory.prototype.make = function(currentQuestionNumber) {
        var threeBases = this.utilities.pickNElementsFromArray([ 2, 3, 5, 7 ], 3);
        threeBases.sort();

        // Choose exponent values.
        var firstExponents;
        var secondExponents;
        switch (currentQuestionNumber) {
            // Small exponent values.
            case 0:
            case 2:
                firstExponents = [ 0, 1, 2 ];
                secondExponents = [ 1, 1, 2 ];
                break;
            // Large exponent values.
            case 1:
            case 3:
                firstExponents = [ 1, 6, 7 ];
                secondExponents = [ 3, 4, 5 ];
                break;
        }

        // Build two Factors.
        this.utilities.shuffleArray(firstExponents);
        var firstFactors = new Factors(threeBases, firstExponents, this.utilities);
        this.utilities.shuffleArray(secondExponents);
        var secondFactors = new Factors(threeBases, secondExponents, this.utilities);

        // Refactored values used multiple times below.
        var firstFactorValue = firstFactors.getValue();
        var secondFactorValue = secondFactors.getValue();

        var answerExponents = null;
        var functionName;
        var explanation;
        switch (currentQuestionNumber) {
            /*
                Ex: gcd(147, 315)
                    147 = 3 * 7^2
                    315 = 3^2 * 5 * 7^2
            */
            case 0:
            case 1:
                // Compute the GCD of |firstFactors| and |secondFactors|.
                answerExponents = firstFactors.map(function(firstFactor, index) {
                    return Math.min(firstFactor.exponent, secondFactors[index].exponent);
                });

                functionName = 'gcd';
                explanation = 'Take the minimum of each base\'s exponent:';
                break;

            /*
                Ex: 147 = 3 * 7^2
                    315 = 3^2 * 5 * 7^2
                    lcm(147, 315)
            */
            case 2:
            case 3:
                // Compute the LCM of |firstFactors| and |secondFactors|.
                answerExponents = firstFactors.map(function(firstFactor, index) {
                    return Math.max(firstFactor.exponent, secondFactors[index].exponent);
                });

                functionName = 'lcm';
                explanation = 'Take the maximum of each base\'s exponent:';
                break;
        }

        var display = this.expressionTemplate({
            functionName:        functionName,
            firstFactorValue:    firstFactorValue,
            firstFactorDisplay:  firstFactors.display(),
            secondFactorValue:   secondFactorValue,
            secondFactorDisplay: secondFactors.display(),
        });

        var answerFactors = new Factors(threeBases, answerExponents, this.utilities);
        var expectedAnswer = String(answerFactors.getValue());

        var explanationHTML = this.explanationTemplate({
            firstFactorValue:            firstFactorValue,
            firstFactorCompleteDisplay:  firstFactors.display(true),
            secondFactorValue:           secondFactorValue,
            secondFactorCompleteDisplay: secondFactors.display(true),
            functionName:                functionName,
            thirdFactorCompleteDisplay:  answerFactors.display(true),
            thirdFactorDisplay:          answerFactors.display()
        });
        explanation += explanationHTML;

        return new PrimeFactorizationQuestion(expectedAnswer, explanation, display, this.utilities);
    };
}
