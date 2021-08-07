/*
    SubsetsQuestionFactory inherits CountingPossibilitiesQuestionFactory.
    See CountingPossibilitiesQuestionFactory for details.
*/
function SubsetsQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath) {
    CountingPossibilitiesQuestionFactory.prototype.constructor.call(this, utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);

    this.helperInstructions = 'Write a<sup>b</sup> as: a^b' + this.utilities.getNewline()
                                + 'Write combination as: C(n, k)';
    this.helperInstructionClass = 'two-liner';
    this.instructions = 'A bit string contains 1\'s and 0\'s. How many different bit '
                                + 'strings can be constructed given the restriction(s)?';
    this.numberOfQuestions = 5;
    this.placeholderText = 'Ex: 2^40 or 26 * C(36, 12)';
}

/*
    Build the prototype for |SubsetsQuestionFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForSubsetsQuestionFactory() {
    SubsetsQuestionFactory.prototype = new CountingPossibilitiesQuestionFactory();
    SubsetsQuestionFactory.prototype.constructor = SubsetsQuestionFactory;

    /*
        Return a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    SubsetsQuestionFactory.prototype.make = function(currentQuestionNumber) {
        var stringSize = this.utilities.pickNumberInRange(15, 30);
        var numberOfZeroes = this.utilities.pickNumberInRange(2, 14, [ 10, 11 ]);

        var display = '';
        var expectedAnswer = [];
        var explanation = '';
        switch (currentQuestionNumber) {
            case 0:
                display = 'Length is ' + stringSize + '.';
                expectedAnswer = '2^' + stringSize;
                explanation = 'Each position has 2 possibilities: ' + expectedAnswer;
                break;
            case 1:
                var threeBits = this.utilities.pickElementFromArray([
                    '000', '001', '010', '011',
                    '100', '101', '110', '111'
                ]);

                display = 'Length is ' + stringSize + '.' + this.utilities.getNewline()
                               + 'Starts with: ' + threeBits;
                expectedAnswer = '2^' + (stringSize - 3);
                explanation = stringSize + ' - 3 positions remain, each with 2 possibilities: '
                               + expectedAnswer;
                break;
            case 2:
                display = 'Length is ' + stringSize + '.' + this.utilities.getNewline()
                               + 'Has exactly ' + this.convertNumberToWord(numberOfZeroes) + ' 0\'s.';
                expectedAnswer = 'C(' + stringSize + ', ' + numberOfZeroes + ')';
                explanation = 'Choose ' + this.convertNumberToWord(numberOfZeroes)
                               + ' locations for 0\'s from ' + stringSize + ' locations: '
                               + expectedAnswer;
                break;
            case 3:
                display = 'Length is ' + stringSize + '.' + this.utilities.getNewline()
                               + 'Has exactly ' + this.convertNumberToWord(numberOfZeroes) + ' 0\'s.'
                               + this.utilities.getNewline()
                               + 'Starts with: 11';
                expectedAnswer = 'C(' + (stringSize - 2) + ', ' + numberOfZeroes + ')';
                explanation = 'First two locations already chosen.' + this.utilities.getNewline()
                               + 'Choose ' + this.convertNumberToWord(numberOfZeroes)
                               + ' locations for 0\'s from ' + (stringSize - 2) + ' locations: '
                               + expectedAnswer;
                break;

            // There is exactly one 1 in the first half and exactly three 1's in the second half.
            case 4:
                // Make |stringSize| an even number. If odd, increment by 1.
                stringSize = ((stringSize % 2) === 0) ? stringSize : (stringSize + 1);

                var numberOfOnesInFirstHalf = this.utilities.pickNumberInRange(2, 7);
                var numberOfOnesInSecondHalf = this.utilities.pickNumberInRange(2, 7, [ numberOfOnesInFirstHalf ]);

                display = 'Length is ' + stringSize + '.' + this.utilities.getNewline()
                               + 'Has exactly ' + this.convertNumberToWord(numberOfOnesInFirstHalf)
                               + ' 1\'s in the first half.' + this.utilities.getNewline()
                               + 'Has exactly ' + this.convertNumberToWord(numberOfOnesInSecondHalf)
                               + ' 1\'s in the second half.';
                expectedAnswer = 'C(' + (stringSize / 2) + ', ' + numberOfOnesInFirstHalf
                               + ') * C(' + (stringSize / 2) + ', ' + numberOfOnesInSecondHalf + ')';
                explanation = 'For first half, choose ' + this.convertNumberToWord(numberOfOnesInFirstHalf)
                               + ' 1\'s from ' + (stringSize / 2) + ': C(' + (stringSize / 2) + ', '
                               + numberOfOnesInFirstHalf + ')' + this.utilities.getNewline()
                               + 'For second half, choose ' + this.convertNumberToWord(numberOfOnesInSecondHalf)
                               + ' 1\'s from ' + (stringSize / 2) + ': C(' + (stringSize / 2) + ', '
                               + numberOfOnesInSecondHalf + ')' + this.utilities.getNewline()
                               + 'Then, combine: ' + expectedAnswer;
                break;
        }

        explanation += this.userAndExpectedAnswerDiffExplanation(expectedAnswer);

        return new SubsetsQuestion(expectedAnswer, explanation, display, this.bigNumberMath, this.utilities);
    };

    /*
        Return the string word for |numberToConvert|. Ex: If |numberToConvert| is 5, then return 'five'.
        |numberToConvert| is required and a number.
    */
    SubsetsQuestionFactory.prototype.convertNumberToWord = function(numberToConvert) {
        var numberToWordMap = {
            0: 'zero',
            1: 'one',
            2: 'two',
            3: 'three',
            4: 'four',
            5: 'five',
            6: 'six',
            7: 'seven',
            8: 'eight',
            9: 'nine',
            10: 'ten',
            11: 'eleven',
            12: 'twelve',
            13: 'thirteen',
            14: 'fourteen',
            15: 'fifteen',
            16: 'sixteen',
            17: 'seventeen',
            18: 'eighteen',
            19: 'nineteen',
            20: 'twenty'
        };

        return numberToWordMap[numberToConvert];
    };
}
