// The progression tool must be grunt'd before usage: grunt --tool=progressionTool
function inequalityNumberLine() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        this.notation = 'inequality';
        if (options && options.notation) {
            this.notation = options.notation;
        }

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['inequalityNumberLine']({ id: this.id });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         8,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.$settingsRegion.removeClass('settings-initial');
            },
            reset: function() {
                self.disableAllInputs();
                self.resetSettings();
                self.hideAnswer();
                self.$settingsRegion.addClass('settings-initial');
            },
            next: function(currentQuestion) {
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.makeLevel(currentQuestion);
                    self.resetSettings();
                    self.hideAnswer();
                } else {
                    self.invalidInputEnteredGiveAnotherTry = false;
                    self.enableAllInputs();
                    self.focusOnAppropriateInput(currentQuestion);
                }
            },
            isCorrect: function(currentQuestion) {
                self.disableAllInputs();
                var isAnswerCorrect = false;

                // Instantiate user's answer as an object
                var userAnswer = {
                    value: self.$slider.slider('option', 'value'),
                    arrow: self.arrowSetting,
                    circle: self.circleSetting
                };

                self.progressionTool.userAnswer = JSON.stringify(userAnswer);
                self.progressionTool.expectedAnswer = JSON.stringify(self.correctAnswer);

                // Check if answer is correct
                if (self.progressionTool.userAnswer === self.progressionTool.expectedAnswer) {
                    isAnswerCorrect = true;
                    self.progressionTool.explanationMessage = 'Correct.';
                } else {
                    // Determine if user deserves another try, and display appropriate error message
                    if ((userAnswer.arrow === null) || (userAnswer.circle === null)) {
                        self.progressionTool.explanationMessage = 'Please select settings for the arrow and circle.';
                        self.invalidInputEnteredGiveAnotherTry = true;
                    } else if ((userAnswer.arrow === 'none') && (userAnswer.circle === 'unfilled')) {
                        self.progressionTool.explanationMessage = 'Arrow as none and circle as unfilled means that x is not defined, but ' + self.wrongAnswerMessage;
                        self.invalidInputEnteredGiveAnotherTry = true;
                    } else {
                        self.progressionTool.explanationMessage = self.wrongAnswerMessage;
                    }
                }

                // If we aren't giving a second try, show the answer
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.showAnswer();
                }

                return isAnswerCorrect;
            }
        });

        // Caching
        this.$inequality = $('#' + this.id + ' .inequality');
        this.$slider = $('#' + this.id + ' .slider').not('.answer-slider');
        this.$slider.attr('id', 'slider_' + this.id);
        this.$answerSlider = $('#' + this.id + ' .answer-slider');
        this.$answerSlider.attr('id', 'answer-slider_' + this.id);
        this.$answerArrowLeftGraphic = $('#' + this.id + ' .answer-arrow-left-graphic');
        this.$answerArrowRightGraphic = $('#' + this.id + ' .answer-arrow-right-graphic');
        this.$numLineBar = $('#' + this.id + ' .number-line-bar');
        this.$numLineArrowLeft = $('#' + this.id + ' .number-line-arrow-left');
        this.$numLineArrowRight = $('#' + this.id + ' .number-line-arrow-right');
        this.$settingsRegion = $('#' + this.id + ' .settings');
        this.$arrowLeft = $('#' + this.id + ' .arrow-left');
        this.$arrowNone = $('#' + this.id + ' .arrow-none');
        this.$arrowRight = $('#' + this.id + ' .arrow-right');
        this.$circleFilled = $('#' + this.id + ' .circle-filled');
        this.$circleUnfilled = $('#' + this.id + ' .circle-unfilled');
        this.$arrowLeftGraphic = $('#' + this.id + ' .arrow-left-graphic');
        this.$arrowRightGraphic = $('#' + this.id + ' .arrow-right-graphic');

        // Inits
        this.$settingsRegion.addClass('settings-initial');
        this.$answerSlider.slider({
            min: -6,
            max: 6,
            value: 0,
            step: 1,
            slide: function() { // Don't allow sliding
                return false;
            }
        });
        this.$slider.slider({
            min: -6,
            max: 6,
            value: 0,
            step: 1,
            slide: function(event, ui) {
                var value = ui.value;
                var $this = $(this);
                if ((value >= $this.slider('option', 'max'))
                    || (value <= $this.slider('option', 'min'))) {
                    return false;
                }
            }
        });
        // Get the options for this slider
        var opt = this.$slider.slider('option');
        // Get the number of possible values
        var length = opt.max - opt.min;
        // Space out values
        for (var i = 1; i < length; i++) {
            var $numberLabel;
            var $tickMark;
            var numberLineTickValue = opt.min + i;
            var tickValuePositiveOrNegative;

            if (numberLineTickValue >= 0) {
                tickValuePositiveOrNegative = 'positive';
            } else {
                tickValuePositiveOrNegative = 'negative';
            }
            $tickMark = $('<div class=\'number-tick-' + tickValuePositiveOrNegative + '\'></div>');
            $numberLabel = $('<label class=\'number-label-' + tickValuePositiveOrNegative + '\'>' + numberLineTickValue + '</label>').css('left', (i / length * 100) + '%');

            $numberLabel.append($tickMark);
            this.$slider.append($numberLabel);
        }

        // More caching...
        this.$circleGraphic = $('#' + this.$slider.attr('id') + ' .ui-slider-handle');
        this.$answerCircleGraphic = $('#' + this.$answerSlider.attr('id') + ' .ui-slider-handle');
        this.$negativeTickMarks = $('#' + this.id + ' .number-tick-negative');
        this.$positiveTickMarks = $('#' + this.id + ' .number-tick-positive');

        // More inits...
        this.makeLevel(0);
        this.disableAllInputs();
        this.resetSettings();
        this.$answerCircleGraphic.addClass('correct-answer');
        this.hideAnswer();

        // Event listeners
        this.$arrowLeft.click(function() {
            self.updateArrowSettings('left');
        });
        this.$arrowNone.click(function() {
            self.updateArrowSettings('none');
        });
        this.$arrowRight.click(function() {
            self.updateArrowSettings('right');
        });
        this.$circleFilled.click(function() {
            self.updateCircleSettings('filled');
        });
        this.$circleUnfilled.click(function() {
            self.updateCircleSettings('unfilled');
        });
    };

    // ---------- Tool specific data arrays ---------- //
    this.startingInstructions = 'Graph the inequality.';

    // Direction Mapping (this mapping no longer applies, but should make more mappings)
    this.direction = {
        left: 'left',
        leftEqual: 'left-equal',
        equal: 'equal',
        rightEqual: 'right-equal',
        right: 'right'
    };

    this.arrowSetting = 'none';
    this.circleSetting = 'filled';
    this.inputDisabled = true;
    this.correctAnswer = {
        value: null,
        arrow: '',
        circle: ''
    };
    this.wrongAnswerMessage = null;
    this.invalidInputEnteredGiveAnotherTry = false;
    // ---------------------------------------------- //

    // ---------- Tool specific custom functions ---------- //

    // Update the arrow modal and graphic
    // |arrowDirection| is a required string
    this.updateArrowSettings = function(arrowDirection) {
        if (arrowDirection === this.arrowSetting || this.inputDisabled) {
            return;
        }
        switch(arrowDirection) {
            case 'left':
                this.$arrowLeftGraphic.show();
                this.$arrowRightGraphic.hide();
                this.$arrowLeft.addClass('segment-button-selected');
                this.$arrowNone.removeClass('segment-button-selected');
                this.$arrowRight.removeClass('segment-button-selected');
                this.$slider.slider('option', 'range', 'min');
                break;
            case 'none':
                this.$arrowLeftGraphic.hide();
                this.$arrowRightGraphic.hide();
                this.$arrowLeft.removeClass('segment-button-selected');
                this.$arrowNone.addClass('segment-button-selected');
                this.$arrowRight.removeClass('segment-button-selected');
                this.$slider.slider('option', 'range', false);
                break;
            case 'right':
                this.$arrowLeftGraphic.hide();
                this.$arrowRightGraphic.show();
                this.$arrowLeft.removeClass('segment-button-selected');
                this.$arrowNone.removeClass('segment-button-selected');
                this.$arrowRight.addClass('segment-button-selected');
                this.$slider.slider('option', 'range', 'max');
                break;
            default:
                break;
        }
        this.arrowSetting = arrowDirection;
    };

    // Update the circle modal and graphic
    // |circleDescription| is a required string
    this.updateCircleSettings = function(circleDescription) {
        if (circleDescription === this.circleSetting || this.inputDisabled) {
            return;
        }
        switch(circleDescription) {
            case 'filled':
                var circleColor = this.$circleGraphic.css('border-color');
                this.$circleGraphic.css('background', circleColor);
                this.$circleFilled.addClass('segment-button-selected');
                this.$circleUnfilled.removeClass('segment-button-selected');
                break;
            case 'unfilled':
                this.$circleGraphic.css('background', 'white');
                this.$circleFilled.removeClass('segment-button-selected');
                this.$circleUnfilled.addClass('segment-button-selected');
                break;
            default:
                break;
        }
        this.circleSetting = circleDescription;
    };

    // Reset the settings of the slider, arrow and circle modals
    this.resetSettings = function() {
        this.$slider.slider('value', 0);

        this.arrowSetting = 'none';
        this.$arrowLeft.removeClass('segment-button-selected');
        this.$arrowNone.addClass('segment-button-selected');
        this.$arrowRight.removeClass('segment-button-selected');
        this.$arrowLeftGraphic.hide();
        this.$arrowRightGraphic.hide();
        this.$slider.slider('option', 'range', false);

        this.circleSetting = 'filled';
        this.$circleFilled.addClass('segment-button-selected');
        this.$circleUnfilled.removeClass('segment-button-selected');
        var circleColor = this.$circleGraphic.css('border-color');
        this.$circleGraphic.css('background', circleColor);
    };

    // Enable all input fields in tool
    this.enableAllInputs = function() {
        this.inputDisabled = false;
        this.$slider.slider('enable');
        this.$numLineBar.removeClass('ui-state-disabled');
        this.$numLineArrowLeft.removeClass('ui-state-disabled');
        this.$numLineArrowRight.removeClass('ui-state-disabled');
        this.$arrowLeftGraphic.removeClass('ui-state-disabled');
        this.$arrowRightGraphic.removeClass('ui-state-disabled');
        this.$settingsRegion.removeClass('ui-state-disabled');
        this.$negativeTickMarks.each(function() {
            $(this).removeClass('number-tick-disabled');
        });
        this.$positiveTickMarks.each(function() {
            $(this).removeClass('number-tick-disabled');
        });
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        this.inputDisabled = true;
        this.$slider.slider('disable');
        this.$numLineBar.addClass('ui-state-disabled');
        this.$numLineArrowLeft.addClass('ui-state-disabled');
        this.$numLineArrowRight.addClass('ui-state-disabled');
        this.$arrowLeftGraphic.addClass('ui-state-disabled');
        this.$arrowRightGraphic.addClass('ui-state-disabled');
        this.$settingsRegion.addClass('ui-state-disabled');
        this.$negativeTickMarks.each(function() {
            $(this).addClass('number-tick-disabled');
        });
        this.$positiveTickMarks.each(function() {
            $(this).addClass('number-tick-disabled');
        });
    };

    // Hides the displayed correct answer graphic
    this.hideAnswer = function() {
        this.$answerSlider.hide();
        this.$answerArrowLeftGraphic.hide();
        this.$answerArrowRightGraphic.hide();
    };

    // Shows the correct answer graphic
    this.showAnswer = function() {
        this.$answerSlider.show();
        if (this.correctAnswer.arrow !== 'none') {
            if (this.correctAnswer.arrow === 'left') {
                this.$answerArrowLeftGraphic.show();
            } else {
                this.$answerArrowRightGraphic.show();
            }
        }
    };

    /*
        Generate a string in interval notation based on |variableIsOnLeft|, |inequalitySymbol|, and |numberOnLine|.
        For example: x is [3, infinity)
        |variableIsOnLeft| is required and a boolean
        |inequalitySymbol| is required and a string
        |numberOnLine| is required and a number
    */
    this.generateIntervalNotationString = function(variableIsOnLeft, inequalitySymbol, numberOnLine) {
        // If |variableIsOnLeft| is false, then reverse the direction of the |inequalitySymbol|.
        // With interval notation, the side of the variable is determined by the |inequalitySymbol|.
        if (!variableIsOnLeft) {
            switch (inequalitySymbol) {
                case '<':
                    inequalitySymbol = '>';
                    break;
                case '>':
                    inequalitySymbol = '<';
                    break;
                case '≤':
                    inequalitySymbol = '≥';
                    break;
                case '≥':
                    inequalitySymbol = '≤';
                    break;
                case '=':
                    break;
            }
        }

        var userPromptText = 'x is ';
        switch (inequalitySymbol) {
            case '<':
                // &infin; is HTML infinite symbol
                userPromptText += '(-&infin;, ' + numberOnLine + ')';
                break;
            case '>':
                userPromptText += '(' + numberOnLine + ', &infin;)';
                break;
            case '≤':
                userPromptText += '(-&infin;, ' + numberOnLine + ']';
                break;
            case '≥':
                userPromptText += '[' + numberOnLine + ', &infin;)';
                break;
            case '=':
                userPromptText += '[' + numberOnLine + ', ' + numberOnLine + ']';
                break;
        }

        return userPromptText;
    };

    /*
        Generate a string in inequality notation based on |variableIsOnLeft|, |inequalitySymbol|, and |numberOnLine|.
        For example: x > 5
        |variableIsOnLeft| is required and a boolean
        |inequalitySymbol| is required and a string
        |numberOnLine| is required and a number
    */
    this.generateInequalityNotationString = function(variableIsOnLeft, inequalitySymbol, numberOnLine) {
        if (variableIsOnLeft) {
            return ('x ' + inequalitySymbol + ' ' + numberOnLine);
        } else {
            return (numberOnLine + ' ' + inequalitySymbol + ' x');
        }
    };

    /*
        Display the appropriate notation based on |variableIsOnLeft|, |inequalitySymbol|, and |numberOnLine|.
        |variableIsOnLeft| is required and a boolean
        |inequalitySymbol| is required and a string
        |numberOnLine| is required and a number
    */
    this.generateNotationString = function(variableIsOnLeft, inequalitySymbol, numberOnLine) {
        var notationString = '';
        switch (this.notation) {
            case 'inequality':
                notationString = this.generateInequalityNotationString(variableIsOnLeft, inequalitySymbol, numberOnLine);
                break;
            case 'setBuilder':
                notationString = this.generateInequalityNotationString(variableIsOnLeft, inequalitySymbol, numberOnLine);
                notationString = '{x | ' + notationString + '}';
                break;
            case 'interval':
                notationString = this.generateIntervalNotationString(variableIsOnLeft, inequalitySymbol, numberOnLine);
                break;
        }
        return notationString;
    };

    /*
        Generates a random inequality to be graphed by the user.
        The type of inequality presented depends on |currentQuestionNumber|.
        |this.correctAnswer| is set.
        |this.wrongAnswerMessage| is set.
        The correct answer graphic is set up.
        |currentQuestionNumber| is a required integer.
    */
    this.makeLevel = function(currentQuestionNumber) {
        this.enableAllInputs();

        // Get a random value for inequality between min+1 and max-1
        var valueMin = this.$slider.slider('option', 'min') + 1;
        var valueMax = this.$slider.slider('option', 'max') - 1;
        var randomValue = Math.floor(Math.random() * (valueMax - valueMin)) + valueMin;

        // Make sure randomly selected value is not the same as the last question
        if (randomValue === this.correctAnswer.value) {
            if (randomValue === valueMin) {
                randomValue += 1;
            } else if (randomValue === valueMax) {
                randomValue -= 1;
            } else {
                randomValue += (Math.random() < 0.5) ? -1 : 1;
            }
        }

        // Determine if x should go on the left or right hand side
        var variableIsOnLeft;
        switch (currentQuestionNumber) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                variableIsOnLeft = true;
                break;
            case 5:
            case 6:
            case 7:
                variableIsOnLeft = false;
                break;
            default:
                variableIsOnLeft = Math.random() < 0.5;
                break;
        }

        // Determine inequality
        var inequalityText;
        var inequalitySymbol;
        var inequalityChoice;
        switch (currentQuestionNumber) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                inequalityChoice = currentQuestionNumber;
                break;
            case 5:
                inequalityChoice = Math.floor(Math.random() * 2); // Choose between 0 and 1
                break;
            case 6:
                inequalityChoice = Math.floor(Math.random() * 2) + 2; // Choose between 2 and 3
                break;
            case 7:
                inequalityChoice = 4;
                break;
            default:
                inequalityChoice = Math.floor(Math.random() * 5);
                break;
        }

        // Create the symbol and text translation based of the |inequalityChoice|
        switch (inequalityChoice) {
            case 0:
                inequalitySymbol = '<';
                inequalityText = variableIsOnLeft ? 'any number less than' : 'any number greater than';
                break;
            case 1:
                inequalitySymbol = '>';
                inequalityText = variableIsOnLeft ? 'any number greater than' : 'any number less than';
                break;
            case 2:
                inequalitySymbol = '≤';
                inequalityText = variableIsOnLeft ? 'any number less than or equal to' : 'any number greater than or equal to';
                break;
            case 3:
                inequalitySymbol = '≥';
                inequalityText = variableIsOnLeft ? 'any number greater than or equal to' : 'any number less than or equal to';
                break;
            case 4:
                inequalitySymbol = '=';
                inequalityText = 'equal to';
                break;
            default:
                inequalitySymbol = '=';
                inequalityText = 'equal to';
                break;
        }
        this.wrongAnswerMessage = 'x is ' + inequalityText + ' ' + randomValue + '.';

        var userPromptText = this.generateNotationString(variableIsOnLeft, inequalitySymbol, randomValue);
        this.$inequality.html(userPromptText);

        // Determine the correct answer to the generated problem, and cache it
        this.correctAnswer.value = randomValue;
        if ((inequalitySymbol === '=')
            || (inequalitySymbol === '≤')
            || (inequalitySymbol === '≥')) {
            this.correctAnswer.circle = 'filled';
        } else {
            this.correctAnswer.circle = 'unfilled';
        }
        if ((inequalitySymbol === '≤')
            || (inequalitySymbol === '<')) {
            this.correctAnswer.arrow = variableIsOnLeft ? 'left' : 'right';
        } else if ((inequalitySymbol === '≥')
            || (inequalitySymbol === '>')) {
            this.correctAnswer.arrow = variableIsOnLeft ? 'right' : 'left';
        } else {
            this.correctAnswer.arrow = 'none';
        }

        // Create correct answer image
        this.$answerSlider.slider('value', randomValue);
        if (this.correctAnswer.circle === 'filled') {
            this.$answerCircleGraphic.css('background', this.$answerCircleGraphic.css('border-color'));
        } else {
            this.$answerCircleGraphic.css('background', 'white');
        }
        if (this.correctAnswer.arrow === 'none') {
            this.$answerSlider.slider('option', 'range', false);
        } else {
            this.$answerSlider.slider('option', 'range', (this.correctAnswer.arrow === 'left') ? 'min' : 'max');
        }
        var $answerRange = $('#' + this.$answerSlider.attr('id') + ' div');
        $answerRange.addClass('correct-answer');
    };
    // --------------------------------------------------- //

    // ------------- Tool reset function -------------//
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var inequalityNumberLineExport = {
    create: function() {
        return new inequalityNumberLine();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = inequalityNumberLineExport;
