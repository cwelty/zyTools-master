/*
    PermutationsQuestionFactory inherits CountingPossibilitiesQuestionFactory.
    See CountingPossibilitiesQuestionFactory for details.
*/
function PermutationsQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath) {
    CountingPossibilitiesQuestionFactory.prototype.constructor.call(this, utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);

    this.helperInstructions = 'Write permutations as: P(n, k)';
    this.instructions = 'Each character in a password is either a digit [0-9] or '
                            + 'lowercase letter [a-z]. How many valid passwords are there with '
                            + 'the given restriction(s)?';
    this.numberOfQuestions = 6;
    this.placeholderText = 'Ex: P(11, 4) * P(4, 3)';
}

/*
    Build the prototype for |PermutationsQuestionFactory|.
    The prototype building should only be done after integerProperties' dependencies have been loaded.
*/
function buildPrototypeForPermutationsQuestionFactory() {
    PermutationsQuestionFactory.prototype = new CountingPossibilitiesQuestionFactory();
    PermutationsQuestionFactory.prototype.constructor = PermutationsQuestionFactory;

    /*
        Return a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is a required Number.
    */
    PermutationsQuestionFactory.prototype.make = function(currentQuestionNumber) {
        var passwordLength = this.utilities.pickNumberInRange(8, 20);
        var lowercaseLetter = this.pickRandomLowercaseLetter();
        var digit = this.utilities.pickNumberInRange(0, 9, [ passwordLength ]);
        var digit2 = this.utilities.pickNumberInRange(0, 9, [ passwordLength, digit ]);
        var digit3 = this.utilities.pickNumberInRange(0, 9, [ passwordLength, digit, digit2 ]);

        var display = '';
        var expectedAnswer = [];
        var explanation = '';
        switch (currentQuestionNumber) {
            case 0:
                display = 'Length is ' + passwordLength + '.' + this.utilities.getNewline()
                               + 'No character repeats.';
                expectedAnswer = 'P(36, ' + passwordLength + ')';
                explanation = 'No repeats means permute ' + passwordLength
                               + ' from 36 characters: ' + expectedAnswer;
                break;
            case 1:
                display = 'Length is ' + passwordLength + '.' + this.utilities.getNewline()
                               + 'No character repeats.' + this.utilities.getNewline()
                               + 'Starts with: ' + lowercaseLetter;
                expectedAnswer = 'P(35, ' + (passwordLength - 1) + ')';
                explanation = lowercaseLetter + ' is first character. Choose other ' + (passwordLength - 1)
                               + ' from 35 characters: ' + expectedAnswer;
                break;
            case 2:
                display = 'Length is ' + passwordLength + '.' + this.utilities.getNewline()
                               + 'No character repeats.' + this.utilities.getNewline()
                               + 'Starts with: ' + lowercaseLetter + digit;
                expectedAnswer = 'P(34, ' + (passwordLength - 2) + ')';
                explanation = 'First two characters already chosen: ' + expectedAnswer;
                break;
            case 3:
                display = 'Length is ' + passwordLength + '.' + this.utilities.getNewline()
                               + 'No character repeats.' + this.utilities.getNewline()
                               + 'Must contain: ' + lowercaseLetter;
                expectedAnswer = 'P(' + passwordLength + ', 1) * P(35, ' + (passwordLength - 1) + ')';
                explanation = lowercaseLetter + ' can be in ' + passwordLength + ' possible positions: P('
                               + passwordLength + ',1)' + this.utilities.getNewline()
                               + 'Then, permute ' + (passwordLength - 1) + ' from 35 characters: P(35,'
                               + (passwordLength - 1) + ')' + this.utilities.getNewline()
                               + 'Finally, combine: ' + expectedAnswer;
                break;
            case 4:
                display = 'Length is ' + passwordLength + '.' + this.utilities.getNewline()
                               + 'No character repeats.' + this.utilities.getNewline()
                               + 'Must contain: ' + lowercaseLetter + ', ' + digit + ', ' + digit2 + ', and '
                               + digit3 + '.' + this.utilities.getNewline();
                expectedAnswer = 'P(' + passwordLength + ', 4) * P(32, ' + (passwordLength - 4) + ')';
                explanation = '4 already chosen characters with ' + passwordLength
                               + ' possible positions: P('
                               + passwordLength + ', 4)' + this.utilities.getNewline()
                               + 'Then, permute ' + (passwordLength - 4) + ' from 32 characters: P(32, '
                               + (passwordLength - 4) + ')' + this.utilities.getNewline()
                               + 'Finally, combine: ' + expectedAnswer;
                break;
            case 5:
                // Special case where password length equals number of characters the password must use.
                passwordLength = this.utilities.pickNumberInRange(6, 8);
                var lowercaseLetters = this.pickArrayOfLowercaseLetters(passwordLength);

                display = 'Length is ' + passwordLength + '.' + this.utilities.getNewline()
                               + 'Must contain: ' + this.convertArrayToPrintedList(lowercaseLetters);
                expectedAnswer = 'P(' + passwordLength + ', ' + passwordLength + ')';
                explanation = 'Permute ' + passwordLength + ' from ' + passwordLength
                               + ' characters: ' + expectedAnswer;
                break;
        }

        explanation += this.userAndExpectedAnswerDiffExplanation(expectedAnswer);

        return new PermutationsQuestion(expectedAnswer, explanation, display, this.bigNumberMath);
    };

    /*
        Return a string that is a list of |lowercaseLetters|.
        Ex: For ['a', 'b', 'c', 'd', 'f'], return: a, b, c, d, and f
        |lowercaseLetters| is required and an array.
    */
    PermutationsQuestionFactory.prototype.convertArrayToPrintedList = function(lowercaseLetters) {
        var list = '';
        lowercaseLetters.forEach(function(lowercaseLetter, index) {
            list += lowercaseLetter;

            // For each elements except the last element, add a comma.
            if (index <= (lowercaseLetters.length - 2)) {
                list += ', ';
            }

            // For only the second to last element, add an "and".
            if (index === (lowercaseLetters.length - 2)) {
                list += 'and ';
            }
        });

        return list;
    };

    /*
        Return an array containing |numberOfLetters| lowercase letters without repeats.
        |numberOfLetters| is required and a number.
    */
    PermutationsQuestionFactory.prototype.pickArrayOfLowercaseLetters = function(numberOfLetters) {
        var lowercaseLetters = [];
        for (var i = 0; i < numberOfLetters; ++i) {
            // Find a letter not yet added.
            var newLetter;
            do {
                newLetter = this.pickRandomLowercaseLetter();
            } while (lowercaseLetters.indexOf(newLetter) !== -1);

            lowercaseLetters.push(newLetter);
        }

        return lowercaseLetters;
    };

    // Return a random lowercase letter.
    PermutationsQuestionFactory.prototype.pickRandomLowercaseLetter = function() {
        var aInAscii = 97;
        var zInAscii = 122;
        var randomLetterInAscii = this.utilities.pickNumberInRange(aInAscii, zInAscii);
        return String.fromCharCode(randomLetterInAscii);
    };
}
