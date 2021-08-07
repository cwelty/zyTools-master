/*
    QuotientRemainderFactory inherits QuestionFactory for the equation: n = m * divisor + modulus
    |utilities| is required and the utilities zyTool.
*/
function QuotientRemainderFactory(utilities) {
    this.numberOfQuestions = 6;
    this.utilities = utilities;

    // Generate Carousels of Equation used in |generateQuestion|.
    this.generateLowValueEquationCarousel();
    this.generateHighValueEquationCarousel();
}

/*
    Build the prototype for |QuotientRemainderFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForQuotientRemainderFactory() {
    QuotientRemainderFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    QuotientRemainderFactory.prototype.constructor = QuotientRemainderFactory;

    /*
        Return a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    QuotientRemainderFactory.prototype.make = function(currentQuestionNumber) {
        // Get next equation.
        var equation;
        switch (currentQuestionNumber) {
            case 0:
            case 3:
                equation = this.lowValueEquationCarousel.getValue();
                break;
            case 1:
            case 2:
            case 4:
            case 5:
                equation = this.highValueEquationCarousel.getValue();
                break;
        }

        // Use a negative divisor for the following questions.
        switch (currentQuestionNumber) {
            case 2:
            case 5:
                equation.divisor = -1 * equation.divisor;
                equation.computeN();
                break;
        }

        // Build the expected answer, explanation, and display expression.
        var expectedAnswer;
        var explanation;
        var display;
        switch (currentQuestionNumber) {
            case 0:
            case 1:
            case 2:
                expectedAnswer = equation.divisor;
                display = equation.n + ' div ' + equation.m;
                explanation = this.getDivisorExplanation(equation);
                break;
            case 3:
            case 4:
            case 5:
                expectedAnswer = equation.modulus;
                display = equation.n + ' mod ' + equation.m;
                explanation = this.getModulusExplanation(equation);
                break;
        }

        expectedAnswer = String(expectedAnswer);

        return new ModularArithmeticAndQuotientRemainderQuestion(expectedAnswer, explanation, display);
    };

    /*
        Generate possible Equations for given |m| and |divisor|, for equation n = divisor * m + modulus.
        |mArray| and |divisorArray| are required and arrays of numbers.
    */
    QuotientRemainderFactory.prototype.generatePossibleEquations = function(mArray, divisorArray) {
        var possibleEquations = [];
        mArray.forEach(function(m) {
            divisorArray.forEach(function(divisor) {
                // Modulus values are {m-1, m-2, ..., 1}
                var modulusArray = [];
                for (var i = m - 1; i >= 1; --i) {
                    modulusArray.push(i);
                }

                modulusArray.forEach(function(modulus) {
                    possibleEquations.push(new Equation(m, divisor, modulus));
                });
            });
        });
        return possibleEquations;
    };

    /*
        Generate a Carousel (defined in utilities zyTool) of low value Equations, such as 14 div 4.
        More generally, written as n div m.
        Ex: 14 div 4 comes from: m = 4, divisor = 3, modulus = 2, and n = divisor * m + modulus
    */
    QuotientRemainderFactory.prototype.generateLowValueEquationCarousel = function() {
        var possibleEquations = this.generatePossibleEquations([ 3, 4, 5 ], [ 3, 4, 5 ]);
        this.lowValueEquationCarousel = this.utilities.getCarousel(possibleEquations);
    };

    /*
        Generate a Carousel (defined in utilities zyTool) of high value Equations, such as 345 div 9.
        More generally, written as n div m.
    */
    QuotientRemainderFactory.prototype.generateHighValueEquationCarousel = function() {
        var possibleEquations = this.generatePossibleEquations(
            [ 7, 8, 9 ],
            [ 10, 11, 12, 13, 14, 15 ]
        );
        this.highValueEquationCarousel = this.utilities.getCarousel(possibleEquations);
    };

    /*
        Return the explanation for divisor given the |equation|.
        |equation| is required and an Equation.
    */
    QuotientRemainderFactory.prototype.getDivisorExplanation = function(equation) {
        var fullEquation = equation.n + ' = <span class="underline">' + equation.divisor + '</span> '
                         + this.utilities.multiplicationSymbol + ' ' + equation.m + ' + '
                         + equation.modulus;
        return (fullEquation + '. The underlined ' + equation.divisor + ' is the divisor.');
    };

    /*
        Return the explanation for modulus given the |equation|.
        |equation| is required and an Equation.
    */
    QuotientRemainderFactory.prototype.getModulusExplanation = function(equation) {
        var fullEquation = equation.n + ' = ' + equation.divisor + ' '
                         + this.utilities.multiplicationSymbol + ' ' + equation.m
                         + ' + <span class=\'underline\'>' + equation.modulus + '</span>';
        return (fullEquation + '. The underlined ' + equation.modulus + ' is the modulus.');
    };
}
