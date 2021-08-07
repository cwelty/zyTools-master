/*
    ModularArithmeticFactory inherits QuestionFactory expressions like: (651 * 17 * 300) mod 10
    |utilities| is required and the utilities zyTool.
*/
function ModularArithmeticFactory(utilities) {
    this.numberOfQuestions = 5;
    this.utilities = utilities;
}

/*
    Build the prototype for |ModularArithmeticFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForModularArithmeticFactory() {
    ModularArithmeticFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    ModularArithmeticFactory.prototype.constructor = ModularArithmeticFactory;

    /*
        Return a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    ModularArithmeticFactory.prototype.make = function(currentQuestionNumber) {
        var firstNumber = this.getBigNumber();
        var secondNumber = this.getBigNumber();
        var thirdNumber = this.getSmallNumber();

        var firstNumberModulated = firstNumber % thirdNumber;
        var secondNumberModulated = secondNumber % thirdNumber;

        // Ex: [(9 mod 6)(11 mod 6)] mod 6
        var questionTwoDisplay = '[(' + firstNumber + ' mod ' + thirdNumber + ' )(' + secondNumber
                               + ' mod ' + thirdNumber + ')] mod ' + thirdNumber;

        // Ex: [(3)(5)] mod 6 = [15] mod 6 = 3
        var questionTwoExplanation = '[(' + firstNumberModulated + ')(' + secondNumberModulated
                                   + ')] mod ' + thirdNumber + ' = ['
                                   + (firstNumberModulated * secondNumberModulated) + '] mod '
                                   + thirdNumber
                                   + ' = ' + ((firstNumber * secondNumber) % thirdNumber);

        var expectedAnswer;
        var explanation;
        var display;
        switch (currentQuestionNumber) {
            /*
                Ex: [(13 mod 5) + (25 mod 5)] mod 5,
                where |firstNumber| is 13, |secondNumber| is 25, and |thirdNumber| is 5.
            */
            case 0:
                expectedAnswer = String((firstNumber + secondNumber) % thirdNumber);
                explanation = '[(' + firstNumberModulated + ') + (' + secondNumberModulated
                               + ')] mod ' + thirdNumber
                               + ' = [' + ((firstNumber + secondNumber) % thirdNumber) + '] mod '
                               + thirdNumber + ' = ' + expectedAnswer;
                display = '[(' + firstNumber + ' mod ' + thirdNumber + ') + (' + secondNumber
                               + ' mod ' + thirdNumber + ')] mod ' + thirdNumber;
                break;

            /*
                Ex: [(13 mod 5) * (25 mod 5)] mod 5,
                where |firstNumber| is 13, |secondNumber| is 25, and |thirdNumber| is 5.
            */
            case 1:
                expectedAnswer = String((firstNumber * secondNumber) % thirdNumber);
                explanation = questionTwoExplanation;
                display = questionTwoDisplay;
                break;

            /*
                Ex: [65 * 17] mod 10,
                where |firstNumber| is 65, |secondNumber| is 17, and |thirdNumber| is 10.
            */
            case 2:
                expectedAnswer = String((firstNumber * secondNumber) % thirdNumber);
                explanation = 'Convert then compute:' + this.utilities.getNewline()
                               + questionTwoDisplay + this.utilities.getNewline()
                               + '= ' + questionTwoExplanation;
                display = '[' + firstNumber + ' ' + this.utilities.multiplicationSymbol + ' '
                               + secondNumber + '] mod ' + thirdNumber;
                break;

            /*
                Ex: [65 * 17 * 40] mod 10,
                where |firstNumber| is 65, |secondNumber| is 17, |thirdNumber| is 10, and |fourthNumber| is 40.
            */
            case 3:
                var fourthNumber = this.getBigNumber();
                var fourthNumberModulated = fourthNumber % thirdNumber;

                expectedAnswer = String((firstNumber * secondNumber * fourthNumber) % thirdNumber);
                explanation = 'Convert then compute: ' + this.utilities.getNewline()
                               + '[(' + firstNumber + ' mod ' + thirdNumber + ')(' + secondNumber + ' mod '
                               + thirdNumber + ')(' + fourthNumber + ' mod ' + thirdNumber + ')] mod '
                               + thirdNumber + this.utilities.getNewline()
                               + '= [(' + firstNumberModulated + ')(' + secondNumberModulated + ')('
                               + fourthNumberModulated + ')] mod ' + thirdNumber;

                // Add more explanation if none of the modulated values are 0.
                if ([ firstNumberModulated, secondNumberModulated, fourthNumberModulated ].indexOf(0) === -1) {
                    explanation += this.utilities.getNewline() + '= [(' + (firstNumberModulated * secondNumberModulated)
                                 + ')(' + fourthNumberModulated + ')] mod ' + thirdNumber + this.utilities.getNewline()
                                 + '= [(' + (firstNumberModulated * secondNumberModulated) + ' mod '
                                 + thirdNumber + ')(' + fourthNumberModulated + ')] mod '
                                 + thirdNumber + this.utilities.getNewline()
                                 + '= [(' + ((firstNumber * secondNumber) % thirdNumber) + ')('
                                 + fourthNumberModulated + ')] mod ' + thirdNumber;
                }

                explanation += this.utilities.getNewline() + '= ['
                             + (((firstNumber * secondNumber) % thirdNumber) * fourthNumberModulated)
                             + '] mod ' + thirdNumber + this.utilities.getNewline() + '= ' + expectedAnswer;
                display = '[' + firstNumber + ' ' + this.utilities.multiplicationSymbol + ' '
                             + secondNumber + ' ' + this.utilities.multiplicationSymbol + ' ' + fourthNumber
                             + '] mod ' + thirdNumber;
                break;

            /*
                61^23 + 17 mod 10,
                where |firstNumber| is 61, |secondNumber| is 17, |thirdNumber| is 10, and |fourthNumber| is 23.
            */
            case 4:
                firstNumberModulated = 1;
                firstNumber = (thirdNumber * this.getSmallNumber()) + firstNumberModulated;

                var fourthNumber = this.getBigNumber();

                expectedAnswer = String((firstNumberModulated + secondNumber) % thirdNumber);
                explanation = '[(' + firstNumber + ' mod ' + thirdNumber + ')<sup>' + fourthNumber
                               + '</sup> + ' + secondNumber + '] mod ' + thirdNumber
                               + this.utilities.getNewline() + '= [(' + firstNumberModulated + ')<sup>'
                               + fourthNumber + '</sup> + ' + secondNumber + '] mod ' + thirdNumber
                               + this.utilities.getNewline() + '= [' + firstNumberModulated + ' + '
                               + secondNumber + '] mod ' + thirdNumber
                               + this.utilities.getNewline() + '= [' + (firstNumberModulated + secondNumber)
                               + '] mod ' + thirdNumber + this.utilities.getNewline() + '= ' + expectedAnswer;
                display = '[' + firstNumber + '<sup>' + fourthNumber + '</sup> + '
                               + secondNumber + '] mod ' + thirdNumber;
                break;
        }

        return new ModularArithmeticAndQuotientRemainderQuestion(expectedAnswer, explanation, display);
    };

    // Return a value in the range of 4 - 10.
    ModularArithmeticFactory.prototype.getSmallNumber = function() {
        return this.utilities.pickNumberInRange(4, 10);
    };

    // Return a value in the range of 13 - 80.
    ModularArithmeticFactory.prototype.getBigNumber = function() {
        return this.utilities.pickNumberInRange(13, 80);
    };
}
