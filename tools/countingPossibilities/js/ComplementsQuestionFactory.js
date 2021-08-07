/*
    ComplementsQuestionFactory inherits CountingPossibilitiesQuestionFactory.
    See CountingPossibilitiesQuestionFactory for details.
*/
function ComplementsQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath) {
    CountingPossibilitiesQuestionFactory.prototype.constructor.call(this, utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);

    this.helperInstructions = 'Write combination as: C(n, k)';
    this.instructions = '';
    this.numberOfQuestions = 4;
    this.placeholderText = 'Ex: 26 * C(36, 12)';
}

/*
    Build the prototype for |ComplementsQuestionFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForComplementsQuestionFactory() {
    ComplementsQuestionFactory.prototype = new CountingPossibilitiesQuestionFactory();
    ComplementsQuestionFactory.prototype.constructor = ComplementsQuestionFactory;

    /*
        Return a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    ComplementsQuestionFactory.prototype.make = function(currentQuestionNumber) {
        var itemOneCount = this.utilities.pickNumberInRange(4, 8);
        var itemTwoCount = this.utilities.pickNumberInRange(4, 8, [ itemOneCount ]);

        var display = '';
        var expectedAnswer = [];
        var explanation = '';

        switch (currentQuestionNumber) {
            case 0:
                display = 'An auto dealer has ' + itemOneCount + ' different cars and '
                               + itemTwoCount + ' different trucks.' + this.utilities.getNewline()
                               + 'How many ways are there to select two vehicles?';
                expectedAnswer = 'C(' + (itemOneCount + itemTwoCount) + ', 2)';
                explanation = 'Choose 2 from ' + (itemOneCount + itemTwoCount) + ' vehicles: '
                               + expectedAnswer;
                break;
            case 1:
                display = 'A shop has ' + itemOneCount + ' different shirts and ' + itemTwoCount
                               + ' different jeans.' + this.utilities.getNewline()
                               + 'How many ways are there to select 2 shirts?';
                expectedAnswer = 'C(' + itemOneCount + ', 2)';
                explanation = 'Choose 2 from ' + itemOneCount + ' shirts: ' + expectedAnswer;
                break;
            case 2:
                var teaAndCoffeeCombination = this.bigNumberMath.combinations(itemOneCount + itemTwoCount, 2);
                var teaOnlyCombination = this.bigNumberMath.combinations(itemOneCount, 2);

                display = 'A shop has ' + itemOneCount + ' different shirts and ' + itemTwoCount
                               + ' different jeans.' + this.utilities.getNewline()
                               + 'How many ways are there to select two items so that at least one jeans'
                               + ' is chosen?';
                expectedAnswer = 'C(' + (itemOneCount + itemTwoCount) + ', 2) - C('
                               + itemOneCount + ', 2)';
                explanation = 'First, choose 2 from all items: C(' + (itemOneCount + itemTwoCount)
                               + ', 2)' + this.utilities.getNewline()
                               + 'Second, choose 2 from only shirts: C(' + itemOneCount + ', 2)'
                               + this.utilities.getNewline()
                               + 'Finally, subtract only shirts from all item: ' + expectedAnswer;
                break;
            case 3:
                var carAndTruckCombination = this.bigNumberMath.combinations(itemOneCount + itemTwoCount, 3);
                var carOnlyCombination = this.bigNumberMath.combinations(itemOneCount, 3);

                display = 'An auto dealer has ' + itemOneCount + ' different cars and '
                               + itemTwoCount + ' different trucks.' + this.utilities.getNewline()
                               + 'How many ways are there to select three vehicles so that at least one'
                               + ' truck is chosen?';
                expectedAnswer = 'C(' + (itemOneCount + itemTwoCount) + ', 3) - C('
                               + itemOneCount + ', 3)';
                explanation = 'First, choose 3 from all vehicles: C(' + (itemOneCount + itemTwoCount)
                               + ', 3)' + this.utilities.getNewline()
                               + 'Second, choose 3 from only cars: C(' + itemOneCount + ', 3)'
                               + this.utilities.getNewline()
                               + 'Finally, subtract only cars from all vehicles: ' + expectedAnswer;
                break;
        }

        explanation += this.userAndExpectedAnswerDiffExplanation(expectedAnswer);

        return new ComplementsQuestion(expectedAnswer, explanation, display, this.bigNumberMath);
    };
}
