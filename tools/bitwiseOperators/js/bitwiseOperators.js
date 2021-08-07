function BitwiseOperators() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useMultipleParts = options && options.useMultipleParts;

        var numberOfBitsInNibble = 4;
        this.numberOfQuestionsToWin = 6;

        this.utilities = require('utilities');

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['bitwiseOperators']({ id: this.id, numberOfBitsInNibble: numberOfBitsInNibble });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.numberOfQuestionsToWin,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.$bitResults.removeClass('disabled');
                self.displayLevel();
            },
            reset: function() {
                self.$bitResults.addClass('disabled');
                self.displayLevel();
            },
            next: function(currentQuestion) {
                self.$bitResults.removeClass('disabled');
                self.displayLevel(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                self.$bitResults.addClass('disabled');

                var isAnswerCorrect = true;

                self.progressionTool.userAnswer = '';
                self.progressionTool.expectedAnswer = '';

                if (self.$operator.text() === '|') { // operator is bitwise OR
                    self.$bitMask.each(function(index) {
                        var maskBit = $(this).text();
                        var $bitResult = self.$bitResults.eq(index);
                        var bitIndex = $bitResult.attr('bit-index');

                        if (maskBit === '1') { // mask bit was 1
                            self.progressionTool.userAnswer += $bitResult.text();
                            self.progressionTool.expectedAnswer += '1';
                            if ($bitResult.text() !== '1') {
                                isAnswerCorrect = false;
                                $bitResult.addClass('highlighted-yellow');
                                self.$bitwiseOr1.addClass('highlighted-yellow');
                            }
                        } else if (maskBit === '0') { // mask bit was 0
                            self.progressionTool.userAnswer += $bitResult.text();
                            self.progressionTool.expectedAnswer += 'b' + bitIndex;
                            if ($bitResult.text() !== ('b' + bitIndex)) {
                                isAnswerCorrect = false;
                                $bitResult.addClass('highlighted-blue');
                                self.$bitwiseOr0.addClass('highlighted-blue');
                            }
                        }
                    });
                } else if (self.$operator.text() === '&') { // operator is bitwise AND
                    self.$bitMask.each(function(index) {
                        var maskBit = $(this).text();
                        var $bitResult = self.$bitResults.eq(index);
                        var bitIndex = $bitResult.attr('bit-index');

                        if (maskBit === '1') { // mask bit was 1
                            self.progressionTool.userAnswer += $bitResult.text();
                            self.progressionTool.expectedAnswer += 'b' + bitIndex;
                            if ($bitResult.text() !== ('b' + bitIndex)) {
                                isAnswerCorrect = false;
                                $bitResult.addClass('highlighted-yellow');
                                self.$bitwiseAnd1.addClass('highlighted-yellow');
                            }
                        } else if (maskBit === '0') { // mask bit was 0
                            self.progressionTool.userAnswer += $bitResult.text();
                            self.progressionTool.expectedAnswer += '0';
                            if ($bitResult.text() !== '0') {
                                isAnswerCorrect = false;
                                $bitResult.addClass('highlighted-blue');
                                self.$bitwiseAnd0.addClass('highlighted-blue');
                            }
                        }
                    });
                }

                if (!isAnswerCorrect) {
                    self.$bitwiseOpLookup.css('visibility', 'visible');
                    self.progressionTool.feedbackMessage = 'Wrong. Check the highlighted bits and table.';
                } else {
                    self.progressionTool.feedbackMessage = 'Correct';
                }

                return isAnswerCorrect;
            }
        });

        this.$operator = $('#' + this.id + ' .bitwise-operator');
        this.$bitMask = $('#' + this.id + ' .bit-mask');
        this.$bitResults = $('#' + this.id + ' .bit-result');
        this.$bitwiseOpLookup = $('#' + this.id + ' .bitwise-operator-lookup');
        this.$bitwiseAnd1 = $('#' + this.id + ' .bitwise-and-1');
        this.$bitwiseAnd0 = $('#' + this.id + ' .bitwise-and-0');
        this.$bitwiseOr1 = $('#' + this.id + ' .bitwise-or-1');
        this.$bitwiseOr0 = $('#' + this.id + ' .bitwise-or-0');

        this.$bitResults.addClass('disabled');
        this.$bitwiseOpLookup.css('visibility', 'hidden');
        this.displayLevel();

        this.$bitResults.click(function(event) {
            self.bitResultsClicked(event);
        });
    };

    // Choose bit-wise operator, randomly set mask, and reset result bits
    this.displayLevel = function(currentQuestion) {
        currentQuestion = currentQuestion === undefined ? 0 : currentQuestion;
        this.$operator.text(currentQuestion < (this.numberOfQuestionsToWin / 2) ? '&' : '|'); // use & if currentQuestion is under 3
        this.$bitMask.each(function() {
            var coinFlip = Math.floor(Math.random() * 2); // result is 0 or 1
            $(this).text(coinFlip === 0 ? '0' : '1');
        });
        this.$bitResults.text('0');

        this.$bitResults.removeClass('highlighted-yellow').removeClass('highlighted-blue');
        this.$bitwiseOpLookup.css('visibility', 'hidden');
        this.$bitwiseAnd1.removeClass('highlighted-yellow');
        this.$bitwiseAnd0.removeClass('highlighted-blue');
        this.$bitwiseOr1.removeClass('highlighted-yellow');
        this.$bitwiseOr0.removeClass('highlighted-blue');
    };

    // Toggle bit result value between 0, 1, and b0
    this.bitResultsClicked = function(event) {
        var $bit = $(event.target);
        if (!$bit.hasClass('disabled')) {
            if ($bit.text() === '0') {
                $bit.text('1');
            } else if ($bit.text() === '1') {
                $bit.text('b' + $bit.attr('bit-index'));
            } else {
                $bit.text('0');
            }
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var bitwiseOperatorsExport = {
    create: function() {
        return new BitwiseOperators();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = bitwiseOperatorsExport;
