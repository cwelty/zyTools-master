function BitAddition() {
    this.init = function(id, parentResource, options) {

        /**
            Whether to show 64-bit instead of 32-bit.
            @property show64Bit
            @type {Boolean}
            @default false
        */
        this.show64Bit = (options && options.show64Bit) || false;

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.utilities = require('utilities');
        this.questionFactory = new QuestionFactory(this.utilities);
        this.progressionTool = require('progressionTool').create();

        // Give the user another try if the user does not change one of the result bits.
        var giveUserAnotherTry = false;

        var self = this;
        this.progressionTool.init(id, parentResource, {
            html:             this[this.name].template(),
            css:              '<style><%= grunt.file.read(css_filename) %></style>',
            numToWin:         this.questionFactory.numberOfQuestions,
            useMultipleParts: true,
            start: function() {
                self._enableButtons();
            },
            reset: function() {
                self._generateQuestion(0);
                self._disableButtons();
            },
            next: function(currentQuestion) {
                if (!giveUserAnotherTry) {
                    self._generateQuestion(currentQuestion);
                }
                giveUserAnotherTry = false;
                self._enableButtons();
            },
            isCorrect: function(currentQuestion) {
                // Read user-entered result and carry bits.
                var $resultSuffixBits = self._resultSuffixBits();
                var $carrySuffixBits = self._carrySuffixBits();
                var userResultBits = self.convertToBitArray($resultSuffixBits);
                var userCarryBits = self.convertToBitArray($carrySuffixBits);
                self._disableButtons();

                // Give the user another try if any result or carry bits not yet set.
                var userResultBitNotSet = userResultBits.some(isNaN);
                var userCarryBitNotSet = userCarryBits.some(isNaN);
                giveUserAnotherTry = userResultBitNotSet || userCarryBitNotSet;

                // Inform user that result or carry bits not set.
                var isCorrect = false;
                var explanationMessage = 'Please set each ';
                if (giveUserAnotherTry) {
                    if (userResultBitNotSet && userCarryBitNotSet) {
                        explanationMessage += 'sum and carry';
                    }
                    else if (userResultBitNotSet) {
                        explanationMessage += 'sum';
                    }
                    else if (userCarryBitNotSet) {
                        explanationMessage += 'carry';
                    }
                    explanationMessage += ' bit to 0 or 1.';
                }
                // Otherwise, grade the user-entered result bits and provide feedback.
                else {
                    // Filter out the correct user-entered result bits.
                    var $incorrectBits = $resultSuffixBits.filter(function(index) {
                        return (userResultBits[index] !== self.currentQuestion.expectedResultSuffixBits[index]);
                    });
                    var $incorrectUserCarryBits = $carrySuffixBits.filter(function(index) {
                        return (userCarryBits[index] !== self.currentQuestion.expectedCarrySuffixBits[index]);
                    });
                    $.merge($incorrectBits, $incorrectUserCarryBits);

                    // Highlight the incorrect user-entered bits.
                    $incorrectBits.addClass('highlight-bit');

                    isCorrect = ($incorrectBits.length === 0);

                    explanationMessage = 'Correct';
                    if (!isCorrect) {
                        explanationMessage = 'Incorrect bit';
                        explanationMessage += ($incorrectBits.length === 1) ? ' is' : 's are';
                        explanationMessage += ' highlighted';
                    }

                    // Show the value of the user-entered result bits.
                    var userEnteredResultNumber = self._convertBitArrayToDecimalNumber(
                        userResultBits,
                        self.currentQuestion.resultPrefixBits
                    );
                    $('#' + self.id + ' .result-bits .number-value').text(userEnteredResultNumber);
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         self.convertToString(userResultBits, userCarryBits),
                    expectedAnswer:     self.convertToString(self.currentQuestion.expectedResultSuffixBits, self.currentQuestion.expectedCarrySuffixBits),
                    isCorrect:          isCorrect
                };
            }
        });

        this._generateQuestion(0);
        this._disableButtons();
    };

    /*
        Return a string of |sumBits| and |carryBits|.
        |sumBits| and |carryBits| are required and arrays of bits.
    */
    this.convertToString = function(sumBits, carryBits) {
        return ('sum bits: ' + JSON.stringify(sumBits) + ', carry bits: ' + JSON.stringify(carryBits));
    };

    /*
        Convert |$bits| to an array of bit numbers.
        |$bits| is required and a jQuery object.
    */
    this.convertToBitArray = function($bits) {
        return $bits.map(function(index) {
            return parseInt($(this).text());
        }).toArray();
    };

    /*
        Return the decimal value of |bitArray| prefixed with |prefixBits|.
        |bitArray| is required and an array of 1's and 0's.
        |prefixBits| is required and a number.
    */
    this._convertBitArrayToDecimalNumber = function(bitArray, prefixBits) {
        var decimalValue = 0;
        var self = this;
        bitArray.reverse().forEach(function(bit, index) {
            decimalValue += self._bitValue(bit, index);
        });

        // Prefix |decimalValue| with |prefixBits|.
        for (var i = bitArray.length; i < 32; ++i) {
            decimalValue += this._bitValue(prefixBits, i);
        }

        // Return a signed 32-bit integer.
        return decimalValue >> 0;
    };

    /*
        Return the value of |bit| at |index| in a binary number.
        Ex: The bit 1 at index 3 of binary number 0100 has a value of 4.

        |bit| and |index| are required and a number.
    */
    this._bitValue = function(bit, index) {
        return (bit * (1 << index));
    };

    // Enable the buttons.
    this._enableButtons = function() {
        var self = this;
        this._interactiveBits().each(function() {
            self.utilities.enableButton($(this));
        });
    };

    // Disable the buttons.
    this._disableButtons = function() {
        var self = this;
        this._interactiveBits().each(function() {
            self.utilities.disableButton($(this));
        });
    };

    // Return the interactive bits, which are the result and carry bits.
    this._interactiveBits = function() {
        return $.merge(this._resultSuffixBits(), this._carrySuffixBits());
    };

    // Return the result suffix bits.
    this._resultSuffixBits = function() {
        return $('#' + this.id + ' .result-bit');
    };

    // Return the carry suffix bits.
    this._carrySuffixBits = function() {
        return $('#' + this.id + ' .carry-bit');
    };

    /*
        Return an array of |n| dashes.
        |n| is required and a number.
    */
    this._makeArrayOfNDashes = function(n) {
        return Array(n + 1).join('-').split('');
    };

    /*
        Build a question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is required and a number.
    */
    this._generateQuestion = function(currentQuestionNumber) {
        this.currentQuestion = this.questionFactory.make(currentQuestionNumber);

        var carryBitsHTML = this[this.name].bits({
            prefixBit:   '',
            buttonClass: 'carry-bit',
            suffixBits:  this._makeArrayOfNDashes(this.currentQuestion.expectedCarrySuffixBits.length),
            numberValue: '',
            label:       'Carry bits'
        });

        const numberOfBits = this.show64Bit ? '64' : '32';
        const bitLabel = `${numberOfBits}-bit number`;

        var firstNumberBitsHTML = this[this.name].bits({
            prefixBit:   this.currentQuestion.firstNumberPrefixBits,
            buttonClass: 'number-bit',
            suffixBits:  this.currentQuestion.firstNumberSuffixBits,
            numberValue: this.currentQuestion.firstNumber,
            label: bitLabel,
        });

        var secondNumberBitsHTML = this[this.name].bits({
            prefixBit:   this.currentQuestion.secondNumberPrefixBits,
            buttonClass: 'number-bit',
            suffixBits:  this.currentQuestion.secondNumberSuffixBits,
            numberValue: this.currentQuestion.secondNumber,
            label: bitLabel,
        });

        var resultBitsHTML = this[this.name].bits({
            prefixBit:   this.currentQuestion.resultPrefixBits,
            buttonClass: 'result-bit',
            suffixBits:  this._makeArrayOfNDashes(this.currentQuestion.expectedResultSuffixBits.length),
            numberValue: '',
            label: bitLabel,
        });

        var questionHTML = this[this.name].question({
            prompt:               this.currentQuestion.prompt,
            carryBitsHTML:        carryBitsHTML,
            firstNumberBitsHTML:  firstNumberBitsHTML,
            secondNumberBitsHTML: secondNumberBitsHTML,
            resultBitsHTML:       resultBitsHTML
        });

        $('#' + this.id + ' .container').html(questionHTML);

        // Remove the right-most carry bit.
        this._carrySuffixBits().last().remove();
        this.currentQuestion.expectedCarrySuffixBits.pop();

        // Toggle the value of a bit when clicked.
        this._interactiveBits().click(function() {
            var $bit = $(this);
            var currentBit = $bit.text();
            var newBit = (currentBit === '0') ? '1' : '0';
            $bit.text(newBit);
        });

        // Set the solution if the platform supports.
        if (this.parentResource.setSolution) {

            // Generate a solution.
            const carryBitsString = this.currentQuestion.expectedCarrySuffixBits.join(', ');
            const resultBitsString = this.currentQuestion.expectedResultSuffixBits.join(', ');
            const solution = `Carry bits: ${carryBitsString}
Result bits: ${resultBitsString}`;

            this.parentResource.setSolution(solution, 'text');
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var bitAdditionExport = {
    create: function() {
        return new BitAddition();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = bitAdditionExport;
