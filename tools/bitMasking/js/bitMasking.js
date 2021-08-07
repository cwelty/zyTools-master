function BitMasking() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useMultipleParts = options && options.useMultipleParts;

        var numberOfBitsInNibble = 4;
        this.numberOfQuestions = 6;

        this.utilities = require('utilities');

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['bitMasking']({ id: this.id, numberOfBitsInNibble: numberOfBitsInNibble });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.numberOfQuestions,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.$bitMask.removeClass('disabled');
                self.displayLevel();
            },
            reset: function() {
                self.$bitMask.addClass('disabled');
                self.displayLevel();
            },
            next: function(currentQuestion) {
                self.$bitMask.removeClass('disabled');
                self.displayLevel(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                self.$bitMask.addClass('disabled');

                var isAnswerCorrect = true;

                self.progressionTool.userAnswer = '';
                self.progressionTool.expectedAnswer = '';

                if (self.$operator.text() === '|') { // operator is bitwise OR
                    self.$bitResults.each(function(index) {
                        var resultBit = $(this).text();
                        var $maskBit = self.$bitMask.eq(index);
                        var bitIndex = self.$bitResults.eq(index).attr('bit-index');

                        if (resultBit === '1') {
                            self.progressionTool.userAnswer += $maskBit.text();
                            self.progressionTool.expectedAnswer += '1';
                            if ($maskBit.text() !== '1') {
                                isAnswerCorrect = false;
                                $maskBit.addClass('highlighted-yellow');
                                self.$bitwiseAnd1.addClass('highlighted-yellow');
                            }
                        } else if (resultBit === ('b' + bitIndex)) {
                            self.progressionTool.userAnswer += $maskBit.text();
                            self.progressionTool.expectedAnswer += '0';
                            if ($maskBit.text() !== '0') {
                                isAnswerCorrect = false;
                                $maskBit.addClass('highlighted-blue');
                                self.$bitwiseAnd0.addClass('highlighted-blue');
                            }
                        }
                    });
                } else if (self.$operator.text() === '&') { // operator is bitwise AND
                    self.$bitResults.each(function(index) {
                        var resultBit = $(this).text();
                        var $maskBit = self.$bitMask.eq(index);
                        var bitIndex = self.$bitResults.eq(index).attr('bit-index');

                        if (resultBit === ('b' + bitIndex)) {
                            self.progressionTool.userAnswer += $maskBit.text();
                            self.progressionTool.expectedAnswer += '1';
                            if ($maskBit.text() !== '1') {
                                isAnswerCorrect = false;
                                $maskBit.addClass('highlighted-yellow');
                                self.$bitwiseAnd1.addClass('highlighted-yellow');
                            }
                        } else if (resultBit === '0') {
                            self.progressionTool.userAnswer += $maskBit.text();
                            self.progressionTool.expectedAnswer += '0';
                            if ($maskBit.text() !== '0') {
                                isAnswerCorrect = false;
                                $maskBit.addClass('highlighted-blue');
                                self.$bitwiseAnd0.addClass('highlighted-blue');
                            }
                        }
                    });
                }

                if (!isAnswerCorrect) {
                    self.$bitwiseOpLookup.css('visibility', 'visible');
                    self.progressionTool.explanationMessage = 'Wrong. Check the highlighted bits and table.';
                } else {
                    self.progressionTool.explanationMessage = 'Correct.';
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

        this.$bitMask.addClass('disabled');
        this.$bitwiseOpLookup.css('visibility', 'hidden');
        this.displayLevel();

        this.$bitMask.click(function(event) {
            self.bitMaskClicked(event);
        });
    };

    // Choose bit-wise operator, reset mask, and randomize result bits
    this.displayLevel = function(currentQuestion) {
        currentQuestion = currentQuestion === undefined ? 0 : currentQuestion;

        this.$bitMask.text('0');
        if (currentQuestion < (this.numberOfQuestions / 2)) {
            this.$operator.text('&');
            this.$bitResults.each(function() {
                var $bitResult = $(this);
                var coinFlip = Math.floor(Math.random() * 2); // result is 0 or bit-index
                $bitResult.text(coinFlip === 0 ? '0' : 'b' + $bitResult.attr('bit-index'));
            });
        } else {
            this.$operator.text('|');
            this.$bitResults.each(function() {
                var $bitResult = $(this);
                var coinFlip = Math.floor(Math.random() * 2); // result is 1 or bit-index
                $bitResult.text(coinFlip === 0 ? '1' : 'b' + $bitResult.attr('bit-index'));
            });
        }

        this.$bitMask.removeClass('highlighted-yellow').removeClass('highlighted-blue');
        this.$bitwiseOpLookup.css('visibility', 'hidden');
        this.$bitwiseAnd1.removeClass('highlighted-yellow');
        this.$bitwiseAnd0.removeClass('highlighted-blue');
        this.$bitwiseOr1.removeClass('highlighted-yellow');
        this.$bitwiseOr0.removeClass('highlighted-blue');
    };

    // Toggle bit result value between 0 and 1
    this.bitMaskClicked = function(event) {
        var $bit = $(event.target);
        if (!$bit.hasClass('disabled')) {
            if ($bit.text() === '0') {
                $bit.text('1');
            } else {
                $bit.text('0');
            }
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var bitMaskingExport = {
    create: function() {
        return new BitMasking();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = bitMaskingExport;
