function ChooseBinaryFromHex() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        // Tool properties
        this.smallestOpacityOfHexVal = 0.2;
        this.largestTopOfHexVal = 70;

        // Handle options
        this.numberCorrectToWin = 5;
        this.numberOfBitsInNibble = 4;
        this.useDecimal = false;
        var templateToUse = 'chooseBinaryFromHex';
        if (options && options.useDecimal) {
            this.numberCorrectToWin = 3;
            this.numberOfBitsInNibble = 3;
            this.useDecimal = true;
            templateToUse = 'chooseBinaryFromDec';
        }

        this.useMultipleParts = options && options.useMultipleParts;

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        var html = this[this.name][templateToUse]({
            id:                   this.id,
            numberOfBitsInNibble: this.numberOfBitsInNibble
        });
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.numberCorrectToWin,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.enableClickableBits();
                self.makeLevel(0);
            },
            reset: function() {
                self.disabledClickableBits();
                self.resetDisplay();
                self.shownValueThatUserHasGottenCorrect.length = 0;
            },
            next: function(currentQuestion) {
                self.enableClickableBits();
                self.resetDisplay();
                self.makeLevel(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                self.disabledClickableBits();

                // Stop hex value animation and change opacity to 1.
                self.$hexVal.stop();
                self.$hexVal.css('opacity', '1');

                var isAnswerCorrect = true;
                var userAnswer = '';
                var expectedAnswer = '';

                // Get the |expectedValue| in binary from the shown value
                var expectedValue = '';
                if (self.useDecimal) {
                    expectedValue = self.decimalToBinary[parseInt(self.$hexVal.text())];
                }
                else {
                    var expectedUpperNibbleBits = self.hexidecimalToBinary[self.$hexVal.text().charAt(0)];
                    var expectedLowerNibbleBits = self.hexidecimalToBinary[self.$hexVal.text().charAt(1)];
                    expectedValue = expectedUpperNibbleBits + expectedLowerNibbleBits;
                }

                // Check each clickable bit for correctness. If wrong, then highlight that bit.
                self.$clickableBits.each(function(index) {
                    var expectedBit = expectedValue.charAt(index);
                    self.$correctAnswerBits.eq(index).text(expectedBit);

                    userAnswer += $(this).text();
                    expectedAnswer += expectedBit;

                    if ($(this).text() !== expectedBit) {
                        isAnswerCorrect = false;
                        self.$correctAnswerBits.eq(index).addClass('highlighted');
                    }
                });

                // If wrong, then say so and show the correct bits.
                var explanationMessage = '';
                if (!isAnswerCorrect) {
                    explanationMessage = 'Wrong. Check highlighted bits.';
                    self.$correctAnswerBits.css('visibility', 'visible');
                }
                else {
                    explanationMessage = 'Correct.';
                    self.shownValueThatUserHasGottenCorrect.push(self.$hexVal.text());
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         userAnswer,
                    expectedAnswer:     expectedAnswer,
                    isCorrect:          isAnswerCorrect
                };
            }
        });

        // Cache regularly used DOM objects
        this.$thisTool = $('#' + this.id);
        this.$clickableBits = this.$thisTool.find('.clickable-bit');
        this.$hexVal = this.$thisTool.find('.hex-value');
        this.$correctAnswerBits = this.$thisTool.find('.correct-answer-bits');
        this.$decimalEquivalent = this.$thisTool.find('.decimal-equivalent');

        // Set initial properties
        this.$hexVal.data({ progressionTool: this.progressionTool }); // used to access progressionTool.check(), reasoning explained in makeLevel()
        this.disabledClickableBits();
        this.resetDisplay();
        this.generateShownValue();

        // Set click listeners on clickable bits
        this.$clickableBits.click(function(event) {
            self.bitClicked(event);
        });
    };

    // Maps to convert between numerical types
    this.decimalToHexidecimal = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' ];
    this.hexidecimalToBinary = { '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100', '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001', 'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111' };
    this.decimalToBinary = [ '000', '001', '010', '011', '100', '101', '110', '111' ];
    this.binaryToDecimal = { '000': '0', '001': '1', '010': '2', '011': '3', '100': '4', '101': '5', '110': '6', '111': '7' };
    this.binaryToHexidecial = { '0000': '0', '0001': '1', '0010': '2', '0011': '3', '0100': '4', '0101': '5', '0110': '6', '0111': '7', '1000': '8', '1001': '9', '1010': 'A', '1011': 'B', '1100': 'C', '1101': 'D', '1110': 'E', '1111': 'F' };

    // Shown values that the user has gotten correct. Used to prevent showing a question that the user has already gotten correct.
    this.shownValueThatUserHasGottenCorrect = [];

    // Disable the clickable bits
    this.disabledClickableBits = function() {
        this.$clickableBits.addClass('disabled');
        this.$clickableBits.attr('disabled', true);
    };

    // Enable the clickable bits
    this.enableClickableBits = function() {
        this.$clickableBits.removeClass('disabled');
        this.$clickableBits.attr('disabled', false);
    };

    // Update the shown decimal value equivalent to the user-select bit values
    this.updateDecimalEquivalent = function() {
        // Build string of user-selected bit values
        var userSelectedBitValues = '';
        this.$clickableBits.each(function() {
            userSelectedBitValues += $(this).text();
        });

        // Convert bit string into decimal value equivalent
        var decimalEquivalent = '';
        if (this.useDecimal) {
            decimalEquivalent = this.binaryToDecimal[userSelectedBitValues];
        }
        else {
            decimalEquivalent = this.binaryToHexidecial[userSelectedBitValues];
        }

        // Set decimal value equivalent
        this.$decimalEquivalent.text(decimalEquivalent);
    };

    // Toggle the bit when clicked
    this.bitClicked = function(event) {
        var $bit = $(event.target);
        if ($bit.text() === '0') {
            $bit.text('1');
        }
        else {
            $bit.text('0');
        }
        this.updateDecimalEquivalent();
    };

    // Reset the tool visually. Reset the clickable bits. Stop the hex value animation and reset the hex value.
    this.resetDisplay = function() {
        this.$clickableBits.each(function() {
            $(this).text('0');
        });
        this.$hexVal.stop();
        this.$hexVal.css('top', '0px').css('opacity', '1');
        this.$correctAnswerBits.css('visibility', 'hidden');
        this.$correctAnswerBits.removeClass('highlighted');
        this.updateDecimalEquivalent();
    };

    // Randomly generate a value to show the user
    this.randomlyGenerateValueToShow = function() {
        var valueToShow = '';
        if (this.useDecimal) {
            // Random choose decimal value between 0 and 7 (inclusively).
            valueToShow = String(this.utilities.pickNumberInRange(0, 7));
        }
        else {
            // Random choose hex value with two hexidecimals
            var firstRandHex = this.utilities.pickElementFromArray(this.decimalToHexidecimal);
            var secondRandHex = this.utilities.pickElementFromArray(this.decimalToHexidecimal);
            valueToShow = firstRandHex + secondRandHex;
        }
        return valueToShow;
    };

    // Generate a value to show the user that the user hasn't already gotten correct.
    this.generateShownValue = function() {
        var valueToShow = '';

        // Answer that user has gotten correct are in |this.shownValueThatUserHasGottenCorrect|.
        do {
            valueToShow = this.randomlyGenerateValueToShow();
        } while (this.shownValueThatUserHasGottenCorrect.indexOf(valueToShow) !== -1);

        this.$hexVal.text(valueToShow);
    };

    // Randomly generate a shown value and animate the hex value.
    // |currentQuestion| is a required integer, used to determine how much time a user has to select the right bit values.
    this.makeLevel = function(currentQuestion) {
        this.generateShownValue();

        this.$hexVal.css('top', '0px')
            .animate({ opacity: this.smallestOpacityOfHexVal, top: this.largestTopOfHexVal }, 10000 - (currentQuestion * 1000), function() {
                // This function's scope is global, so we cannot directly access the progressionTool.
                // But, we need to force a check.
                // Thus, we store a pointer to the progressionTool on the hexVal DOM object.
                $(this).data('progressionTool').check();
            });
    };

    <%= grunt.file.read(hbs_output) %>
}

var chooseBinaryFromHexExport = {
    create: function() {
        return new ChooseBinaryFromHex();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = chooseBinaryFromHexExport;
